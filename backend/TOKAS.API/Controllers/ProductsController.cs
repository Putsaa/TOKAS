using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Products;
using TOKAS.Application.Interfaces;

namespace TOKAS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProductsController : ControllerBase
{
    private readonly IProductService _productService;

    public ProductsController(IProductService productService)
    {
        _productService = productService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<ProductDto>>>> GetAll(
        [FromQuery] string? search, [FromQuery] int? categoryId, [FromQuery] bool? isActive, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var items = await _productService.GetAllAsync(search, categoryId, isActive, page, pageSize);
        return Ok(ApiResponse<PagedResult<ProductDto>>.Ok(items));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> GetById(int id)
    {
        var item = await _productService.GetByIdAsync(id);
        return Ok(ApiResponse<ProductDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<ApiResponse<ProductDto>>> Create([FromBody] CreateProductRequest request)
    {
        var item = await _productService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<ProductDto>.Ok(item, "Produk berhasil dibuat"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<ApiResponse>> Update(int id, [FromBody] UpdateProductRequest request)
    {
        await _productService.UpdateAsync(id, request);
        return Ok(ApiResponse.Ok("Produk berhasil diperbarui"));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<ApiResponse>> UpdateStatus(int id, [FromBody] UpdateProductStatusRequest request)
    {
        await _productService.UpdateStatusAsync(id, request);
        return Ok(ApiResponse.Ok("Status produk berhasil diperbarui"));
    }
}
