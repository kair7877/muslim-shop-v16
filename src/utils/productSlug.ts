import { Product, Language, StoreSettings } from '../types';

/**
 * Cyrillic to Latin transliteration map covering Russian and Kazakh alphabets
 */
const CYRILLIC_MAP: Record<string, string> = {
  // Russian alphabet
  'а': 'a', 'б': 'b', 'в': 'v', 'г': 'g', 'д': 'd', 'е': 'e', 'ё': 'yo',
  'ж': 'zh', 'з': 'z', 'и': 'i', 'й': 'y', 'к': 'k', 'л': 'l', 'м': 'm',
  'н': 'n', 'о': 'o', 'п': 'p', 'р': 'r', 'с': 's', 'т': 't', 'у': 'u',
  'ф': 'f', 'х': 'kh', 'ц': 'ts', 'ч': 'ch', 'ш': 'sh', 'щ': 'shch',
  'ъ': '', 'ы': 'y', 'ь': '', 'э': 'e', 'ю': 'yu', 'я': 'ya',
  // Kazakh specific letters
  'ә': 'a', 'ғ': 'g', 'қ': 'q', 'ң': 'ng', 'ө': 'o', 'ұ': 'u', 'ү': 'u',
  'һ': 'h', 'і': 'i'
};

/**
 * Transliterates Cyrillic text (Russian + Kazakh) to English Latin letters
 */
export function transliterateCyrillic(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .split('')
    .map((char) => CYRILLIC_MAP[char] !== undefined ? CYRILLIC_MAP[char] : char)
    .join('');
}

/**
 * Generates an SEO-friendly URL slug from any title or text
 * e.g. "Магний California Gold Nutrition 100 мг" -> "magnesium-california-gold-nutrition-100-mg"
 */
