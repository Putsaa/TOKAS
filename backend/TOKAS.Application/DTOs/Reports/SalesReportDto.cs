namespace TOKAS.Application.DTOs.Reports;

public class SalesReportDto
{
    public decimal TotalSales { get; set; }
    public int TotalTransactions { get; set; }
    public int TotalItemsSold { get; set; }
    public List<DailySalesDto> DailySales { get; set; } = new();
    public List<BestSellerDto> BestSellers { get; set; } = new();
}

public class DailySalesDto
{
    public DateTime Date { get; set; }
    public decimal TotalSales { get; set; }
    public int TransactionCount { get; set; }
}

public class BestSellerDto
{
    public int ProductId { get; set; }
    public string ProductName { get; set; } = string.Empty;
    public int TotalQuantity { get; set; }
    public decimal TotalRevenue { get; set; }
}
