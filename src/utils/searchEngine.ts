import { Category, Language, Product } from '../types';
import { SYMPTOM_GOALS, SymptomGoal } from './recommendations';

export interface KeywordSuggestion {
  termRu: string;
  termKz: string;
  categoryHintId?: string;
  symptomHintId?: string;
  keywords: string[];
}

export const POPULAR_SEARCH_KEYWORDS: KeywordSuggestion[] = [
  {
    termRu: 'Чёрный тмин',
    termKz: 'Қара зере майы',
    categoryHintId: 'cat-mufuo6b3',
    symptomHintId: 'immunity',
    keywords: ['тмин', 'черный тмин', 'чёрный тмин', 'тмина', 'қара зере', 'black seed'],
  },
  {
    termRu: 'Крем и мази для суставов',
    termKz: 'Буынға арналған жақпа майлар',
    symptomHintId: 'joints',
    keywords: ['суставы', 'суставов', 'для суставов', 'disaar', 'montalin', 'артроз', 'грыжа'],
  },
  {
    termRu: 'Сироп от кашля (Лиминин)',
    termKz: 'Жөтелге арналған сироп (Лиминин)',
    categoryHintId: 'cat-mudtm3gz',
    symptomHintId: 'immunity',
    keywords: ['кашель', 'кашля', 'от кашля', 'простуда', 'лиминин', 'nilrich'],
  },
  {
    termRu: 'Кыст аль-Хинди',
    termKz: 'Қыст әл-Хинди',
    categoryHintId: 'cat-health',
    symptomHintId: 'immunity',
    keywords: ['кыст', 'қыст', 'хинди', 'иммунитет', 'простуда'],
  },
  {
    termRu: 'Детские витамины и рост',
    termKz: 'Балалар дәрумендері мен өсу',
    categoryHintId: 'cat-kids',
    symptomHintId: 'kids',
    keywords: ['детский', 'для детей', 'детям', 'kids', 'uzmax', 'bork'],
  },
  {
    termRu: 'Эпимедиумная паста для мужчин',
    termKz: 'Ерлерге арналған эпимедиум пастасы',
    categoryHintId: 'cat-men',
    symptomHintId: 'men',
    keywords: ['эпимедиум', 'themra', 'мужское', 'для мужчин', 'потенция', 'тибетский олень', 'снайпер'],
  },
  {
    termRu: 'Женское здоровье и баланс',
    termKz: 'Әйелдер денсаулығы',
    categoryHintId: 'cat-women',
    symptomHintId: 'women',
    keywords: ['женское', 'для женщин', 'мастопатия', 'бусинки', 'пажитник', 'хельба', 'clinright'],
  },
  {
    termRu: 'Омега-3 и Витамин D3',
    termKz: 'Омега-3 және D3 дәрумені',
    categoryHintId: 'cat-iherb',
    keywords: ['омега', 'omega', 'd3', 'д3', 'рыбий жир'],
  },
  {
    termRu: 'Магний и Антистресс',
    termKz: 'Магний және Жүйке жүйесі',
    categoryHintId: 'cat-iherb',
    symptomHintId: 'energy',
    keywords: ['магний', 'magnesium', 'стресс', 'сон', 'нервы', 'b-complex'],
  },
  {
    termRu: 'Похудение и Детокс (Жиросжигатели)',
    termKz: 'Арықтау және Детокс',
    categoryHintId: 'cat-diet',
    symptomHintId: 'digestion',
    keywords: ['похудение', 'жиросжигатель', 'детокс', 'lipo rush', 'сеннол', 'samyun wan'],
  },
  {
    termRu: 'Щитовидная железа (Arabian Med)',
    termKz: 'Қалқанша безі кешені',
    keywords: ['щитовидка', 'щитовидная', 'зоб', 'arabiyan med'],
  },
  {
    termRu: 'От давления и для сердца',
    termKz: 'Қан қысымы мен жүрек үшін',
    keywords: ['давление', 'от давления', 'сердце', 'сосуды'],
  },
  {
    termRu: 'Сахарный диабет',
    termKz: 'Қант диабеті',
    keywords: ['диабет', 'сахарный диабет', 'сахар'],
  },
  {
    termRu: 'Миски и масляные духи',
    termKz: 'Миск және хош иістер',
    categoryHintId: 'cat-1789842214142',
    keywords: ['миск', 'духи', 'парфюм', 'аромат', 'масляные'],
  },
];

