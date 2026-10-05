import React, { useState, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ShoppingBag,
  Sparkles,
  Flame,
  MapPin,
  ShieldCheck,
  Truck,
  Eye,
  ArrowLeft,
  ArrowRight,
} from 'lucide-react';
import { Language, Product, StoreConfig } from '../types';
import { formatPrice } from '../utils/formatters';

interface BoutiqueStoriesProps {
  products: Product[];
  config: StoreConfig;
  lang: Language;
  onOpenProduct: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onSelectCategory: (categoryId: string) => void;
}

interface StorySlide {
  id: string;
  type: 'product' | 'info';
  product?: Product;
  badgeRu: string;
  badgeKz: string;
  titleRu: string;
  titleKz: string;
  subtitleRu: string;
  subtitleKz: string;
  bulletsRu?: string[];
  bulletsKz?: string[];
  ctaLabelRu?: string;
  ctaLabelKz?: string;
  ctaUrl?: string;
  ctaCategory?: string;
  bgGradient: string;
}

interface StoryGroup {
  id: string;
  titleRu: string;
  titleKz: string;
  tagRu: string;
  tagKz: string;
  ringGradient: string;
  coverImage?: string;
  iconType: 'new' | 'hits' | 'location' | 'authentic' | 'delivery';
  slides: StorySlide[];
}

const SEEN_STORIES_STORAGE_KEY = 'muslim_shop_seen_stories_v1';

