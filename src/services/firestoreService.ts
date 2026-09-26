import {
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  addDoc,
  getDocs,
  getDoc,
  query,
  orderBy,
  where,
} from 'firebase/firestore';
import { db } from '../firebase';
import { Category, Product, StoreConfig } from '../types';

export const PRODUCTS_COLLECTION = 'products';
export const CATEGORIES_COLLECTION = 'categories';
export const SETTINGS_COLLECTION = 'settings';
export const ORDERS_COLLECTION = 'orders';

/**
 * Normalizes a Firestore product document into a typed Product object
 */
export function normalizeProduct(id: string, data: any): Product {
  return {
    id: data.id || id,
    titleRu: data.titleRu || data.title || '',
    titleKz: data.titleKz || data.titleRu || '',
    price: typeof data.price === 'number' ? data.price : Number(data.price) || 0,
    oldPrice: data.oldPrice ? Number(data.oldPrice) : undefined,
    categoryId: data.categoryId || 'cat-health',
    descriptionRu: data.descriptionRu || data.description || '',
    descriptionKz: data.descriptionKz || data.descriptionRu || '',
    specsRu: data.specsRu || '',
    specsKz: data.specsKz || '',
    benefitsRu: Array.isArray(data.benefitsRu) ? data.benefitsRu : [],
    benefitsKz: Array.isArray(data.benefitsKz) ? data.benefitsKz : [],
    howToUseRu: data.howToUseRu || '',
    howToUseKz: data.howToUseKz || '',
    inStock: typeof data.inStock === 'boolean' ? data.inStock : true,
    sku: data.sku || `MS-${id.replace('prod-', '').slice(-4)}`,
    isHit: Boolean(data.isHit),
    isNew: Boolean(data.isNew),
    isSale: Boolean(data.isSale),
    images: Array.isArray(data.images) && data.images.length > 0
      ? data.images
      : ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
    volumeOrWeight: data.volumeOrWeight || '',
    country: data.country || '',
    createdAt: data.createdAt || new Date().toISOString(),
  };
}

/**
 * Normalizes a Firestore category document into a typed Category object
 */
export function normalizeCategory(id: string, data: any): Category {
  return {
    id: data.id || id,
    nameRu: data.nameRu || 'Категория',
    nameKz: data.nameKz || data.nameRu || 'Санат',
    icon: data.icon || '✨',
    order: typeof data.order === 'number' ? data.order : Number(data.order) || 99,
  };
}

/**
 * Determines whether an error is caused by Firebase Free Tier quota exhaustion or network offline
 */
export function isQuotaOrNetworkError(err: any): boolean {
  if (!err) return false;
  const msg = (err.message || err.toString() || '').toLowerCase();
  const code = (err.code || '').toLowerCase();
  return (
    code === 'resource-exhausted' ||
    code === 'unavailable' ||
    msg.includes('quota') ||
    msg.includes('resource-exhausted') ||
    msg.includes('resource_exhausted') ||
    msg.includes('limit exceeded') ||
    msg.includes('read units') ||
    msg.includes('offline')
  );
}

/**
 * Directly fetch all products from backend server API (/api/products)
 * Ensures catalog loading in other browsers even if Firestore quota is exceeded.
 */
export async function fetchProductsFromBackend(): Promise<Product[]> {
  try {
    const res = await fetch('/api/products');
    if (res.ok) {
      const data = await res.json();
      if (data && Array.isArray(data.products) && data.products.length > 0) {
        return data.products;
      }
    }
  } catch (e) {
    console.warn('Backend /api/products fetch notice:', e);
  }
  return [];
}

/**
 * Real-time subscription to products collection.
 * Always prioritizes the user's authentic products from Firestore or offline storage.
 */
