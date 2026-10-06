using TOKAS.Application.DTOs.Stock;
using TOKAS.Application.DTOs.Transactions;

namespace TOKAS.Application.DTOs.Dashboard;

public class DashboardDto
{
    public decimal TodaySales { get; set; }
    public int TodayTransactions { get; set; }
    public int TotalProducts { get; set; }
    public int LowStockCount { get; set; }
    public List<TransactionListDto> RecentTransactions { get; set; } = new();
    public List<LowStockDto> LowStockProducts { get; set; } = new();
    public List<DailySalesSummary> WeeklySales { get; set; } = new();
}

public class DailySalesSummary
{
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
    public int Count { get; set; }
}
