using TOKAS.Application.DTOs.Categories;
using TOKAS.Application.Interfaces;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;

namespace TOKAS.Application.Services;

public class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categoryRepository;

    public CategoryService(ICategoryRepository categoryRepository)
    {
        _categoryRepository = categoryRepository;
    }

    public async Task<IEnumerable<CategoryDto>> GetAllAsync(bool? isActive = null)
    {
        var categories = await _categoryRepository.GetAllAsync(isActive);
        var productCounts = await _categoryRepository.GetProductCountsAsync();
        return categories.Select(c => new CategoryDto
        {
            Id = c.Id,
            Name = c.Name,
            IsActive = c.IsActive,
            ProductCount = productCounts.GetValueOrDefault(c.Id, 0),
            CreatedAt = c.CreatedAt
        });
    }

    public async Task<CategoryDto> GetByIdAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Kategori tidak ditemukan.");
        var count = await _categoryRepository.GetProductCountByCategoryIdAsync(id);
        return new CategoryDto 
        { 
            Id = category.Id, 
            Name = category.Name, 
            IsActive = category.IsActive, 
            ProductCount = count, 
            CreatedAt = category.CreatedAt 
        };
    }

    public async Task<CategoryDto> CreateAsync(CreateCategoryRequest request)
    {
        var category = new Category { Name = request.Name, IsActive = true };
        var id = await _categoryRepository.CreateAsync(category);
        return await GetByIdAsync(id);
    }

    public async Task UpdateAsync(int id, UpdateCategoryRequest request)
    {
        var category = await _categoryRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Kategori tidak ditemukan.");
        category.Name = request.Name;
        category.IsActive = request.IsActive;
        await _categoryRepository.UpdateAsync(category);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var category = await _categoryRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Kategori tidak ditemukan.");
        var count = await _categoryRepository.GetProductCountByCategoryIdAsync(id);
        if (count > 0)
        {
            category.IsActive = false;
            await _categoryRepository.UpdateAsync(category);
            return false;
        }
        return await _categoryRepository.DeleteAsync(id);
    }

    public async Task UpdateStatusAsync(int id, bool isActive)
    {
        var category = await _categoryRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Kategori tidak ditemukan.");
        category.IsActive = isActive;
        await _categoryRepository.UpdateAsync(category);
    }
}
