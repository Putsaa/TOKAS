using System.Data;
using TOKAS.Domain.Entities;

namespace TOKAS.Application.Interfaces.Repositories;

public interface IProductRepository
{
    Task<(IEnumerable<Product> Items, int TotalCount)> GetAllAsync(string? search = null, int? categoryId = null, bool? isActive = null, int page = 1, int pageSize = 20);
    Task<Product?> GetByIdAsync(int id);
    Task<IEnumerable<Product>> GetActiveProductsAsync(string? search = null);
    Task<int> CreateAsync(Product product);
    Task UpdateAsync(Product product);
    Task UpdateStatusAsync(int id, bool isActive);
    Task UpdateStockAsync(int productId, int newStock, IDbTransaction? transaction = null);
    Task<bool> CodeExistsAsync(string code, int? excludeId = null);
    Task<IEnumerable<Product>> GetLowStockAsync();
    Task<int> GetTotalCountAsync(bool? isActive = null);
}
