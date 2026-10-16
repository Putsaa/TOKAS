import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
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
  Tooltip,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import DeleteOutlinedIcon from '@mui/icons-material/DeleteOutlined';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import PaymentsOutlinedIcon from '@mui/icons-material/PaymentsOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import BookmarkBorderIcon from '@mui/icons-material/BookmarkBorder';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import PrintOutlinedIcon from '@mui/icons-material/PrintOutlined';
import ClearIcon from '@mui/icons-material/Clear';
import NotesOutlinedIcon from '@mui/icons-material/NotesOutlined';

import ProductVisual from '../components/common/ProductVisual';
import StatusBadge from '../components/common/StatusBadge';
import KeyboardBadge from '../components/common/KeyboardBadge';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useSnackbar } from 'notistack';
import api from '../services/api';
import { formatCurrency } from '../utils/formatters';
import tokens from '../theme/tokens';
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
  ]);

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('Tunai'); 
  const [cashAmount, setCashAmount] = useState('');
  const [receiptDialog, setReceiptDialog] = useState(false);
  const [completedTx, setCompletedTx] = useState(null);
  const [clearCartConfirm, setClearCartConfirm] = useState(false);

  const searchInputRef = useRef(null);
  const cashInputRef = useRef(null);
  const { enqueueSnackbar } = useSnackbar();

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

  const addToCart = useCallback((product) => {
    if (product.stok <= 0) {
      enqueueSnackbar('Stok produk habis!', { variant: 'warning' });
      return;
    }

    setCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      if (existing) {
        if (existing.quantity >= product.stok) {
          enqueueSnackbar(`Mencapai batas stok produk (${product.stok} unit)`, { variant: 'warning' });
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
  }, [enqueueSnackbar]);

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
    setClearCartConfirm(false);
    enqueueSnackbar('Keranjang berhasil dikosongkan', { variant: 'info' });
  };

  const handleOpenPayment = useCallback((method) => {
    if (cart.length === 0) {
      enqueueSnackbar('Keranjang belanja masih kosong! Pilih produk terlebih dahulu.', { variant: 'warning' });
      return;
    }
    setPaymentMethod(method);
    setCashAmount(totalPayment.toString());
    setPaymentModalOpen(true);
    setTimeout(() => {
      if (cashInputRef.current) {
        cashInputRef.current.focus();
        cashInputRef.current.select();
      }
    }, 100);
  }, [cart.length, totalPayment, enqueueSnackbar]);

  const handleProcessPayment = useCallback(async () => {
    const cashNum = parseFloat(cashAmount) || totalPayment;
    if (paymentMethod === 'Tunai' && cashNum < totalPayment) {
      enqueueSnackbar('Uang pembayaran kurang dari total tagihan!', { variant: 'error' });
      return;
    }

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
      const fresh = await fetchAndSyncProducts();
      if (fresh && fresh.length > 0) {
        setProducts(fresh);
      }
      setCompletedTx(res.data?.data);
      setPaymentModalOpen(false);
      setReceiptDialog(true);
      setCart([]);
      setNote('');
      enqueueSnackbar('Transaksi berhasil diselesaikan! Stok otomatis diperbarui di database.', { variant: 'success' });
    } catch (err) {
      const msg = err.response?.data?.message || 'Gagal memproses transaksi kasir ke database';
      enqueueSnackbar(msg, { variant: 'error' });
    }
  }, [cashAmount, totalPayment, paymentMethod, cart, note, enqueueSnackbar]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      
      if (paymentModalOpen) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setPaymentModalOpen(false);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          handleProcessPayment();
        }
        return;
      }

      if (receiptDialog) {
        if (e.key === 'Escape') {
          e.preventDefault();
          setReceiptDialog(false);
        } else if (e.key === 'p' || e.key === 'P') {
          e.preventDefault();
          window.print();
        }
        return;
      }

      if (e.key === 'F2') {
        e.preventDefault();
        if (searchInputRef.current) {
          searchInputRef.current.focus();
          searchInputRef.current.select();
        }
      } else if (e.key === 'F4') {
        e.preventDefault();
        handleOpenPayment('Tunai');
      } else if (e.key === 'F8' || e.key === 'F9') {
        e.preventDefault();
        handleOpenPayment('Non Tunai');
      } else if (e.key === 'F10') {
        e.preventDefault();
        enqueueSnackbar('Pesanan berhasil disimpan di draf', { variant: 'info' });
      } else if (e.key === 'Escape') {
        if (search) {
          setSearch('');
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [paymentModalOpen, receiptDialog, search, handleOpenPayment, handleProcessPayment, enqueueSnackbar]);

  const currentCashNum = parseFloat(cashAmount) || 0;
  const changeNum = currentCashNum - totalPayment;
  const isCashSufficient = currentCashNum >= totalPayment;

  return (
    <Box sx={{ width: '100%', maxWidth: '100%', boxSizing: 'border-box', pb: 4 }}>
      
      <Box
        sx={{
          display: 'flex',
          flexDirection: { xs: 'column', lg: 'row' },
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', lg: 'center' },
          mb: 2.5,
          gap: 2,
        }}
      >
        <Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: tokens.colors.neutral[900],
                fontSize: { xs: '1.35rem', sm: '1.55rem' },
                letterSpacing: '-0.02em',
              }}
            >
              Mesin Kasir (POS)
            </Typography>
          </Box>
          <Typography variant="body2" sx={{ color: tokens.colors.neutral[500], fontSize: '0.825rem', mt: 0.25 }}>
            Gunakan barcode scanner atau ketik nama/kode barang untuk menambah ke keranjang.
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, flexWrap: 'wrap', width: { xs: '100%', lg: 'auto' } }}>
          
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1.25,
              bgcolor: tokens.colors.neutral[100],
              borderRadius: '8px',
              px: 1.5,
              py: 0.6,
            }}
          >
            <KeyboardBadge shortcut="F2" label="Cari" />
            <Box sx={{ color: tokens.colors.neutral[300] }}>•</Box>
            <KeyboardBadge shortcut="F4" label="Bayar Tunai" />
            <Box sx={{ color: tokens.colors.neutral[300] }}>•</Box>
            <KeyboardBadge shortcut="F8" label="QRIS" />
          </Box>

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              bgcolor: '#ffffff',
              border: `1px solid ${tokens.colors.neutral[200]}`,
              borderRadius: '10px',
              px: 1.5,
              py: 0.75,
              width: { xs: '100%', sm: 380 },
              boxShadow: tokens.shadows.card,
              transition: tokens.transitions.fast,
              '&:focus-within': {
                borderColor: tokens.colors.brand[500],
                boxShadow: `0 0 0 2px ${tokens.colors.brand[100]}`,
              },
            }}
          >
            <SearchIcon sx={{ color: tokens.colors.neutral[400], fontSize: 20, mr: 1 }} />
            <InputBase
              inputRef={searchInputRef}
              placeholder="Cari produk / scan barcode [F2]..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              sx={{
                flex: 1,
                fontSize: '0.84rem',
                color: tokens.colors.neutral[800],
                '& input::placeholder': { color: tokens.colors.neutral[400], opacity: 1 },
              }}
            />
            {search ? (
              <IconButton size="small" onClick={() => setSearch('')} sx={{ p: 0.25 }}>
                <ClearIcon sx={{ fontSize: 16, color: tokens.colors.neutral[400] }} />
              </IconButton>
            ) : (
              <Tooltip title="Fokus scanner barcode">
                <QrCodeScannerIcon sx={{ color: tokens.colors.brand[500], fontSize: 20, cursor: 'pointer' }} />
              </Tooltip>
            )}
          </Box>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: {
            xs: '1fr',
            lg: '1.2fr 1fr',
            xl: '1.25fr 1fr',
          },
          gap: 2.5,
          alignItems: 'start',
        }}
      >
        
        <Box sx={{ width: '100%' }}>
          
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              mb: 2,
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
                    px: 1.75,
                    py: 0.65,
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    fontWeight: 700,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: tokens.transitions.fast,
                    bgcolor: isActive ? tokens.colors.brand[500] : '#ffffff',
                    color: isActive ? '#ffffff' : tokens.colors.neutral[600],
                    border: `1px solid ${isActive ? tokens.colors.brand[500] : tokens.colors.neutral[200]}`,
                    boxShadow: isActive ? tokens.shadows.card : 'none',
                    '&:hover': {
                      bgcolor: isActive ? tokens.colors.brand[600] : tokens.colors.neutral[50],
                      borderColor: isActive ? tokens.colors.brand[600] : tokens.colors.neutral[300],
                    },
                  }}
                >
                  {cat}
                </Box>
              );
            })}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, 1fr)',
                sm: 'repeat(3, 1fr)',
                md: 'repeat(3, 1fr)',
              },
              gap: 1.75,
            }}
          >
            {filteredProducts.map((p) => {
              const isOutOfStock = p.stok <= 0;
              const isLow = p.stok > 0 && p.stok <= 5;
              const inCartItem = cart.find(c => c.productId === p.id);

              return (
                <Card
                  key={p.id}
                  onClick={() => !isOutOfStock && addToCart(p)}
                  elevation={0}
                  sx={{
                    p: 1.75,
                    borderRadius: '12px',
                    border: inCartItem
                      ? `1.5px solid ${tokens.colors.brand[500]}`
                      : `1px solid ${tokens.colors.neutral[200]}`,
                    bgcolor: isOutOfStock ? tokens.colors.neutral[50] : '#ffffff',
                    cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                    minHeight: 185,
                    opacity: isOutOfStock ? 0.65 : 1,
                    transition: tokens.transitions.fast,
                    position: 'relative',
                    '&:hover': !isOutOfStock
                      ? {
                          borderColor: tokens.colors.brand[500],
                          transform: 'translateY(-2px)',
                          boxShadow: tokens.shadows.cardHover,
                        }
                      : undefined,
                  }}
                >
                  
                  {inCartItem && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: tokens.colors.brand[500],
                        color: '#ffffff',
                        borderRadius: '6px',
                        px: 0.75,
                        py: 0.2,
                        fontSize: '0.7rem',
                        fontWeight: 800,
                      }}
                    >
                      {inCartItem.quantity} di keranjang
                    </Box>
                  )}

                  <Box
                    sx={{
                      height: 80,
                      width: '100%',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      bgcolor: tokens.colors.neutral[50],
                      mb: 1.25,
                    }}
                  >
                    <ProductVisual code={p.kode} name={p.nama} size={52} />
                  </Box>

                  <Box>
                    <Typography
                      variant="caption"
                      sx={{
                        color: tokens.colors.neutral[400],
                        fontSize: '0.7rem',
                        fontWeight: 600,
                        display: 'block',
                      }}
                    >
                      {p.kode}
                    </Typography>
                    <Typography
                      variant="body2"
                      sx={{
                        fontWeight: 700,
                        color: tokens.colors.neutral[900],
                        fontSize: '0.825rem',
                        lineHeight: 1.3,
                        mb: 0.5,
                        height: 34,
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
                        color: tokens.colors.brand[600],
                        fontSize: '0.925rem',
                        fontFeatureSettings: '"tnum"',
                        mb: 1,
                      }}
                    >
                      {formatCurrency(p.hargaJual)}
                    </Typography>

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <StatusBadge
                        status={isOutOfStock ? 'habis' : isLow ? 'menipis' : 'aman'}
                        label={isOutOfStock ? 'Habis' : `Stok: ${p.stok}`}
                        size="small"
                        showDot={isLow || isOutOfStock}
                      />

                      <Box
                        onClick={(e) => {
                          e.stopPropagation();
                          if (!isOutOfStock) addToCart(p);
                        }}
                        sx={{
                          width: 28,
                          height: 28,
                          borderRadius: '6px',
                          bgcolor: isOutOfStock ? tokens.colors.neutral[200] : tokens.colors.brand[50],
                          color: isOutOfStock ? tokens.colors.neutral[400] : tokens.colors.brand[600],
                          border: `1px solid ${isOutOfStock ? tokens.colors.neutral[300] : tokens.colors.brand[100]}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          cursor: isOutOfStock ? 'not-allowed' : 'pointer',
                          transition: tokens.transitions.fast,
                          '&:hover': !isOutOfStock
                            ? {
                                bgcolor: tokens.colors.brand[500],
                                color: '#ffffff',
                                borderColor: tokens.colors.brand[500],
                              }
                            : undefined,
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

        <Card
          elevation={0}
          sx={{
            p: 2.5,
            borderRadius: '12px',
            bgcolor: '#ffffff',
            border: `1px solid ${tokens.colors.neutral[200]}`,
            boxShadow: tokens.shadows.card,
            display: 'flex',
            flexDirection: 'column',
            position: { lg: 'sticky' },
            top: { lg: 80 },
          }}
        >
          
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.75 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: tokens.colors.neutral[900], fontSize: '1rem' }}>
                Keranjang Belanja
              </Typography>
              <Box
                sx={{
                  bgcolor: tokens.colors.brand[50],
                  color: tokens.colors.brand[600],
                  px: 0.8,
                  py: 0.2,
                  borderRadius: '6px',
                  fontSize: '0.725rem',
                  fontWeight: 700,
                }}
              >
                {totalItemCount} item
              </Box>
            </Box>

            {cart.length > 0 && (
              <Box
                onClick={() => setClearCartConfirm(true)}
                sx={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.4,
                  color: tokens.colors.danger[600],
                  fontSize: '0.75rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  '&:hover': { color: tokens.colors.danger[700] },
                }}
              >
                <DeleteOutlinedIcon sx={{ fontSize: 16 }} />
                Kosongkan
              </Box>
            )}
          </Box>

          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr',
              pb: 1,
              borderBottom: `1px solid ${tokens.colors.neutral[200]}`,
              color: tokens.colors.neutral[500],
              fontSize: '0.74rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.025em',
            }}
          >
            <Box>Produk</Box>
            <Box sx={{ textAlign: 'right' }}>Harga</Box>
            <Box sx={{ textAlign: 'center' }}>Qty</Box>
            <Box sx={{ textAlign: 'right' }}>Subtotal</Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              maxHeight: 250,
              overflowY: 'auto',
              scrollbarWidth: 'thin',
              my: 0.5,
            }}
          >
            {cart.length === 0 ? (
              <Box sx={{ py: 4, textAlign: 'center' }}>
                <Typography variant="body2" sx={{ color: tokens.colors.neutral[400], fontSize: '0.84rem' }}>
                  Keranjang kosong. Pilih produk atau scan barcode [F2].
                </Typography>
              </Box>
            ) : (
              cart.map(item => (
                <Box
                  key={item.productId}
                  sx={{
                    display: 'grid',
                    gridTemplateColumns: '2.5fr 1fr 1fr 1.2fr',
                    alignItems: 'center',
                    py: 1.25,
                    borderBottom: `1px solid ${tokens.colors.neutral[100]}`,
                  }}
                >
                  
                  <Box sx={{ pr: 1, minWidth: 0 }}>
                    <Typography
                      variant="body2"
                      noWrap
                      sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontSize: '0.8125rem' }}
                    >
                      {item.name}
                    </Typography>
                    <Typography variant="caption" sx={{ color: tokens.colors.neutral[400], fontSize: '0.7rem' }}>
                      {item.code}
                    </Typography>
                  </Box>

                  <Box sx={{ textAlign: 'right', fontSize: '0.78rem', color: tokens.colors.neutral[600], fontFeatureSettings: '"tnum"' }}>
                    {formatCurrency(item.price)}
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 0.4 }}>
                    <Box
                      onClick={() => updateQuantity(item.productId, -1)}
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '4px',
                        border: `1px solid ${tokens.colors.neutral[300]}`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        color: tokens.colors.neutral[700],
                        '&:hover': { bgcolor: tokens.colors.neutral[100] },
                      }}
                    >
                      <RemoveIcon sx={{ fontSize: 13 }} />
                    </Box>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8rem', color: tokens.colors.neutral[900], minWidth: 16, textAlign: 'center' }}>
                      {item.quantity}
                    </Typography>
                    <Box
                      onClick={() => updateQuantity(item.productId, 1)}
                      sx={{
                        width: 22,
                        height: 22,
                        borderRadius: '4px',
                        bgcolor: tokens.colors.brand[50],
                        border: `1px solid ${tokens.colors.brand[100]}`,
                        color: tokens.colors.brand[600],
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                        '&:hover': { bgcolor: tokens.colors.brand[100] },
                      }}
                    >
                      <AddIcon sx={{ fontSize: 13 }} />
                    </Box>
                  </Box>

                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.5 }}>
                    <Typography sx={{ fontWeight: 700, fontSize: '0.8125rem', color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                      {formatCurrency(item.subtotal)}
                    </Typography>
                    <IconButton
                      size="small"
                      onClick={() => removeFromCart(item.productId)}
                      sx={{ p: 0.25, color: tokens.colors.neutral[400], '&:hover': { color: tokens.colors.danger[600] } }}
                    >
                      <DeleteOutlinedIcon sx={{ fontSize: 15 }} />
                    </IconButton>
                  </Box>
                </Box>
              ))
            )}
          </Box>

          <Box sx={{ my: 1.5 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, mb: 0.5 }}>
              <NotesOutlinedIcon sx={{ fontSize: 15, color: tokens.colors.neutral[500] }} />
              <Typography variant="caption" sx={{ fontWeight: 600, color: tokens.colors.neutral[600], fontSize: '0.74rem' }}>
                Catatan Transaksi (Opsional)
              </Typography>
            </Box>
            <InputBase
              fullWidth
              placeholder="Tambahkan catatan khusus..."
              value={note}
              onChange={e => setNote(e.target.value)}
              sx={{
                bgcolor: tokens.colors.neutral[50],
                border: `1px solid ${tokens.colors.neutral[200]}`,
                borderRadius: '8px',
                px: 1.25,
                py: 0.5,
                fontSize: '0.78rem',
                color: tokens.colors.neutral[800],
                '&:focus-within': { borderColor: tokens.colors.brand[500] },
              }}
            />
          </Box>

          <Divider sx={{ my: 1, borderColor: tokens.colors.neutral[200] }} />

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, my: 1 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[600], fontSize: '0.825rem' }}>
                Subtotal ({totalItemCount} item)
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(rawSubtotal)}
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[600], fontSize: '0.825rem' }}>
                Diskon Penjualan (%)
              </Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    border: `1px solid ${tokens.colors.neutral[200]}`,
                    borderRadius: '6px',
                    px: 0.75,
                    py: 0.2,
                    bgcolor: '#ffffff',
                  }}
                >
                  <InputBase
                    value={discountPercent}
                    onChange={e => setDiscountPercent(e.target.value)}
                    sx={{ width: 32, fontSize: '0.78rem', textAlign: 'center', color: tokens.colors.neutral[900] }}
                    inputProps={{ style: { textAlign: 'center', padding: 0 } }}
                  />
                  <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], ml: 0.25 }}>%</Typography>
                </Box>
                <Typography variant="body2" sx={{ color: tokens.colors.danger[600], fontWeight: 600, fontSize: '0.8rem', fontFeatureSettings: '"tnum"' }}>
                  {discountAmount > 0 ? `- ${formatCurrency(discountAmount)}` : 'Rp 0'}
                </Typography>
              </Box>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[600], fontSize: '0.825rem' }}>
                Pajak (PPN 5%)
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[700], fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(taxAmount)}
              </Typography>
            </Box>
          </Box>

          <Divider sx={{ my: 1, borderColor: tokens.colors.neutral[200] }} />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              bgcolor: tokens.colors.brand[50],
              p: 1.75,
              borderRadius: '10px',
              border: `1px solid ${tokens.colors.brand[100]}`,
              my: 1.5,
            }}
          >
            <Box>
              <Typography variant="caption" sx={{ color: tokens.colors.brand[700], fontWeight: 700, textTransform: 'uppercase', fontSize: '0.72rem' }}>
                Total Pembayaran
              </Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[500], fontSize: '0.74rem' }}>
                Termasuk PPN & diskon
              </Typography>
            </Box>
            <Typography
              variant="h5"
              sx={{
                fontWeight: 800,
                color: tokens.colors.brand[700],
                fontSize: { xs: '1.4rem', sm: '1.6rem' },
                letterSpacing: '-0.02em',
                fontFeatureSettings: '"tnum"',
              }}
            >
              {formatCurrency(totalPayment)}
            </Typography>
          </Box>

          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.25, mt: 1 }}>
            
            <Button
              variant="contained"
              onClick={() => handleOpenPayment('Tunai')}
              disabled={cart.length === 0}
              startIcon={<PaymentsOutlinedIcon />}
              sx={{
                bgcolor: tokens.colors.brand[500],
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.825rem',
                py: 1.2,
                borderRadius: '8px',
                '&:hover': { bgcolor: tokens.colors.brand[600] },
              }}
            >
              Tunai <KeyboardBadge shortcut="F4" sx={{ ml: 0.75 }} />
            </Button>

            <Button
              variant="contained"
              onClick={() => handleOpenPayment('Non Tunai')}
              disabled={cart.length === 0}
              startIcon={<QrCode2OutlinedIcon />}
              sx={{
                bgcolor: tokens.colors.success[600],
                color: '#ffffff',
                fontWeight: 700,
                fontSize: '0.825rem',
                py: 1.2,
                borderRadius: '8px',
                '&:hover': { bgcolor: tokens.colors.success[700] },
              }}
            >
              QRIS <KeyboardBadge shortcut="F8" sx={{ ml: 0.75 }} />
            </Button>
          </Box>

          <Button
            variant="outlined"
            onClick={() => enqueueSnackbar('Pesanan tersimpan di draf', { variant: 'info' })}
            disabled={cart.length === 0}
            startIcon={<BookmarkBorderIcon sx={{ fontSize: 17 }} />}
            sx={{
              mt: 1.2,
              borderRadius: '8px',
              py: 0.8,
              fontSize: '0.78rem',
              fontWeight: 600,
              borderColor: tokens.colors.neutral[300],
              color: tokens.colors.neutral[700],
            }}
          >
            Simpan Draf Pesanan <KeyboardBadge shortcut="F10" sx={{ ml: 0.75 }} />
          </Button>
        </Card>
      </Box>

      <Dialog
        open={paymentModalOpen}
        onClose={() => setPaymentModalOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '14px',
            p: 1,
            border: `1px solid ${tokens.colors.neutral[200]}`,
          },
        }}
      >
        <DialogTitle sx={{ fontWeight: 800, color: tokens.colors.neutral[900], pb: 1, pt: 2, px: 2.5 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              {paymentMethod === 'Tunai' ? (
                <PaymentsOutlinedIcon sx={{ color: tokens.colors.brand[500] }} />
              ) : (
                <QrCode2OutlinedIcon sx={{ color: tokens.colors.success[600] }} />
              )}
              <Typography variant="h6" sx={{ fontWeight: 800, fontSize: '1.05rem' }}>
                Pembayaran {paymentMethod}
              </Typography>
            </Box>
            <KeyboardBadge shortcut="ESC" label="Batal" />
          </Box>
        </DialogTitle>

        <DialogContent dividers sx={{ px: 2.5, py: 2, borderColor: tokens.colors.neutral[200] }}>
          <Box sx={{ mb: 2, p: 1.5, borderRadius: '8px', bgcolor: tokens.colors.neutral[50], border: `1px solid ${tokens.colors.neutral[200]}` }}>
            <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], fontWeight: 600 }}>
              TOTAL TAGIHAN:
            </Typography>
            <Typography
              variant="h5"
              sx={{ fontWeight: 800, color: tokens.colors.brand[600], fontFeatureSettings: '"tnum"', mt: 0.25 }}
            >
              {formatCurrency(totalPayment)}
            </Typography>
          </Box>

          {paymentMethod === 'Tunai' ? (
            <Box>
              <Typography variant="caption" sx={{ fontWeight: 700, color: tokens.colors.neutral[700], display: 'block', mb: 0.75 }}>
                Uang Diterima dari Pelanggan (Rp):
              </Typography>
              <TextField
                inputRef={cashInputRef}
                fullWidth
                size="medium"
                type="number"
                value={cashAmount}
                onChange={e => setCashAmount(e.target.value)}
                placeholder="Masukkan nominal uang..."
                sx={{
                  mb: 2,
                  '& input': { fontWeight: 700, fontSize: '1.15rem', color: tokens.colors.neutral[900] },
                }}
              />

              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 2 }}>
                {[totalPayment, 50000, 100000, 200000, 500000].map(amt => (
                  <Box
                    key={amt}
                    onClick={() => setCashAmount(amt.toString())}
                    sx={{
                      px: 1.25,
                      py: 0.45,
                      borderRadius: '6px',
                      bgcolor: tokens.colors.neutral[100],
                      fontSize: '0.74rem',
                      fontWeight: 700,
                      color: tokens.colors.neutral[700],
                      cursor: 'pointer',
                      border: `1px solid ${tokens.colors.neutral[200]}`,
                      transition: tokens.transitions.fast,
                      '&:hover': { bgcolor: tokens.colors.brand[50], borderColor: tokens.colors.brand[200], color: tokens.colors.brand[600] },
                    }}
                  >
                    {amt === totalPayment ? 'Uang Pas' : formatCurrency(amt)}
                  </Box>
                ))}
              </Box>

              <Box
                sx={{
                  p: 1.75,
                  borderRadius: '10px',
                  bgcolor: isCashSufficient ? tokens.colors.success[50] : tokens.colors.danger[50],
                  border: `1px solid ${isCashSufficient ? tokens.colors.success[100] : tokens.colors.danger[100]}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 700,
                    color: isCashSufficient ? tokens.colors.success[700] : tokens.colors.danger[700],
                  }}
                >
                  {isCashSufficient ? 'Uang Kembalian:' : 'Uang Pembayaran Kurang:'}
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.2rem',
                    color: isCashSufficient ? tokens.colors.success[700] : tokens.colors.danger[700],
                    fontFeatureSettings: '"tnum"',
                  }}
                >
                  {isCashSufficient
                    ? formatCurrency(changeNum)
                    : formatCurrency(Math.abs(changeNum))}
                </Typography>
              </Box>
            </Box>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[600], mb: 2 }}>
                Pindai QRIS TOKAS menggunakan aplikasi mobile banking / e-wallet.
              </Typography>
              <Box
                sx={{
                  width: 160,
                  height: 160,
                  mx: 'auto',
                  border: `2px dashed ${tokens.colors.brand[200]}`,
                  borderRadius: '12px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  bgcolor: tokens.colors.brand[50],
                  color: tokens.colors.brand[500],
                }}
              >
                <QrCodeScannerIcon sx={{ fontSize: 72 }} />
              </Box>
              <Typography variant="caption" sx={{ color: tokens.colors.neutral[500], display: 'block', mt: 1.5 }}>
                Verifikasi pembayaran otomatis setelah pelanggan berhasil transfer.
              </Typography>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ p: 2.5, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setPaymentModalOpen(false)}
            sx={{ color: tokens.colors.neutral[600], fontWeight: 600, fontSize: '0.825rem' }}
          >
            Batal [ESC]
          </Button>
          <Button
            variant="contained"
            onClick={handleProcessPayment}
            disabled={paymentMethod === 'Tunai' && !isCashSufficient}
            sx={{
              bgcolor: tokens.colors.brand[500],
              fontWeight: 700,
              fontSize: '0.84rem',
              borderRadius: '8px',
              px: 3,
              py: 0.9,
              '&:hover': { bgcolor: tokens.colors.brand[600] },
            }}
          >
            Selesaikan Transaksi [Enter]
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        open={receiptDialog}
        onClose={() => setReceiptDialog(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: '14px', p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 2.5 }}>
          <CheckCircleOutlinedIcon sx={{ color: tokens.colors.success[600], fontSize: 46, mb: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 800, color: tokens.colors.neutral[900] }}>
            Pembayaran Berhasil!
          </Typography>
          <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
            {completedTx?.transactionNo} • {completedTx?.date}
          </Typography>
        </DialogTitle>

        <DialogContent dividers sx={{ borderTop: `1px solid ${tokens.colors.neutral[200]}`, borderBottom: `1px solid ${tokens.colors.neutral[200]}` }}>
          <Box sx={{ my: 1 }}>
            {completedTx?.items?.map((item, idx) => (
              <Box
                key={idx}
                sx={{ display: 'flex', justifyContent: 'space-between', mb: 1, fontSize: '0.8125rem' }}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: tokens.colors.neutral[900] }}>
                    {item.name}
                  </Typography>
                  <Typography variant="caption" sx={{ color: tokens.colors.neutral[500] }}>
                    {item.quantity} x {formatCurrency(item.price)}
                  </Typography>
                </Box>
                <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                  {formatCurrency(item.subtotal)}
                </Typography>
              </Box>
            ))}

            <Divider sx={{ my: 1.5, borderColor: tokens.colors.neutral[200] }} />

            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[500] }}>Total Tagihan</Typography>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(completedTx?.total || 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[500] }}>Uang Diterima</Typography>
              <Typography variant="body2" sx={{ color: tokens.colors.neutral[900], fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(completedTx?.paymentAmount || 0)}
              </Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography variant="body2" sx={{ fontWeight: 700, color: tokens.colors.success[700] }}>Kembalian</Typography>
              <Typography variant="body2" sx={{ fontWeight: 800, color: tokens.colors.success[700], fontFeatureSettings: '"tnum"' }}>
                {formatCurrency(completedTx?.changeAmount || 0)}
              </Typography>
            </Box>
          </Box>
        </DialogContent>

        <DialogActions sx={{ p: 2, justifyContent: 'space-between' }}>
          <Button
            onClick={() => setReceiptDialog(false)}
            sx={{ textTransform: 'none', color: tokens.colors.neutral[600], fontWeight: 600 }}
          >
            Tutup [ESC]
          </Button>
          <Button
            variant="contained"
            onClick={() => window.print()}
            startIcon={<PrintOutlinedIcon sx={{ fontSize: 18 }} />}
            sx={{
              bgcolor: tokens.colors.brand[500],
              fontWeight: 700,
              borderRadius: '8px',
              px: 2.5,
              '&:hover': { bgcolor: tokens.colors.brand[600] },
            }}
          >
            Cetak Struk [P]
          </Button>
        </DialogActions>
      </Dialog>

      <ConfirmDialog
        open={clearCartConfirm}
        title="Kosongkan Keranjang?"
        content="Semua item dalam keranjang belanja saat ini akan dihapus."
        confirmText="Ya, Kosongkan"
        isDanger={true}
        onConfirm={clearCart}
        onCancel={() => setClearCartConfirm(false)}
      />
    </Box>
  );
};

export default CashierPage;
