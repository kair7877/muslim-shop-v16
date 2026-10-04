import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  MapPin,
  MessageCircle,
  ShieldCheck,
  Truck,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  Clock,
} from 'lucide-react';
import { Category, Language, StoreConfig } from '../types';

interface HeroBannerProps {
  config: StoreConfig;
  lang: Language;
  onScrollToCatalog: () => void;
  categories?: Category[];
  selectedCategoryId?: string;
  onSelectCategory?: (id: string) => void;
}

interface SlideItem {
  id: string;
  badgeRu: string;
  badgeKz: string;
  titleRu: string;
  titleKz: string;
  subtitleRu: string;
  subtitleKz: string;
  btnTextRu: string;
  btnTextKz: string;
  image: string;
  categoryId?: string;
}

const HERO_SLIDES: SlideItem[] = [
  {
    id: 'slide-iherb',
    badgeRu: 'ПРЯМЫЕ ПОСТАВКИ ИЗ США · ХАЛЯЛЬ',
    badgeKz: 'АҚШ-ТАН ТІКЕЛЕЙ ЖЕТКІЗІЛІМ · ХАЛАЛ',
    titleRu: 'Оригинальные витамины iHerb и БАДы в Атырау',
    titleKz: 'Атыраудағы түпнұсқа iHerb дәрумендері мен ББҚ',
    subtitleRu: 'Сертифицированная продукция Now Foods, California Gold, Solgar. Омега-3, Витамин D3, Магний и Цинк в наличии в Бутике №24.',
    subtitleKz: 'Now Foods, California Gold, Solgar өнімдері. Омега-3, D3 дәрумені, Магний және Мырыш №24 Бутикте бар.',
    btnTextRu: 'Смотреть витамины',
    btnTextKz: 'Витаминдерді көру',
    image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-iherb',
  },
  {
    id: 'slide-islamic',
    badgeRu: '100% НАТУРАЛЬНОЕ КАЧЕСТВО',
    badgeKz: '100% ТАБИҒИ САПА',
    titleRu: 'Масло чёрного тмина, хиджама и арабский парфюм',
    titleKz: 'Қара зере майы, хиджама және араб әтірлері',
    subtitleRu: 'Прямые поставки из Саудовской Аравии, Египта и ОАЭ. Холодный отжим, натуральный горный мед и товары для Сунны.',
    subtitleKz: 'Сауд Арабиясы, Мысыр және БӘӘ-ден тікелей жеткізілім. Суық сығындылы зере майы және сүннет тауарлары.',
    btnTextRu: 'Исламские товары',
    btnTextKz: 'Ислам тауарлары',
    image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-muslim',
  },
  {
    id: 'slide-health',
    badgeRu: 'КОМПЛЕКСНОЕ ОЗДОРОВЛЕНИЕ',
    badgeKz: 'КЕШЕНДІ САУЫҚТЫРУ',
    titleRu: 'Мужское и женское здоровье: готовые курсы',
    titleKz: 'Ерлер мен әйелдер денсаулығы: дайын курстар',
    subtitleRu: 'Эпимедиумные пасты, комплексы для иммунитета, суставов, энергии и очищения организма.',
    subtitleKz: 'Эпимедиум пасталары, иммунитет, буын саулығы және қуатқа арналған табиғи кешендер.',
    btnTextRu: 'Подобрать курс',
    btnTextKz: 'Курсты таңдау',
    image: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?auto=format&fit=crop&w=1200&q=80',
    categoryId: 'cat-health',
  },
];

