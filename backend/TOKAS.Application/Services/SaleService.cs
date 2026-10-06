using TOKAS.Application.DTOs.Cashier;
using TOKAS.Application.Interfaces;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;

namespace TOKAS.Application.Services;

public class SaleService : ISaleService
{
    private readonly ISaleRepository _saleRepository;
    private readonly IProductRepository _productRepository;
    private readonly IStockTransactionRepository _stockTransactionRepository;
    private readonly IDbConnectionFactory _db;

    public SaleService(ISaleRepository saleRepository, IProductRepository productRepository, IStockTransactionRepository stockTransactionRepository, IDbConnectionFactory db)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
        _stockTransactionRepository = stockTransactionRepository;
        _db = db;
    }

    public async Task<SaleResponse> CreateSaleAsync(CreateSaleRequest request, int userId)
    {
        // 1. Validations
        var products = new Dictionary<int, Product>();
        decimal subtotal = 0;

        foreach (var item in request.Items)
        {
            var product = await _productRepository.GetByIdAsync(item.ProductId) 
                ?? throw new KeyNotFoundException($"Produk ID {item.ProductId} tidak ditemukan.");
                
            if (!product.IsActive) throw new InvalidOperationException($"Produk {product.Name} tidak aktif.");
            if (product.Stock < item.Quantity) throw new InvalidOperationException($"Stok produk {product.Name} tidak mencukupi. (Stok: {product.Stock}, Diminta: {item.Quantity})");

            products.Add(item.ProductId, product);
            subtotal += product.SellingPrice * item.Quantity;
        }

        if (request.PaymentAmount < subtotal) 
            throw new InvalidOperationException($"Pembayaran (Rp {request.PaymentAmount}) kurang dari total (Rp {subtotal}).");

        // 2. Generate Transaction Number
        var datePrefix = $"TRX-{DateTime.Now:yyyyMMdd}-";
        var lastNo = await _saleRepository.GetLastTransactionNoAsync(datePrefix);
        int nextId = 1;
        if (!string.IsNullOrEmpty(lastNo))
        {
            var parts = lastNo.Split('-');
            if (parts.Length == 3 && int.TryParse(parts[2], out int lastId))
            {
                nextId = lastId + 1;
            }
        }
        var transactionNo = $"{datePrefix}{nextId:D4}";

        var sale = new Sale
        {
            TransactionNo = transactionNo,
            UserId = userId,
            Subtotal = subtotal,
            Discount = 0,
            Total = subtotal,
            PaymentAmount = request.PaymentAmount,
            ChangeAmount = request.PaymentAmount - subtotal,
            PaymentMethod = request.PaymentMethod,
            Notes = request.Notes
        };

        using var connection = _db.CreateConnection();
        connection.Open();
        using var transaction = connection.BeginTransaction();

        try
        {
            // 3. Save Sale
            int saleId = await _saleRepository.CreateAsync(sale, transaction);
            
            // 4. Save details and update stock
            foreach (var item in request.Items)
            {
                var product = products[item.ProductId];
                
                var detail = new SaleDetail
                {
                    SaleId = saleId,
                    ProductId = product.Id,
                    ProductName = product.Name,
                    Price = product.SellingPrice,
                    Quantity = item.Quantity,
                    Subtotal = product.SellingPrice * item.Quantity
                };
                
                await _saleRepository.CreateDetailAsync(detail, transaction);
                
                // Deduct stock
                var newStock = product.Stock - item.Quantity;
                await _productRepository.UpdateStockAsync(product.Id, newStock, transaction);
                
                // Record stock transaction
                var stockTx = new StockTransaction
                {
                    ProductId = product.Id,
                    Type = "out",
                    Quantity = item.Quantity,
                    StockBefore = product.Stock,
                    StockAfter = newStock,
                    Reason = $"Penjualan {transactionNo}",
                    ReferenceId = saleId,
                    UserId = userId
                };
                await _stockTransactionRepository.CreateAsync(stockTx, transaction);
            }
            
            transaction.Commit();
            
            var savedSale = await _saleRepository.GetByIdAsync(saleId);
            return MapToResponse(savedSale!);
        }
        catch
        {
            transaction.Rollback();
            throw;
        }
    }
    
    private static SaleResponse MapToResponse(Sale sale)
    {
        return new SaleResponse
        {
            Id = sale.Id,
            TransactionNo = sale.TransactionNo,
            CashierName = sale.CashierName ?? string.Empty,
            Subtotal = sale.Subtotal,
            Discount = sale.Discount,
            Total = sale.Total,
            PaymentAmount = sale.PaymentAmount,
            ChangeAmount = sale.ChangeAmount,
            PaymentMethod = sale.PaymentMethod,
            CreatedAt = sale.CreatedAt,
            Items = sale.Items.Select(i => new SaleDetailResponse
            {
                ProductName = i.ProductName,
                Price = i.Price,
                Quantity = i.Quantity,
                Subtotal = i.Subtotal
            }).ToList()
        };
    }
}
