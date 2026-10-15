using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Stock;
using TOKAS.Application.Interfaces;

namespace TOKAS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class StockController : ControllerBase
{
    private readonly IStockService _stockService;

    public StockController(IStockService stockService)
    {
        _stockService = stockService;
    }

    private int GetCurrentUserId()
    {
        var val = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("nameid")?.Value
            ?? User.FindFirst("sub")?.Value
            ?? "1";
        return int.TryParse(val, out var id) ? id : 1;
    }

    [HttpPost("in")]
    [Authorize(Roles = "Owner,Admin,admin,owner")]
    public async Task<ActionResult<ApiResponse>> StockIn([FromBody] StockInRequest request)
    {
        var userId = GetCurrentUserId();
        await _stockService.StockInAsync(request, userId);
        return Ok(ApiResponse.Ok("Stok berhasil ditambahkan"));
    }

    [HttpPost("adjustment")]
    [Authorize(Roles = "Owner,Admin,admin,owner")]
    public async Task<ActionResult<ApiResponse>> StockAdjustment([FromBody] StockAdjustmentRequest request)
    {
        var userId = GetCurrentUserId();
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
