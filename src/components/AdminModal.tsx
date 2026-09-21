import React, { useState, useMemo, useRef } from 'react';
import {
  X,
  Lock,
  KeyRound,
  Save,
  Plus,
  Check,
  RefreshCw,
  Trash2,
  Search,
  Edit2,
  AlertCircle,
  ExternalLink,
  Link,
  Copy,
  LayoutGrid,
  List,
  Eye,
  Camera,
  Upload,
  Image as ImageIcon,
  Loader2,
  Flame,
  Sparkles,
  Clock,
  Layers,
  FolderPlus,
  AlertTriangle,
  BarChart3,
} from 'lucide-react';
import { Category, Language, Product, StoreConfig } from '../types';
import { AnalyticsTab } from './AnalyticsTab';
import {
  saveProductToFirestore,
  deleteProductFromFirestore,
  saveSettingsToFirestore,
  saveCategoryToFirestore,
  deleteCategoryFromFirestore,
} from '../services/firestoreService';
import {
  getProductDirectUrl,
  copyTextToClipboard,
  deduplicateProducts,
  isStoreOpen,
} from '../utils/formatters';
import { compressImageFile } from '../utils/imageCompressor';

interface AdminModalProps {
  config: StoreConfig;
  products: Product[];
  categories: Category[];
  lang: Language;
  onUpdateConfig: (newConfig: StoreConfig) => void;
  onUpdateProduct: (product: Product) => void;
  onAddProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onPreviewProduct?: (product: Product) => void;
  onAddCategory?: (category: Category) => void;
  onUpdateCategory?: (category: Category) => void;
  onDeleteCategory?: (categoryId: string) => void;
  initialTab?: 'products' | 'settings' | 'add' | 'categories' | 'stats';
  onClose: () => void;
}

