using TOKAS.Application.DTOs.Reports;
using TOKAS.Application.Interfaces;
using TOKAS.Application.Interfaces.Repositories;

namespace TOKAS.Application.Services;

public class ReportService : IReportService
{
    private readonly IReportRepository _reportRepository;

    public ReportService(IReportRepository reportRepository)
    {
        _reportRepository = reportRepository;
    }

    public async Task<SalesReportDto> GetSalesReportAsync(DateTime? startDate, DateTime? endDate)
    {
        var start = startDate ?? new DateTime(DateTime.Now.Year, DateTime.Now.Month, 1);
        var end = endDate ?? DateTime.Now;

        var totalSales = await _reportRepository.GetTotalSalesAsync(start, end);
        var totalTransactions = await _reportRepository.GetTotalTransactionsAsync(start, end);
        var totalItemsSold = await _reportRepository.GetTotalItemsSoldAsync(start, end);
        var dailySales = await _reportRepository.GetDailySalesAsync(start, end);
        var bestSellers = await _reportRepository.GetBestSellersAsync(start, end);

        return new SalesReportDto
        {
            TotalSales = totalSales,
            TotalTransactions = totalTransactions,
            TotalItemsSold = totalItemsSold,
            DailySales = dailySales.ToList(),
            BestSellers = bestSellers.ToList()
        };
    }
}