/**
 * Common stop words in search queries that should not restrict results.
 */
const STOP_WORDS = new Set([
  'для', 'от', 'в', 'во', 'и', 'на', 'с', 'со', 'к', 'ко', 'по', 'из', 'изо',
  'о', 'об', 'обо', 'у', 'за', 'при', 'до', 'без', 'над', 'под', 'про', 'же',
  'ли', 'бы', 'не', 'ни', 'жане', 'үшін', 'ушин', 'мен', 'бен', 'пен',
]);

/**
 * Keyboard layout switch map: converts accidental English typing to Russian.
 */
const EN_TO_RU_KEYBOARD: Record<string, string> = {
  q: 'й', w: 'ц', e: 'у', r: 'к', t: 'е', y: 'н', u: 'г', i: 'ш', o: 'щ', p: 'з', '[': 'х', ']': 'ъ',
  a: 'ф', s: 'ы', d: 'в', f: 'а', g: 'п', h: 'р', j: 'о', k: 'л', l: 'д', ';': 'ж', "'": 'э',
  z: 'я', x: 'ч', c: 'с', v: 'м', b: 'и', n: 'т', m: 'ь', ',': 'б', '.': 'ю',
};

export function convertKeyboardLayout(text: string): string {
  let res = '';
  for (const ch of text.toLowerCase()) {
    res += EN_TO_RU_KEYBOARD[ch] || ch;
  }
  return res;
}

/**
 * Normalizes text: replaces ё->е, converts Kazakh vowels/consonants to Russian equivalents for matching.
 */
export function normalizeText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/ё/g, 'е')
    .replace(/қ/g, 'к')
    .replace(/ғ/g, 'г')
    .replace(/ұ/g, 'у')
    .replace(/ү/g, 'у')
    .replace(/ө/g, 'о')
    .replace(/ә/g, 'а')
    .replace(/і/g, 'и')
    .replace(/ң/g, 'н')
    .replace(/һ/g, 'х')
    .replace(/h/g, 'х');
}

/**
 * Intelligent stemmer for Russian and Kazakh words.
 * Truncates inflectional endings to get the conceptual core.
 */
export function stemWord(word: string): string {
  let w = normalizeText(word).trim();
  if (w.length <= 2) return w;

  // Irregular / high-frequency root transformations
  if (w.startsWith('кашел') || w.startsWith('кашл')) return 'кашл';
  if (w.startsWith('дет')) return 'дет';
  if (w.startsWith('волос') || w.startsWith('волос')) return 'волос';
  if (w.startsWith('сустав')) return 'сустав';
  if (w.startsWith('тмин')) return 'тмин';
  if (w.startsWith('кыст')) return 'кыст';
  if (w.startsWith('щитовид')) return 'щитовид';
  if (w.startsWith('давлен')) return 'давлен';
  if (w.startsWith('диабет') || w.startsWith('сахар')) return 'диабет';
  if (w.startsWith('похуден') || w.startsWith('похудет') || w.startsWith('жиросжиг')) return 'похуд';
  if (w.startsWith('паразит') || w.startsWith('глист')) return 'паразит';
  if (w.startsWith('мужск') || w.startsWith('мужчин')) return 'мужск';
  if (w.startsWith('женск') || w.startsWith('женщин') || w.startsWith('әйел')) return 'женск';
  if (w.startsWith('коллаген')) return 'коллаген';
  if (w.startsWith('магний') || w.startsWith('магнез')) return 'магний';
  if (w.startsWith('омег')) return 'омег';
  if (w.startsWith('хиджам')) return 'хиджам';
  if (w.startsWith('миск')) return 'миск';
  if (w.startsWith('жайнамаз') || w.startsWith('намаз')) return 'жайнамаз';

  // Common Russian inflectional endings to strip
  const endings = [
    'остями', 'остью', 'остях', 'ости', 'ость',
    'ами', 'ями', 'ях', 'ах', 'ом', 'ем', 'ой', 'ей', 'ею', 'ою',
    'ого', 'его', 'ому', 'ему', 'ыми', 'ими', 'ых', 'их', 'ым', 'им',
    'ую', 'юю', 'ая', 'яя', 'ое', 'ее', 'ые', 'ие',
    'ов', 'ев', 'ей', 'ам', 'ям',
    'а', 'я', 'у', 'ю', 'е', 'и', 'ы', 'о', 'ь'
  ];

  for (const end of endings) {
    if (w.length > end.length + 2 && w.endsWith(end)) {
      return w.slice(0, -end.length);
    }
  }

  return w;
}

