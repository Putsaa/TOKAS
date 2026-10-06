using TOKAS.Application.DTOs.Dashboard;
using TOKAS.Application.DTOs.Stock;
using TOKAS.Application.DTOs.Transactions;
using TOKAS.Application.Interfaces;
using TOKAS.Application.Interfaces.Repositories;

namespace TOKAS.Application.Services;

public class DashboardService : IDashboardService
{
    private readonly ISaleRepository _saleRepository;
    private readonly IProductRepository _productRepository;
    private readonly IReportRepository _reportRepository;

    public DashboardService(ISaleRepository saleRepository, IProductRepository productRepository, IReportRepository reportRepository)
    {
        _saleRepository = saleRepository;
        _productRepository = productRepository;
        _reportRepository = reportRepository;
    }

    public async Task<DashboardDto> GetDashboardDataAsync()
    {
        var todaySales = await _saleRepository.GetTodayTotalAsync();
        var todayTransactions = await _saleRepository.GetTodayCountAsync();
        var totalProducts = await _productRepository.GetTotalCountAsync(true);
        var lowStockProducts = await _productRepository.GetLowStockAsync();
        var recentTransactions = await _saleRepository.GetRecentAsync(5);
        var weeklySales = await _reportRepository.GetWeeklySalesAsync();

        return new DashboardDto
        {
            TodaySales = todaySales,
            TodayTransactions = todayTransactions,
            TotalProducts = totalProducts,
            LowStockCount = lowStockProducts.Count(),
            LowStockProducts = lowStockProducts.Select(p => new LowStockDto
            {
                Id = p.Id,
                Name = p.Name,
                Code = p.Code,
                Stock = p.Stock,
                MinimumStock = p.MinimumStock,
                Unit = p.Unit,
                CategoryName = p.CategoryName ?? string.Empty
            }).ToList(),
            RecentTransactions = recentTransactions.Select(s => new TransactionListDto
            {
                Id = s.Id,
                TransactionNo = s.TransactionNo,
                CashierName = s.CashierName ?? string.Empty,
                Total = s.Total,
                PaymentAmount = s.PaymentAmount,
                ChangeAmount = s.ChangeAmount,
                PaymentMethod = s.PaymentMethod,
                CreatedAt = s.CreatedAt
            }).ToList(),
            WeeklySales = weeklySales.Select(w => new DailySalesSummary
            {
                Date = w.Date,
                Total = w.TotalSales,
                Count = w.TransactionCount
            }).ToList()
        };
    }
}
