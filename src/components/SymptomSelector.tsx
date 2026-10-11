import React, { useMemo } from 'react';
import {
  ShieldCheck,
  Zap,
  Activity,
  Sparkles,
  Flame,
  Heart,
  Leaf,
  Smile,
  RotateCcw,
  Target,
} from 'lucide-react';
import { AccessibilitySettings, Language, Product } from '../types';
import { SYMPTOM_GOALS, doesProductMatchSymptom } from '../utils/recommendations';

interface SymptomSelectorProps {
  products: Product[];
  selectedSymptom: string;
  onSelectSymptom: (symptomId: string) => void;
  lang: Language;
  accessibility: AccessibilitySettings;
}

export const SymptomSelector: React.FC<SymptomSelectorProps> = ({
  products,
  selectedSymptom,
  onSelectSymptom,
  lang,
}) => {
  const isKz = lang === 'kz';

  // Calculate how many products match each symptom goal
  const symptomCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    SYMPTOM_GOALS.forEach((goal) => {
      counts[goal.id] = products.filter((p) => doesProductMatchSymptom(p, goal.id)).length;
    });
    return counts;
  }, [products]);

  const getIcon = (id: string, isActive: boolean) => {
    const cls = `w-4 h-4 shrink-0 transition-transform duration-200 ${
      isActive ? 'text-white' : 'text-emerald-700'
    }`;
    switch (id) {
      case 'immunity':
        return <ShieldCheck className={cls} />;
      case 'energy':
        return <Zap className={cls} />;
      case 'joints':
        return <Activity className={cls} />;
      case 'beauty':
        return <Sparkles className={cls} />;
      case 'men':
        return <Flame className={cls} />;
      case 'women':
        return <Heart className={cls} />;
      case 'digestion':
        return <Leaf className={cls} />;
      case 'kids':
        return <Smile className={cls} />;
      default:
        return <ShieldCheck className={cls} />;
    }
  };

  const activeGoal = SYMPTOM_GOALS.find((g) => g.id === selectedSymptom);

  return (
    <section
      id="symptom-selector-section"
      aria-label={isKz ? 'Мақсат бойынша таңдау' : 'Подбор товаров по задаче'}
      className="w-full bg-white border-b border-slate-200/90 py-3 sm:py-3.5 transition-colors select-none"
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <Target className="w-4 h-4 text-emerald-700 shrink-0" />
            <h2 className="font-extrabold text-xs sm:text-sm text-slate-900 tracking-tight">
              {isKz ? 'Мақсат бойынша таңдау' : 'Подбор по направлению здоровья'}
            </h2>
          </div>

          {selectedSymptom !== 'all' && (
            <button
              type="button"
              id="reset-symptom-btn"
              onClick={() => onSelectSymptom('all')}
              className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs flex items-center gap-1 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3 h-3 text-slate-500" />
              <span>{isKz ? 'Барлығы' : 'Сбросить'}</span>
            </button>
          )}
        </div>

        {/* Responsive Grid: All 8 health directions fully visible on main screen */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 pt-1">
          {SYMPTOM_GOALS.map((goal) => {
            const isActive = selectedSymptom === goal.id;
            const count = symptomCounts[goal.id] || 0;
            return (
              <button
                key={goal.id}
                id={`symptom-btn-${goal.id}`}
                type="button"
                onClick={() => {
                  const next = isActive ? 'all' : goal.id;
                  onSelectSymptom(next);
                  if (next !== 'all') {
                    const el = document.getElementById('catalog-section');
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }
                }}
                className={`flex items-center justify-between gap-1.5 px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border min-h-[44px] text-left shadow-2xs active:scale-97 ${
                  isActive
                    ? 'bg-emerald-800 text-white border-emerald-800 shadow-md ring-2 ring-emerald-500/30'
                    : 'bg-slate-50 hover:bg-emerald-50/70 hover:border-emerald-300 text-slate-800 border-slate-200/90'
                }`}
              >
                <div className="flex items-center gap-1.5 min-w-0">
                  {getIcon(goal.id, isActive)}
                  <span className="truncate leading-tight">{isKz ? goal.titleKz : goal.titleRu}</span>
                </div>
                <span
                  className={`text-[10px] font-mono tabular-nums px-1.5 py-0.5 rounded-md shrink-0 font-semibold ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
};
