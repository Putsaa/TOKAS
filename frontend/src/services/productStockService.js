import api from './api';

const STORAGE_KEY = 'tokas_inventory_products';

export const getStoredProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (e) {
  }
  return [];
};

export const saveStoredProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('tokas_stock_updated', { detail: products }));
  } catch (e) {
  }
};

export const deductStockFromSale = (purchasedItems) => {
  const current = getStoredProducts();
  const updated = current.map(p => {
    const item = purchasedItems.find(it => it.productId === p.id);
    if (item) {
      const nextStock = Math.max(0, (parseInt(p.stok, 10) || 0) - item.quantity);
      return { ...p, stok: nextStock };
    }
    return p;
  });
  saveStoredProducts(updated);
  return updated;
};

export const fetchAndSyncProducts = async () => {
  try {
    const res = await api.get('/products?pageSize=100');
    const items = res.data?.data?.items;
    if (Array.isArray(items)) {
      const mapped = items.map(p => ({
        id: p.id,
        kode: p.code || `PRD${p.id}`,
        nama: p.name,
        kategori: p.categoryName || 'Umum',
        hargaBeli: p.purchasePrice !== undefined ? p.purchasePrice : 0,
        hargaJual: p.sellingPrice !== undefined ? p.sellingPrice : 0,
        stok: p.stock !== undefined ? p.stock : 0,
        minimumStock: p.minimumStock !== undefined ? p.minimumStock : 10,
        unit: p.unit || 'pcs',
        status: p.isActive ? 'Aktif' : 'Nonaktif',
      }));
      saveStoredProducts(mapped);
      return mapped;
    }
  } catch (err) {
  }
  return getStoredProducts();
};
