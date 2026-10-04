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
      isActive ? 'text-black' : 'text-[#C5A059]'
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
      className="w-full bg-[#121212] border-b border-[#222222] transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-6">
        {/* Header Row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#1C1C1C] border border-[#2E2E2E] text-[#C5A059] flex items-center justify-center shrink-0">
              <Target className="w-4 h-4" />
            </div>
            <div>
              <h2 className="font-extrabold text-base sm:text-lg text-white leading-tight">
                {isKz
                  ? 'Мақсат бойынша жылдам таңдау'
                  : 'Подбор товаров по направлению'}
              </h2>
              <p className="text-xs text-[#A3A3A3] mt-0.5">
                {isKz
                  ? 'Қажетті бағытты басыңыз — лайықты өнімдер шығады'
                  : 'Выберите направление здоровья — покажем подходящие средства'}
              </p>
            </div>
          </div>

          {selectedSymptom !== 'all' && (
            <button
              type="button"
              id="reset-symptom-btn"
              onClick={() => onSelectSymptom('all')}
              className="self-start sm:self-auto px-3 py-1.5 rounded-lg bg-[#1C1C1C] hover:bg-[#252525] text-[#C5A059] border border-[#333] font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer whitespace-nowrap"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{isKz ? 'Барлығын көрсету' : 'Сбросить'}</span>
            </button>
          )}
        </div>

        {/* Interactive Goal Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2 sm:gap-2.5">
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
                className={`group text-left p-3 rounded-xl border transition-all duration-150 flex flex-col justify-between gap-2 cursor-pointer shadow-xs ${
                  isActive
                    ? 'bg-[#C5A059] text-black border-[#C5A059] font-bold shadow-md'
                    : 'bg-[#171717] hover:bg-[#1E1E1E] text-white border-[#262626] hover:border-[#383838]'
                }`}
              >
                <div className="flex items-center justify-between gap-1 w-full">
                  {getIcon(goal.id, isActive)}
                  <span
                    className={`text-[10px] font-mono tabular-nums font-bold px-1.5 py-0.5 rounded-md ${
                      isActive
                        ? 'bg-black/20 text-black'
                        : 'bg-[#222222] text-[#A3A3A3]'
                    }`}
                  >
                    {count}
                  </span>
                </div>

                <div>
                  <div
                    className={`font-bold text-xs sm:text-sm leading-tight line-clamp-2 ${
                      isActive ? 'text-black' : 'text-white group-hover:text-[#C5A059]'
                    }`}
                  >
                    {isKz ? goal.titleKz : goal.titleRu}
                  </div>
                  <p
                    className={`text-[11px] mt-0.5 line-clamp-1 ${
                      isActive ? 'text-black/80' : 'text-[#8E8E8E]'
                    }`}
                  >
                    {isKz ? goal.badgeKz : goal.badgeRu}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Active Goal Explanation Bar */}
        {activeGoal && (
          <div className="mt-3 p-3 rounded-xl bg-[#1A1A1A] text-white border border-[#2E2E2E] flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-[#C5A059] animate-pulse shrink-0" />
              <div>
                <span className="font-bold text-[#C5A059]">
                  {isKz ? activeGoal.titleKz : activeGoal.titleRu}:
                </span>{' '}
                <span className="text-[#D4D4D4]">
                  {isKz ? activeGoal.subtitleKz : activeGoal.subtitleRu}
                </span>
              </div>
            </div>
            <span className="font-mono tabular-nums font-bold text-[#C5A059] shrink-0">
              {isKz
                ? `Табылды: ${symptomCounts[activeGoal.id] || 0} өнім`
                : `Подходит товаров: ${symptomCounts[activeGoal.id] || 0}`}
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
