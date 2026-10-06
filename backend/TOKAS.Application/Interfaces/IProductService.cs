using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Products;

namespace TOKAS.Application.Interfaces;

public interface IProductService
{
    Task<PagedResult<ProductDto>> GetAllAsync(string? search, int? categoryId, bool? isActive, int page, int pageSize);
    Task<ProductDto> GetByIdAsync(int id);
    Task<IEnumerable<ProductDto>> GetActiveProductsAsync(string? search);
    Task<ProductDto> CreateAsync(CreateProductRequest request);
    Task UpdateAsync(int id, UpdateProductRequest request);
    Task UpdateStatusAsync(int id, UpdateProductStatusRequest request);
}
