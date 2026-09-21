import React, { useState, useEffect, useMemo } from 'react';
import {
  Users,
  Eye,
  Smartphone,
  Monitor,
  TrendingUp,
  Clock,
  ShieldCheck,
  Package,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { DailyAnalytics, AnalyticsOverview, VisitLogItem, Product } from '../types';
import {
  subscribeToDailyAnalytics,
  subscribeToAnalyticsOverview,
  subscribeToRecentVisits,
  isIgnoreAdminVisits,
  setIgnoreAdminVisits,
  getTodayDateString,
} from '../services/analyticsService';

interface AnalyticsTabProps {
  products: Product[];
  currency: string;
}

export const AnalyticsTab: React.FC<AnalyticsTabProps> = ({ products, currency }) => {
  const [dailyData, setDailyData] = useState<DailyAnalytics[]>([]);
  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [recentVisits, setRecentVisits] = useState<VisitLogItem[]>([]);
  const [selectedRange, setSelectedRange] = useState<'7' | '14' | '30'>('7');
  const [hoveredDay, setHoveredDay] = useState<DailyAnalytics | null>(null);
  const [ignoreAdmin, setIgnoreAdmin] = useState<boolean>(() => isIgnoreAdminVisits());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const unsubDaily = subscribeToDailyAnalytics(30, (data) => {
      setDailyData(data);
    });
    const unsubOverview = subscribeToAnalyticsOverview((data) => {
      setOverview(data);
    });
    const unsubVisits = subscribeToRecentVisits(30, (data) => {
      setRecentVisits(data);
    });

    return () => {
      unsubDaily();
      unsubOverview();
      unsubVisits();
    };
  }, []);

  const handleToggleIgnoreAdmin = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.checked;
    setIgnoreAdmin(val);
    setIgnoreAdminVisits(val);
  };

  const todayStr = getTodayDateString();

  // Find today's specific stats
  const todayStats = useMemo(() => {
    return (
      dailyData.find((d) => d.date === todayStr) || {
        id: todayStr,
        date: todayStr,
        totalVisits: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        mobileVisits: 0,
        desktopVisits: 0,
        ruVisits: 0,
        kzVisits: 0,
        productViews: {},
        updatedAt: '',
      }
    );
  }, [dailyData, todayStr]);

  // Filter daily data by range
  const filteredDailyData = useMemo(() => {
    const count = parseInt(selectedRange, 10);
    // If we have less data than days, pad or slice
    if (dailyData.length <= count) {
      return dailyData;
    }
    return dailyData.slice(-count);
  }, [dailyData, selectedRange]);

  // Calculate totals for selected range
  const rangeTotals = useMemo(() => {
    return filteredDailyData.reduce(
      (acc, d) => {
        acc.totalVisits += d.totalVisits;
        acc.uniqueVisitors += d.uniqueVisitors;
        acc.pageViews += d.pageViews;
        acc.mobileVisits += d.mobileVisits;
        acc.desktopVisits += d.desktopVisits;
        acc.ruVisits += d.ruVisits;
        acc.kzVisits += d.kzVisits;
        return acc;
      },
      {
        totalVisits: 0,
        uniqueVisitors: 0,
        pageViews: 0,
        mobileVisits: 0,
        desktopVisits: 0,
        ruVisits: 0,
        kzVisits: 0,
      }
    );
  }, [filteredDailyData]);

  // Max value for chart height scaling
  const maxChartValue = useMemo(() => {
    let max = 5;
    filteredDailyData.forEach((d) => {
      if (d.pageViews > max) max = d.pageViews;
      if (d.totalVisits > max) max = d.totalVisits;
      if (d.uniqueVisitors > max) max = d.uniqueVisitors;
    });
    return Math.ceil(max * 1.25);
  }, [filteredDailyData]);

  // Aggregate most viewed products
  const topProducts = useMemo(() => {
    const map: Record<string, { title: string; count: number; productId: string }> = {};

    filteredDailyData.forEach((day) => {
      if (day.productViews) {
        const views = day.productViews as Record<string, { title?: string; count?: number }>;
        Object.entries(views).forEach(([prodId, info]) => {
          if (!map[prodId]) {
            map[prodId] = { productId: prodId, title: info?.title || 'Товар', count: 0 };
          }
          map[prodId].count += info?.count || 0;
        });
      }
    });

    const list = Object.values(map).sort((a, b) => b.count - a.count);

    // Map to products with image
    return list.slice(0, 6).map((item) => {
      const prod = products.find((p) => p.id === item.productId);
      return {
        ...item,
        image: prod?.images?.[0] || '',
        price: prod?.price || 0,
      };
    });
  }, [filteredDailyData, products]);

  // Device percentage
  const totalDeviceVisits = rangeTotals.mobileVisits + rangeTotals.desktopVisits;
  const mobilePercent = totalDeviceVisits > 0 ? Math.round((rangeTotals.mobileVisits / totalDeviceVisits) * 100) : 85;
  const desktopPercent = 100 - mobilePercent;

  // Format date readable (e.g. 21 сен)
  const formatDateLabel = (dStr: string) => {
    try {
      const parts = dStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short' });
      }
      return dStr;
    } catch {
      return dStr;
    }
  };

  const formatTimeAgo = (isoString: string) => {
    try {
      const d = new Date(isoString);
      const diffMs = Date.now() - d.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) return 'Только что';
      if (diffMins < 60) return `${diffMins} мин назад`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours} ч назад`;
      return d.toLocaleDateString('ru-RU', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Недавно';
    }
  };

  return (
    <div className="space-y-6 pb-12 animate-in fade-in">
      {/* Header with Live Status & Controls */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-600"></span>
            </span>
            <h3 className="font-extrabold text-stone-900 text-base">
              Статистика посещаемости магазина
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
              Live Firestore
            </span>
          </div>
          <p className="text-xs text-stone-500 mt-1">
            Точный учет реальных посетителей, просмотров витрины и популярных товаров
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Admin Exclusion Switch */}
          <label className="flex items-center gap-2 text-xs font-semibold text-stone-700 bg-stone-50 hover:bg-stone-100 px-3 py-2 rounded-xl border border-stone-200 cursor-pointer transition-colors">
            <input
              type="checkbox"
              checked={ignoreAdmin}
              onChange={handleToggleIgnoreAdmin}
              className="w-4 h-4 rounded text-emerald-700 focus:ring-emerald-600 cursor-pointer"
            />
            <ShieldCheck className="w-3.5 h-3.5 text-stone-500" />
            <span>Не учитывать мои визиты (я админ)</span>
          </label>

          {/* Period selector */}
          <div className="flex items-center bg-stone-100 p-1 rounded-xl text-xs font-bold text-stone-600 border border-stone-200">
            {(['7', '14', '30'] as const).map((range) => (
              <button
                key={range}
                type="button"
                onClick={() => setSelectedRange(range)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  selectedRange === range
                    ? 'bg-white text-emerald-950 shadow-xs'
                    : 'hover:text-stone-900'
                }`}
              >
                {range === '7' ? '7 дней' : range === '14' ? '14 дней' : '30 дней'}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Today Visitors */}
        <div className="bg-gradient-to-br from-emerald-900 to-emerald-950 rounded-2xl p-5 text-white shadow-md relative overflow-hidden">
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-emerald-700/20 rounded-full blur-xl pointer-events-none" />
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-200 uppercase tracking-wider">
              Сегодня
            </span>
            <div className="w-8 h-8 rounded-xl bg-emerald-800/60 flex items-center justify-center text-emerald-200">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black tracking-tight">
              {todayStats.uniqueVisitors}
            </div>
            <p className="text-xs text-emerald-200/90 font-medium mt-0.5">
              уникальных посетителей
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-emerald-800/60 flex items-center justify-between text-[11px] text-emerald-300">
            <span>Всего заходов: {todayStats.totalVisits}</span>
            <span>Просмотров: {todayStats.pageViews}</span>
          </div>
        </div>

        {/* Card 2: Selected Range Unique Visitors */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              За {selectedRange} дней
            </span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-stone-900 tracking-tight">
              {rangeTotals.uniqueVisitors}
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              клиентов за период
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Визитов: {rangeTotals.totalVisits}</span>
            <span>Просмотров: {rangeTotals.pageViews}</span>
          </div>
        </div>

        {/* Card 3: All-time overview */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              За всё время
            </span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center">
              <Eye className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-stone-900 tracking-tight">
              {overview?.totalVisitsAllTime || rangeTotals.totalVisits || 0}
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              всего заходов на сайт
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span>Уникальных: {overview?.uniqueVisitorsAllTime || rangeTotals.uniqueVisitors || 0}</span>
            <span>Просмотров: {overview?.totalPageViewsAllTime || rangeTotals.pageViews || 0}</span>
          </div>
        </div>

        {/* Card 4: Device breakdown */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-stone-500 uppercase tracking-wider">
              Устройства
            </span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-black text-stone-900 tracking-tight">
              {mobilePercent}%
            </div>
            <p className="text-xs text-stone-500 font-medium mt-0.5">
              со смартфонов
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-500">
            <span className="flex items-center gap-1">
              <Smartphone className="w-3 h-3" /> {mobilePercent}%
            </span>
            <span className="flex items-center gap-1">
              <Monitor className="w-3 h-3" /> Компьютеры: {desktopPercent}%
            </span>
          </div>
        </div>
      </div>

      {/* Interactive Daily Traffic Chart */}
      <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-700" />
              <span>Динамика посещений по дням ({selectedRange} дней)</span>
            </h4>
            <p className="text-xs text-stone-500 mt-0.5">
              Наведите курсор или нажмите на столбец, чтобы увидеть подробности за конкретный день
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-semibold text-stone-600">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-700 inline-block" />
              <span>Уникальные клиенты</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-emerald-200 inline-block" />
              <span>Просмотры страниц</span>
            </div>
          </div>
        </div>

        {/* Chart View */}
        {filteredDailyData.length === 0 ? (
          <div className="py-16 text-center text-stone-400 text-xs">
            <Calendar className="w-8 h-8 mx-auto mb-2 text-stone-300" />
            <p className="font-semibold">Данные о посещениях начали фиксироваться</p>
            <p className="text-[11px] text-stone-400 mt-0.5">
              Как только первые посетители откроют сайт, здесь появится график динамики
            </p>
          </div>
        ) : (
          <div className="pt-4">
            <div className="h-56 w-full flex items-end gap-1 sm:gap-2 pb-2 border-b border-stone-200">
              {filteredDailyData.map((day) => {
                const isToday = day.date === todayStr;
                const uniqueHeight = Math.max(
                  6,
                  Math.min(100, Math.round((day.uniqueVisitors / maxChartValue) * 100))
                );
                const pageViewsHeight = Math.max(
                  8,
                  Math.min(100, Math.round((day.pageViews / maxChartValue) * 100))
                );

                const isHovered = hoveredDay?.date === day.date;

                return (
                  <div
                    key={day.date}
                    className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer relative"
                    onMouseEnter={() => setHoveredDay(day)}
                    onMouseLeave={() => setHoveredDay(null)}
                    onClick={() => setHoveredDay(day)}
                  >
                    {/* Hover tooltip */}
                    {isHovered && (
                      <div className="absolute -top-24 z-30 bg-stone-900 text-white rounded-xl px-3 py-2 text-xs shadow-xl pointer-events-none whitespace-nowrap min-w-[130px] animate-in fade-in zoom-in-95">
                        <div className="font-bold text-stone-200 border-b border-stone-700 pb-1 mb-1 flex items-center justify-between">
                          <span>{formatDateLabel(day.date)}</span>
                          {isToday && <span className="text-[10px] text-emerald-400">Сегодня</span>}
                        </div>
                        <div className="text-[11px] text-stone-300 space-y-0.5">
                          <div className="flex justify-between gap-2">
                            <span>Уникальных:</span>
                            <span className="font-bold text-white">{day.uniqueVisitors}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span>Всего заходов:</span>
                            <span className="font-bold text-white">{day.totalVisits}</span>
                          </div>
                          <div className="flex justify-between gap-2">
                            <span>Просмотров:</span>
                            <span className="font-bold text-white">{day.pageViews}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Bars pair */}
                    <div className="w-full max-w-[28px] flex items-end justify-center gap-0.5 sm:gap-1 h-full">
                      {/* Unique Visitors Bar */}
                      <div
                        style={{ height: `${uniqueHeight}%` }}
                        className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                          isToday
                            ? 'bg-emerald-600 hover:bg-emerald-500'
                            : 'bg-emerald-800 hover:bg-emerald-700'
                        } ${isHovered ? 'ring-2 ring-emerald-400' : ''}`}
                      />
                      {/* PageViews Bar */}
                      <div
                        style={{ height: `${pageViewsHeight}%` }}
                        className={`w-1/2 rounded-t-sm transition-all duration-300 ${
                          isToday
                            ? 'bg-emerald-300 hover:bg-emerald-200'
                            : 'bg-emerald-200 hover:bg-emerald-100'
                        } ${isHovered ? 'ring-2 ring-emerald-300' : ''}`}
                      />
                    </div>

                    {/* Date label */}
                    <span
                      className={`text-[10px] mt-2 font-semibold transition-colors ${
                        isToday
                          ? 'text-emerald-800 font-extrabold'
                          : 'text-stone-500 group-hover:text-stone-900'
                      }`}
                    >
                      {formatDateLabel(day.date)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Quick summary below chart */}
            <div className="flex flex-wrap items-center justify-between text-xs text-stone-500 pt-2 font-medium">
              <span>Шкала графика масштабируется автоматически (макс: {maxChartValue})</span>
              <span>Всего за {selectedRange} дн: {rangeTotals.uniqueVisitors} уник. клиентов</span>
            </div>
          </div>
        )}
      </div>

      {/* Two columns: Top Products & Live Stream of Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Most Viewed Products */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <Package className="w-4 h-4 text-emerald-800" />
              <span>Популярные товары (по просмотрам)</span>
            </h4>
            <span className="text-[11px] text-stone-500">За {selectedRange} дней</span>
          </div>

          {topProducts.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <p className="font-semibold">Просмотры товаров пока не накоплены</p>
              <p className="text-[11px] text-stone-400 mt-1">
                Когда клиенты открывают карточки товаров, здесь сформируется рейтинг спроса
              </p>
            </div>
          ) : (
            <div className="space-y-2.5">
              {topProducts.map((item, idx) => (
                <div
                  key={item.productId}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 hover:bg-stone-100/80 transition-colors border border-stone-100"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-black shrink-0 ${
                        idx === 0
                          ? 'bg-amber-400 text-amber-950 shadow-xs'
                          : idx === 1
                          ? 'bg-stone-300 text-stone-800'
                          : idx === 2
                          ? 'bg-amber-700/20 text-amber-900'
                          : 'bg-stone-200 text-stone-600'
                      }`}
                    >
                      {idx + 1}
                    </span>
                    {item.image && (
                      <img
                        src={item.image}
                        alt=""
                        className="w-10 h-10 rounded-lg object-cover bg-stone-100 shrink-0 border border-stone-200"
                      />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-stone-900 truncate">
                        {item.title}
                      </p>
                      {item.price > 0 && (
                        <p className="text-[11px] text-emerald-800 font-semibold">
                          {item.price.toLocaleString('ru-RU')} {currency}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-3">
                    <span className="inline-flex items-center gap-1 text-xs font-extrabold text-stone-800 bg-white px-2.5 py-1 rounded-lg border border-stone-200 shadow-2xs">
                      <Eye className="w-3 h-3 text-emerald-700" />
                      <span>{item.count}</span>
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Live Recent Visitors Stream */}
        <div className="bg-white rounded-2xl p-5 border border-stone-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-extrabold text-stone-900 text-sm flex items-center gap-2">
              <Clock className="w-4 h-4 text-emerald-800" />
              <span>Журнал последних посещений (Live)</span>
            </h4>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              Потоковые данные
            </span>
          </div>

          {recentVisits.length === 0 ? (
            <div className="py-12 text-center text-stone-400 text-xs">
              <Clock className="w-8 h-8 mx-auto mb-2 text-stone-300" />
              <p className="font-semibold">Ожидание первых посещений</p>
              <p className="text-[11px] text-stone-400 mt-1">
                Каждый новый визит клиента сразу фиксируется в этом списке
              </p>
            </div>
          ) : (
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {recentVisits.slice(0, 10).map((v) => (
                <div
                  key={v.id}
                  className="flex items-center justify-between p-2.5 rounded-xl bg-stone-50 border border-stone-100 text-xs hover:bg-stone-100 transition-colors"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-7 h-7 rounded-lg bg-emerald-100 text-emerald-900 flex items-center justify-center shrink-0">
                      {v.device === 'mobile' ? (
                        <Smartphone className="w-3.5 h-3.5" />
                      ) : (
                        <Monitor className="w-3.5 h-3.5" />
                      )}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-stone-900 truncate">
                          Клиент #{v.visitorId}
                        </span>
                        {v.isNewVisitor && (
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-emerald-100 text-emerald-800 uppercase">
                            Новый
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-stone-500 truncate">
                        {v.page} • {v.referrer}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0 pl-2">
                    <span className="text-[10px] font-semibold text-stone-500 block">
                      {formatTimeAgo(v.timestamp)}
                    </span>
                    <span className="text-[9px] uppercase font-bold text-stone-400">
                      {v.lang}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Practical Guide for Store Owner */}
      <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 text-xs text-stone-600 space-y-2">
        <h5 className="font-bold text-stone-900 flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Как понимать эти цифры и привлекать больше клиентов?</span>
        </h5>
        <ul className="list-disc list-inside space-y-1 text-stone-600 text-[11px] leading-relaxed">
          <li>
            <strong>Уникальные посетители</strong> — это реальные люди (телефоны или компьютеры). Если один и тот же человек заходит 5 раз в день, в «уникальных» он посчитается 1 раз, а в «заходах» — 5 раз.
          </li>
          <li>
            <strong>Источники визитов</strong>: разместите ссылку на ваш сайт в шапке профиля Instagram (Taplink/Bio), добавьте в описание карточки 2ГИС и делитесь товарами в статусе WhatsApp — переходы сразу отразятся здесь.
          </li>
          <li>
            <strong>Популярные товары</strong> показывают, что больше всего интересует покупателей — держите эти позиции в наличии в первую очередь!
          </li>
        </ul>
      </div>
    </div>
  );
};
