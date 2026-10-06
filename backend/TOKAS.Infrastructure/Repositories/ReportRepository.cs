using Dapper;
using TOKAS.Application.DTOs.Reports;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Infrastructure.Data;

namespace TOKAS.Infrastructure.Repositories;

public class ReportRepository : IReportRepository
{
    private readonly DbConnectionFactory _db;

    public ReportRepository(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<decimal> GetTotalSalesAsync(DateTime startDate, DateTime endDate)
    {
        using var connection = _db.CreateConnection();
        return await connection.ExecuteScalarAsync<decimal>(
            "SELECT ISNULL(SUM(total), 0) FROM sales WHERE CAST(created_at AS DATE) BETWEEN CAST(@StartDate AS DATE) AND CAST(@EndDate AS DATE)",
            new { StartDate = startDate, EndDate = endDate });
    }

    public async Task<int> GetTotalTransactionsAsync(DateTime startDate, DateTime endDate)
    {
        using var connection = _db.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM sales WHERE CAST(created_at AS DATE) BETWEEN CAST(@StartDate AS DATE) AND CAST(@EndDate AS DATE)",
            new { StartDate = startDate, EndDate = endDate });
    }

    public async Task<int> GetTotalItemsSoldAsync(DateTime startDate, DateTime endDate)
    {
        using var connection = _db.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(@"
            SELECT ISNULL(SUM(sd.quantity), 0) 
            FROM sale_details sd
            INNER JOIN sales s ON sd.sale_id = s.id
            WHERE CAST(s.created_at AS DATE) BETWEEN CAST(@StartDate AS DATE) AND CAST(@EndDate AS DATE)",
            new { StartDate = startDate, EndDate = endDate });
    }

    public async Task<IEnumerable<DailySalesDto>> GetDailySalesAsync(DateTime startDate, DateTime endDate)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            SELECT CAST(created_at AS DATE) as Date, SUM(total) as TotalSales, COUNT(1) as TransactionCount
            FROM sales
            WHERE CAST(created_at AS DATE) BETWEEN CAST(@StartDate AS DATE) AND CAST(@EndDate AS DATE)
            GROUP BY CAST(created_at AS DATE)
            ORDER BY Date ASC";
        return await connection.QueryAsync<DailySalesDto>(sql, new { StartDate = startDate, EndDate = endDate });
    }

    public async Task<IEnumerable<BestSellerDto>> GetBestSellersAsync(DateTime startDate, DateTime endDate, int top = 10)
    {
        using var connection = _db.CreateConnection();
        var sql = $@"
            SELECT TOP {top} 
                sd.product_id as ProductId, 
                MAX(sd.product_name) as ProductName, 
                SUM(sd.quantity) as TotalQuantity, 
                SUM(sd.subtotal) as TotalRevenue
            FROM sale_details sd
            INNER JOIN sales s ON sd.sale_id = s.id
            WHERE CAST(s.created_at AS DATE) BETWEEN CAST(@StartDate AS DATE) AND CAST(@EndDate AS DATE)
            GROUP BY sd.product_id
            ORDER BY TotalQuantity DESC";
        return await connection.QueryAsync<BestSellerDto>(sql, new { StartDate = startDate, EndDate = endDate });
    }

    public async Task<IEnumerable<DailySalesDto>> GetWeeklySalesAsync()
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            SELECT CAST(created_at AS DATE) as Date, SUM(total) as TotalSales, COUNT(1) as TransactionCount
            FROM sales
            WHERE created_at >= DATEADD(day, -7, GETDATE())
            GROUP BY CAST(created_at AS DATE)
            ORDER BY Date ASC";
        return await connection.QueryAsync<DailySalesDto>(sql);
    }
}