/**
 * Rich synonym clusters connecting user queries with catalog nomenclature.
 */
const SYNONYM_CLUSTERS: string[][] = [
  // Joints & spine
  ['сустав', 'суставы', 'суставов', 'суставах', 'для суставов', 'буын', 'артроз', 'артрит', 'грыжа', 'остеохондроз', 'хрящ', 'artroflex', 'montalin', 'disaar', 'коллаген'],
  // Cough & colds
  ['кашель', 'кашля', 'от кашля', 'простуда', 'простуды', 'бронхит', 'горло', 'лиминин', 'nilrich', 'локва', 'суық тию'],
  // Black seed oil
  ['тмин', 'тмина', 'черный тмин', 'чёрный тмин', 'черного тмина', 'қара зере', 'black seed', 'nigella'],
  // Kyst al-Hindi
  ['кыст', 'кыста', 'кыст аль хинди', 'кыст аль-хинди', 'қыст', 'аль-кыст'],
  // Kids
  ['детский', 'детские', 'для детей', 'детям', 'детей', 'балалар', 'балаларға', 'kids', 'child', 'childlife', 'uzmax', 'рост'],
  // Men's health
  ['мужской', 'мужское', 'для мужчин', 'потенция', 'эрекция', 'простатит', 'эпимедиум', 'themra', 'тибетский олень', 'черный муравей', 'снайпер', 'виагра', 'sealex', 'сеалекс', 'кучала', 'ерлер'],
  // Women's health
  ['женский', 'женское', 'для женщин', 'мастопатия', 'бусинки', 'пажитник', 'хельба', 'хельбы', 'clinright', 'чка доянь', 'розовая женщина', 'әйелдер', 'вагинальные', 'фолиевая'],
  // Thyroid
  ['щитовидка', 'щитовидная', 'щитовидной', 'зоб', 'йод', 'arabiyan med'],
  // Blood pressure
  ['давление', 'давления', 'от давления', 'гипертония', 'сердце', 'сосуды'],
  // Diabetes
  ['диабет', 'диабета', 'сахарный диабет', 'сахар', 'глюкоза'],
  // Weight loss & detox
  ['похудение', 'похудения', 'похудеть', 'жиросжигатель', 'жиросжигатели', 'стройность', 'детокс', 'арықтау', 'lipo rush', 'samyun wan', 'сеннол', 'очищение'],
  // Parasites
  ['паразиты', 'паразитов', 'от паразитов', 'глисты', 'антипаразит', 'антипаразитарный', 'aqwavital', 'nasr'],
  // Hair & skin
  ['волосы', 'волос', 'выпадение', 'от выпадения', 'шампунь', 'биотин', 'акне', 'clinsol', 'прыщи', 'кожа', 'шаш'],
  // Perfume & misk
  ['миск', 'миски', 'масляные духи', 'парфюм', 'духи', 'аромат', 'хош иіс', 'attar'],
  // Prayer mats
  ['жайнамаз', 'намазник', 'коврик для намаза', 'намаз'],
  // Hijama
  ['хиджама', 'хиджамы', 'банки для хиджамы', 'ланцеты', 'насос', 'вакуумные банки'],
  // Honey
  ['мед', 'мёд', 'меда', 'бал', 'прополис', 'исмаил'],
  // D3 & Omega
  ['d3', 'д3', 'витамин d', 'витамин д', 'омега', 'omega', 'рыбий жир', 'балық майы'],
  // Magnesium
  ['магний', 'магния', 'magnesium', 'b6', 'антистресс', 'сон', 'нервы'],
];

