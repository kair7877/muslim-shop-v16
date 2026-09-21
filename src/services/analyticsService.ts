import {
  collection,
  doc,
  setDoc,
  addDoc,
  increment,
  onSnapshot,
  query,
  orderBy,
  limit,
  serverTimestamp,
  getDocs,
} from 'firebase/firestore';
import { db } from '../firebase';
import { AnalyticsOverview, DailyAnalytics, VisitLogItem } from '../types';

export const ANALYTICS_DAILY_COLLECTION = 'analytics_daily';
export const ANALYTICS_SUMMARY_COLLECTION = 'analytics_summary';
export const ANALYTICS_VISITS_COLLECTION = 'analytics_visits';

const ADMIN_IGNORE_KEY = 'muslim_shop_ignore_admin_visits';
const VISITOR_ID_KEY = 'muslim_shop_visitor_id';
const LAST_VISITED_DATE_KEY = 'muslim_shop_last_visit_date';
const SESSION_ACTIVE_KEY = 'muslim_shop_session_active';

/**
 * Gets or creates an anonymous persistent visitor ID
 */
export function getVisitorId(): string {
  try {
    let vid = localStorage.getItem(VISITOR_ID_KEY);
    if (!vid) {
      vid = 'v_' + Math.random().toString(36).substring(2, 11) + Date.now().toString(36);
      localStorage.setItem(VISITOR_ID_KEY, vid);
    }
    return vid;
  } catch {
    return 'v_' + Math.random().toString(36).substring(2, 10);
  }
}

/**
 * Check if current browser has admin mode enabled to ignore visits
 */
export function isIgnoreAdminVisits(): boolean {
  try {
    return localStorage.getItem(ADMIN_IGNORE_KEY) === 'true';
  } catch {
    return false;
  }
}

export function setIgnoreAdminVisits(ignore: boolean): void {
  try {
    localStorage.setItem(ADMIN_IGNORE_KEY, ignore ? 'true' : 'false');
  } catch {}
}

/**
 * Detects visitor device type
 */
function getDeviceType(): 'mobile' | 'desktop' | 'tablet' {
  if (typeof navigator === 'undefined') return 'desktop';
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return 'tablet';
  }
  if (/Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(ua)) {
    return 'mobile';
  }
  return 'desktop';
}

/**
 * Formats date into YYYY-MM-DD format (local timezone)
 */
export function getTodayDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Formats referrer into friendly human label
 */
function formatReferrer(raw: string): string {
  if (!raw) return 'Прямой заход';
  try {
    const url = new URL(raw);
    const host = url.hostname.toLowerCase();
    if (host.includes('instagram')) return 'Instagram';
    if (host.includes('wa.me') || host.includes('whatsapp')) return 'WhatsApp';
    if (host.includes('2gis')) return '2ГИС';
    if (host.includes('google')) return 'Google';
    if (host.includes('yandex')) return 'Яндекс';
    if (host.includes('telegram') || host.includes('t.me')) return 'Telegram';
    return host.replace(/^www\./, '');
  } catch {
    return 'Внешняя ссылка';
  }
}

/**
 * Records a client visit / page view in Firestore
 */
