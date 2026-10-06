using System.Data;
using Dapper;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;
using TOKAS.Infrastructure.Data;

namespace TOKAS.Infrastructure.Repositories;

public class SaleRepository : ISaleRepository
{
    private readonly DbConnectionFactory _db;

    public SaleRepository(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<int> CreateAsync(Sale sale, IDbTransaction transaction)
    {
        const string sql = @"
            INSERT INTO sales (transaction_no, user_id, subtotal, discount, total, payment_amount, change_amount, payment_method, notes, created_at)
            VALUES (@TransactionNo, @UserId, @Subtotal, @Discount, @Total, @PaymentAmount, @ChangeAmount, @PaymentMethod, @Notes, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);";
        return await transaction.Connection.ExecuteScalarAsync<int>(sql, sale, transaction);
    }

    public async Task CreateDetailAsync(SaleDetail detail, IDbTransaction transaction)
    {
        const string sql = @"
            INSERT INTO sale_details (sale_id, product_id, product_name, price, quantity, subtotal)
            VALUES (@SaleId, @ProductId, @ProductName, @Price, @Quantity, @Subtotal);";
        await transaction.Connection.ExecuteAsync(sql, detail, transaction);
    }

    public async Task<Sale?> GetByIdAsync(int id)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            SELECT s.*, u.name as CashierName 
            FROM sales s
            INNER JOIN users u ON s.user_id = u.id
            WHERE s.id = @Id";
        
        var sale = await connection.QuerySingleOrDefaultAsync<Sale>(sql, new { Id = id });
        if (sale != null)
        {
            const string detailsSql = "SELECT * FROM sale_details WHERE sale_id = @Id";
            var details = await connection.QueryAsync<SaleDetail>(detailsSql, new { Id = id });
            sale.Items = details.ToList();
        }
        return sale;
    }

    public async Task<(IEnumerable<Sale> Items, int TotalCount)> GetAllAsync(string? search = null, DateTime? startDate = null, DateTime? endDate = null, int? userId = null, int page = 1, int pageSize = 20)
    {
        using var connection = _db.CreateConnection();
        var whereClause = "WHERE 1=1";
        if (!string.IsNullOrEmpty(search)) whereClause += " AND s.transaction_no LIKE @Search";
        if (startDate.HasValue) whereClause += " AND CAST(s.created_at AS DATE) >= CAST(@StartDate AS DATE)";
        if (endDate.HasValue) whereClause += " AND CAST(s.created_at AS DATE) <= CAST(@EndDate AS DATE)";
        if (userId.HasValue) whereClause += " AND s.user_id = @UserId";

        var countSql = $"SELECT COUNT(1) FROM sales s {whereClause}";
        var dataSql = $@"
            SELECT s.*, u.name as CashierName 
            FROM sales s
            INNER JOIN users u ON s.user_id = u.id
            {whereClause}
            ORDER BY s.id DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        var parameters = new { Search = $"%{search}%", StartDate = startDate, EndDate = endDate, UserId = userId, Offset = (page - 1) * pageSize, PageSize = pageSize };

        var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);
        var items = await connection.QueryAsync<Sale>(dataSql, parameters);

        return (items, totalCount);
    }

    public async Task<int> GetTodayCountAsync()
    {
        using var connection = _db.CreateConnection();
        return await connection.ExecuteScalarAsync<int>("SELECT COUNT(1) FROM sales WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)");
    }

    public async Task<decimal> GetTodayTotalAsync()
    {
        using var connection = _db.CreateConnection();
        return await connection.ExecuteScalarAsync<decimal>("SELECT ISNULL(SUM(total), 0) FROM sales WHERE CAST(created_at AS DATE) = CAST(GETDATE() AS DATE)");
    }

    public async Task<string> GetLastTransactionNoAsync(string datePrefix)
    {
        using var connection = _db.CreateConnection();
        const string sql = "SELECT TOP 1 transaction_no FROM sales WHERE transaction_no LIKE @Prefix ORDER BY id DESC";
        return await connection.QuerySingleOrDefaultAsync<string>(sql, new { Prefix = $"{datePrefix}%" });
    }

    public async Task<IEnumerable<Sale>> GetRecentAsync(int count = 5)
    {
        using var connection = _db.CreateConnection();
        var sql = $@"
            SELECT TOP {count} s.*, u.name as CashierName 
            FROM sales s
            INNER JOIN users u ON s.user_id = u.id
            ORDER BY s.id DESC";
        return await connection.QueryAsync<Sale>(sql);
    }
}
