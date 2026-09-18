// IndexedDB service for high-capacity local storage (products, images, orders)
// Bypasses the strict 5MB quota of localStorage

const DB_NAME = 'MuslimShopDatabase_v1';
const DB_VERSION = 1;

export const IDB_STORES = {
  PRODUCTS: 'products',
  ORDERS: 'orders',
  CATEGORIES: 'categories',
  SETTINGS: 'settings',
} as const;

type StoreName = typeof IDB_STORES[keyof typeof IDB_STORES];

class IndexedDbService {
  private dbPromise: Promise<IDBDatabase | null> | null = null;

  private isSupported(): boolean {
    return typeof window !== 'undefined' && 'indexedDB' in window;
  }

  private async getDB(): Promise<IDBDatabase | null> {
    if (!this.isSupported()) return null;
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve) => {
      try {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;
          Object.values(IDB_STORES).forEach((store) => {
            if (!db.objectStoreNames.contains(store)) {
              db.createObjectStore(store, { keyPath: 'id' });
            }
          });
        };

        request.onsuccess = () => {
          resolve(request.result);
        };

        request.onerror = (e) => {
          console.warn('IndexedDB open error:', e);
          resolve(null);
        };
      } catch (err) {
        console.warn('IndexedDB initialization failed:', err);
        resolve(null);
      }
    });

    return this.dbPromise;
  }

  public async getAll<T>(storeName: StoreName): Promise<T[]> {
    try {
      const db = await this.getDB();
      if (!db) return [];

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readonly');
          const store = tx.objectStore(storeName);
          const request = store.getAll();

          request.onsuccess = () => {
            resolve((request.result as T[]) || []);
          };

          request.onerror = () => {
            resolve([]);
          };
        } catch {
          resolve([]);
        }
      });
    } catch {
      return [];
    }
  }

  public async saveAll<T extends { id: string }>(storeName: StoreName, items: T[]): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db || items.length === 0) return;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);

          // Clear existing and write fresh
          const clearReq = store.clear();
          clearReq.onsuccess = () => {
            for (const item of items) {
              if (item && item.id) {
                store.put(item);
              }
            }
          };

          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
          tx.onabort = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // Graceful fallback
    }
  }

  public async saveItem<T extends { id: string }>(storeName: StoreName, item: T): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db || !item || !item.id) return;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.put(item);

          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // Graceful fallback
    }
  }

  public async deleteItem(storeName: StoreName, id: string): Promise<void> {
    try {
      const db = await this.getDB();
      if (!db || !id) return;

      return new Promise((resolve) => {
        try {
          const tx = db.transaction(storeName, 'readwrite');
          const store = tx.objectStore(storeName);
          store.delete(id);

          tx.oncomplete = () => resolve();
          tx.onerror = () => resolve();
        } catch {
          resolve();
        }
      });
    } catch {
      // Graceful fallback
    }
  }
}

export const indexedDbService = new IndexedDbService();
