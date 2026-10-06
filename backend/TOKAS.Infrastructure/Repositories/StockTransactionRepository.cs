using System.Data;
using Dapper;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;
using TOKAS.Infrastructure.Data;

namespace TOKAS.Infrastructure.Repositories;

public class StockTransactionRepository : IStockTransactionRepository
{
    private readonly DbConnectionFactory _db;

    public StockTransactionRepository(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<int> CreateAsync(StockTransaction stockTransaction, IDbTransaction? transaction = null)
    {
        const string sql = @"
            INSERT INTO stock_transactions (product_id, type, quantity, stock_before, stock_after, reason, reference_id, user_id, created_at)
            VALUES (@ProductId, @Type, @Quantity, @StockBefore, @StockAfter, @Reason, @ReferenceId, @UserId, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);";
            
        if (transaction != null)
        {
            return await transaction.Connection.ExecuteScalarAsync<int>(sql, stockTransaction, transaction);
        }
        else
        {
            using var connection = _db.CreateConnection();
            return await connection.ExecuteScalarAsync<int>(sql, stockTransaction);
        }
    }

    public async Task<IEnumerable<StockTransaction>> GetByProductIdAsync(int productId, int page = 1, int pageSize = 20)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            SELECT st.*, u.name as UserName 
            FROM stock_transactions st
            INNER JOIN users u ON st.user_id = u.id
            WHERE st.product_id = @ProductId
            ORDER BY st.id DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";
            
        return await connection.QueryAsync<StockTransaction>(sql, new { ProductId = productId, Offset = (page - 1) * pageSize, PageSize = pageSize });
    }
}
