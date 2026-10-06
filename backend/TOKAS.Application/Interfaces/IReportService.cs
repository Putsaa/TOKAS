using TOKAS.Application.DTOs.Reports;

namespace TOKAS.Application.Interfaces;

public interface IReportService
{
    Task<SalesReportDto> GetSalesReportAsync(DateTime? startDate, DateTime? endDate);
}
