using TOKAS.Application.DTOs.Categories;

namespace TOKAS.Application.Interfaces;

public interface ICategoryService
{
    Task<IEnumerable<CategoryDto>> GetAllAsync(bool? isActive = null);
    Task<CategoryDto> GetByIdAsync(int id);
    Task<CategoryDto> CreateAsync(CreateCategoryRequest request);
    Task UpdateAsync(int id, UpdateCategoryRequest request);
}
