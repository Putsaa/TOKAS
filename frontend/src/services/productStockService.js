import api from './api';

const STORAGE_KEY = 'tokas_inventory_products';

export const INITIAL_PRODUCTS = [
  { id: 1, kode: 'PRD001', nama: 'Kertas Thermal 58mm', kategori: 'Perlengkapan Kantor', hargaBeli: 18000, hargaJual: 25000, stok: 50, status: 'Aktif' },
  { id: 2, kode: 'PRD002', nama: 'Tinta Printer Kasir', kategori: 'Elektronik', hargaBeli: 65000, hargaJual: 85000, stok: 30, status: 'Aktif' },
  { id: 3, kode: 'PRD003', nama: 'Pulpen Standard', kategori: 'Alat Tulis', hargaBeli: 1800, hargaJual: 3000, stok: 120, status: 'Aktif' },
  { id: 4, kode: 'PRD004', nama: 'Buku Tulis A5', kategori: 'Alat Tulis', hargaBeli: 4500, hargaJual: 7500, stok: 80, status: 'Aktif' },
  { id: 5, kode: 'PRD005', nama: 'Plastik Shopping Bag', kategori: 'Kebersihan', hargaBeli: 250, hargaJual: 500, stok: 200, status: 'Aktif' },
  { id: 6, kode: 'PRD006', nama: 'Stapler', kategori: 'Alat Tulis', hargaBeli: 21000, hargaJual: 30000, stok: 25, status: 'Aktif' },
  { id: 7, kode: 'PRD007', nama: 'Isi Staples', kategori: 'Alat Tulis', hargaBeli: 3200, hargaJual: 5000, stok: 100, status: 'Aktif' },
  { id: 8, kode: 'PRD008', nama: 'Lakban Bening', kategori: 'Perlengkapan Kantor', hargaBeli: 4800, hargaJual: 7000, stok: 90, status: 'Aktif' },
  { id: 9, kode: 'PRD009', nama: 'Spidol Permanent', kategori: 'Alat Tulis', hargaBeli: 8000, hargaJual: 12000, stok: 60, status: 'Aktif' },
  { id: 10, kode: 'PRD010', nama: 'Map Plastik', kategori: 'Alat Tulis', hargaBeli: 2400, hargaJual: 4000, stok: 150, status: 'Aktif' },
  { id: 11, kode: 'PRD011', nama: 'Kertas A4 70gsm', kategori: 'Perlengkapan Kantor', hargaBeli: 42000, hargaJual: 55000, stok: 40, status: 'Aktif' },
  { id: 12, kode: 'PRD012', nama: 'Gunting', kategori: 'Alat Tulis', hargaBeli: 9500, hargaJual: 15000, stok: 35, status: 'Aktif' },
];

/**
 * Get current synchronized products list
 */
export const getStoredProducts = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    // Ignore error
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_PRODUCTS));
  return INITIAL_PRODUCTS;
};

/**
 * Save and broadcast updated products
 */
export const saveStoredProducts = (products) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
    window.dispatchEvent(new CustomEvent('tokas_stock_updated', { detail: products }));
  } catch (e) {
    // Ignore error
  }
};

/**
 * Deduct stock after a sale
 * @param {Array<{productId: number, quantity: number}>} purchasedItems
 */
export const deductStockFromSale = (purchasedItems) => {
  const current = getStoredProducts();
  const updated = current.map(p => {
    const item = purchasedItems.find(it => it.productId === p.id);
    if (item) {
      const nextStock = Math.max(0, (parseInt(p.stok) || 0) - item.quantity);
      return { ...p, stok: nextStock };
    }
    return p;
  });
  saveStoredProducts(updated);
  return updated;
};

/**
 * Fetch products from backend API, or fall back to local stored products
 */
export const fetchAndSyncProducts = async () => {
  try {
    const res = await api.get('/products');
    const items = res.data?.data?.items;
    if (Array.isArray(items) && items.length > 0) {
      const mapped = items.map(p => ({
        id: p.id,
        kode: p.kode,
        nama: p.nama,
        kategori: p.kategoriNama || p.kategori || 'Alat Tulis',
        hargaBeli: p.hargaBeli || 0,
        hargaJual: p.hargaJual || 0,
        stok: p.stok || 0,
        status: p.status || (p.isActive ? 'Aktif' : 'Nonaktif'),
      }));
      saveStoredProducts(mapped);
      return mapped;
    }
  } catch (err) {
    // Keep local stored
  }
  return getStoredProducts();
};