export function generateProductSlug(title: string): string {
  if (!title) return '';
  const transliterated = transliterateCyrillic(title);
  return transliterated
    .toLowerCase()
    .replace(/['"«»„“”`’]/g, '')        // remove quotes
    .replace(/[^a-z0-9]+/g, '-')       // replace non-alphanumeric with dash
    .replace(/-+/g, '-')               // collapse multiple dashes
    .replace(/^-+|-+$/g, '')           // trim leading and trailing dashes
    .substring(0, 80);                 // prevent overly long URLs
}

/**
 * Returns the definitive slug for a product
 */
export function getProductSlug(product: Partial<Product> | null | undefined): string {
  if (!product) return '';
  if (product.slug && product.slug.trim().length > 0) {
    return generateProductSlug(product.slug);
  }
  const fallbackSource = product.titleRu || product.titleKz || product.id || 'product';
  const generated = generateProductSlug(fallbackSource);
  return generated || `product-${product.id || 'item'}`;
}

/**
 * Returns the full, absolute direct URL for a product
 * e.g. "https://domain.com/product/misk-royal"
 */
export function getProductDirectUrl(product: Product): string {
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://muslimshop.kz';
  const slug = getProductSlug(product);
  return `${origin}/product/${slug}`;
}

/**
 * Parses the product slug from the current browser URL
 * Supports:
 * - /product/:slug (clean path)
 * - ?product=:slug or ?p=:slug or ?slug=:slug (query param fallback)
 * - #/product/:slug or #/p/:slug (hash fallback)
 */
export function parseProductSlugFromUrl(): string | null {
  if (typeof window === 'undefined') return null;

  // 1. Pathname check: /product/:slug
  const pathname = window.location.pathname;
  const pathMatch = pathname.match(/\/product\/([^/?#]+)/i);
  if (pathMatch && pathMatch[1]) {
    try {
      return decodeURIComponent(pathMatch[1]).trim();
    } catch {
      return pathMatch[1].trim();
    }
  }

  // 2. Search query params check: ?product=... or ?p=... or ?slug=...
  try {
    const searchParams = new URLSearchParams(window.location.search);
    const querySlug = searchParams.get('product') || searchParams.get('p') || searchParams.get('slug');
    if (querySlug && querySlug.trim()) {
      return decodeURIComponent(querySlug.trim());
    }
  } catch {
    // Ignore URLSearchParams error
  }

  // 3. Hash routing check: #/product/...
  const hash = window.location.hash;
  if (hash) {
    const hashMatch = hash.match(/#\/?(?:product\/|p\/)?([^/?#]+)/i);
    if (hashMatch && hashMatch[1] && hashMatch[1] !== 'product' && hashMatch[1] !== 'p') {
      try {
        return decodeURIComponent(hashMatch[1]).trim();
      } catch {
        return hashMatch[1].trim();
      }
    }
  }

  return null;
}

/**
 * Finds matching product by slug or ID
 */
export function findProductBySlug(products: Product[], slug: string): Product | undefined {
  if (!slug || !products || products.length === 0) return undefined;
  const cleanSlug = slug.toLowerCase().trim();

  // 1. Exact match on product.slug
  const matchByStoredSlug = products.find((p) => p.slug && p.slug.toLowerCase().trim() === cleanSlug);
  if (matchByStoredSlug) return matchByStoredSlug;

  // 2. Match on generated slug from product
  const matchByGeneratedSlug = products.find((p) => getProductSlug(p).toLowerCase() === cleanSlug);
  if (matchByGeneratedSlug) return matchByGeneratedSlug;

  // 3. Match on exact product id (e.g. prod-1, prod-123)
  const matchById = products.find((p) => p.id && p.id.toLowerCase() === cleanSlug);
  if (matchById) return matchById;

  // 4. Fuzzy fallback: check if slug contains the product id or vice versa
  return products.find((p) => cleanSlug.includes(p.id.toLowerCase()) || p.id.toLowerCase().includes(cleanSlug));
}

/**
 * Copies product link to user clipboard reliably across all devices and browsers
 */
export async function copyProductLinkToClipboard(product: Product): Promise<boolean> {
  const url = getProductDirectUrl(product);
  try {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(url);
      return true;
    }
  } catch (err) {
    console.warn('navigator.clipboard failed, attempting fallback', err);
  }

  // Fallback for older web views / iFrames
  try {
    const textArea = document.createElement('textarea');
    textArea.value = url;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px';
    textArea.style.top = '-9999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    return successful;
  } catch {
    return false;
  }
}

/**
 * Updates dynamic browser title, Meta description, OpenGraph, Twitter, and Schema.org JSON-LD
 */
export function updateProductSeo(
  product: Product | null,
  language: Language = 'ru',
  settings?: StoreSettings
): void {
  if (typeof document === 'undefined') return;

  const defaultTitle = 'MUSLIM SHOP — Премиальный интернет-магазин в Атырау';
  const defaultDesc = 'Премиальные товары для здоровья, красоты, натуральные продукты и товары для мусульман в Атырау. Доставка по Казахстану и самовывоз. Бутик №24.';
  const defaultImage = 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?auto=format&fit=crop&w=1200&q=80';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://muslimshop.kz';

  const setMetaTag = (attrName: string, attrValue: string, content: string) => {
    let el = document.querySelector(`meta[${attrName}="${attrValue}"]`);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attrName, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  };

  if (!product) {
    document.title = defaultTitle;
    setMetaTag('name', 'description', defaultDesc);
    setMetaTag('property', 'og:title', defaultTitle);
    setMetaTag('property', 'og:description', defaultDesc);
    setMetaTag('property', 'og:url', origin);
    setMetaTag('property', 'og:image', defaultImage);
    setMetaTag('property', 'og:type', 'website');
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', defaultTitle);
    setMetaTag('name', 'twitter:description', defaultDesc);
    setMetaTag('name', 'twitter:image', defaultImage);

    // Remove product JSON-LD if present
    const existingJsonLd = document.getElementById('product-json-ld');
    if (existingJsonLd) {
      existingJsonLd.remove();
    }
    return;
  }

  const title = language === 'ru' ? product.titleRu : (product.titleKz || product.titleRu);
  const rawDesc = language === 'ru' ? product.descriptionRu : (product.descriptionKz || product.descriptionRu);
  const cleanDesc = rawDesc ? rawDesc.replace(/\n/g, ' ').substring(0, 160) : `${title} в магазине MUSLIM SHOP Атырау. Доставка по Казахстану.`;
  const pageTitle = `${title} — купить в Атырау | MUSLIM SHOP`;
  const productUrl = getProductDirectUrl(product);
  const productImage = (product.images && product.images.length > 0) ? product.images[0] : defaultImage;

  // 1. Update Title & Standard Meta
  document.title = pageTitle;
  setMetaTag('name', 'description', cleanDesc);

  // 2. OpenGraph for Telegram, WhatsApp, Facebook
  setMetaTag('property', 'og:title', `${title} — MUSLIM SHOP`);
  setMetaTag('property', 'og:description', `${product.price.toLocaleString('ru-RU')} ₸ · ${cleanDesc}`);
  setMetaTag('property', 'og:image', productImage);
  setMetaTag('property', 'og:url', productUrl);
  setMetaTag('property', 'og:type', 'product');
  setMetaTag('property', 'og:site_name', 'MUSLIM SHOP');

  // 3. Twitter Card
  setMetaTag('name', 'twitter:card', 'summary_large_image');
  setMetaTag('name', 'twitter:title', `${title} — MUSLIM SHOP`);
  setMetaTag('name', 'twitter:description', `${product.price.toLocaleString('ru-RU')} ₸ · ${cleanDesc}`);
  setMetaTag('name', 'twitter:image', productImage);

  // 4. Schema.org Product Structured Data (JSON-LD)
  let scriptEl = document.getElementById('product-json-ld') as HTMLScriptElement | null;
  if (!scriptEl) {
    scriptEl = document.createElement('script');
    scriptEl.id = 'product-json-ld';
    scriptEl.type = 'application/ld+json';
    document.head.appendChild(scriptEl);
  }

  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: title,
    image: productImage,
    description: cleanDesc,
    sku: product.sku || product.id,
    offers: {
      '@type': 'Offer',
      url: productUrl,
      priceCurrency: 'KZT',
      price: product.price,
      availability: product.inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: settings?.storeName || 'MUSLIM SHOP',
      },
    },
  };

  scriptEl.textContent = JSON.stringify(schemaData);
}
