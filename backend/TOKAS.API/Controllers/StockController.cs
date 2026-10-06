using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Stock;
using TOKAS.Application.Interfaces;

namespace TOKAS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Owner")]
public class StockController : ControllerBase
{
    private readonly IStockService _stockService;

    public StockController(IStockService stockService)
    {
        _stockService = stockService;
    }

    [HttpPost("in")]
    public async Task<ActionResult<ApiResponse>> StockIn([FromBody] StockInRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        await _stockService.StockInAsync(request, userId);
        return Ok(ApiResponse.Ok("Stok berhasil ditambahkan"));
    }

    [HttpPost("adjustment")]
    public async Task<ActionResult<ApiResponse>> StockAdjustment([FromBody] StockAdjustmentRequest request)
    {
        var userId = int.Parse(User.FindFirst(ClaimTypes.NameIdentifier)?.Value!);
        await _stockService.StockAdjustmentAsync(request, userId);
        return Ok(ApiResponse.Ok("Penyesuaian stok berhasil"));
    }

    [HttpGet("low")]
    public async Task<ActionResult<ApiResponse<IEnumerable<LowStockDto>>>> GetLowStock()
    {
        var items = await _stockService.GetLowStockAsync();
        return Ok(ApiResponse<IEnumerable<LowStockDto>>.Ok(items));
    }
}
