import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, Heart, ShoppingBag, Trash2, ArrowLeft } from 'lucide-react';
import { Language, Product } from '../types';
import { formatPrice } from '../utils/formatters';

interface FavoritesDrawerProps {
  favorites: Product[];
  lang: Language;
  onRemoveFavorite: (product: Product) => void;
  onClearFavorites?: () => void;
  onAddToCart: (product: Product) => void;
  onOpenDetail: (product: Product) => void;
  onClose: () => void;
}

export const FavoritesDrawer: React.FC<FavoritesDrawerProps> = ({
  favorites,
  lang,
  onRemoveFavorite,
  onClearFavorites,
  onAddToCart,
  onOpenDetail,
  onClose,
}) => {
  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose]);

  return createPortal(
    <div
      id="favorites-drawer-backdrop"
      className="fixed inset-0 z-[100] bg-black/80 backdrop-blur-xs flex justify-end overflow-hidden"
      onClick={onClose}
    >
      <div
        id="favorites-drawer-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-[#141414] text-white border-l border-[#2E2E2E] h-full flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="px-4 py-3.5 sm:py-4 bg-[#1C1C1C] text-white flex items-center justify-between gap-2 border-b border-[#2A2A2A] shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#242424] hover:bg-[#2E2E2E] text-white font-bold text-xs transition-colors cursor-pointer border border-[#383838] shrink-0"
            title={lang === 'kz' ? 'Артқа' : 'Назад'}
          >
            <ArrowLeft className="w-3.5 h-3.5 text-[#C5A059]" />
            <span>{lang === 'kz' ? 'Артқа' : 'Назад'}</span>
          </button>

          <div className="flex items-center justify-center gap-2 min-w-0">
            <Heart className="w-5 h-5 text-[#C5A059] fill-[#C5A059] shrink-0" />
            <h2 className="font-extrabold text-base sm:text-lg text-white whitespace-nowrap">
              {lang === 'kz' ? 'Таңдаулы' : 'Избранное'}
            </h2>
            <span className="text-xs px-2 py-0.5 rounded-full bg-[#242424] text-[#C5A059] font-mono font-bold border border-[#C5A059]/40 shrink-0">
              {favorites.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-[#8E8E8E] hover:text-white hover:bg-[#242424] transition-colors cursor-pointer shrink-0"
            title={lang === 'kz' ? 'Жабу' : 'Закрыть'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-[#1C1C1C] border border-[#2E2E2E] flex items-center justify-center text-[#C5A059] mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white">
              {lang === 'kz' ? 'Таңдаулылар тізімі бос' : 'В избранном пока ничего нет'}
            </h3>
            <p className="text-xs sm:text-sm text-[#A3A3A3] max-w-xs mt-1.5 mb-6 leading-relaxed">
              {lang === 'kz'
                ? 'Өнім карточкасындағы жүрекшені басу арқылы өнімді осында сақтаңыз'
                : 'Нажимайте на сердечко в карточках товаров, чтобы сохранить их здесь'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-3 rounded-xl bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs sm:text-sm shadow-md transition-all cursor-pointer"
            >
              <span>{lang === 'kz' ? 'Каталогқа өту' : 'Перейти в каталог'}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {onClearFavorites && (
              <div className="px-4 py-2.5 flex items-center justify-between gap-2 border-b border-[#242424] bg-[#181818]">
                <span className="text-xs font-semibold text-[#A3A3A3]">
                  {lang === 'kz' ? 'Сақталған тауарлар:' : 'Сохранённые товары:'}
                </span>
                <button
                  type="button"
                  onClick={onClearFavorites}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#8E8E8E] hover:text-rose-400 transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5 shrink-0" />
                  <span>{lang === 'kz' ? 'Бәрін өшіру' : 'Очистить всё'}</span>
                </button>
              </div>
            )}
            <div className="p-4 space-y-3">
              {favorites.map((product) => {
                const title = lang === 'kz' && product.titleKz?.trim() ? product.titleKz : product.titleRu;
                return (
                  <div
                    key={product.id}
                    className="rounded-xl bg-[#1A1A1A] p-3.5 border border-[#2A2A2A] shadow-sm space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.images[0]}
                        alt={title}
                        className="w-16 h-18 rounded-lg object-contain border border-[#333] bg-white p-1 shrink-0 cursor-pointer"
                        onClick={() => {
                          onOpenDetail(product);
                          onClose();
                        }}
                      />

                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => {
                              onOpenDetail(product);
                              onClose();
                            }}
                            className="text-xs sm:text-sm font-bold text-white hover:text-[#C5A059] transition-colors leading-snug line-clamp-2 cursor-pointer"
                          >
                            {title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveFavorite(product)}
                            className="p-1 rounded-md text-[#737373] hover:text-rose-400 hover:bg-[#262626] transition-colors cursor-pointer shrink-0"
                            title={lang === 'kz' ? 'Өшіру' : 'Удалить'}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <div className="text-sm font-black text-[#C5A059] tabular-nums mt-1.5">
                          {formatPrice(product.price)}
                        </div>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-[#262626] flex items-center justify-between gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onOpenDetail(product);
                          onClose();
                        }}
                        className="text-xs font-semibold text-[#A3A3A3] hover:text-white transition-colors cursor-pointer"
                      >
                        {lang === 'kz' ? 'Толығырақ' : 'Подробнее'}
                      </button>

                      <button
                        type="button"
                        onClick={() => onAddToCart(product)}
                        className="px-3.5 py-1.5 rounded-lg bg-[#C5A059] hover:bg-[#D4AF37] text-black font-extrabold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 stroke-[2.5]" />
                        <span>{lang === 'kz' ? 'Себетке' : 'В корзину'}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};