export interface ProcessedQuery {
  rawQuery: string;
  cleanQuery: string;
  tokens: string[];
  meaningfulTokens: string[];
  stems: string[];
  synonymStems: string[];
  isExclusivelyMale: boolean;
  isExclusivelyFemale: boolean;
}

/**
 * Preprocesses a search query: tokenization, stem extraction, translit & synonym expansion.
 */
export function processSearchQuery(rawQuery: string): ProcessedQuery {
  const norm = normalizeText(rawQuery).trim();
  const convertedLayout = normalizeText(convertKeyboardLayout(rawQuery)).trim();

  // Extract alphanumeric tokens
  const rawTokens = norm.match(/[a-zA-Zа-яА-ЯёЁ0-9\-]+/g) || [];
  const meaningful = rawTokens.filter((t) => !STOP_WORDS.has(t));
  const effectiveTokens = meaningful.length > 0 ? meaningful : rawTokens;

  const stems = new Set<string>();
  effectiveTokens.forEach((t) => {
    const s = stemWord(t);
    if (s.length >= 2) stems.add(s);
  });

  // Also check layout converted tokens if user accidentally typed in English
  if (convertedLayout && convertedLayout !== norm) {
    const altTokens = convertedLayout.match(/[a-zA-Zа-яА-ЯёЁ0-9\-]+/g) || [];
    altTokens.forEach((t) => {
      if (!STOP_WORDS.has(t)) {
        const s = stemWord(t);
        if (s.length >= 2) stems.add(s);
      }
    });
  }

  // Synonym expansion
  const synonymStems = new Set<string>();
  for (const cluster of SYNONYM_CLUSTERS) {
    const matchesCluster = cluster.some((term) => {
      const normTerm = normalizeText(term);
      const stemTerm = stemWord(normTerm);
      return (
        norm.includes(normTerm) ||
        effectiveTokens.some((t) => t === normTerm || stemWord(t) === stemTerm)
      );
    });

    if (matchesCluster) {
      cluster.forEach((term) => {
        const s = stemWord(normalizeText(term));
        if (s.length >= 2) synonymStems.add(s);
      });
    }
  }

  // Context flags
  const isExclusivelyMale = ['мужск', 'для мужчин', 'потенци', 'ерлер'].some((k) => norm.includes(k));
  const isExclusivelyFemale = ['женск', 'для женщин', 'әйелдер', 'мастопати'].some((k) => norm.includes(k));

  return {
    rawQuery,
    cleanQuery: norm,
    tokens: rawTokens,
    meaningfulTokens: effectiveTokens,
    stems: Array.from(stems),
    synonymStems: Array.from(synonymStems),
    isExclusivelyMale,
    isExclusivelyFemale,
  };
}

/**
 * Scores how well a product matches a search query using linguistic stemming,
 * field prioritization, semantic synonym expansion, and negative exclusions.
 */
