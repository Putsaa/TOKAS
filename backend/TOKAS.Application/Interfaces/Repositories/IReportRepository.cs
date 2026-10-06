using TOKAS.Application.DTOs.Reports;

namespace TOKAS.Application.Interfaces.Repositories;

public interface IReportRepository
{
    Task<decimal> GetTotalSalesAsync(DateTime startDate, DateTime endDate);
    Task<int> GetTotalTransactionsAsync(DateTime startDate, DateTime endDate);
    Task<int> GetTotalItemsSoldAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<DailySalesDto>> GetDailySalesAsync(DateTime startDate, DateTime endDate);
    Task<IEnumerable<BestSellerDto>> GetBestSellersAsync(DateTime startDate, DateTime endDate, int top = 10);
    Task<IEnumerable<DailySalesDto>> GetWeeklySalesAsync();
}
