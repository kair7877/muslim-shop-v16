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
      className="fixed inset-0 z-[100] bg-slate-900/60 backdrop-blur-xs flex justify-end overflow-hidden"
      onClick={onClose}
    >
      <div
        id="favorites-drawer-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md bg-white text-slate-900 border-l border-slate-200 h-full flex flex-col shadow-2xl overflow-hidden"
      >
        <div className="px-4 py-3 sm:py-3.5 bg-white text-slate-900 flex items-center justify-between gap-2 border-b border-slate-200 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors cursor-pointer shrink-0"
            title={lang === 'kz' ? 'Артқа' : 'Назад'}
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'kz' ? 'Артқа' : 'Назад'}</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 min-w-0">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-rose-500 fill-rose-500 shrink-0" />
            <h2 className="font-bold text-base sm:text-lg text-slate-900 whitespace-nowrap">
              {lang === 'kz' ? 'Таңдаулы' : 'Избранное'}
            </h2>
            <span className="text-xs px-2 py-0.2 rounded-full bg-rose-50 border border-rose-200 text-rose-600 font-bold shrink-0">
              {favorites.length}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer shrink-0"
            title={lang === 'kz' ? 'Жабу' : 'Закрыть'}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {favorites.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 mb-4">
              <Heart className="w-8 h-8" />
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900">
              {lang === 'kz' ? 'Таңдаулылар тізімі бос' : 'В избранном пока ничего нет'}
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 max-w-xs mt-1.5 mb-6 leading-relaxed">
              {lang === 'kz'
                ? 'Өнім карточкасындағы жүрекшені басу арқылы өнімді осында сақтаңыз'
                : 'Нажимайте на сердечко в карточках товаров, чтобы сохранить их здесь'}
            </p>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs sm:text-sm shadow-sm transition-colors cursor-pointer"
            >
              <span>{lang === 'kz' ? 'Каталогқа өту' : 'Перейти в каталог'}</span>
            </button>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto overscroll-contain">
            {onClearFavorites && (
              <div className="px-4 py-2 flex items-center justify-between gap-2 border-b border-slate-100 bg-slate-50">
                <span className="text-xs font-semibold text-slate-600">
                  {lang === 'kz' ? 'Сақталған тауарлар:' : 'Сохранённые товары:'}
                </span>
                <button
                  type="button"
                  onClick={onClearFavorites}
                  className="inline-flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-rose-600 transition-colors cursor-pointer"
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
                    className="rounded-xl bg-white p-3.5 border border-slate-200/90 shadow-2xs space-y-3"
                  >
                    <div className="flex items-start gap-3">
                      <img
                        src={product.images[0]}
                        alt={title}
                        onClick={() => {
                          onOpenDetail(product);
                          onClose();
                        }}
                        className="w-14 h-16 rounded-lg object-contain border border-slate-100 shrink-0 cursor-pointer bg-white"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <h4
                            onClick={() => {
                              onOpenDetail(product);
                              onClose();
                            }}
                            className="text-xs sm:text-sm font-semibold text-slate-900 leading-snug line-clamp-2 cursor-pointer hover:text-blue-600"
                          >
                            {title}
                          </h4>
                          <button
                            type="button"
                            onClick={() => onRemoveFavorite(product)}
                            className="p-1 rounded-md text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer shrink-0"
                            title={lang === 'kz' ? 'Таңдаулыдан өшіру' : 'Удалить из избранного'}
                          >
                            <Trash2 className="w-3.5 h-3.5 text-slate-400 hover:text-rose-600" />
                          </button>
                        </div>
                        <p className="text-sm sm:text-base font-black text-slate-900 tabular-nums mt-1">
                          {formatPrice(product.price)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => onAddToCart(product)}
                        className="flex-1 px-3 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-xs sm:text-sm font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                      >
                        <ShoppingBag className="w-3.5 h-3.5 text-white shrink-0" />
                        <span>{lang === 'kz' ? 'Себетке қосу' : 'В корзину'}</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onRemoveFavorite(product)}
                        className="px-2.5 py-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-colors cursor-pointer shrink-0"
                        title={lang === 'kz' ? 'Таңдаулыдан өшіру' : 'Удалить'}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Bottom Back & Close Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-2.5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>{lang === 'kz' ? 'Каталогқа оралу' : 'Назад в каталог'}</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2 px-3 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-semibold text-xs transition-colors cursor-pointer"
          >
            <span>{lang === 'kz' ? 'Жабу' : 'Закрыть'}</span>
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};