export function scoreProductSearchMatch(
  product: Product,
  rawQuery: string,
  categoriesMap: Map<string, Category>
): number {
  if (!rawQuery || !rawQuery.trim()) return 1;

  const proc = processSearchQuery(rawQuery);
  if (proc.stems.length === 0 && !proc.cleanQuery) return 1;

  const titleRu = normalizeText(product.titleRu || '');
  const titleKz = normalizeText(product.titleKz || '');
  const titleFull = `${titleRu} ${titleKz}`;

  const descRu = normalizeText(product.descriptionRu || '');
  const descKz = normalizeText(product.descriptionKz || '');
  const descFull = `${descRu} ${descKz}`;

  const benefits = (product.benefitsRu || []).concat(product.benefitsKz || []).map(normalizeText).join(' ');
  const specs = normalizeText(`${product.specsRu || ''} ${product.specsKz || ''}`);
  const sku = normalizeText(product.sku || '');

  const category = categoriesMap.get(product.categoryId);
  const catNameRu = normalizeText(category?.nameRu || '');
  const catNameKz = normalizeText(category?.nameKz || '');
  const catFull = `${catNameRu} ${catNameKz}`;

  // STRICT NEGATIVE CONFLICTS:
  // 1. If searching exclusively for men, never match feminine health items
  if (proc.isExclusivelyMale) {
    if (
      product.categoryId === 'cat-women' ||
      ['для женщин', 'бусинки', 'мастопати', 'влагалищ', 'зубная'].some((k) => titleFull.includes(k))
    ) {
      return 0;
    }
  }

  // 2. If searching exclusively for women, never match male aphrodisiacs
  if (proc.isExclusivelyFemale) {
    if (
      product.categoryId === 'cat-men' ||
      ['для мужчин', 'тибетский олень', 'муравей', 'снайпер', 'виагра', 'кучала'].some((k) => titleFull.includes(k))
    ) {
      return 0;
    }
  }

  let score = 0;

  // 1. EXACT PHRASE MATCH IN TITLE OR SKU (Massive score)
  if (titleFull.includes(proc.cleanQuery)) {
    score += 500;
  }
  if (sku && (sku === proc.cleanQuery || sku.includes(proc.cleanQuery))) {
    score += 400;
  }

  // 2. EXACT STEM MATCHES IN TITLE
  let titleStemMatches = 0;
  proc.stems.forEach((st) => {
    if (titleFull.includes(st) || sku.includes(st)) {
      titleStemMatches++;
      score += 150;
    }
  });

  // All meaningful query stems matched in Title -> Huge Multi-token boost!
  if (proc.stems.length > 1 && titleStemMatches === proc.stems.length) {
    score += 250;
  } else if (proc.stems.length > 1 && titleStemMatches >= 1) {
    score += titleStemMatches * 60;
  }

  // 3. MATCH IN CATEGORY NAME (searching by category, e.g. "сиропы", "витамины")
  if (catFull.includes(proc.cleanQuery)) {
    score += 200;
  } else {
    proc.stems.forEach((st) => {
      if (catFull.includes(st)) score += 90;
    });
  }

  // Special category mappings for dedicated queries
  if (proc.cleanQuery.includes('тмин') && (product.categoryId === 'cat-mufuo6b3' || titleFull.includes('тмин'))) {
    score += 160;
  }
  if (proc.cleanQuery.includes('кашл') && titleFull.includes('кашл')) {
    score += 220;
  }
  if ((proc.cleanQuery.includes('сустав') || proc.cleanQuery.includes('буын')) && titleFull.includes('сустав')) {
    score += 220;
  }
  if (proc.cleanQuery.includes('миск') && (product.categoryId === 'cat-1789842214142' || titleFull.includes('миск'))) {
    score += 200;
  }

  // 4. STEM MATCHES IN BENEFITS, SPECS & DESCRIPTION
  let descStemMatches = 0;
  proc.stems.forEach((st) => {
    if (benefits.includes(st) || specs.includes(st)) {
      score += 35;
      descStemMatches++;
    } else if (descFull.includes(st)) {
      score += 20;
      descStemMatches++;
    }
  });

  // 5. SYNONYM STEM MATCHES (Semantic expansion)
  let synonymMatches = 0;
  proc.synonymStems.forEach((syn) => {
    if (titleFull.includes(syn)) {
      score += 110;
      synonymMatches++;
    } else if (benefits.includes(syn) || specs.includes(syn)) {
      score += 25;
      synonymMatches++;
    } else if (descFull.includes(syn)) {
      score += 15;
      synonymMatches++;
    }
  });

  // Small tie-breakers for hits and in-stock items
  if (score > 0) {
    if (product.isHit) score += 10;
    if (product.inStock) score += 5;
  }

  return score;
}