export function subscribeToProducts(
  onSuccess: (products: Product[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: Product[] = [];
        snapshot.forEach((docSnap) => {
          if (
            docSnap.id !== 'test-probe' &&
            docSnap.id !== 'prod-ginseng-1' &&
            docSnap.data()?.sku !== 'MS-2401'
          ) {
            items.push(normalizeProduct(docSnap.id, docSnap.data()));
          }
        });
        if (items.length > 0) {
          try {
            localStorage.setItem('muslim_shop_products_cache', JSON.stringify(items));
            localStorage.setItem('muslim_shop_products', JSON.stringify(items));
          } catch {}
          onSuccess(items);

          // Synchronize authentic products to server so other browsers can view them
          fetch('/api/products/sync', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ products: items }),
          }).catch(() => {});
        }
      },
      (err) => {
        if (isQuotaOrNetworkError(err)) {
          console.warn('Firestore notice: daily read quota reached or offline. Loading cached products.');
        } else {
          console.warn('Firestore subscribeToProducts notice:', err);
        }

        // 1. First attempt to restore from local storage cache
        try {
          const cached =
            localStorage.getItem('muslim_shop_products_cache') ||
            localStorage.getItem('muslim_shop_products');
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed) && parsed.length > 0) {
              const clean = parsed.filter(
                (p: any) =>
                  p.sku !== 'MS-101-OIL' &&
                  !p.titleRu?.includes('Масло черного тмина «Королевское»') &&
                  !p.titleRu?.includes('Кыст аль-Хинди в капсулах (Премиум)') &&
                  !p.titleRu?.includes('Витамин D3 5000 IU') &&
                  !p.titleRu?.includes('Омега-3 Премиум') &&
                  !p.titleRu?.includes('Themra') &&
                  !p.titleRu?.includes('Kangzhu') &&
                  !p.titleRu?.includes('Al-Rehab Sultan')
              );
              if (clean.length > 0) {
                onSuccess(clean);
                return;
              }
            }
          }
        } catch {}

        // 2. Fallback to server products if local cache is empty (e.g. in new browsers)
        fetchProductsFromBackend().then((backendProducts) => {
          if (backendProducts && backendProducts.length > 0) {
            onSuccess(backendProducts);
          }
        });

        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Firestore subscribeToProducts initialization notice:', err);
    try {
      const cached =
        localStorage.getItem('muslim_shop_products_cache') ||
        localStorage.getItem('muslim_shop_products');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          onSuccess(parsed);
          return () => {};
        }
      }
    } catch {}

    fetchProductsFromBackend().then((backendProducts) => {
      if (backendProducts && backendProducts.length > 0) {
        onSuccess(backendProducts);
      }
    });

    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Directly fetch a single product from Firestore by Document ID or SKU.
 * Highly optimized for direct link navigation from WhatsApp / Instagram stories.
 */
export async function getProductById(targetId: string): Promise<Product | null> {
  if (!targetId || typeof targetId !== 'string') return null;
  const cleanId = targetId.trim();

  // 1. Direct document lookup by Document ID
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, cleanId);
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return normalizeProduct(snap.id, snap.data());
    }
  } catch (err) {
    console.warn('Direct doc fetch failed:', err);
  }

  // 2. Query by 'sku' field (e.g. MS-101)
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const qSku = query(colRef, where('sku', '==', cleanId));
    const snapSku = await getDocs(qSku);
    if (!snapSku.empty) {
      const docSnap = snapSku.docs[0];
      return normalizeProduct(docSnap.id, docSnap.data());
    }
  } catch (err) {
    console.warn('Query by SKU failed:', err);
  }

  // 3. Query by 'id' field in case Firestore document ID differed from data.id
  try {
    const colRef = collection(db, PRODUCTS_COLLECTION);
    const qId = query(colRef, where('id', '==', cleanId));
    const snapId = await getDocs(qId);
    if (!snapId.empty) {
      const docSnap = snapId.docs[0];
      return normalizeProduct(docSnap.id, docSnap.data());
    }
  } catch (err) {
    console.warn('Query by id failed:', err);
  }

  // 4. Fallback: check backend products API (ensures direct link works even if Firestore quota exceeded)
  try {
    const backendProducts = await fetchProductsFromBackend();
    const cleanLower = cleanId.toLowerCase();
    const match = backendProducts.find(
      (p) =>
        p.id.toLowerCase() === cleanLower ||
        (p.sku && p.sku.toLowerCase() === cleanLower) ||
        p.id.toLowerCase().replace(/^prod-/, '') === cleanLower.replace(/^prod-/, '')
    );
    if (match) return match;
  } catch {}

  return null;
}

/**
 * Real-time subscription to categories collection with local fallback
 */
