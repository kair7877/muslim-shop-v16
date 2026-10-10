import { Category, Product, StoreConfig } from '../types';

export const INITIAL_CONFIG: StoreConfig = {
  storeName: 'MUSLIM SHOP',
  taglineRu: 'Красота, здоровье и халяль-товары в Атырау',
  taglineKz: 'Атыраудағы сұлулық, денсаулық және халал өнімдер',
  subtitleRu: 'Витамины iHerb, БАДы, товары для мужского и женского здоровья, мед, хиджама и мусульманские ароматы.',
  subtitleKz: 'iHerb дәрумендері, ББҚ, ерлер мен әйелдер денсаулығына арналған өнімдер, бал, хиджама және мұсылман хош иістері.',
  city: 'Атырау',
  boutiqueNumber: 'Бутик №24',
  address: 'г. Атырау, ТД «Дина Байзар», бутик №24',
  whatsappNumber: '77781754241',
  instagram: 'musliim_shop06',
  instagramUrl: 'https://www.instagram.com/musliim_shop06?stkn=dnAzejJ2cm5nOXNi',
  tiktok: 'muslim_shop06',
  tiktokUrl: 'https://www.tiktok.com/@muslim_shop06?_r=1&_t=ZS-9AFgdLAOcZ2',
  gis2Url: 'https://2gis.kz/atyrau/geo/70000001094546376',
  workingHoursRu: 'Ежедневно с 10:00 до 19:00',
  workingHoursKz: 'Күн сайын сағат 10:00-ден 19:00-ге дейін',
  deliveryInfoRu: 'Быстрая доставка курьером по городу Атырау в день заказа. Доставка по Казахстану через Казпочту / СДЭК.',
  deliveryInfoKz: 'Атырау қаласы бойынша тапсырыс берілген күні жылдам жеткізу. Қазақстан бойынша Қазпошта / СДЭК арқылы жеткізу.',
  pickupInfoRu: 'г. Атырау, Бутик №24. Выдача заказов ежедневно с 10:00 до 20:30.',
  pickupInfoKz: 'Атырау қ., №24 бутик. Тапсырыстарды күн сайын 10:00-ден 20:30-ға дейін алып кетуге болады.',
  currency: '₸',
  adminPin: '505534',
};

export const CATEGORIES: Category[] = [
  { id: 'cat-all', nameRu: 'Все товары', nameKz: 'Барлық өнімдер', icon: '✨', order: 0 },
  { id: 'cat-hits', nameRu: 'Хиты', nameKz: 'Хит тауарлар', icon: '🔥', order: 1 },
  { id: 'cat-iherb', nameRu: 'iHerb Витамины', nameKz: 'iHerb дәрумендері', icon: '💊', order: 2 },
  { id: 'cat-health', nameRu: 'Здоровье', nameKz: 'Денсаулық', icon: '🌿', order: 3 },
  { id: 'cat-men', nameRu: 'Мужское здоровье', nameKz: 'Ерлер денсаулығы', icon: '💪', order: 4 },
  { id: 'cat-women', nameRu: 'Женское здоровье', nameKz: 'Әйелдер денсаулығы', icon: '🌸', order: 5 },
  { id: 'cat-mufuo6b3', nameRu: 'Черный тмин', nameKz: 'Қара зере', icon: '🌿', order: 6 },
  { id: 'cat-mudtm3gz', nameRu: 'Сиропы', nameKz: 'Сироптар', icon: '🍯', order: 7 },
  { id: 'cat-muds79cl', nameRu: 'Arabian Med', nameKz: 'Arabian Med', icon: '🏺', order: 8 },
  { id: 'cat-beauty', nameRu: 'Красота', nameKz: 'Сұлулық', icon: '✨', order: 9 },
  { id: 'cat-diet', nameRu: 'Похудение', nameKz: 'Арықтау', icon: '🌱', order: 10 },
  { id: 'cat-1789842214142', nameRu: 'Миски и парфюмерия', nameKz: 'Мисктөр мен парфюмерия', icon: '✨', order: 11 },
  { id: 'cat-honey', nameRu: 'Исмаил мёд', nameKz: 'Исмаил бал', icon: '🍯', order: 12 },
  { id: 'cat-muslim', nameRu: 'Для мусульман', nameKz: 'Мұсылман тауарлары', icon: '🕌', order: 13 },
  { id: 'cat-1789672741016', nameRu: 'Набор веса', nameKz: 'Салмақ жинау', icon: '⚖️', order: 14 },
  { id: 'cat-new', nameRu: 'Новинки', nameKz: 'Жаңа өнімдер', icon: '🌟', order: 15 },
  { id: 'cat-misc', nameRu: 'Разное', nameKz: 'Басқа', icon: '📦', order: 16 },
];

// Demo products removed; all real products are loaded directly from Firestore
export const INITIAL_PRODUCTS: Product[] = [];