/**
 * Returns categories that match the typed search query.
 */
export function getMatchingCategories(
  rawQuery: string,
  categories: Category[]
): Category[] {
  if (!rawQuery || !rawQuery.trim()) return [];
  const proc = processSearchQuery(rawQuery);

  return categories.filter((cat) => {
    if (cat.id === 'cat-all') return false;
    const nameRu = normalizeText(cat.nameRu || '');
    const nameKz = normalizeText(cat.nameKz || '');
    const full = `${nameRu} ${nameKz}`;

    if (full.includes(proc.cleanQuery)) return true;
    return proc.stems.some((st) => st.length >= 3 && full.includes(st));
  });
}

/**
 * Returns symptom/health goals that match the typed search query.
 */
export function getMatchingSymptoms(rawQuery: string): SymptomGoal[] {
  if (!rawQuery || !rawQuery.trim() || rawQuery.trim().length < 2) return [];
  const proc = processSearchQuery(rawQuery);

  return SYMPTOM_GOALS.filter((goal) => {
    const text = normalizeText(
      `${goal.titleRu} ${goal.titleKz} ${goal.subtitleRu} ${goal.subtitleKz} ${goal.keywords.join(' ')}`
    );
    if (text.includes(proc.cleanQuery)) return true;
    return proc.stems.some((st) => st.length >= 3 && text.includes(st));
  }).slice(0, 3);
}

/**
 * Returns keyword autocomplete suggestions matching the current input.
 */
export function getMatchingKeywordSuggestions(
  rawQuery: string,
  products: Product[],
  lang: Language,
  limit: number = 6
): string[] {
  const isKz = lang === 'kz';
  if (!rawQuery || !rawQuery.trim()) {
    return POPULAR_SEARCH_KEYWORDS.slice(0, limit).map((k) => (isKz ? k.termKz : k.termRu));
  }

  const proc = processSearchQuery(rawQuery);
  const results = new Set<string>();

  // 1. Curated suggestions matching stems
  for (const item of POPULAR_SEARCH_KEYWORDS) {
    const label = isKz ? item.termKz : item.termRu;
    const allText = normalizeText(`${item.termRu} ${item.termKz} ${item.keywords.join(' ')}`);

    if (
      allText.includes(proc.cleanQuery) ||
      proc.stems.some((st) => st.length >= 3 && allText.includes(st))
    ) {
      results.add(label);
    }
    if (results.size >= limit) break;
  }

  // 2. Real product title matches from catalog
  if (results.size < limit) {
    for (const p of products) {
      const title = (isKz && p.titleKz?.trim() ? p.titleKz : p.titleRu).trim();
      const norm = normalizeText(title);

      if (
        norm.includes(proc.cleanQuery) ||
        proc.stems.some((st) => st.length >= 3 && norm.includes(st))
      ) {
        // Clean title snippet (remove emoji and strip after comma/dash)
        const cleanTitle = title.replace(/^[🔥✨💎🌿💊🩸🍯🌸💪👶🏺🕋⚖️🌱📦\s]+/, '').split(/[—•|,]/)[0].trim();
        if (cleanTitle.length >= 4 && cleanTitle.length <= 45) {
          results.add(cleanTitle);
        }
      }
      if (results.size >= limit) break;
    }
  }

  return Array.from(results).slice(0, limit);
}