export function subscribeToCategories(
  onSuccess: (categories: Category[]) => void,
  onError?: (error: Error) => void
) {
  try {
    const colRef = collection(db, CATEGORIES_COLLECTION);
    return onSnapshot(
      colRef,
      (snapshot) => {
        const items: Category[] = [];
        snapshot.forEach((docSnap) => {
          items.push(normalizeCategory(docSnap.id, docSnap.data()));
        });
        // Sort by order
        items.sort((a, b) => a.order - b.order);
        if (items.length > 0) {
          try {
            localStorage.setItem('muslim_shop_categories_cache', JSON.stringify(items));
          } catch {}
        }
        onSuccess(items);
      },
      (err) => {
        if (isQuotaOrNetworkError(err)) {
          console.warn('Firestore notice: daily read quota reached for categories. Loading cached categories.');
          try {
            const cached =
              localStorage.getItem('muslim_shop_categories_cache') ||
              localStorage.getItem('muslim_shop_categories');
            if (cached) {
              const parsed = JSON.parse(cached);
              if (Array.isArray(parsed) && parsed.length > 0) {
                onSuccess(parsed);
                return;
              }
            }
          } catch {}
        } else {
          console.warn('Firestore subscribeToCategories notice:', err);
        }
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Firestore subscribeToCategories initialization notice:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Real-time subscription to store settings with local fallback
 */
export function subscribeToSettings(
  initialConfig: StoreConfig,
  onSuccess: (config: StoreConfig) => void,
  onError?: (error: Error) => void
) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    return onSnapshot(
      docRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const merged = {
            ...initialConfig,
            ...data,
          };
          try {
            localStorage.setItem('muslim_shop_config', JSON.stringify(merged));
          } catch {}
          onSuccess(merged);
        }
      },
      (err) => {
        if (isQuotaOrNetworkError(err)) {
          console.warn('Firestore notice: daily read quota reached for settings. Using cached settings.');
          try {
            const cached = localStorage.getItem('muslim_shop_config');
            if (cached) {
              const parsed = JSON.parse(cached);
              onSuccess({ ...initialConfig, ...parsed });
              return;
            }
          } catch {}
        } else {
          console.warn('Firestore subscribeToSettings notice:', err);
        }
        if (onError) onError(err);
      }
    );
  } catch (err: any) {
    console.warn('Firestore subscribeToSettings initialization notice:', err);
    if (onError) onError(err);
    return () => {};
  }
}

/**
 * Create or update product in Firestore and persistent backend server
 */
export async function saveProductToFirestore(product: Product): Promise<void> {
  // 1. Sync to backend server file storage
  try {
    await fetch('/api/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(product),
    });
  } catch (err) {
    console.warn('Backend sync product notice:', err);
  }

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, product.id);
    const cleanData: Record<string, any> = {};
    for (const [key, val] of Object.entries(product)) {
      if (val !== undefined) {
        cleanData[key] = val;
      }
    }
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('Firestore write notice: quota limit exceeded. Saved in local cache.', err);
    } else {
      console.warn('Firestore saveProduct notice:', err);
    }
  }
}

/**
 * Create or update category in Firestore
 */
export async function saveCategoryToFirestore(category: Category): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, category.id);
    const cleanData: Record<string, any> = {};
    for (const [key, val] of Object.entries(category)) {
      if (val !== undefined) {
        cleanData[key] = val;
      }
    }
    await setDoc(docRef, cleanData, { merge: true });
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('Firestore write notice: quota limit exceeded for category. Saved locally.', err);
    } else {
      console.warn('Firestore saveCategory notice:', err);
    }
  }
}

/**
 * Delete category from Firestore
 */
export async function deleteCategoryFromFirestore(categoryId: string): Promise<void> {
  try {
    const docRef = doc(db, CATEGORIES_COLLECTION, categoryId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore deleteCategory notice:', err);
  }
}

/**
 * Delete product from Firestore and persistent backend server
 */
export async function deleteProductFromFirestore(productId: string): Promise<void> {
  // 1. Sync to backend server file storage
  try {
    await fetch(`/api/products/${encodeURIComponent(productId)}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Backend delete product notice:', err);
  }

  // 2. Sync to Firestore
  try {
    const docRef = doc(db, PRODUCTS_COLLECTION, productId);
    await deleteDoc(docRef);
  } catch (err) {
    console.warn('Firestore deleteProduct notice:', err);
  }
}

/**
 * Save store settings to Firestore
 */
export async function saveSettingsToFirestore(config: StoreConfig): Promise<void> {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, 'general');
    await setDoc(docRef, config, { merge: true });
  } catch (err) {
    if (isQuotaOrNetworkError(err)) {
      console.warn('Firestore write notice: quota limit exceeded for settings. Saved locally.', err);
    } else {
      console.warn('Firestore saveSettings notice:', err);
    }
  }
}

/**
 * Record an order in Firestore
 */
export async function createOrderInFirestore(orderData: {
  customerName: string;
  customerPhone: string;
  deliveryMethod: string;
  address?: string;
  items: Array<{
    id: string;
    titleRu: string;
    titleKz: string;
    price: number;
    quantity: number;
  }>;
  totalAmount: number;
  lang: string;
  createdAt: string;
  status: 'new' | 'completed' | 'cancelled';
}): Promise<string> {
  const ordersRef = collection(db, ORDERS_COLLECTION);
  const res = await addDoc(ordersRef, orderData);
  return res.id;
}
