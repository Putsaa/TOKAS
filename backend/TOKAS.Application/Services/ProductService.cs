using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Products;
using TOKAS.Application.Interfaces;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;

namespace TOKAS.Application.Services;

public class ProductService : IProductService
{
    private readonly IProductRepository _productRepository;
    private readonly ICategoryRepository _categoryRepository;

    public ProductService(IProductRepository productRepository, ICategoryRepository categoryRepository)
    {
        _productRepository = productRepository;
        _categoryRepository = categoryRepository;
    }

    public async Task<PagedResult<ProductDto>> GetAllAsync(string? search, int? categoryId, bool? isActive, int page, int pageSize)
    {
        var (items, totalCount) = await _productRepository.GetAllAsync(search, categoryId, isActive, page, pageSize);
        
        return new PagedResult<ProductDto>
        {
            Items = items.Select(MapToDto).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<IEnumerable<ProductDto>> GetActiveProductsAsync(string? search)
    {
        var products = await _productRepository.GetActiveProductsAsync(search);
        return products.Select(MapToDto);
    }

    public async Task<ProductDto> GetByIdAsync(int id)
    {
        var product = await _productRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Produk tidak ditemukan.");
        return MapToDto(product);
    }

    public async Task<ProductDto> CreateAsync(CreateProductRequest request)
    {
        if (await _categoryRepository.GetByIdAsync(request.CategoryId) == null)
            throw new ArgumentException("Kategori tidak ditemukan.");

        if (!string.IsNullOrEmpty(request.Code) && await _productRepository.CodeExistsAsync(request.Code))
            throw new ArgumentException("Kode produk sudah digunakan.");

        var product = new Product
        {
            CategoryId = request.CategoryId,
            Code = request.Code,
            Name = request.Name,
            PurchasePrice = request.PurchasePrice,
            SellingPrice = request.SellingPrice,
            Stock = request.Stock,
            MinimumStock = request.MinimumStock,
            Unit = request.Unit,
            IsActive = true
        };

        var id = await _productRepository.CreateAsync(product);
        return await GetByIdAsync(id);
    }

    public async Task UpdateAsync(int id, UpdateProductRequest request)
    {
        var product = await _productRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Produk tidak ditemukan.");

        if (await _categoryRepository.GetByIdAsync(request.CategoryId) == null)
            throw new ArgumentException("Kategori tidak ditemukan.");

        if (!string.IsNullOrEmpty(request.Code) && await _productRepository.CodeExistsAsync(request.Code, id))
            throw new ArgumentException("Kode produk sudah digunakan.");

        product.CategoryId = request.CategoryId;
        product.Code = request.Code;
        product.Name = request.Name;
        product.PurchasePrice = request.PurchasePrice;
        product.SellingPrice = request.SellingPrice;
        product.MinimumStock = request.MinimumStock;
        product.Unit = request.Unit;

        await _productRepository.UpdateAsync(product);
    }

    public async Task UpdateStatusAsync(int id, UpdateProductStatusRequest request)
    {
        if (await _productRepository.GetByIdAsync(id) == null) throw new KeyNotFoundException("Produk tidak ditemukan.");
        await _productRepository.UpdateStatusAsync(id, request.IsActive);
    }

    private static ProductDto MapToDto(Product p) => new()
    {
        Id = p.Id,
        CategoryId = p.CategoryId,
        Code = p.Code,
        Name = p.Name,
        PurchasePrice = p.PurchasePrice,
        SellingPrice = p.SellingPrice,
        Stock = p.Stock,
        MinimumStock = p.MinimumStock,
        Unit = p.Unit,
        IsActive = p.IsActive,
        CategoryName = p.CategoryName ?? string.Empty,
        CreatedAt = p.CreatedAt
    };
}
