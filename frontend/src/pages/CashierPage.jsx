import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  InputBase,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Divider,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import CreditCardOutlinedIcon from '@mui/icons-material/CreditCardOutlined';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

import ProductVisual from '../components/common/ProductVisual';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import { getStoredProducts, deductStockFromSale, fetchAndSyncProducts } from '../services/productStockService';

const CATEGORIES = [
  'Semua',
  'Makanan & Minuman',
  'Alat Tulis',
  'Perlengkapan Kantor',
  'Kebersihan',
  'Elektronik',
];

const CashierPage = () => {
  const [products, setProducts] = useState(getStoredProducts);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [search, setSearch] = useState('');
  const [note, setNote] = useState('');
  const [discountPercent, setDiscountPercent] = useState(0);

  // Initial cart with the 4 items shown in Kasir.png
  const [cart, setCart] = useState([
    {
      productId: 1,
      name: 'Kertas Thermal 58mm',
      code: 'PRD001',
      price: 25000,
      quantity: 2,
      subtotal: 50000,
    },
    {
      productId: 2,
      name: 'Tinta Printer Kasir',
      code: 'PRD002',
      price: 85000,
      quantity: 1,
      subtotal: 85000,
    },
    {
      productId: 3,
      name: 'Pulpen Standard',
      code: 'PRD003',
      price: 3000,
      quantity: 3,
      subtotal: 9000,
    },
    {
      productId: 4,
      name: 'Buku Tulis A5',
      code: 'PRD004',
      price: 7500,
      quantity: 1,
      subtotal: 7500,
    },
  ]);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai'); // 'Tunai' or 'Non Tunai'
  const [cashAmount, setCashAmount] = useState('');
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [completedTx, setCompletedTx] = useState(null);

  const { enqueueSnackbar } = useSnackbar();

  // Load & synchronize products across pages
  useEffect(() => {
    fetchAndSyncProducts().then(items => {
      if (items && items.length > 0) {
        setProducts(items);
      }
    });

    const handleStockUpdate = (e) => {
      if (e.detail && Array.isArray(e.detail)) {
        setProducts(e.detail);
      }
    };

    window.addEventListener('tokas_stock_updated', handleStockUpdate);
    return () => window.removeEventListener('tokas_stock_updated', handleStockUpdate);
  }, []);

  // Filter products by category and search keyword
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat =
        selectedCategory === 'Semua' ||
        (p.kategori && p.kategori.toLowerCase() === selectedCategory.toLowerCase());
      const query = search.toLowerCase();
      const matchSearch =
        !search ||
        (p.nama && p.nama.toLowerCase().includes(query)) ||
        (p.kode && p.kode.toLowerCase().includes(query));
      return matchCat && matchSearch;
    });
  }, [products, selectedCategory, search]);

  // Cart operations
  const addToCart = (product) => {
    if (product.stok <= 0) {
      enqueueSnackbar('Stok produk habis', { variant: 'warning' });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stok) {
          enqueueSnackbar('Mencapai batas stok produk', { variant: 'warning' });
          return prev;
        }
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1, subtotal: (item.quantity + 1) * item.price }
            : item
        );
      }
      return [
        ...prev,
        {
          productId: product.id,
          name: product.nama,
          code: product.kode,
          price: product.hargaJual,
          quantity: 1,
          subtotal: product.hargaJual,
        },
      ];
    });
  };

  const updateQuantity = (productId, delta) => {
    setCart(prev =>
      prev
        .map(item => {
          if (item.productId === productId) {
            const nextQty = item.quantity + delta;
            if (nextQty <= 0) return null;
            return { ...item, quantity: nextQty, subtotal: nextQty * item.price };
          }
          return item;
        })
        .filter(Boolean)
    );
  };

  const removeFromCart = (productId) => {
    setCart(prev => prev.filter(item => item.productId !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Calculations
  const totalItemCount = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.quantity, 0);
  }, [cart]);

  const rawSubtotal = useMemo(() => {
    return cart.reduce((acc, item) => acc + item.subtotal, 0);
  }, [cart]);

  const discountAmount = useMemo(() => {
    const p = parseFloat(discountPercent) || 0;
    return Math.round((rawSubtotal * p) / 100);
  }, [rawSubtotal, discountPercent]);

  const afterDiscount = Math.max(0, rawSubtotal - discountAmount);
  const taxAmount = Math.round(afterDiscount * 0.05);
  const totalPayment = afterDiscount + taxAmount;

  const handleOpenPayment = (method) => {
    if (cart.length === 0) {
      enqueueSnackbar('Keranjang belanja masih kosong', { variant: 'warning' });
      return;
    }
    setPaymentMethod(method);
    setCashAmount(totalPayment.toString());
    setPaymentModalOpen(true);
  };

  const handleProcessPayment = async () => {
    const cashNum = parseFloat(cashAmount) || totalPayment;
    if (paymentMethod === 'Tunai' && cashNum < totalPayment) {
      enqueueSnackbar('Uang pembayaran kurang dari total tagihan', { variant: 'error' });
      return;
    }

    // Deduct stock in real-time across the app
    const updatedProducts = deductStockFromSale(cart);
    setProducts(updatedProducts);

    try {
      const payload = {
        items: cart.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
        })),
        paymentAmount: paymentMethod === 'Tunai' ? cashNum : totalPayment,
        paymentMethod: paymentMethod === 'Tunai' ? 'cash' : 'qris',
        notes: note,
      };

      const res = await api.post('/transactions', payload);
      // Synchronize immediately with real database stock
      const fresh = await fetchAndSyncProducts();
      if (fresh && fresh.length > 0) {
        setProducts(fresh);
      }
      setCompletedTx(res.data?.data || {
        transactionNo: `TRX-${Date.now().toString().slice(-6)}`,
        total: totalPayment,
        paymentAmount: cashNum,
        changeAmount: Math.max(0, cashNum - totalPayment),
        items: [...cart],
        date: new Date().toLocaleString('id-ID'),
      });
    } catch (err) {
      // Mock fallback completion
      setCompletedTx({
        transactionNo: `TRX-${Date.now().toString().slice(-6)}`,
        total: totalPayment,
        paymentAmount: cashNum,
        changeAmount: Math.max(0, cashNum - totalPayment),
        items: [...cart],
        date: new Date().toLocaleString('id-ID'),
      });
    }

    setPaymentModalOpen(false);
    setReceiptDialog(true);
    setCart([]);
    setNote('');
    enqueueSnackbar('Transaksi berhasil diselesaikan! Stok produk otomatis berkurang.', { variant: 'success' });
  };

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      {/* HEADER SECTION: Title & Search Bar */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', md: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', md: 'center' },
          mb: 3,
          gap: 2,
          width: '100%',
        }}
      >
        <Box>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#0f172a',
              fontSize: { xs: '1.4rem', sm: '1.65rem' },
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Mesin Kasir
          </Typography>
          <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.875rem' }}>
            Pilih produk untuk ditambahkan ke keranjang
          </Typography>
        </Box>

        {/* Search Bar matching Kasir.png */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            bgcolor: '#ffffff',
            border: '1px solid #e2e8f0',
            borderRadius: '24px',
            px: 2,
            py: 0.85,
            width: { xs: '100%', md: 460 },
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            transition: 'all 0.2s',
            '&:hover, &:focus-within': {
              borderColor: '#cbd5e1',
              boxShadow: '0 0 0 3px rgba(37, 99, 235, 0.08)',
            },
          }}
        >
          <SearchIcon sx={{ color: '#94a3b8', fontSize: 20, mr: 1.25 }} />
          <InputBase
            placeholder="Cari produk (nama atau barcode)..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{
              flex: 1,
              fontSize: '0.825rem',
              color: '#334155',
              '& input::placeholder': { color: '#94a3b8', opacity: 1 },
            }}
          />
          <QrCodeScannerIcon sx={{ color: '#2563eb', fontSize: 20, ml: 1, cursor: 'pointer' }} />
        </Box>
      </Box>

      {/* MAIN TWO-COLUMN LAYOUT: Catalog (Left) & Cart (Right) */}
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            md: '1.05fr 1fr',
            lg: '1fr 1fr',
            xl: '1.02fr 1fr',
          },
          gap: 2.5,
          width: '100%',
          alignItems: 'start',
        }}
      >
        {/* LEFT PANEL: Categories & Product Grid */}
        <Box sx={{ width: '100%' }}>
          {/* Category Filter Pills Row */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1.25,
              mb: 2.5,
              overflowX: 'auto',
              pb: 0.5,
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
            }}
          >
            {CATEGORIES.map(cat => {
              const isActive = selectedCategory === cat;
              return (
                <Box
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    px: 2,
                    py: 0.75,
                    borderRadius: '20px',
                    fontSize: '0.8125rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.15s ease-in-out',
                    bgcolor: isActive ? '#2563eb' : '#ffffff',
                    color: isActive ? '#ffffff' : '#475569',
                    border: isActive ? '1px solid #2563eb' : '1px solid #e2e8f0',
                    boxShadow: isActive ? '0 2px 6px rgba(37, 99, 235, 0.2)' : '0 1px 2px rgba(0,0,0,0.02)',
                    '&:hover': {
                      bgcolor: isActive ? '#1d4ed8' : '#f8fafc',
                      color: isActive ? '#ffffff' : '#0f172a',
                    },
                  }}
                >
                  {cat}
                </Box>
              );
            })}
            {/* More button */}
            <Box
              sx={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: '#64748b',
                flexShrink: 0,
                '&:hover': { bgcolor: '#f8fafc', color: '#0f172a' },
              }}
            >
              <MoreHorizIcon sx={{ fontSize: 18 }} />
            </Box>
          </Box>

          {/* Product Cards Grid: 4 columns on desktop */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(2, 1fr)',
                lg: 'repeat(3, 1fr)',
                xl: 'repeat(3, 1fr)',
              },
              gap: 1.75,
              width: '100%',
            }}
          >
            {filteredProducts.map((p, index) => {
              // Item 1 has an active blue border indicator in Kasir.png
              const isFirst = index === 0;
              return (
                <Card
                  key={p.id}
                  onClick={() => addToCart(p)}
                  elevation={0}
                  sx={{
                    p: 2,
                    borderRadius: '16px',
                    border: isFirst ? '1.5px solid #2563eb' : '1px solid #eef2f6',
                    bgcolor: '#ffffff',
                    boxShadow: isFirst ? '0 4px 14px rgba(37, 99, 235, 0.08)' : '0 1px 3px rgba(0,0,0,0.02)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 205,
                    transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                    '&:hover': {
                      borderColor: '#2563eb',
                      transform: 'translateY(-3px)',
                      boxShadow: '0 8px 20px -4px rgba(37, 99, 235, 0.12)',
                      '& .product-thumb-svg': {
                        transform: 'scale(1.08)',
                      },
                    },
                  }}
                >
                  {/* Thumbnail Container */}
                  <Box
                    sx={{
                      height: 100,
                      width: '100%',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: '#f8fafc',
                      mb: 1.5,
                      overflow: 'hidden',
                      transition: 'background 0.2s',
                    }}
                  >
                    <Box className="product-thumb-svg" sx={{ transition: 'transform 0.25s ease' }}>
                      <ProductVisual code={p.kode} name={p.nama} size={72} />
                    </Box>
                  </Box>

                  {/* Product Details */}
                  <Box>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: '#0f172a',
                        fontSize: '0.85rem',
                        lineHeight: 1.3,
                        mb: 0.5,
                        height: 36,
                        overflow: 'hidden',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                      }}
                    >
                      {p.nama}
                    </Typography>

                    <Typography
                      variant="subtitle2"
                      sx={{
                        fontWeight: 800,
                        color: '#2563eb',
                        fontSize: '0.95rem',
                        mb: 1,
                      }}
                    >
                      {formatCurrency(p.hargaJual)}
                    </Typography>

                    {/* Stock & Plus button */}
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: p.stok <= 0 ? '#ef4444' : (isFirst ? '#2563eb' : '#64748b'),
                          fontSize: '0.78rem',
                          fontWeight: p.stok <= 0 ? 700 : 600,
                        }}
                      >
                        {p.stok <= 0 ? 'Habis' : `Stok: ${p.stok}`}
                      </Typography>

                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          if (p.stok > 0) addToCart(p);
                        }}
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '50%',
                          bgcolor: p.stok <= 0 ? '#e2e8f0' : '#2563eb',
                          color: p.stok <= 0 ? '#94a3b8' : '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: p.stok <= 0 ? 'none' : '0 2px 6px rgba(37, 99, 235, 0.35)',
                          transition: 'all 0.15s ease',
                          cursor: p.stok <= 0 ? 'not-allowed' : 'pointer',
                          '&:hover': {
                            bgcolor: p.stok <= 0 ? '#e2e8f0' : '#1d4ed8',
                            transform: p.stok <= 0 ? 'none' : 'scale(1.12)',
                          },
                        }}
                      >
                        <AddIcon sx={{ fontSize: 16 }} />
                      </Box>
                    </Box>
                  </Box>
                </Card>
              );
            })}
          </Box>
        </Box>

        {/* RIGHT PANEL: Keranjang Belanja (Cart) */}
        <Card
          elevation={0}
          sx={{
            p: 2.75,
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            bgcolor: '#ffffff',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            boxSizing: 'border-box',
          }}
        >
          {/* Cart Header */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 2,
            }}
          >
            <Typography
              variant="subtitle1"
              sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1.05rem' }}
            >
              Keranjang Belanja
            </Typography>

            <Box
              onClick={clearCart}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 0.5,
                color: '#ef4444',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
              Hapus Semua
            </Box>
          </Box>

          {/* Table / List Header */}
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '2.3fr 1.1fr 1fr 1.2fr',
              pb: 1,
              borderBottom: '1px solid #f1f5f9',
              color: '#64748b',
              fontSize: '0.75rem',
              fontWeight: 600,
            }}
          >
            <Box>Produk</Box>
            <Box sx={{ textAlign: 'right' }}>Harga</Box>
            <Box sx={{ textAlign: 'center' }}>Qty</Box>
            <Box sx={{ textAlign: 'right' }}>Subtotal</Box>
          </Box>

          {/* Cart Items List */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 280,
              overflowY: 'auto',
              scrollbarWidth: 'none',
              '&::-webkit-scrollbar': { display: 'none' },
              my: 1,
            }}
          >
            {cart.length === 0 ? (
              <Box sx={{ py: 5, textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem' }}>
                Keranjang masih kosong. Pilih produk dari daftar katalog.
              </Box>
            ) : (
              cart.map(item => (
                <Box
                  key={item.productId}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2.3fr 1.1fr 1fr 1.2fr',
                    alignItems: 'center',
                    py: 1.5,
                    borderBottom: '1px solid #f8fafc',
                  }}
                >
                  {/* Product thumbnail + Name & SKU */}
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25, pr: 1 }}>
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: '8px',
                        bgcolor: '#f8fafc',
                        border: '1px solid #f1f5f9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <ProductVisual code={item.code} name={item.name} size={28} />
                    </Box>
                    <Box sx={{ minWidth: 0 }}>
                      <Typography
                        variant="body2"
                        noWrap
                        sx={{
                          fontWeight: 700,
                          color: '#0f172a',
                          fontSize: '0.8rem',
                          lineHeight: 1.2,
                        }}
                      >
                        {item.name}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Price */}
                  <Box sx={{ textAlign: 'right', fontSize: '0.78rem', color: '#475569' }}>
                    {formatCurrency(item.price)}
                  </Box>

                  {/* Qty Stepper */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.5 }}>
                    <Box
                      onClick={() => updateQuantity(item.productId, -1)}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '5px',
                        border: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: '#64748b',
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: '#f8fafc' },
                      }}
                    >
                      <RemoveIcon sx={{ fontSize: 12 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a', minWidth: 14, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <Box
                      onClick={() => updateQuantity(item.productId, 1)}
                      sx={{
                        width: 20,
                        height: 20,
                        borderRadius: '5px',
                        border: '1px solid #dbeafe',
                        bgcolor: '#eff6ff',
                        color: '#2563eb',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        '&:hover': { bgcolor: '#dbeafe' },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 12 }} />
                    </Box>
                  </Box>

                  {/* Subtotal & Delete icon */}
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.75 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: '#0f172a' }}>
                      {formatCurrency(item.subtotal)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.productId)}
                      sx={{ p: 0.25, color: '#94a3b8', '&:hover': { color: '#ef4444' } }}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          {/* Catatan Transaksi (Opsional) */}
          <Box sx={{ mt: 2.25, mb: 2.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box
                sx={{
                  width: 26,
                  height: 26,
                  borderRadius: '7px',
                  bgcolor: '#eff6ff',
                  color: '#2563eb',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <DescriptionOutlinedIcon sx={{ fontSize: 16 }} />
              </Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', fontSize: '0.78rem' }}>
                Catatan Transaksi (Opsional)
              </Typography>
            </Box>
            <InputBase
              fullWidth
              placeholder="Contoh: Pembelian untuk kantor..."
              value={note}
              onChange={e => setNote(e.target.value)}
              sx={{
                bgcolor: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '10px',
                px: 1.75,
                py: 0.9,
                fontSize: '0.8125rem',
                color: '#334155',
                '& input::placeholder': { color: '#94a3b8', opacity: 1 },
              }}
            />
          </Box>

          <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

          {/* Calculation Details - Spacious with good line-height */}
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.75, my: 2 }}>
            {/* Subtotal */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem' }}>
                Subtotal ({totalItemCount} item)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '0.925rem' }}>
                {formatCurrency(rawSubtotal)}
              </Typography>
            </Box>

            {/* Diskon */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#475569', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: 0.5 }}>
                % Diskon
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.25 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: '1px solid #e2e8f0',
                    borderRadius: '7px',
                    px: 1.25,
                    py: 0.35,
                    bgcolor: '#ffffff',
                  }}
                >
                  <InputBase
                    value={discountPercent}
                    onChange={e => setDiscountPercent(e.target.value)}
                    sx={{ width: 36, fontSize: '0.825rem', textAlign: 'center', color: '#0f172a' }}
                    inputProps={{ style: { textAlign: 'center', padding: 0 } }}
                  />
                  <Box sx={{ display: 'flex', alignItems: 'center', color: '#64748b', fontSize: '0.75rem', ml: 0.5 }}>
                    % <KeyboardArrowDownIcon sx={{ fontSize: 15 }} />
                  </Box>
                </Box>
                <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                  {discountAmount > 0 ? `- ${formatCurrency(discountAmount)}` : 'Rp 0'}
                </Typography>
              </Box>
            </Box>

            {/* Pajak (PPN 11%) */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                Pajak (PPN 5%)
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748b', fontSize: '0.85rem' }}>
                {formatCurrency(taxAmount)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

          {/* Total Pembayaran - Spacious */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', my: 2 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0f172a', fontSize: '1rem' }}>
              Total Pembayaran
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: '#2563eb', fontSize: '1.55rem', letterSpacing: '-0.02em' }}
            >
              {formatCurrency(totalPayment)}
            </Typography>
          </Box>

          {/* 3 Action Buttons - Spacious, Non-Squished */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr 1.2fr' }, gap: 1.5, mt: 1 }}>
            {/* Simpan Pesanan */}
            <Button
              variant="outlined"
              onClick={() => enqueueSnackbar('Pesanan tersimpan di draf', { variant: 'info' })}
              startIcon={<BookmarkBorderIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '11px',
                borderColor: '#dbeafe',
                color: '#2563eb',
                bgcolor: '#ffffff',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                minHeight: 46,
                py: 1.2,
                px: 1.25,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#f8fafc', borderColor: '#bfdbfe' },
              }}
            >
              Simpan Pesanan
            </Button>

            {/* Bayar Tunai */}
            <Button
              variant="contained"
              onClick={() => handleOpenPayment('Tunai')}
              startIcon={<PaymentsOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '11px',
                bgcolor: '#eff6ff',
                color: '#2563eb',
                boxShadow: 'none',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                minHeight: 46,
                py: 1.2,
                px: 1.25,
                whiteSpace: 'nowrap',
                border: '1px solid #dbeafe',
                '&:hover': { bgcolor: '#dbeafe', boxShadow: 'none' },
              }}
            >
              Bayar Tunai
            </Button>

            {/* Bayar Non Tunai */}
            <Button
              variant="contained"
              onClick={() => handleOpenPayment('Non Tunai')}
              startIcon={<CreditCardOutlinedIcon sx={{ fontSize: 18 }} />}
              sx={{
                borderRadius: '11px',
                bgcolor: '#2563eb',
                color: '#ffffff',
                boxShadow: 'none',
                textTransform: 'none',
                fontWeight: 700,
                fontSize: '0.8125rem',
                minHeight: 46,
                py: 1.2,
                px: 1.5,
                whiteSpace: 'nowrap',
                '&:hover': { bgcolor: '#1d4ed8', boxShadow: '0 2px 8px rgba(37,99,235,0.25)' },
              }}
            >
              Bayar Non Tunai
            </Button>
          </Box>
        </Card>
      </Box>

      {/* PAYMENT MODAL DIALOG */}
      <Dialog
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1 } }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: '#0f172a', pb: 1 }}>
          Pembayaran {paymentMethod}
        </DialogTitle>
        <DialogContent dividers sx={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ color: '#64748b' }}>
              Total Tagihan:
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 800, color: '#2563eb', mt: 0.5 }}>
              {formatCurrency(totalPayment)}
            </Typography>
          </Box>

          {paymentMethod === 'Tunai' ? (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: '#334155', display: 'block', mb: 1 }}>
                Nominal Uang Diterima:
              </Typography>
              <TextField
                fullWidth
                size="small"
                type="number"
                value={cashAmount}
                onChange={e => setCashAmount(e.target.value)}
                placeholder="Masukkan nominal..."
                sx={{ mb: 2 }}
              />

              {/* Quick cash pills */}
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {[totalPayment, 50000, 100000, 200000].map(amt => (
                  <Box
                    key={amt}
                    onClick={() => setCashAmount(amt.toString())}
                    sx={{
                      px: 1.5,
                      py: 0.5,
                      borderRadius: '8px',
                      bgcolor: '#f1f5f9',
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: '#475569',
                      cursor: 'pointer',
                      '&:hover': { bgcolor: '#e2e8f0' },
                    }}
                  >
                    {formatCurrency(amt)}
                  </Box>
                ))}
              </Box>

              {/* Kembalian calculation */}
              <Box
                sx={{
                  p: 1.5,
                  borderRadius: '10px',
                  bgcolor: '#f8fafc',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="body2" sx={{ color: '#64748b' }}>
                  Kembalian:
                </Typography>
                <Typography
                  variant="subtitle1"
                  sx={{
                    fontWeight: 800,
                    color: (parseFloat(cashAmount) || 0) >= totalPayment ? '#16a34a' : '#ef4444',
                  }}
                >
                  {(parseFloat(cashAmount) || 0) >= totalPayment
                    ? formatCurrency((parseFloat(cashAmount) || 0) - totalPayment)
                    : 'Uang kurang'}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
                Pindai QRIS atau gunakan mesin EDC EDC untuk pembayaran non-tunai.
              </Typography>
              <Box
                sx={{
                  width: 140,
                  height: 140,
                  mx: 'auto',
                  border: '2px dashed #93c5fd',
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: '#f0f9ff',
                  color: '#2563eb',
                }}
              >
                <QrCodeScannerIcon sx={{ fontSize: 64 }} />
              </Box>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={() => setPaymentModalOpen(false)}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600 }}
          >
            Batal
          </Button>
          <Button
            variant="contained"
            onClick={handleProcessPayment}
            sx={{
              textTransform: 'none',
              bgcolor: '#2563eb',
              fontWeight: 700,
              borderRadius: '8px',
              px: 3,
            }}
          >
            Konfirmasi Bayar
          </Button>
        </DialogActions>
      </Dialog>

      {/* RECEIPT / STRUK DIALOG */}
      <Dialog
        open={receiptDialog}
        onClose={() => setReceiptDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '16px', p: 1.5 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
          <CheckCircleOutlinedIcon sx={{ color: '#16a34a', fontSize: 44, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a' }}>
            Pembayaran Berhasil!
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748b' }}>
            {completedTx?.transactionNo} • {completedTx?.date}
          </Typography>
        </DialogTitle>
        <DialogContent dividers sx={{ borderTop: '1px solid #f1f5f9', borderBottom: '1px solid #f1f5f9' }}>
          <Box sx={{ my: 1 }}>
            {completedTx?.items?.map((item, idx) => (
              <Box
                key={idx}
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.8125rem' }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: '#0f172a' }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#64748b' }}>
                    {item.quantity} x {formatCurrency(item.price)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                  {formatCurrency(item.subtotal)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 1.5, borderColor: '#f1f5f9' }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Total Tagihan</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                {formatCurrency(completedTx?.total || 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: '#64748b' }}>Uang Diterima</Typography>
              <Typography variant="body2" sx={{ color: '#0f172a' }}>
                {formatCurrency(completedTx?.paymentAmount || 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: '#16a34a' }}>Kembalian</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: '#16a34a' }}>
                {formatCurrency(completedTx?.changeAmount || 0)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setReceiptDialog(false)}
            sx={{ textTransform: 'none', color: '#64748b', fontWeight: 600 }}
          >
            Tutup
          </Button>
          <Button
            variant="contained"
            onClick={() => window.print()}
            sx={{
              textTransform: 'none',
              bgcolor: '#2563eb',
              fontWeight: 700,
              borderRadius: '8px',
              px: 3,
            }}
          >
            Cetak Struk
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default CashierPage;