export const HeroBanner: React.FC<HeroBannerProps> = ({
  config,
  lang,
  onScrollToCatalog,
  onSelectCategory,
}) => {
  const isKz = lang === 'kz';
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const goToPrev = useCallback(() => {
    setCurrentSlide((prev) => (prev === 0 ? HERO_SLIDES.length - 1 : prev - 1));
  }, []);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartXRef.current === null) return;
    const diff = touchStartXRef.current - e.changedTouches[0].clientX;
    if (Math.abs(diff) > 40) {
      if (diff > 0) goToNext();
      else goToPrev();
    }
    touchStartXRef.current = null;
  };

  const handleSlideAction = (slide: SlideItem) => {
    if (slide.categoryId && onSelectCategory) {
      onSelectCategory(slide.categoryId);
    }
    onScrollToCatalog();
  };

  return (
    <section
      id="hero-section"
      className="w-full bg-[#0F0F0F] border-b border-[#242424] py-4 sm:py-6"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Main Banner Card */}
        <div
          id="hero-carousel-container"
          className="relative rounded-2xl overflow-hidden bg-[#141414] border border-[#262626] shadow-xl group select-none min-h-[360px] sm:min-h-[420px] flex flex-col justify-between"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Slider Track */}
          <div
            className="flex transition-transform duration-500 ease-out h-full"
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {HERO_SLIDES.map((slide) => (
              <div
                key={slide.id}
                className="w-full shrink-0 flex flex-col justify-between p-6 sm:p-12 relative overflow-hidden"
              >
                {/* Subtle Luxury Dark Overlay with Image */}
                <div
                  className="absolute inset-0 bg-cover bg-center opacity-20 pointer-events-none filter brightness-75 contrast-125"
                  style={{ backgroundImage: `url(${slide.image})` }}
                />
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#0E0E0E] via-[#0E0E0E]/90 to-transparent pointer-events-none"
                />

                {/* Content Box */}
                <div className="relative z-10 max-w-2xl space-y-4">
                  {/* Subtle Gold Badge */}
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-md bg-[#1C1C1C] border border-[#C5A059]/40 text-[#C5A059] text-xs font-black tracking-wider uppercase">
                    <span>{isKz ? slide.badgeKz : slide.badgeRu}</span>
                  </div>

                  {/* Main Title: Large, Bold, Crisp White */}
                  <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                    {isKz ? slide.titleKz : slide.titleRu}
                  </h1>

                  {/* Subtitle: Readable Gray */}
                  <p className="text-sm sm:text-base text-[#D4D4D4] leading-relaxed max-w-xl">
                    {isKz ? slide.subtitleKz : slide.subtitleRu}
                  </p>

                  {/* CTA Buttons */}
                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={() => handleSlideAction(slide)}
                      className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] active:bg-[#B38F46] text-black font-extrabold text-sm sm:text-base tracking-wide transition-all cursor-pointer shadow-lg active:scale-98"
                    >
                      <span>{isKz ? slide.btnTextKz : slide.btnTextRu}</span>
                      <ArrowRight className="w-4 h-4 stroke-[2.5]" />
                    </button>

                    <a
                      href={`https://wa.me/${config.whatsappNumber}?text=${encodeURIComponent(
                        isKz
                          ? `Сәлеметсіз бе! Мен ${slide.titleKz} бойынша кеңес алғым келеді.`
                          : `Здравствуйте! Хочу проконсультироваться по теме: ${slide.titleRu}`
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-[#1C1C1C] hover:bg-[#252525] text-white border border-[#333333] hover:border-[#C5A059] font-bold text-sm sm:text-base transition-colors"
                    >
                      <MessageCircle className="w-4 h-4 text-[#25D366]" />
                      <span>{isKz ? 'WhatsApp кеңес' : 'Консультация'}</span>
                    </a>
                  </div>
                </div>

                {/* Bottom Boutique Guarantees inside Slide */}
                <div className="relative z-10 pt-6 mt-6 border-t border-[#262626]/80 flex flex-wrap items-center gap-4 sm:gap-8 text-xs text-[#A3A3A3]">
                  <span className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#C5A059]" />
                    <span>100% Түпнұсқа • Халал өнімдер</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <Truck className="w-4 h-4 text-[#C5A059]" />
                    <span>Атырау бойынша бүгін жеткізу</span>
                  </span>
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#C5A059]" />
                    <span>ТД «Дина Байзар», Бутик №24</span>
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Slider Nav Arrows */}
          <button
            type="button"
            onClick={goToPrev}
            aria-label="Предыдущий слайд"
            className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button
            type="button"
            onClick={goToNext}
            aria-label="Следующий слайд"
            className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black text-white/80 hover:text-white border border-white/20 flex items-center justify-center transition-all cursor-pointer opacity-80 sm:opacity-0 group-hover:opacity-100 z-20"
          >
            <ChevronRight className="w-5 h-5" />
          </button>

          {/* Dots Indicator */}
          <div className="absolute bottom-3 right-6 z-20 flex items-center gap-1.5">
            {HERO_SLIDES.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentSlide(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentSlide === idx ? 'w-6 bg-[#C5A059]' : 'w-2 bg-[#404040]'
                }`}
                aria-label={`Слайд ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
