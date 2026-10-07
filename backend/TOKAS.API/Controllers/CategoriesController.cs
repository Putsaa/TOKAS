using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TOKAS.Application.DTOs.Categories;
using TOKAS.Application.DTOs.Common;
using TOKAS.Application.Interfaces;

namespace TOKAS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categoryService;

    public CategoriesController(ICategoryService categoryService)
    {
        _categoryService = categoryService;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<IEnumerable<CategoryDto>>>> GetAll([FromQuery] bool? isActive)
    {
        var items = await _categoryService.GetAllAsync(isActive);
        return Ok(ApiResponse<IEnumerable<CategoryDto>>.Ok(items));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> GetById(int id)
    {
        var item = await _categoryService.GetByIdAsync(id);
        return Ok(ApiResponse<CategoryDto>.Ok(item));
    }

    [HttpPost]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<ApiResponse<CategoryDto>>> Create([FromBody] CreateCategoryRequest request)
    {
        var item = await _categoryService.CreateAsync(request);
        return CreatedAtAction(nameof(GetById), new { id = item.Id }, ApiResponse<CategoryDto>.Ok(item, "Kategori berhasil dibuat"));
    }

    [HttpPut("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<ApiResponse>> Update(int id, [FromBody] UpdateCategoryRequest request)
    {
        await _categoryService.UpdateAsync(id, request);
        return Ok(ApiResponse.Ok("Kategori berhasil diperbarui"));
    }

    [HttpPatch("{id}/status")]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<ApiResponse>> UpdateStatus(int id, [FromBody] UpdateCategoryStatusRequest request)
    {
        await _categoryService.UpdateStatusAsync(id, request.IsActive);
        return Ok(ApiResponse.Ok("Status kategori berhasil diperbarui"));
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Owner")]
    public async Task<ActionResult<ApiResponse>> Delete(int id)
    {
        var hardDeleted = await _categoryService.DeleteAsync(id);
        var message = hardDeleted
            ? "Kategori berhasil dihapus secara permanen"
            : "Kategori dinonaktifkan karena masih terdapat produk terkait";
        return Ok(ApiResponse.Ok(message));
    }
}
