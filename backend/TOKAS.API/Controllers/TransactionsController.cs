using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TOKAS.Application.DTOs.Cashier;
using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Transactions;
using TOKAS.Application.Interfaces;

namespace TOKAS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class TransactionsController : ControllerBase
{
    private readonly ITransactionService _transactionService;
    private readonly ISaleService _saleService;

    public TransactionsController(ITransactionService transactionService, ISaleService saleService)
    {
        _transactionService = transactionService;
        _saleService = saleService;
    }

    private int GetCurrentUserId()
    {
        var val = User.FindFirst(ClaimTypes.NameIdentifier)?.Value
            ?? User.FindFirst("nameid")?.Value
            ?? User.FindFirst("sub")?.Value
            ?? "1";
        return int.TryParse(val, out var id) ? id : 1;
    }

    [HttpGet]
    public async Task<ActionResult<ApiResponse<PagedResult<TransactionListDto>>>> GetAll(
        [FromQuery] string? search, [FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate, [FromQuery] int page = 1, [FromQuery] int pageSize = 20)
    {
        var role = User.FindFirst(ClaimTypes.Role)?.Value ?? string.Empty;
        int? userId = string.Equals(role, "Kasir", StringComparison.OrdinalIgnoreCase) ? GetCurrentUserId() : null;
        
        var items = await _transactionService.GetAllAsync(search, startDate, endDate, userId, page, pageSize);
        return Ok(ApiResponse<PagedResult<TransactionListDto>>.Ok(items));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<ApiResponse<TransactionDetailDto>>> GetById(int id)
    {
        var item = await _transactionService.GetByIdAsync(id);
        return Ok(ApiResponse<TransactionDetailDto>.Ok(item));
    }

    [HttpPost]
    public async Task<ActionResult<ApiResponse<SaleResponse>>> CreateSale([FromBody] CreateSaleRequest request)
    {
        var userId = GetCurrentUserId();
        var result = await _saleService.CreateSaleAsync(request, userId);
        return Ok(ApiResponse<SaleResponse>.Ok(result, "Transaksi berhasil"));
    }
}
