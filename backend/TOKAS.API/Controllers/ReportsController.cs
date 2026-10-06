using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Reports;
using TOKAS.Application.Interfaces;

namespace TOKAS.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Owner")]
public class ReportsController : ControllerBase
{
    private readonly IReportService _reportService;

    public ReportsController(IReportService reportService)
    {
        _reportService = reportService;
    }

    [HttpGet("sales")]
    public async Task<ActionResult<ApiResponse<SalesReportDto>>> GetSales([FromQuery] DateTime? startDate, [FromQuery] DateTime? endDate)
    {
        var report = await _reportService.GetSalesReportAsync(startDate, endDate);
        return Ok(ApiResponse<SalesReportDto>.Ok(report));
    }
}