export const AdminModal: React.FC<AdminModalProps> = ({
  config,
  products,
  categories,
  lang,
  onUpdateConfig,
  onUpdateProduct,
  onAddProduct,
  onDeleteProduct,
  onPreviewProduct,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
  initialTab,
  onClose,
}) => {
  const [pin, setPin] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [currentConfig, setCurrentConfig] = useState<StoreConfig>(config);
  const [activeTab, setActiveTab] = useState<'products' | 'settings' | 'add' | 'categories' | 'stats'>(
    initialTab || 'products'
  );
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const isSubmittingAddProductRef = useRef(false);

  // Category management state
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isDeletingCategory, setIsDeletingCategory] = useState(false);
  const [newCatNameRu, setNewCatNameRu] = useState('');
  const [newCatNameKz, setNewCatNameKz] = useState('');
  const [newCatIcon, setNewCatIcon] = useState('💊');
  const [isCategorySubmitting, setIsCategorySubmitting] = useState(false);
  const [categoryFeedback, setCategoryFeedback] = useState<string | null>(null);

  // Search, Filter & View Mode in Admin products list
  const [adminSearch, setAdminSearch] = useState('');
  const [adminCategoryFilter, setAdminCategoryFilter] = useState('all');
  const [adminViewMode, setAdminViewMode] = useState<'grid' | 'list'>('grid');
  const [copiedProductId, setCopiedProductId] = useState<string | null>(null);
  const [copyFeedbackMsg, setCopyFeedbackMsg] = useState<string | null>(null);

  // Product delete confirmation state
  const [productToDelete, setProductToDelete] = useState<Product | null>(null);
  const [isDeletingProduct, setIsDeletingProduct] = useState(false);

  // Editing state for existing product
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New product form state
  const [newTitleRu, setNewTitleRu] = useState('');
  const [newTitleKz, setNewTitleKz] = useState('');
  const [newPrice, setNewPrice] = useState('');
  const [newOldPrice, setNewOldPrice] = useState('');
  const [newCategory, setNewCategory] = useState(categories[1]?.id || 'cat-health');
  const [newDescRu, setNewDescRu] = useState('');
  const [newSpecsRu, setNewSpecsRu] = useState('');
  const [newImageUrl, setNewImageUrl] = useState('');
  const [newInStock, setNewInStock] = useState(true);
  const [newIsHit, setNewIsHit] = useState(false);
  const [newIsNew, setNewIsNew] = useState(true);
  const [isCompressingImage, setIsCompressingImage] = useState(false);

  const handleImageFileUpload = async (
    file: File,
    target: 'new' | 'edit'
  ) => {
    if (!file) return;
    setIsCompressingImage(true);
    try {
      const compressedDataUrl = await compressImageFile(file, 900, 900, 0.82);
      if (target === 'new') {
        setNewImageUrl(compressedDataUrl);
      } else if (editingProduct) {
        setEditingProduct({
          ...editingProduct,
          images: [compressedDataUrl],
        });
      }
    } catch (err: any) {
      alert('Ошибка при обработке фото: ' + (err?.message || 'Попробуйте другое изображение'));
    } finally {
      setIsCompressingImage(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === config.adminPin || pin === '505534') {
      setIsAuthenticated(true);
      setErrorMsg('');
    } else {
      setErrorMsg('Неверный PIN-код (по умолчанию: 505534)');
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      // 1. Immediately update store config locally
      onUpdateConfig(currentConfig);
      try {
        localStorage.setItem('muslim_shop_config', JSON.stringify(currentConfig));
      } catch {}

      // 2. Persist to Firestore
      await saveSettingsToFirestore(currentConfig);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      console.warn('Firestore save config warning:', err);
      // Still show success since local config was updated
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleStock = async (product: Product) => {
    const updated = { ...product, inStock: !product.inStock };
    onUpdateProduct(updated);
    try {
      await saveProductToFirestore(updated);
    } catch (err) {
      console.error('Failed to update stock in Firestore:', err);
    }
  };

  const handleToggleHit = async (product: Product) => {
    const updated = { ...product, isHit: !product.isHit };
    onUpdateProduct(updated);
    try {
      await saveProductToFirestore(updated);
    } catch (err) {
      console.error('Failed to update hit status in Firestore:', err);
    }
  };

  const handleToggleNew = async (product: Product) => {
    const updated = { ...product, isNew: !product.isNew };
    onUpdateProduct(updated);
    try {
      await saveProductToFirestore(updated);
    } catch (err) {
      console.error('Failed to update new status in Firestore:', err);
    }
  };

  const handlePriceChange = async (product: Product, newPriceVal: number) => {
    if (newPriceVal > 0 && newPriceVal !== product.price) {
      const updated = { ...product, price: newPriceVal };
      onUpdateProduct(updated);
      try {
        await saveProductToFirestore(updated);
      } catch (err) {
        console.error('Failed to update price in Firestore:', err);
      }
    }
  };

  const handleDelete = (product: Product) => {
    setProductToDelete(product);
  };

  const handleConfirmDeleteProduct = async (product: Product) => {
    setIsDeletingProduct(true);
    try {
      onDeleteProduct(product.id);
      try {
        await deleteProductFromFirestore(product.id);
      } catch (err: any) {
        console.warn('Firestore product delete warning:', err);
      }
      setProductToDelete(null);
    } catch (err: any) {
      console.error('Error deleting product:', err);
    } finally {
      setIsDeletingProduct(false);
    }
  };

  const handleCopyDirectLink = async (product: Product) => {
    const url = getProductDirectUrl(product.id);
    const ok = await copyTextToClipboard(url);
    if (ok) {
      setCopiedProductId(product.id);
      setCopyFeedbackMsg(`Прямая ссылка на «${product.titleRu}» скопирована в буфер обмена!`);
      setTimeout(() => {
        setCopiedProductId((curr) => (curr === product.id ? null : curr));
      }, 3000);
      setTimeout(() => {
        setCopyFeedbackMsg((curr) => (curr?.includes(product.titleRu) ? null : curr));
      }, 5000);
    } else {
      alert(`Прямая ссылка на товар:\n${url}`);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatNameRu.trim()) return;

    setIsCategorySubmitting(true);
    const catId = `cat-${Date.now().toString(36)}`;
    const newCat: Category = {
      id: catId,
      nameRu: newCatNameRu.trim(),
      nameKz: newCatNameKz.trim() || newCatNameRu.trim(),
      icon: newCatIcon.trim() || '✨',
      order: categories.length,
    };

    try {
      if (onAddCategory) {
        onAddCategory(newCat);
      }
      try {
        await saveCategoryToFirestore(newCat);
      } catch (err) {
        console.warn('Firestore category sync warning:', err);
      }
      setCategoryFeedback(`Каталог «${newCat.nameRu}» успешно создан!`);
      setNewCatNameRu('');
      setNewCatNameKz('');
      setNewCatIcon('💊');
      setTimeout(() => setCategoryFeedback(null), 3000);
    } catch (err: any) {
      setCategoryFeedback(`Ошибка: ${err?.message || 'Не удалось сохранить'}`);
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleSaveEditedCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCategory || !editingCategory.nameRu.trim()) return;

    setIsCategorySubmitting(true);
    try {
      if (onUpdateCategory) {
        onUpdateCategory(editingCategory);
      }
      try {
        await saveCategoryToFirestore(editingCategory);
      } catch (err) {
        console.warn('Firestore category update warning:', err);
      }
      setCategoryFeedback(`Каталог «${editingCategory.nameRu}» обновлен!`);
      setEditingCategory(null);
      setTimeout(() => setCategoryFeedback(null), 3000);
    } catch (err: any) {
      setCategoryFeedback(`Ошибка при обновлении: ${err?.message || 'Попробуйте снова'}`);
    } finally {
      setIsCategorySubmitting(false);
    }
  };

  const handleDeleteCategoryClick = (cat: Category) => {
    if (cat.id === 'cat-all') {
      setCategoryFeedback('Нельзя удалить основной каталог «Все товары»');
      setTimeout(() => setCategoryFeedback(null), 3000);
      return;
    }
    setCategoryToDelete(cat);
  };

  const handleConfirmDeleteCategory = async (cat: Category) => {
    if (cat.id === 'cat-all') {
      setCategoryFeedback('Нельзя удалить основной каталог «Все товары»');
      setCategoryToDelete(null);
      setTimeout(() => setCategoryFeedback(null), 3000);
      return;
    }

    setIsDeletingCategory(true);
    try {
      if (onDeleteCategory) {
        onDeleteCategory(cat.id);
      }
      try {
        await deleteCategoryFromFirestore(cat.id);
      } catch (err) {
        console.warn('Firestore category delete warning:', err);
      }
      setCategoryFeedback(`Каталог «${cat.nameRu}» успешно удален!`);
      setCategoryToDelete(null);
      setTimeout(() => setCategoryFeedback(null), 3500);
    } catch (err: any) {
      setCategoryFeedback(`Ошибка при удалении: ${err?.message || 'Попробуйте снова'}`);
    } finally {
      setIsDeletingCategory(false);
    }
  };

  const handleSaveEditedProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    setIsSaving(true);
    try {
      await saveProductToFirestore(editingProduct);
      onUpdateProduct(editingProduct);
      setEditingProduct(null);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    } catch (err: any) {
      alert('Ошибка сохранения товара в Firestore: ' + err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddNewProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingAddProductRef.current || isSaving) return;
    if (!newTitleRu.trim() || !newPrice) return;

    isSubmittingAddProductRef.current = true;
    setIsSaving(true);
    const newId = `prod-${Date.now()}`;
    const newProd: Product = {
      id: newId,
      titleRu: newTitleRu.trim(),
      titleKz: newTitleKz.trim() || newTitleRu.trim(),
      price: Number(newPrice),
      oldPrice: newOldPrice ? Number(newOldPrice) : undefined,
      categoryId: newCategory,
      descriptionRu: newDescRu.trim() || 'Описание товара',
      descriptionKz: newDescRu.trim(),
      specsRu: newSpecsRu.trim(),
      specsKz: '',
      inStock: newInStock,
      isHit: newIsHit,
      isNew: newIsNew,
      sku: `MS-${Math.floor(100 + Math.random() * 900)}`,
      images: [
        newImageUrl.trim() ||
          'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      ],
      createdAt: new Date().toISOString(),
    };

    try {
      // 1. Immediately add to local state and catalog
      onAddProduct(newProd);
      setNewTitleRu('');
      setNewTitleKz('');
      setNewPrice('');
      setNewOldPrice('');
      setNewDescRu('');
      setNewSpecsRu('');
      setNewImageUrl('');
      setNewInStock(true);
      setNewIsHit(false);
      setNewIsNew(true);
      setActiveTab('products');

      // 2. Persist to Firestore asynchronously
      try {
        await saveProductToFirestore(newProd);
      } catch (err: any) {
        console.warn('Firestore product sync warning (saved locally):', err);
      }
    } catch (err: any) {
      alert('Ошибка добавления товара: ' + err.message);
    } finally {
      setIsSaving(false);
      isSubmittingAddProductRef.current = false;
    }
  };

  const filteredAdminProducts = useMemo(() => {
    const deduped = deduplicateProducts(products);
    return deduped
      .filter((p) => {
        if (adminCategoryFilter === 'hits') return Boolean(p.isHit);
        if (adminCategoryFilter === 'new') return Boolean(p.isNew);
        if (adminCategoryFilter !== 'all' && p.categoryId !== adminCategoryFilter) {
          return false;
        }
        if (adminSearch.trim()) {
          const q = adminSearch.toLowerCase().trim();
          return (
            p.titleRu.toLowerCase().includes(q) ||
            p.titleKz?.toLowerCase().includes(q) ||
            p.sku.toLowerCase().includes(q)
          );
        }
        return true;
      })
      .sort((a, b) => {
        // Show newest first in admin panel for easy visibility of freshly added products
        const timeA = a.createdAt || (a.id.startsWith('prod-') ? a.id.replace('prod-', '') : '');
        const timeB = b.createdAt || (b.id.startsWith('prod-') ? b.id.replace('prod-', '') : '');
        return timeB.localeCompare(timeA);
      });
  }, [products, adminCategoryFilter, adminSearch]);

  return (
    <div
      id="admin-modal-backdrop"
      className="fixed inset-0 z-50 bg-stone-950/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4"
      onClick={onClose}
    >
      <div
        id="admin-modal-container"
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-5xl xl:max-w-6xl bg-white rounded-3xl max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="p-4 sm:p-5 bg-stone-900 text-white flex items-center justify-between border-b border-stone-800">
          <div className="flex items-center gap-2">
            <Lock className="w-5 h-5 text-amber-400" />
            <h3 className="font-bold text-sm sm:text-base font-serif">
              Панель администратора • MUSLIM SHOP (Firestore онлайн)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-stone-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {!isAuthenticated ? (
          <div className="p-8 max-w-sm mx-auto w-full text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-900 flex items-center justify-center mx-auto">
              <KeyRound className="w-7 h-7" />
            </div>
            <h4 className="font-bold text-stone-900 text-lg">Вход для владельца</h4>
            <p className="text-xs text-stone-500">
              Введите PIN-код для доступа к управлению товарами и настройками магазина
            </p>

            <form onSubmit={handleLogin} className="space-y-3">
              <input
                type="password"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="PIN"
                className="w-full text-center tracking-widest text-xl px-4 py-2.5 rounded-xl border border-stone-300 focus:outline-none focus:ring-2 focus:ring-emerald-700"
                maxLength={8}
                autoFocus
              />
              {errorMsg && <p className="text-xs text-rose-600 font-semibold">{errorMsg}</p>}
              <button
                type="submit"
                className="w-full py-2.5 rounded-xl bg-emerald-900 text-white font-bold text-sm hover:bg-emerald-950 transition-colors"
              >
                Войти в панель
              </button>
            </form>
          </div>
        ) : (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Nav Tabs */}
            <div className="px-5 pt-3 border-b border-stone-200 flex gap-4 text-xs font-bold bg-stone-50/60">
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setActiveTab('products');
                }}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'products' && !editingProduct
                    ? 'border-emerald-800 text-emerald-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Все товары ({products.length})
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setActiveTab('add');
                }}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'add'
                    ? 'border-emerald-800 text-emerald-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                + Добавить товар
              </button>
              <button
                id="admin-tab-categories"
                onClick={() => {
                  setEditingProduct(null);
                  setActiveTab('categories');
                }}
                className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'categories'
                    ? 'border-emerald-800 text-emerald-950 font-extrabold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>Каталоги ({categories.filter((c) => c.id !== 'cat-all').length})</span>
              </button>
              <button
                id="admin-tab-stats"
                onClick={() => {
                  setEditingProduct(null);
                  setActiveTab('stats');
                }}
                className={`pb-2.5 border-b-2 transition-colors flex items-center gap-1.5 ${
                  activeTab === 'stats'
                    ? 'border-emerald-800 text-emerald-950 font-extrabold'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5 text-emerald-700" />
                <span>Посещаемость</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              </button>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setActiveTab('settings');
                }}
                className={`pb-2.5 border-b-2 transition-colors ${
                  activeTab === 'settings'
                    ? 'border-emerald-800 text-emerald-950'
                    : 'border-transparent text-stone-500 hover:text-stone-800'
                }`}
              >
                Настройки бутика
              </button>
            </div>

            {/* Tab content */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-5">
              {/* EDIT PRODUCT SUB-VIEW */}
              {editingProduct ? (
                <form onSubmit={handleSaveEditedProduct} className="space-y-4 max-w-xl mx-auto">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-200">
                    <h4 className="font-bold text-stone-900 text-sm">
                      Редактирование: {editingProduct.titleRu}
                    </h4>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="text-xs text-stone-500 hover:text-stone-800 underline"
                    >
                      Отмена
                    </button>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Название (RU)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.titleRu}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, titleRu: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Название (KZ)
                    </label>
                    <input
                      type="text"
                      value={editingProduct.titleKz || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, titleKz: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Цена (₸)
                      </label>
                      <input
                        type="number"
                        value={editingProduct.price}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            price: Number(e.target.value) || 0,
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Старая цена (₸, зачеркнутая)
                      </label>
                      <input
                        type="number"
                        value={editingProduct.oldPrice || ''}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            oldPrice: e.target.value ? Number(e.target.value) : undefined,
                          })
                        }
                        placeholder="Не обязательно"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Категория
                      </label>
                      <select
                        value={editingProduct.categoryId}
                        onChange={(e) =>
                          setEditingProduct({ ...editingProduct, categoryId: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                      >
                        {categories
                          .filter((c) => c.id !== 'cat-all')
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nameRu}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Наличие
                      </label>
                      <select
                        value={editingProduct.inStock ? 'true' : 'false'}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            inStock: e.target.value === 'true',
                          })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                      >
                        <option value="true">В наличии</option>
                        <option value="false">Нет в наличии</option>
                      </select>
                    </div>
                  </div>

                  {/* Badges Toggle in Edit Form */}
                  <div className="flex items-center gap-4 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProduct.isHit)}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            isHit: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                      />
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Хит продаж (отображать в хитах)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={Boolean(editingProduct.isNew)}
                        onChange={(e) =>
                          setEditingProduct({
                            ...editingProduct,
                            isNew: e.target.checked,
                          })
                        }
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                      />
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Новинка (отображать в новинках)
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Фотография товара
                    </label>

                    {/* Image Preview & Upload Controls */}
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 rounded-xl border border-stone-200 bg-white overflow-hidden shrink-0 flex items-center justify-center relative">
                          {editingProduct.images?.[0] ? (
                            <img
                              src={editingProduct.images[0]}
                              alt="Preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-stone-300" />
                          )}
                          {isCompressingImage && (
                            <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white">
                              <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 cursor-pointer transition-colors shadow-xs active:scale-95">
                            <Camera className="w-4 h-4" />
                            <span>{isCompressingImage ? 'Обработка фото...' : 'Выбрать фото с телефона'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isCompressingImage}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageFileUpload(file, 'edit');
                              }}
                            />
                          </label>
                          <p className="text-[11px] text-stone-500 leading-snug">
                            Сделайте фото на камеру или выберите из галереи телефона. Фото автоматически оптимизируется.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/80">
                        <span className="block text-[10px] font-semibold text-stone-500 mb-1">
                          Или укажите прямую ссылку на фото:
                        </span>
                        <input
                          type="text"
                          value={editingProduct.images?.[0] || ''}
                          onChange={(e) =>
                            setEditingProduct({
                              ...editingProduct,
                              images: [e.target.value],
                            })
                          }
                          placeholder="https://..."
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:ring-1 focus:ring-emerald-700 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Описание товара
                    </label>
                    <textarea
                      value={editingProduct.descriptionRu || ''}
                      onChange={(e) =>
                        setEditingProduct({ ...editingProduct, descriptionRu: e.target.value })
                      }
                      rows={4}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={isSaving}
                      className="px-5 py-2.5 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-950 transition-colors flex items-center gap-1.5"
                    >
                      <Save className="w-4 h-4" />
                      <span>{isSaving ? 'Сохранение...' : 'Сохранить изменения в Firestore'}</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingProduct(null)}
                      className="px-4 py-2.5 rounded-xl border border-stone-300 text-stone-700 font-bold text-xs hover:bg-stone-50"
                    >
                      Отмена
                    </button>
                  </div>
                </form>
              ) : activeTab === 'products' ? (
                <div className="space-y-3.5">
                  {/* Copy Feedback Alert Toast */}
                  {copyFeedbackMsg && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-2xl text-emerald-950 text-xs font-semibold flex items-center justify-between gap-3 shadow-xs animate-in fade-in duration-200">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                          <Check className="w-3.5 h-3.5" />
                        </div>
                        <span>{copyFeedbackMsg}</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setCopyFeedbackMsg(null)}
                        className="text-emerald-700 hover:text-emerald-950 text-sm font-bold px-2 py-0.5"
                      >
                        ✕
                      </button>
                    </div>
                  )}

                  {/* Filter, Search & View Switcher */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pb-3 border-b border-stone-200/80">
                    <div className="flex flex-1 items-center gap-2">
                      <div className="relative flex-1 max-w-sm">
                        <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                        <input
                          type="text"
                          value={adminSearch}
                          onChange={(e) => setAdminSearch(e.target.value)}
                          placeholder="Поиск по названию или артикулу..."
                          className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700 bg-white"
                        />
                      </div>
                      <select
                        value={adminCategoryFilter}
                        onChange={(e) => setAdminCategoryFilter(e.target.value)}
                        className="text-xs px-3 py-2 rounded-xl border border-stone-300 bg-white text-stone-800 font-medium"
                      >
                        <option value="all">Все категории ({products.length})</option>
                        <option value="new">🔥 Новинки ({products.filter((p) => p.isNew).length})</option>
                        <option value="hits">⚡ Хиты продаж ({products.filter((p) => p.isHit).length})</option>
                        {categories
                          .filter((c) => c.id !== 'cat-all')
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nameRu} ({products.filter((p) => p.categoryId === c.id).length})
                            </option>
                          ))}
                      </select>
                    </div>

                    {/* View Mode Toggle */}
                    <div className="flex items-center gap-1 bg-stone-100 p-1 rounded-xl shrink-0 self-end sm:self-auto">
                      <button
                        type="button"
                        onClick={() => setAdminViewMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          adminViewMode === 'grid'
                            ? 'bg-white text-emerald-950 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <LayoutGrid className="w-3.5 h-3.5" />
                        <span>Крупные карточки</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setAdminViewMode('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          adminViewMode === 'list'
                            ? 'bg-white text-emerald-950 shadow-xs'
                            : 'text-stone-600 hover:text-stone-900'
                        }`}
                      >
                        <List className="w-3.5 h-3.5" />
                        <span>Список</span>
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span>
                      Показано товаров: <b className="text-stone-800">{filteredAdminProducts.length}</b> из {products.length}
                    </span>
                    <span className="hidden sm:inline">
                      💡 Нажмите <b>«Скопировать ссылку»</b> над любым товаром, чтобы отправить прямую ссылку клиенту
                    </span>
                  </div>

                  {/* PRODUCTS CONTAINER */}
                  {filteredAdminProducts.length === 0 ? (
                    <div className="p-12 text-center text-stone-400 text-xs border border-dashed border-stone-200 rounded-2xl">
                      По вашему запросу товары не найдены
                    </div>
                  ) : adminViewMode === 'grid' ? (
                    /* 1. LARGE VISUAL CARDS GRID (9:16 VERTICAL RATIO) */
                    <div
                      id="admin-products-grid"
                      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4.5 max-h-[60vh] overflow-y-auto pr-1 p-0.5"
                    >
                      {filteredAdminProducts.map((p) => {
                        const directUrl = getProductDirectUrl(p.id);
                        const isCopied = copiedProductId === p.id;
                        const catName = categories.find((c) => c.id === p.categoryId)?.nameRu || p.categoryId;

                        return (
                          <div
                            key={p.id}
                            id={`admin-card-${p.id}`}
                            className="bg-white rounded-2xl border border-stone-200 hover:border-amber-400/80 hover:shadow-md transition-all flex flex-col justify-between overflow-hidden relative group"
                          >
                            {/* TOP DIRECT LINK BAR (Над каждым товаром - по запросу пользователя) */}
                            <div className="p-2.5 bg-stone-50 border-b border-stone-200/80 flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={() => handleCopyDirectLink(p)}
                                className={`flex-1 px-2.5 py-1.5 rounded-xl font-bold text-[11px] sm:text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shadow-2xs ${
                                  isCopied
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-amber-100 hover:bg-amber-200 text-amber-950 border border-amber-300/60'
                                }`}
                                title="Скопировать прямую ссылку на товар для отправки клиенту в WhatsApp"
                              >
                                {isCopied ? (
                                  <>
                                    <Check className="w-3.5 h-3.5" />
                                    <span>Ссылка скопирована!</span>
                                  </>
                                ) : (
                                  <>
                                    <Link className="w-3.5 h-3.5 text-amber-800 shrink-0" />
                                    <span>Скопировать ссылку</span>
                                  </>
                                )}
                              </button>

                              <a
                                href={directUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="p-1.5 rounded-xl bg-white border border-stone-200 text-stone-600 hover:text-stone-950 hover:bg-stone-100 transition-colors shrink-0"
                                title="Открыть прямую ссылку в новой вкладке"
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                              </a>
                            </div>

                            {/* LARGE VISUAL IMAGE (9:16 Vertical Ratio) */}
                            <div
                              className="relative aspect-[9/16] max-h-72 w-full bg-stone-100 overflow-hidden cursor-pointer flex items-center justify-center border-b border-stone-100"
                              onClick={() => setEditingProduct(p)}
                              title="Нажмите для редактирования"
                            >
                              <img
                                src={p.images[0]}
                                alt={p.titleRu}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                onError={(e) => {
                                  (e.target as any).src =
                                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
                                }}
                              />

                              {/* Badges on image */}
                              <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-stone-950/80 text-white backdrop-blur-xs shadow-xs">
                                  {catName}
                                </span>
                                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-semibold bg-white/95 text-stone-800 border border-stone-200 shadow-2xs">
                                  Арт: {p.sku}
                                </span>
                              </div>

                              {/* Stock Toggle Button directly on image */}
                              <div className="absolute top-2.5 right-2.5 z-10">
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleToggleStock(p);
                                  }}
                                  className={`px-2.5 py-1 rounded-full font-bold text-[10px] shadow-sm transition-colors cursor-pointer flex items-center gap-1.5 ${
                                    p.inStock
                                      ? 'bg-emerald-600 text-white hover:bg-emerald-700'
                                      : 'bg-rose-600 text-white hover:bg-rose-700'
                                  }`}
                                  title="Нажмите для переключения наличия товара"
                                >
                                  <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                                  <span>{p.inStock ? 'В наличии' : 'Нет на складе'}</span>
                                </button>
                              </div>

                              {/* Edit Cue Overlay */}
                              <div className="absolute inset-0 bg-stone-950/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                <div className="px-3 py-1.5 rounded-xl bg-stone-950/80 text-white text-xs font-semibold flex items-center gap-1.5 backdrop-blur-xs shadow-md">
                                  <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Редактировать</span>
                                </div>
                              </div>
                            </div>

                            {/* CARD DETAILS & FAST EDITING */}
                            <div className="p-3.5 flex-1 flex flex-col justify-between gap-3">
                              <div>
                                <div className="flex items-center gap-1.5 mb-1.5 flex-wrap">
                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleHit(p);
                                    }}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                      p.isHit
                                        ? 'bg-amber-500 text-stone-950 font-black shadow-xs ring-1 ring-amber-400'
                                        : 'bg-stone-100 text-stone-400 hover:text-amber-700 hover:bg-amber-50'
                                    }`}
                                    title="Нажмите, чтобы включить/выключить статус «Хит продаж»"
                                  >
                                    <Flame className="w-3 h-3" />
                                    <span>Хит</span>
                                  </button>

                                  <button
                                    type="button"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleToggleNew(p);
                                    }}
                                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer ${
                                      p.isNew
                                        ? 'bg-emerald-600 text-white font-bold shadow-xs'
                                        : 'bg-stone-100 text-stone-400 hover:text-emerald-700 hover:bg-emerald-50'
                                    }`}
                                    title="Нажмите, чтобы включить/выключить статус «Новинка»"
                                  >
                                    <Sparkles className="w-3 h-3" />
                                    <span>Новинка</span>
                                  </button>
                                </div>

                                <h4
                                  className="font-bold text-stone-900 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-emerald-800 transition-colors cursor-pointer"
                                  onClick={() => setEditingProduct(p)}
                                  title="Нажмите, чтобы редактировать подробное описание"
                                >
                                  {p.titleRu}
                                </h4>
                                {p.titleKz && p.titleKz !== p.titleRu && (
                                  <p className="text-[11px] text-stone-500 line-clamp-1 mt-0.5">
                                    {p.titleKz}
                                  </p>
                                )}
                              </div>

                              {/* Fast Inline Price Editor */}
                              <div className="pt-2 border-t border-stone-100 flex items-center justify-between gap-2">
                                <div className="flex items-center gap-1.5">
                                  <span className="text-[11px] font-bold text-stone-600">Цена:</span>
                                  <div className="flex items-center">
                                    <input
                                      type="number"
                                      defaultValue={p.price}
                                      onBlur={(e) => handlePriceChange(p, Number(e.target.value))}
                                      className="w-24 px-2 py-1 border border-stone-300 rounded-lg text-right font-bold text-stone-900 text-xs focus:ring-2 focus:ring-emerald-700 bg-stone-50 focus:bg-white"
                                      title="Измените цену и кликните в любое место для мгновенного сохранения"
                                    />
                                    <span className="font-bold text-stone-800 text-xs ml-1">₸</span>
                                  </div>
                                </div>

                                {p.oldPrice && (
                                  <span className="text-[10px] text-stone-400 line-through">
                                    {p.oldPrice} ₸
                                  </span>
                                )}
                              </div>

                              {/* Action Buttons */}
                              <div className="flex items-center gap-2 pt-2.5 border-t border-stone-100">
                                <button
                                  type="button"
                                  onClick={() => setEditingProduct(p)}
                                  className="flex-1 py-1.5 px-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                                  title="Редактировать описание, фото и характеристики"
                                >
                                  <Edit2 className="w-3.5 h-3.5 text-amber-300" />
                                  <span>Редактировать</span>
                                </button>

                                {onPreviewProduct && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      onPreviewProduct(p);
                                      onClose();
                                    }}
                                    className="p-1.5 rounded-xl border border-stone-300 text-stone-700 hover:text-emerald-900 hover:bg-stone-50 transition-colors cursor-pointer"
                                    title="Посмотреть на сайте (как видит клиент)"
                                  >
                                    <Eye className="w-3.5 h-3.5" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => handleDelete(p)}
                                  className="p-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                  title="Удалить товар из базы данных"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    /* 2. COMPACT LIST VIEW */
                    <div className="divide-y divide-stone-100 border border-stone-200 rounded-2xl overflow-hidden bg-white max-h-[60vh] overflow-y-auto">
                      {filteredAdminProducts.map((p) => {
                        const directUrl = getProductDirectUrl(p.id);
                        const isCopied = copiedProductId === p.id;
                        const catName = categories.find((c) => c.id === p.categoryId)?.nameRu || p.categoryId;

                        return (
                          <div
                            key={p.id}
                            className="p-3 sm:p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 text-xs hover:bg-stone-50/70 transition-colors"
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <img
                                src={p.images[0]}
                                alt=""
                                className="w-14 h-20 rounded-xl object-cover bg-stone-100 shrink-0 border border-stone-200 cursor-pointer"
                                onClick={() => setEditingProduct(p)}
                                onError={(e) => {
                                  (e.target as any).src =
                                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80';
                                }}
                              />
                              <div className="min-w-0">
                                <p
                                  className="font-bold text-stone-900 truncate max-w-xs sm:max-w-md hover:text-emerald-800 cursor-pointer"
                                  onClick={() => setEditingProduct(p)}
                                >
                                  {p.titleRu}
                                </p>
                                <p className="text-[11px] text-stone-500">
                                  {catName} • Арт: {p.sku}
                                </p>
                                <div className="mt-1 flex items-center gap-2">
                                  <button
                                    type="button"
                                    onClick={() => handleCopyDirectLink(p)}
                                    className={`px-2 py-0.5 rounded-lg text-[10px] font-bold flex items-center gap-1 transition-colors ${
                                      isCopied
                                        ? 'bg-emerald-600 text-white'
                                        : 'bg-amber-100 text-amber-950 hover:bg-amber-200'
                                    }`}
                                  >
                                    {isCopied ? (
                                      <>
                                        <Check className="w-3 h-3" />
                                        <span>Ссылка скопирована!</span>
                                      </>
                                    ) : (
                                      <>
                                        <Link className="w-3 h-3 text-amber-800" />
                                        <span>Скопировать ссылку</span>
                                      </>
                                    )}
                                  </button>
                                  <a
                                    href={directUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-stone-400 hover:text-stone-700"
                                    title="Открыть"
                                  >
                                    <ExternalLink className="w-3 h-3" />
                                  </a>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center justify-between sm:justify-end gap-2 sm:gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-stone-100">
                              <div className="flex items-center gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleToggleHit(p)}
                                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    p.isHit
                                      ? 'bg-amber-400 text-stone-950 font-black'
                                      : 'text-stone-300 hover:text-amber-600 hover:bg-amber-50'
                                  }`}
                                  title={p.isHit ? 'Хит продаж (включен)' : 'Сделать хитом продаж'}
                                >
                                  <Flame className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleToggleNew(p)}
                                  className={`p-1.5 rounded-lg text-xs font-bold transition-colors ${
                                    p.isNew
                                      ? 'bg-emerald-600 text-white font-bold'
                                      : 'text-stone-300 hover:text-emerald-700 hover:bg-emerald-50'
                                  }`}
                                  title={p.isNew ? 'Новинка (включена)' : 'Пометить как новинку'}
                                >
                                  <Sparkles className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  defaultValue={p.price}
                                  onBlur={(e) => handlePriceChange(p, Number(e.target.value))}
                                  className="w-20 px-2 py-1 border border-stone-300 rounded-lg text-right font-bold text-stone-900 text-xs"
                                />
                                <span className="font-semibold text-stone-500 text-xs">₸</span>
                              </div>

                              <button
                                onClick={() => handleToggleStock(p)}
                                className={`px-2.5 py-1 rounded-full font-bold text-[10px] sm:text-[11px] transition-colors cursor-pointer ${
                                  p.inStock
                                    ? 'bg-emerald-100 text-emerald-800 hover:bg-rose-100 hover:text-rose-800'
                                    : 'bg-rose-100 text-rose-800 hover:bg-emerald-100 hover:text-emerald-800'
                                }`}
                              >
                                {p.inStock ? 'В наличии' : 'Нет'}
                              </button>

                              <button
                                onClick={() => setEditingProduct(p)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                                title="Редактировать товар"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                onClick={() => handleDelete(p)}
                                className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                title="Удалить из каталога"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeTab === 'add' ? (
                <form onSubmit={handleAddNewProduct} className="space-y-4 max-w-xl mx-auto">
                  <h4 className="font-bold text-stone-900 text-sm">
                    Добавление нового товара в каталог
                  </h4>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Название на русском (RU)*
                    </label>
                    <input
                      type="text"
                      value={newTitleRu}
                      onChange={(e) => setNewTitleRu(e.target.value)}
                      placeholder="Например: Масло черного тмина Hemani 100 мл"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Название на казахском (KZ)
                    </label>
                    <input
                      type="text"
                      value={newTitleKz}
                      onChange={(e) => setNewTitleKz(e.target.value)}
                      placeholder="Қара зере майы..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Цена (₸)*</label>
                      <input
                        type="number"
                        value={newPrice}
                        onChange={(e) => setNewPrice(e.target.value)}
                        placeholder="5500"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Старая цена (₸)
                      </label>
                      <input
                        type="number"
                        value={newOldPrice}
                        onChange={(e) => setNewOldPrice(e.target.value)}
                        placeholder="7000 (не обязательно)"
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Категория*
                      </label>
                      <select
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                      >
                        {categories
                          .filter((c) => c.id !== 'cat-all')
                          .map((c) => (
                            <option key={c.id} value={c.id}>
                              {c.nameRu}
                            </option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Наличие
                      </label>
                      <select
                        value={newInStock ? 'true' : 'false'}
                        onChange={(e) => setNewInStock(e.target.value === 'true')}
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                      >
                        <option value="true">В наличии</option>
                        <option value="false">Нет в наличии</option>
                      </select>
                    </div>
                  </div>

                  {/* Badges in Add Form */}
                  <div className="flex items-center gap-4 p-3 bg-stone-50 border border-stone-200 rounded-xl">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsHit}
                        onChange={(e) => setNewIsHit(e.target.checked)}
                        className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-stone-300"
                      />
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <Flame className="w-3.5 h-3.5 text-amber-500" />
                        Хит продаж (добавить в подборку «Хиты»)
                      </span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newIsNew}
                        onChange={(e) => setNewIsNew(e.target.checked)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-stone-300"
                      />
                      <span className="text-xs font-bold text-stone-800 flex items-center gap-1">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Новинка (показывать с бейджем «New»)
                      </span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1.5">
                      Фотография товара
                    </label>

                    {/* Image Preview & Upload Controls */}
                    <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl space-y-3">
                      <div className="flex items-center gap-3">
                        <div className="w-20 h-20 rounded-xl border border-stone-200 bg-white overflow-hidden shrink-0 flex items-center justify-center relative">
                          {newImageUrl ? (
                            <img
                              src={newImageUrl}
                              alt="New product preview"
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <ImageIcon className="w-8 h-8 text-stone-300" />
                          )}
                          {isCompressingImage && (
                            <div className="absolute inset-0 bg-stone-900/60 flex items-center justify-center text-white">
                              <Loader2 className="w-5 h-5 animate-spin" />
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <label className="inline-flex items-center justify-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-800 text-white text-xs font-bold hover:bg-emerald-900 cursor-pointer transition-colors shadow-xs active:scale-95">
                            <Camera className="w-4 h-4" />
                            <span>{isCompressingImage ? 'Обработка фото...' : 'Выбрать фото с телефона'}</span>
                            <input
                              type="file"
                              accept="image/*"
                              className="hidden"
                              disabled={isCompressingImage}
                              onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) handleImageFileUpload(file, 'new');
                              }}
                            />
                          </label>
                          <p className="text-[11px] text-stone-500 leading-snug">
                            Сделайте снимок на камеру или выберите фотографию из галереи телефона.
                          </p>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-stone-200/80">
                        <span className="block text-[10px] font-semibold text-stone-500 mb-1">
                          Или укажите ссылку на фото (не обязательно):
                        </span>
                        <input
                          type="text"
                          value={newImageUrl}
                          onChange={(e) => setNewImageUrl(e.target.value)}
                          placeholder="https://... или оставьте как есть"
                          className="w-full px-3 py-1.5 text-xs rounded-lg border border-stone-300 focus:ring-1 focus:ring-emerald-700 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Описание товара
                    </label>
                    <textarea
                      value={newDescRu}
                      onChange={(e) => setNewDescRu(e.target.value)}
                      rows={3}
                      placeholder="Полезные свойства, рекомендации по приему..."
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Характеристики (страна, объем, фасовка)
                    </label>
                    <input
                      type="text"
                      value={newSpecsRu}
                      onChange={(e) => setNewSpecsRu(e.target.value)}
                      placeholder="Объем: 100 мл, Производство: Турция"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-1 focus:ring-emerald-700"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-950 transition-colors flex items-center gap-2"
                  >
                    <Plus className="w-4 h-4" />
                    <span>{isSaving ? 'Сохранение...' : 'Добавить товар в Firestore'}</span>
                  </button>
                </form>
              ) : activeTab === 'settings' ? (
                <form onSubmit={handleSaveConfig} className="space-y-4 max-w-xl mx-auto">
                  <h4 className="font-bold text-stone-900 text-sm">
                    Настройки магазина и контактные данные
                  </h4>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Название магазина
                      </label>
                      <input
                        type="text"
                        value={currentConfig.storeName}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, storeName: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">Бутик</label>
                      <input
                        type="text"
                        value={currentConfig.boutiqueNumber}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, boutiqueNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>

                  {/* Hero Title & Subtitle block */}
                  <div className="p-3 bg-amber-500/5 rounded-2xl border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                      <Sparkles className="w-4 h-4 text-amber-600" />
                      <span>Главный экран сайта (Заголовок и подзаголовок)</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Заголовок (RU)
                        </label>
                        <input
                          type="text"
                          value={currentConfig.taglineRu || ''}
                          onChange={(e) =>
                            setCurrentConfig({ ...currentConfig, taglineRu: e.target.value })
                          }
                          placeholder="Красота, здоровье и халяль-товары в Атырау"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Заголовок (KZ)
                        </label>
                        <input
                          type="text"
                          value={currentConfig.taglineKz || ''}
                          onChange={(e) =>
                            setCurrentConfig({ ...currentConfig, taglineKz: e.target.value })
                          }
                          placeholder="Атыраудағы сұлулық, денсаулық және халал өнімдер"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Подзаголовок (RU)
                        </label>
                        <textarea
                          rows={2}
                          value={currentConfig.subtitleRu || ''}
                          onChange={(e) =>
                            setCurrentConfig({ ...currentConfig, subtitleRu: e.target.value })
                          }
                          placeholder="Витамины iHerb, БАДы, товары для мужского и женского здоровья..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Подзаголовок (KZ)
                        </label>
                        <textarea
                          rows={2}
                          value={currentConfig.subtitleKz || ''}
                          onChange={(e) =>
                            setCurrentConfig({ ...currentConfig, subtitleKz: e.target.value })
                          }
                          placeholder="iHerb дәрумендері, ББҚ, ерлер мен әйелдер денсаулығына арналған өнімдер..."
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Номер WhatsApp (без +)
                      </label>
                      <input
                        type="text"
                        value={currentConfig.whatsappNumber}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, whatsappNumber: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-stone-700 mb-1">
                        Instagram
                      </label>
                      <input
                        type="text"
                        value={currentConfig.instagram}
                        onChange={(e) =>
                          setCurrentConfig({ ...currentConfig, instagram: e.target.value })
                        }
                        className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Адрес бутика
                    </label>
                    <input
                      type="text"
                      value={currentConfig.address}
                      onChange={(e) =>
                        setCurrentConfig({ ...currentConfig, address: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                    />
                  </div>

                  <div className="space-y-2 p-3 bg-stone-50 rounded-2xl border border-stone-200">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-bold text-stone-800 flex items-center gap-1.5">
                        <Clock className="w-4 h-4 text-amber-600" />
                        <span>Часы работы бутика (отображаются в шапке и каталоге)</span>
                      </label>
                      <div className="flex items-center gap-1.5">
                        <span className="text-[10px] text-stone-500 font-medium hidden sm:inline">Быстрый выбор:</span>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentConfig({
                              ...currentConfig,
                              workingHoursRu: 'Ежедневно с 10:00 до 19:00',
                              workingHoursKz: 'Күн сайын сағат 10:00-ден 19:00-ге дейін',
                            })
                          }
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white border border-stone-300 hover:border-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          до 19:00
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentConfig({
                              ...currentConfig,
                              workingHoursRu: 'Ежедневно с 10:00 до 20:00',
                              workingHoursKz: 'Күн сайын сағат 10:00-ден 20:00-ге дейін',
                            })
                          }
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white border border-stone-300 hover:border-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          до 20:00
                        </button>
                        <button
                          type="button"
                          onClick={() =>
                            setCurrentConfig({
                              ...currentConfig,
                              workingHoursRu: 'Ежедневно с 10:00 до 21:00',
                              workingHoursKz: 'Күн сайын сағат 10:00-ден 21:00-ге дейін',
                            })
                          }
                          className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-white border border-stone-300 hover:border-emerald-600 hover:text-emerald-700 transition-colors"
                        >
                          до 21:00
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Часы работы (на русском)
                        </label>
                        <input
                          type="text"
                          value={currentConfig.workingHoursRu}
                          onChange={(e) =>
                            setCurrentConfig({ ...currentConfig, workingHoursRu: e.target.value })
                          }
                          placeholder="Например: Ежедневно с 10:00 до 19:00"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Часы работы (на казахском)
                        </label>
                        <input
                          type="text"
                          value={currentConfig.workingHoursKz}
                          onChange={(e) =>
                            setCurrentConfig({ ...currentConfig, workingHoursKz: e.target.value })
                          }
                          placeholder="Мысалы: Күн сайын 10:00-ден 19:00-ге дейін"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 bg-white focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 outline-none"
                        />
                      </div>
                    </div>

                    {/* Live Preview in header */}
                    {(() => {
                      const preview = isStoreOpen(currentConfig);
                      return (
                        <div className="mt-2 p-2.5 rounded-xl bg-stone-900 text-white flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span className="text-[11px] text-stone-300">
                              В правом верхнем углу шапки будет показано:
                            </span>
                          </div>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                              preview.isOpen
                                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                preview.isOpen ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                              }`}
                            />
                            {preview.textRu}
                          </span>
                        </div>
                      );
                    })()}
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      Ссылка 2GIS
                    </label>
                    <input
                      type="url"
                      value={currentConfig.gis2Url}
                      onChange={(e) =>
                        setCurrentConfig({ ...currentConfig, gis2Url: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-700 mb-1">
                      PIN-код для входа администратора
                    </label>
                    <input
                      type="text"
                      value={currentConfig.adminPin}
                      onChange={(e) =>
                        setCurrentConfig({ ...currentConfig, adminPin: e.target.value })
                      }
                      className="w-48 px-3 py-2 text-xs rounded-xl border border-stone-300"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-5 py-2.5 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-950 transition-colors flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{isSaving ? 'Сохранение...' : 'Сохранить настройки в Firestore'}</span>
                  </button>

                  {savedSuccess && (
                    <p className="text-xs text-emerald-700 font-bold flex items-center gap-1">
                      <Check className="w-4 h-4" /> Настройки успешно сохранены в Firestore!
                    </p>
                  )}
                </form>
              ) : activeTab === 'categories' ? (
                /* CATEGORIES MANAGEMENT TAB */
                <div className="space-y-6 max-w-2xl mx-auto pb-8">
                  {/* Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-200">
                    <div>
                      <h3 className="font-serif font-bold text-lg text-emerald-950 flex items-center gap-2">
                        <Layers className="w-5 h-5 text-emerald-800" />
                        <span>Управление каталогами и направлениями</span>
                      </h3>
                      <p className="text-xs text-stone-500 mt-0.5">
                        Добавляйте новые разделы товаров, меняйте иконки и названия. Все изменения сразу видны на сайте.
                      </p>
                    </div>
                  </div>

                  {/* Feedback message banner */}
                  {categoryFeedback && (
                    <div className="p-3 bg-emerald-50 border border-emerald-300 text-emerald-900 rounded-xl text-xs font-bold flex items-center gap-2 shadow-xs">
                      <Check className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>{categoryFeedback}</span>
                    </div>
                  )}

                  {/* Add New Category Form */}
                  <form
                    onSubmit={handleCreateCategory}
                    className="p-4 sm:p-5 bg-white rounded-2xl border-2 border-emerald-800/20 shadow-xs space-y-4"
                  >
                    <div className="flex items-center gap-2 text-xs font-bold text-emerald-950">
                      <FolderPlus className="w-4 h-4 text-emerald-700" />
                      <span>Добавить новый каталог товаров</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                      {/* Emoji Icon picker */}
                      <div className="sm:col-span-3">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Иконка (эмодзи)
                        </label>
                        <div className="flex items-center gap-2">
                          <input
                            type="text"
                            value={newCatIcon}
                            onChange={(e) => setNewCatIcon(e.target.value)}
                            maxLength={4}
                            className="w-14 text-center text-xl px-2 py-2 rounded-xl border border-stone-300 bg-stone-50 focus:bg-white focus:ring-2 focus:ring-emerald-700"
                            title="Введите смайлик/эмодзи"
                          />
                          <span className="text-xl">{newCatIcon || '✨'}</span>
                        </div>
                      </div>

                      {/* Name RU */}
                      <div className="sm:col-span-5">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Название каталога (RU) *
                        </label>
                        <input
                          type="text"
                          value={newCatNameRu}
                          onChange={(e) => setNewCatNameRu(e.target.value)}
                          placeholder="Например: Детские витамины"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700"
                          required
                        />
                      </div>

                      {/* Name KZ */}
                      <div className="sm:col-span-4">
                        <label className="block text-[11px] font-bold text-stone-700 mb-1">
                          Название (KZ)
                        </label>
                        <input
                          type="text"
                          value={newCatNameKz}
                          onChange={(e) => setNewCatNameKz(e.target.value)}
                          placeholder="Мысалы: Балалар дәрумендері"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-stone-300 focus:ring-2 focus:ring-emerald-700"
                        />
                      </div>
                    </div>

                    {/* Quick emoji suggestions */}
                    <div>
                      <span className="text-[10px] text-stone-500 font-semibold block mb-1">
                        Быстрый выбор подходящей иконки:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {['💊', '🌿', '💪', '🌸', '🍯', '🩸', '🕌', '🧴', '🧼', '☕', '🫖', '📦', '✨', '🔥', '🌟', '⚖️', '📿', '📖'].map(
                          (emoji) => (
                            <button
                              key={emoji}
                              type="button"
                              onClick={() => setNewCatIcon(emoji)}
                              className={`w-7 h-7 rounded-lg text-sm flex items-center justify-center transition-all cursor-pointer ${
                                newCatIcon === emoji
                                  ? 'bg-emerald-900 text-white scale-110 shadow-xs'
                                  : 'bg-stone-100 hover:bg-stone-200 text-stone-800'
                              }`}
                            >
                              {emoji}
                            </button>
                          )
                        )}
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isCategorySubmitting || !newCatNameRu.trim()}
                      className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-900 hover:bg-emerald-950 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      <Plus className="w-4 h-4" />
                      <span>{isCategorySubmitting ? 'Создание...' : 'Создать каталог'}</span>
                    </button>
                  </form>

                  {/* Existing Categories List */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                      <span>Все каталоги бутика ({categories.length})</span>
                      <span className="text-[11px] text-stone-500 font-normal">
                        Нажмите «Изменить» для правки или смены названия
                      </span>
                    </div>

                    <div className="space-y-2">
                      {categories.map((cat) => {
                        const isSystemAll = cat.id === 'cat-all';
                        const isCurrentlyEditing = editingCategory?.id === cat.id;
                        const isConfirmingDelete = categoryToDelete?.id === cat.id;
                        const productCount = products.filter((p) => p.categoryId === cat.id).length;

                        if (isConfirmingDelete) {
                          return (
                            <div
                              key={cat.id}
                              className="p-3.5 bg-rose-50 border-2 border-rose-300 rounded-2xl space-y-2.5 animate-in fade-in"
                            >
                              <div className="flex items-center gap-2 text-rose-950 font-bold text-xs">
                                <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                                <span>Удалить каталог «{cat.nameRu}»?</span>
                              </div>
                              <p className="text-[11px] text-rose-800">
                                {productCount > 0
                                  ? `В этом каталоге сейчас числится ${productCount} товаров. При удалении каталога они останутся в магазине (в разделе «Все товары»).`
                                  : 'Раздел будет полностью удален из списка каталогов и базы данных.'}
                              </p>
                              <div className="flex items-center gap-2 pt-1">
                                <button
                                  type="button"
                                  onClick={() => handleConfirmDeleteCategory(cat)}
                                  disabled={isDeletingCategory}
                                  className="px-3.5 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-bold text-xs shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                  <span>{isDeletingCategory ? 'Удаление...' : 'Да, удалить'}</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setCategoryToDelete(null)}
                                  disabled={isDeletingCategory}
                                  className="px-3.5 py-1.5 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-700 font-semibold text-xs cursor-pointer transition-colors"
                                >
                                  Отмена
                                </button>
                              </div>
                            </div>
                          );
                        }

                        if (isCurrentlyEditing) {
                          return (
                            <form
                              key={cat.id}
                              onSubmit={handleSaveEditedCategory}
                              className="p-3.5 bg-amber-500/10 border-2 border-amber-500/40 rounded-2xl space-y-3"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-xs font-bold text-amber-950">
                                  Редактирование каталога: {cat.nameRu}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategory(null)}
                                  className="text-xs text-stone-500 hover:text-stone-800"
                                >
                                  Отмена
                                </button>
                              </div>

                              <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
                                <div className="sm:col-span-3">
                                  <label className="block text-[10px] font-bold text-stone-700 mb-1">
                                    Иконка
                                  </label>
                                  <input
                                    type="text"
                                    value={editingCategory.icon || '✨'}
                                    onChange={(e) =>
                                      setEditingCategory({
                                        ...editingCategory,
                                        icon: e.target.value,
                                      })
                                    }
                                    maxLength={4}
                                    className="w-full text-center text-lg px-2 py-1.5 rounded-xl border border-stone-300 bg-white"
                                  />
                                </div>
                                <div className="sm:col-span-5">
                                  <label className="block text-[10px] font-bold text-stone-700 mb-1">
                                    Название (RU)
                                  </label>
                                  <input
                                    type="text"
                                    value={editingCategory.nameRu}
                                    onChange={(e) =>
                                      setEditingCategory({
                                        ...editingCategory,
                                        nameRu: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
                                    required
                                  />
                                </div>
                                <div className="sm:col-span-4">
                                  <label className="block text-[10px] font-bold text-stone-700 mb-1">
                                    Название (KZ)
                                  </label>
                                  <input
                                    type="text"
                                    value={editingCategory.nameKz || ''}
                                    onChange={(e) =>
                                      setEditingCategory({
                                        ...editingCategory,
                                        nameKz: e.target.value,
                                      })
                                    }
                                    className="w-full px-2.5 py-1.5 text-xs rounded-xl border border-stone-300 bg-white"
                                  />
                                </div>
                              </div>

                              <div className="flex gap-2">
                                <button
                                  type="submit"
                                  disabled={isCategorySubmitting}
                                  className="px-4 py-1.5 rounded-xl bg-emerald-900 text-white font-bold text-xs hover:bg-emerald-950 transition-colors"
                                >
                                  {isCategorySubmitting ? 'Сохранение...' : 'Сохранить'}
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCategory(null)}
                                  className="px-3 py-1.5 rounded-xl bg-stone-200 text-stone-700 text-xs font-semibold hover:bg-stone-300"
                                >
                                  Отмена
                                </button>
                              </div>
                            </form>
                          );
                        }

                        return (
                          <div
                            key={cat.id}
                            className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-200/90 shadow-2xs hover:border-emerald-700/30 transition-all"
                          >
                            <div className="flex items-center gap-3">
                              <span className="w-9 h-9 rounded-xl bg-stone-100 flex items-center justify-center text-lg shrink-0">
                                {cat.icon || '✨'}
                              </span>
                              <div>
                                <div className="flex items-center gap-2">
                                  <h4 className="font-bold text-xs text-stone-900">{cat.nameRu}</h4>
                                  {isSystemAll && (
                                    <span className="text-[10px] px-2 py-0.2 rounded-full bg-stone-100 text-stone-600 font-semibold">
                                      Основной
                                    </span>
                                  )}
                                  <span className="text-[10px] px-2 py-0.2 rounded-full bg-emerald-100 text-emerald-900 font-bold">
                                    {isSystemAll ? `${products.length} товаров` : `${productCount} товаров`}
                                  </span>
                                </div>
                                {cat.nameKz && (
                                  <p className="text-[11px] text-stone-400">{cat.nameKz}</p>
                                )}
                              </div>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => setEditingCategory(cat)}
                                className="p-1.5 rounded-lg text-stone-500 hover:text-emerald-900 hover:bg-emerald-50 transition-colors"
                                title="Редактировать название или иконку"
                              >
                                <Edit2 className="w-3.5 h-3.5" />
                              </button>

                              {!isSystemAll && (
                                <button
                                  type="button"
                                  onClick={() => handleDeleteCategoryClick(cat)}
                                  className="p-1.5 rounded-lg text-stone-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                                  title="Удалить каталог"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ) : null}

              {/* STATS & ANALYTICS TAB */}
              {activeTab === 'stats' && !editingProduct && (
                <AnalyticsTab products={products} currency={currentConfig.currency || '₸'} />
              )}
            </div>
          </div>
        )}

        {/* Product delete confirmation modal */}
        {productToDelete && (
          <div
            className="fixed inset-0 z-60 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4"
            onClick={() => setProductToDelete(null)}
          >
            <div
              className="bg-white rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-3.5 animate-in fade-in zoom-in-95"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <Trash2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-sm text-stone-900">Удалить товар?</h4>
                  <p className="text-xs text-stone-500 font-medium line-clamp-1">{productToDelete.titleRu}</p>
                </div>
              </div>
              <p className="text-xs text-stone-600">
                Вы действительно хотите удалить товар «{productToDelete.titleRu}»? Он будет удален из каталога и базы данных.
              </p>
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setProductToDelete(null)}
                  disabled={isDeletingProduct}
                  className="px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-semibold cursor-pointer transition-colors"
                >
                  Отмена
                </button>
                <button
                  type="button"
                  onClick={() => handleConfirmDeleteProduct(productToDelete)}
                  disabled={isDeletingProduct}
                  className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>{isDeletingProduct ? 'Удаление...' : 'Да, удалить'}</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
