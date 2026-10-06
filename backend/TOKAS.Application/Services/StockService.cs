using TOKAS.Application.DTOs.Stock;
using TOKAS.Application.Interfaces;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;

namespace TOKAS.Application.Services;

public class StockService : IStockService
{
    private readonly IProductRepository _productRepository;
    private readonly IStockTransactionRepository _stockTransactionRepository;

    public StockService(IProductRepository productRepository, IStockTransactionRepository stockTransactionRepository)
    {
        _productRepository = productRepository;
        _stockTransactionRepository = stockTransactionRepository;
    }

    public async Task StockInAsync(StockInRequest request, int userId)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId) 
            ?? throw new KeyNotFoundException("Produk tidak ditemukan.");

        var newStock = product.Stock + request.Quantity;

        var transaction = new StockTransaction
        {
            ProductId = product.Id,
            Type = "in",
            Quantity = request.Quantity,
            StockBefore = product.Stock,
            StockAfter = newStock,
            Reason = request.Reason,
            UserId = userId
        };

        await _productRepository.UpdateStockAsync(product.Id, newStock);
        await _stockTransactionRepository.CreateAsync(transaction);
    }

    public async Task StockAdjustmentAsync(StockAdjustmentRequest request, int userId)
    {
        var product = await _productRepository.GetByIdAsync(request.ProductId) 
            ?? throw new KeyNotFoundException("Produk tidak ditemukan.");

        var diff = request.ActualStock - product.Stock;
        if (diff == 0) throw new ArgumentException("Stok aktual sama dengan stok sistem.");

        var transaction = new StockTransaction
        {
            ProductId = product.Id,
            Type = "adjustment",
            Quantity = Math.Abs(diff),
            StockBefore = product.Stock,
            StockAfter = request.ActualStock,
            Reason = request.Reason,
            UserId = userId
        };

        await _productRepository.UpdateStockAsync(product.Id, request.ActualStock);
        await _stockTransactionRepository.CreateAsync(transaction);
    }

    public async Task<IEnumerable<LowStockDto>> GetLowStockAsync()
    {
        var products = await _productRepository.GetLowStockAsync();
        return products.Select(p => new LowStockDto
        {
            Id = p.Id,
            Name = p.Name,
            Code = p.Code,
            Stock = p.Stock,
            MinimumStock = p.MinimumStock,
            Unit = p.Unit,
            CategoryName = p.CategoryName ?? string.Empty
        });
    }
}