export async function trackVisit(options: {
  page?: string;
  lang?: string;
  isInitialLoad?: boolean;
}): Promise<void> {
  if (isIgnoreAdminVisits()) {
    return;
  }

  const today = getTodayDateString();
  const visitorId = getVisitorId();
  const device = getDeviceType();
  const lang = options.lang === 'kz' ? 'kz' : 'ru';
  const page = options.page || 'Главная';

  let isNewVisitorToday = false;
  try {
    const lastVisitDate = localStorage.getItem(LAST_VISITED_DATE_KEY);
    if (lastVisitDate !== today) {
      isNewVisitorToday = true;
      localStorage.setItem(LAST_VISITED_DATE_KEY, today);
    }
  } catch {
    isNewVisitorToday = true;
  }

  let isNewSession = false;
  try {
    const hasSession = sessionStorage.getItem(SESSION_ACTIVE_KEY);
    if (!hasSession || options.isInitialLoad) {
      isNewSession = true;
      sessionStorage.setItem(SESSION_ACTIVE_KEY, 'active_' + Date.now());
    }
  } catch {
    isNewSession = true;
  }

  try {
    // 1. Daily aggregated statistics
    const dailyDocRef = doc(db, ANALYTICS_DAILY_COLLECTION, today);
    await setDoc(
      dailyDocRef,
      {
        date: today,
        totalVisits: increment(isNewSession ? 1 : 0),
        uniqueVisitors: increment(isNewVisitorToday ? 1 : 0),
        pageViews: increment(1),
        mobileVisits: increment(device === 'mobile' ? 1 : 0),
        desktopVisits: increment(device === 'desktop' ? 1 : 0),
        ruVisits: increment(lang === 'ru' ? 1 : 0),
        kzVisits: increment(lang === 'kz' ? 1 : 0),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 2. All-time summary
    const summaryDocRef = doc(db, ANALYTICS_SUMMARY_COLLECTION, 'overview');
    await setDoc(
      summaryDocRef,
      {
        totalVisitsAllTime: increment(isNewSession ? 1 : 0),
        uniqueVisitorsAllTime: increment(isNewVisitorToday ? 1 : 0),
        totalPageViewsAllTime: increment(1),
        lastVisitAt: new Date().toISOString(),
      },
      { merge: true }
    );

    // 3. Recent visit item (only on new session or initial load to keep log concise)
    if (isNewSession) {
      const visitsColRef = collection(db, ANALYTICS_VISITS_COLLECTION);
      const referrer = typeof document !== 'undefined' ? formatReferrer(document.referrer) : 'Прямой заход';
      await addDoc(visitsColRef, {
        visitorId: visitorId.slice(-6),
        timestamp: new Date().toISOString(),
        device,
        lang,
        page,
        referrer,
        isNewVisitor: isNewVisitorToday,
      });
    }
  } catch (err) {
    // Analytics failures must never interrupt user shopping experience
    console.warn('Analytics tracking notice:', err);
  }
}

/**
 * Tracks product detail view
 */
export async function trackProductView(productId: string, productTitle: string): Promise<void> {
  if (isIgnoreAdminVisits()) return;

  const today = getTodayDateString();
  try {
    const dailyDocRef = doc(db, ANALYTICS_DAILY_COLLECTION, today);
    await setDoc(
      dailyDocRef,
      {
        pageViews: increment(1),
        [`productViews.${productId}.title`]: productTitle,
        [`productViews.${productId}.count`]: increment(1),
        updatedAt: new Date().toISOString(),
      },
      { merge: true }
    );
  } catch (err) {
    console.warn('Product view track notice:', err);
  }
}

/**
 * Subscribe to daily analytics history for admin dashboard (e.g. past 30 days)
 */
export function subscribeToDailyAnalytics(
  daysLimit = 30,
  callback: (data: DailyAnalytics[]) => void
): () => void {
  const colRef = collection(db, ANALYTICS_DAILY_COLLECTION);
  const q = query(colRef, orderBy('date', 'desc'), limit(daysLimit));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: DailyAnalytics[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          date: data.date || d.id,
          totalVisits: Number(data.totalVisits) || 0,
          uniqueVisitors: Number(data.uniqueVisitors) || 0,
          pageViews: Number(data.pageViews) || 0,
          mobileVisits: Number(data.mobileVisits) || 0,
          desktopVisits: Number(data.desktopVisits) || 0,
          ruVisits: Number(data.ruVisits) || 0,
          kzVisits: Number(data.kzVisits) || 0,
          productViews: data.productViews || {},
          updatedAt: data.updatedAt || '',
        });
      });
      // Sort chronologically (oldest to newest) for chart display
      list.sort((a, b) => a.date.localeCompare(b.date));
      callback(list);
    },
    (err) => {
      console.warn('Daily analytics snapshot warning:', err);
      callback([]);
    }
  );
}

/**
 * Subscribe to all-time overview stats
 */
export function subscribeToAnalyticsOverview(
  callback: (overview: AnalyticsOverview | null) => void
): () => void {
  const docRef = doc(db, ANALYTICS_SUMMARY_COLLECTION, 'overview');

  return onSnapshot(
    docRef,
    (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.data();
        callback({
          totalVisitsAllTime: Number(data.totalVisitsAllTime) || 0,
          uniqueVisitorsAllTime: Number(data.uniqueVisitorsAllTime) || 0,
          totalPageViewsAllTime: Number(data.totalPageViewsAllTime) || 0,
          lastVisitAt: data.lastVisitAt,
        });
      } else {
        callback(null);
      }
    },
    (err) => {
      console.warn('Analytics overview snapshot warning:', err);
      callback(null);
    }
  );
}

/**
 * Subscribe to recent visit logs
 */
export function subscribeToRecentVisits(
  limitCount = 35,
  callback: (visits: VisitLogItem[]) => void
): () => void {
  const colRef = collection(db, ANALYTICS_VISITS_COLLECTION);
  const q = query(colRef, orderBy('timestamp', 'desc'), limit(limitCount));

  return onSnapshot(
    q,
    (snapshot) => {
      const list: VisitLogItem[] = [];
      snapshot.forEach((d) => {
        const data = d.data();
        list.push({
          id: d.id,
          visitorId: data.visitorId || 'user',
          timestamp: data.timestamp || new Date().toISOString(),
          device: (data.device as any) || 'mobile',
          lang: data.lang === 'kz' ? 'kz' : 'ru',
          page: data.page || 'Каталог',
          referrer: data.referrer || 'Прямой заход',
          isNewVisitor: Boolean(data.isNewVisitor),
        });
      });
      callback(list);
    },
    (err) => {
      console.warn('Recent visits snapshot warning:', err);
      callback([]);
    }
  );
}
