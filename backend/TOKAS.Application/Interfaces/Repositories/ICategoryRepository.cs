using TOKAS.Domain.Entities;

namespace TOKAS.Application.Interfaces.Repositories;

public interface ICategoryRepository
{
    Task<IEnumerable<Category>> GetAllAsync(bool? isActive = null);
    Task<Dictionary<int, int>> GetProductCountsAsync();
    Task<Category?> GetByIdAsync(int id);
    Task<int> CreateAsync(Category category);
    Task UpdateAsync(Category category);
    Task<int> GetProductCountByCategoryIdAsync(int id);
    Task<bool> DeleteAsync(int id);
}