export const BoutiqueStories: React.FC<BoutiqueStoriesProps> = ({
  products,
  config,
  lang,
  onOpenProduct,
  onAddToCart,
  onSelectCategory,
}) => {
  const isKz = lang === 'kz';
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState<number>(0);
  const [shuffleSeed] = useState<number>(() => Math.floor(Math.random() * 10000));
  const [seenIds, setSeenIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(SEEN_STORIES_STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch {
      return [];
    }
  });

  // Build dynamic Story Groups from live catalog products & store config
  const storyGroups: StoryGroup[] = useMemo(() => {
    const inStockProducts = products.filter((p) => p.inStock && p.images && p.images[0]);

    const rotateList = (list: Product[], count: number, offset: number): Product[] => {
      if (list.length <= count) return list;
      const rotated = [...list].sort((a, b) => {
        const hashA = ((a.id.charCodeAt(a.id.length - 1) || 1) * 31 + shuffleSeed + offset) % 97;
        const hashB = ((b.id.charCodeAt(b.id.length - 1) || 1) * 31 + shuffleSeed + offset) % 97;
        return hashA - hashB;
      });
      return rotated.slice(0, count);
    };

    const newPool = inStockProducts.filter((p) => p.isNew);
    const hitPool = inStockProducts.filter((p) => p.isHit);

    const effectiveNew =
      newPool.length >= 2
        ? rotateList(newPool, 5, 11)
        : rotateList(inStockProducts, 5, 11);

    const effectiveHits =
      hitPool.length >= 2
        ? rotateList(hitPool, 5, 29)
        : rotateList(inStockProducts, 5, 29);

    // 1. Новое поступление
    const newSlides: StorySlide[] =
      effectiveNew.length > 0
        ? effectiveNew.map((prod) => ({
            id: `story-new-${prod.id}`,
            type: 'product',
            product: prod,
            badgeRu: 'НОВИНКА НЕДЕЛИ',
            badgeKz: 'АПТА ЖАҢАЛЫҒЫ',
            titleRu: prod.titleRu,
            titleKz: prod.titleKz || prod.titleRu,
            subtitleRu: prod.descriptionRu || 'Сертифицированная продукция высшего качества в наличии.',
            subtitleKz: prod.descriptionKz || prod.descriptionRu || 'Жоғары сапалы сертификатталған өнім қолда бар.',
            bgGradient: 'from-stone-950 via-stone-900 to-amber-950/40',
          }))
        : [];

    // 2. Хиты продаж
    const hitSlides: StorySlide[] =
      effectiveHits.length > 0
        ? effectiveHits.map((prod) => ({
            id: `story-hit-${prod.id}`,
            type: 'product',
            product: prod,
            badgeRu: 'ХИТ ПРОДАЖ',
            badgeKz: 'ХИТ ТАУАР',
            titleRu: prod.titleRu,
            titleKz: prod.titleKz || prod.titleRu,
            subtitleRu: prod.descriptionRu || 'Лидер доверия сотен покупателей Бутика №24.',
            subtitleKz: prod.descriptionKz || prod.descriptionRu || '№24 Бутик сатып алушыларының таңдауы.',
            bgGradient: 'from-stone-950 via-stone-900 to-amber-950/40',
          }))
        : [];

    // 3. Информация о бутике в Атырау
    const locationSlides: StorySlide[] = [
      {
        id: 'story-loc-1',
        type: 'info',
        badgeRu: 'АТЫРАУ · ТД «ДИНА БАЙЗАР»',
        badgeKz: 'АТЫРАУ · «ДИНА БАЙЗАР» СҮ',
        titleRu: 'Бутик №24 — ваш надёжный халяль-магазин',
        titleKz: '№24 Бутик — сіздің сенімді халал дүкеніңіз',
        subtitleRu: 'Приходите за оригинальными витаминами, маслами и БАДами каждый день без перерывов.',
        subtitleKz: 'Күн сайын түпнұсқа дәрумендер, майлар мен ББҚ алуға келіңіз.',
        bulletsRu: [
          '📍 Адрес: ТД «Дина Байзар», Бутик №24',
          '🕙 Время работы: 10:00 – 19:00',
          '📞 Телефон: +7 (778) 175-42-41',
          '💳 Оплата: Kaspi QR, Kaspi Pay, наличные',
        ],
        bulletsKz: [
          '📍 Мекенжайы: «Дина Байзар» СҮ, №24 Бутик',
          '🕙 Жұмыс уақыты: 10:00 – 19:00',
          '📞 Телефон: +7 (778) 175-42-41',
          '💳 Төлем: Kaspi QR, Kaspi Pay, қолма-қол',
        ],
        ctaLabelRu: 'Маршрут в 2GIS',
        ctaLabelKz: '2GIS маршруты',
        ctaUrl: config.gis2Url || 'https://2gis.kz/atyrau',
        bgGradient: 'from-stone-950 via-stone-900 to-emerald-950/50',
      },
    ];

    // 4. Подлинность и халяль 100%
    const authenticSlides: StorySlide[] = [
      {
        id: 'story-auth-1',
        type: 'info',
        badgeRu: '100% ОРИГИНАЛ ИЗ США И ОАЭ',
        badgeKz: '100% ТҮПНҰСҚА АҚШ ЖӘНЕ БӘӘ-ДЕН',
        titleRu: 'Строгий контроль каждой партии',
        titleKz: 'Әрбір партияны қатаң тексеру',
        subtitleRu: 'Мы закупаем продукцию только у официальных дистрибьюторов брендов Now Foods, Solgar, California Gold Nutrition.',
        subtitleKz: 'Біз өнімдерді тек Now Foods, Solgar, California Gold Nutrition ресми өкілдерінен аламыз.',
        bulletsRu: [
          '🌿 Халяль-стандарты и чистота состава',
          '🔍 Заводские пломбы и QR-проверка',
          '❄️ Соблюдение температурного режима хранения',
          '🤝 Гарантия возврата при несоответствии',
        ],
        bulletsKz: [
          '🌿 Халал стандарттары мен таза құрам',
          '🔍 Зауыттық пломбалар мен QR-тексеру',
          '❄️ Сақтау температурасының талаптары',
          '🤝 Сәйкессіздік болған жағдайда қайтару',
        ],
        ctaLabelRu: 'Смотреть витамины',
        ctaLabelKz: 'Витаминдерді көру',
        ctaCategory: 'cat-iherb',
        bgGradient: 'from-stone-950 via-stone-900 to-amber-950/50',
      },
    ];

    // 5. Доставка и самовывоз
    const deliverySlides: StorySlide[] = [
      {
        id: 'story-del-1',
        type: 'info',
        badgeRu: 'ДОСТАВКА В ДЕНЬ ЗАКАЗА',
        badgeKz: 'ТАПСЫРЫС БЕРГЕН КҮНІ ЖЕТКІЗУ',
        titleRu: 'Быстро доставим до вашей двери',
        titleKz: 'Есігіңізге дейін жылдам жеткіземіз',
        subtitleRu: 'Отправляем курьером по Атырау в течение 1–2 часов. Также отправляем во все города Казахстана.',
        subtitleKz: 'Атырау бойынша курьермен 1–2 сағатта жеткіземіз. Сондай-ақ Қазақстанның барлық қалаларына жібереміз.',
        bulletsRu: [
          '⚡ Курьер по Атырау (день в день)',
          '🏬 Бесплатный самовывоз из Бутика №24',
          '📦 Отправка по Казахстану через Казпочту / Indriver',
          '📲 Заказ через сайт или WhatsApp',
        ],
        bulletsKz: [
          '⚡ Атырау бойынша курьер (сол күні)',
          '🏬 №24 Бутиктен тегін алып кету',
          '📦 Қазақстан бойынша Қазпошта / Indriver арқылы',
          '📲 Сайт немесе WhatsApp арқылы тапсырыс',
        ],
        ctaLabelRu: 'Написать на WhatsApp',
        ctaLabelKz: 'WhatsApp-қа жазу',
        ctaUrl: `https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent('Ассаляму алейкум! Хочу оформить доставку из Muslim Shop.')}`,
        bgGradient: 'from-stone-950 via-stone-900 to-emerald-950/50',
      },
    ];

    const groups: StoryGroup[] = [];

    if (newSlides.length > 0) {
      groups.push({
        id: 'grp-new',
        titleRu: 'Новые поступления',
        titleKz: 'Жаңа өнімдер',
        tagRu: 'НОВИНКИ',
        tagKz: 'ЖАҢА',
        ringGradient: 'from-amber-400 via-yellow-500 to-amber-600',
        coverImage: effectiveNew[0]?.images?.[0],
        iconType: 'new',
        slides: newSlides,
      });
    }

    if (hitSlides.length > 0) {
      groups.push({
        id: 'grp-hits',
        titleRu: 'Хиты продаж',
        titleKz: 'Хит тауарлар',
        tagRu: 'ХИТЫ',
        tagKz: 'ХИТ',
        ringGradient: 'from-amber-500 via-orange-500 to-amber-600',
        coverImage: effectiveHits[0]?.images?.[0],
        iconType: 'hits',
        slides: hitSlides,
      });
    }

    groups.push({
      id: 'grp-loc',
      titleRu: 'О Бутике №24',
      titleKz: '№24 Бутик туралы',
      tagRu: 'АТЫРАУ',
      tagKz: 'АТЫРАУ',
      ringGradient: 'from-emerald-400 via-teal-500 to-emerald-600',
      iconType: 'location',
      slides: locationSlides,
    });

    groups.push({
      id: 'grp-auth',
      titleRu: '100% Оригинал',
      titleKz: '100% Түпнұсқа',
      tagRu: 'ОРИГИНАЛ',
      tagKz: 'САПА',
      ringGradient: 'from-amber-400 via-yellow-500 to-amber-600',
      iconType: 'authentic',
      slides: authenticSlides,
    });

    groups.push({
      id: 'grp-del',
      titleRu: 'Доставка по РК',
      titleKz: 'Жеткізу қызметі',
      tagRu: 'ДОСТАВКА',
      tagKz: 'ЖЕТКІЗУ',
      ringGradient: 'from-emerald-400 via-teal-500 to-emerald-600',
      iconType: 'delivery',
      slides: deliverySlides,
    });

    return groups;
  }, [products, config, shuffleSeed]);

  const activeGroup = activeGroupIndex !== null ? storyGroups[activeGroupIndex] : null;
  const activeSlide = activeGroup ? activeGroup.slides[activeSlideIndex] : null;

  const markGroupSeen = (groupId: string) => {
    if (!seenIds.includes(groupId)) {
      const next = [...seenIds, groupId];
      setSeenIds(next);
      try {
        localStorage.setItem(SEEN_STORIES_STORAGE_KEY, JSON.stringify(next));
      } catch {}
    }
  };

  const openStoryGroup = (groupIndex: number) => {
    setActiveGroupIndex(groupIndex);
    setActiveSlideIndex(0);
    const grp = storyGroups[groupIndex];
    if (grp) markGroupSeen(grp.id);
  };

  const closeStories = () => {
    setActiveGroupIndex(null);
    setActiveSlideIndex(0);
  };

  const goNextSlide = () => {
    if (!activeGroup) return;
    if (activeSlideIndex < activeGroup.slides.length - 1) {
      setActiveSlideIndex((prev) => prev + 1);
    } else if (activeGroupIndex !== null && activeGroupIndex < storyGroups.length - 1) {
      const nextGroupIdx = activeGroupIndex + 1;
      const nextGrp = storyGroups[nextGroupIdx];
      setActiveGroupIndex(nextGroupIdx);
      setActiveSlideIndex(0);
      if (nextGrp) markGroupSeen(nextGrp.id);
    } else {
      closeStories();
    }
  };

  const goPrevSlide = () => {
    if (!activeGroup) return;
    if (activeSlideIndex > 0) {
      setActiveSlideIndex((prev) => prev - 1);
    } else if (activeGroupIndex !== null && activeGroupIndex > 0) {
      const prevGroupIdx = activeGroupIndex - 1;
      const prevGroup = storyGroups[prevGroupIdx];
      setActiveGroupIndex(prevGroupIdx);
      setActiveSlideIndex(prevGroup.slides.length - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    if (activeGroupIndex === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeStories();
      if (e.key === 'ArrowRight') goNextSlide();
      if (e.key === 'ArrowLeft') goPrevSlide();
    };
    window.addEventListener('keydown', handleKey);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKey);
    };
  }, [activeGroupIndex, activeSlideIndex]);

  const renderGroupIcon = (type: StoryGroup['iconType']) => {
    const cls = 'w-8 h-8 text-[#D4AF37]';
    switch (type) {
      case 'new':
        return <Sparkles className={cls} />;
      case 'hits':
        return <Flame className={cls} />;
      case 'location':
        return <MapPin className={cls} />;
      case 'authentic':
        return <ShieldCheck className={cls} />;
      case 'delivery':
        return <Truck className={cls} />;
    }
  };

  return (
    <>
      {/* Large Status & Stories Section for Visually Impaired Shoppers */}
      <section
        id="boutique-stories-bar"
        aria-label={isKz ? 'Бутик мәртебелері мен стористері' : 'Статусы и сторис бутика'}
        className="w-full bg-[#111111] border-b-2 border-[#242424] py-6 sm:py-8"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <div className="flex items-center gap-3">
              <span className="w-1.5 h-6 bg-[#C5A059] rounded-full" />
              <h2 className="text-lg sm:text-2xl font-black text-white tracking-tight">
                {isKz ? 'БУТИК СТАТУСЫ МЕН СТОРИСТЕРІ' : 'СТАТУС И СТОРИС БУТИКА №24'}
              </h2>
            </div>
            <span className="text-xs sm:text-sm font-bold text-[#A3A3A3]">
              {isKz ? 'Толық көру үшін карточканы басыңыз' : 'Нажмите на карточку для просмотра'}
            </span>
          </div>

          {/* Large Status Cards Grid / Horizontal Scroll */}
          <div className="flex items-stretch gap-4 sm:gap-6 overflow-x-auto pb-3 pt-1">
            {storyGroups.map((group, idx) => {
              const isSeen = seenIds.includes(group.id);
              return (
                <button
                  key={group.id}
                  id={`story-trigger-${group.id}`}
                  type="button"
                  onClick={() => openStoryGroup(idx)}
                  className={`group relative flex flex-col justify-between w-48 sm:w-60 h-64 sm:h-72 rounded-2xl p-4 shrink-0 text-left bg-[#181818] border-2 transition-colors cursor-pointer shadow-lg ${
                    isSeen
                      ? 'border-[#2E2E2E] opacity-90'
                      : 'border-[#C5A059] hover:bg-[#202020]'
                  }`}
                >
                  {/* Top Area: Badge & Icon / Photo */}
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-black uppercase tracking-wider bg-[#C5A059] text-black">
                        {isKz ? group.tagKz : group.tagRu}
                      </span>
                      <span className="text-xs font-mono font-bold text-[#8E8E8E]">
                        {group.slides.length} {isKz ? 'бет' : 'фото'}
                      </span>
                    </div>

                    <div className="w-full h-28 sm:h-32 rounded-xl bg-[#222222] border border-[#333333] overflow-hidden flex items-center justify-center relative mb-3">
                      {group.coverImage ? (
                        <img
                          src={group.coverImage}
                          alt={isKz ? group.titleKz : group.titleRu}
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="flex items-center justify-center p-4">
                          {renderGroupIcon(group.iconType)}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom Area: Large Title & View Action */}
                  <div className="space-y-2">
                    <h3 className="font-black text-white text-sm sm:text-base leading-snug line-clamp-2">
                      {isKz ? group.titleKz : group.titleRu}
                    </h3>
                    <div className="flex items-center justify-between text-xs sm:text-sm font-bold text-[#D4AF37] pt-1 border-t border-[#2A2A2A]">
                      <span>{isKz ? 'Қарап шығу' : 'Смотреть'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Manual, Big, High-Contrast Story Viewer Modal (No Auto-timer, No Freezing) */}
      {activeGroup &&
        activeSlide &&
        createPortal(
          <div
            id="story-viewer-backdrop"
            className="fixed inset-0 z-[130] bg-black/90 flex items-center justify-center p-2 sm:p-4 select-none"
            onClick={closeStories}
          >
            <div
              id="story-viewer-card"
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-lg h-[92vh] sm:h-[86vh] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#C5A059] flex flex-col justify-between bg-[#141414] text-white"
            >
              {/* Header: Slide Count & Controls */}
              <div className="p-4 sm:p-5 bg-[#1B1B1B] border-b border-[#2C2C2C] flex items-center justify-between gap-3 z-20">
                <div className="flex items-center gap-2">
                  <span className="text-xs sm:text-sm font-black px-2.5 py-1 rounded-md bg-[#C5A059] text-black">
                    {activeSlideIndex + 1} / {activeGroup.slides.length}
                  </span>
                  <span className="text-sm sm:text-base font-bold text-white truncate max-w-[200px]">
                    {isKz ? activeGroup.titleKz : activeGroup.titleRu}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={closeStories}
                  className="px-4 py-2 rounded-xl bg-[#2A2A2A] hover:bg-[#3A3A3A] text-white font-black text-sm flex items-center gap-1.5 border border-[#444444] cursor-pointer"
                  aria-label="Закрыть"
                >
                  <X className="w-5 h-5 text-[#C5A059]" />
                  <span>{isKz ? 'Жабу' : 'Закрыть'}</span>
                </button>
              </div>

              {/* Main Slide Content Area */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-6 flex flex-col justify-center space-y-4">
                {activeSlide.type === 'product' && activeSlide.product ? (
                  <div className="space-y-4">
                    <div
                      onClick={() => {
                        const prod = activeSlide.product!;
                        closeStories();
                        onOpenProduct(prod);
                      }}
                      className="mx-auto w-56 h-64 sm:w-64 sm:h-72 rounded-2xl overflow-hidden border-2 border-[#C5A059] bg-white p-3 flex items-center justify-center cursor-pointer shadow-lg"
                    >
                      <img
                        src={activeSlide.product.images[0]}
                        alt={isKz ? activeSlide.titleKz : activeSlide.titleRu}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                      />
                    </div>

                    <div className="bg-[#1C1C1C] border border-[#333333] rounded-2xl p-4 sm:p-5 space-y-3">
                      <div className="flex items-center justify-between text-xs sm:text-sm font-black text-[#D4AF37]">
                        <span>{isKz ? activeSlide.badgeKz : activeSlide.badgeRu}</span>
                        <span className="text-2xl font-black text-[#D4AF37]">
                          {formatPrice(activeSlide.product.price)}
                        </span>
                      </div>

                      <h3 className="font-black text-lg sm:text-xl text-white leading-snug">
                        {isKz ? activeSlide.titleKz : activeSlide.titleRu}
                      </h3>

                      <p className="text-sm text-[#CCCCCC] leading-relaxed">
                        {isKz ? activeSlide.subtitleKz : activeSlide.subtitleRu}
                      </p>

                      <div className="grid grid-cols-2 gap-3 pt-2">
                        <button
                          type="button"
                          onClick={() => {
                            const prod = activeSlide.product!;
                            closeStories();
                            onOpenProduct(prod);
                          }}
                          className="py-3 px-3 rounded-xl bg-[#2A2A2A] hover:bg-[#383838] text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 border border-[#444444] cursor-pointer"
                        >
                          <Eye className="w-4 h-4 text-[#C5A059]" />
                          <span>{isKz ? 'Толығырақ' : 'Подробнее'}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            onAddToCart(activeSlide.product!);
                          }}
                          className="py-3 px-3 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4 stroke-[2.5]" />
                          <span>{isKz ? 'Себетке' : 'В корзину'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="bg-[#1C1C1C] border border-[#333333] rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
                    <span className="inline-block text-xs sm:text-sm font-black text-[#D4AF37] tracking-wide">
                      {isKz ? activeSlide.badgeKz : activeSlide.badgeRu}
                    </span>

                    <h3 className="font-black text-xl sm:text-2xl text-white leading-tight">
                      {isKz ? activeSlide.titleKz : activeSlide.titleRu}
                    </h3>

                    <p className="text-sm sm:text-base text-[#D4D4D4] leading-relaxed">
                      {isKz ? activeSlide.subtitleKz : activeSlide.subtitleRu}
                    </p>

                    {((isKz ? activeSlide.bulletsKz : activeSlide.bulletsRu) || []).length > 0 && (
                      <div className="space-y-2.5 pt-2 border-t border-[#2C2C2C]">
                        {(isKz ? activeSlide.bulletsKz : activeSlide.bulletsRu)!.map((bullet, bIdx) => (
                          <div
                            key={bIdx}
                            className="p-3 rounded-xl bg-[#252525] border border-[#333333] text-xs sm:text-sm text-white font-semibold flex items-center gap-2.5"
                          >
                            <span>{bullet}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {activeSlide.ctaLabelRu && (
                      <div className="pt-2">
                        {activeSlide.ctaCategory ? (
                          <button
                            type="button"
                            onClick={() => {
                              closeStories();
                              onSelectCategory(activeSlide.ctaCategory!);
                            }}
                            className="w-full py-3.5 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                          >
                            <span>{isKz ? activeSlide.ctaLabelKz : activeSlide.ctaLabelRu}</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        ) : activeSlide.ctaUrl ? (
                          <a
                            href={activeSlide.ctaUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3.5 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-black text-sm flex items-center justify-center gap-2 shadow-md text-center"
                          >
                            <span>{isKz ? activeSlide.ctaLabelKz : activeSlide.ctaLabelRu}</span>
                            <ArrowRight className="w-4 h-4" />
                          </a>
                        ) : null}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Bottom Manual Navigation Buttons */}
              <div className="p-4 bg-[#1B1B1B] border-t border-[#2C2C2C] flex items-center justify-between gap-3 z-20">
                <button
                  type="button"
                  onClick={goPrevSlide}
                  disabled={activeSlideIndex === 0 && activeGroupIndex === 0}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#262626] hover:bg-[#333333] disabled:opacity-40 text-white font-black text-sm flex items-center justify-center gap-2 border border-[#444444] cursor-pointer"
                >
                  <ChevronLeft className="w-5 h-5 text-[#C5A059]" />
                  <span>{isKz ? 'Алдыңғы' : 'Назад'}</span>
                </button>

                <button
                  type="button"
                  onClick={goNextSlide}
                  className="flex-1 py-3 px-4 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-black text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <span>{isKz ? 'Келесі' : 'Вперёд'}</span>
                  <ChevronRight className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};
