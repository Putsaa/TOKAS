using System.Data;
using Dapper;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;
using TOKAS.Infrastructure.Data;

namespace TOKAS.Infrastructure.Repositories;

public class ProductRepository : IProductRepository
{
    private readonly DbConnectionFactory _db;

    public ProductRepository(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<(IEnumerable<Product> Items, int TotalCount)> GetAllAsync(string? search = null, int? categoryId = null, bool? isActive = null, int page = 1, int pageSize = 20)
    {
        using var connection = _db.CreateConnection();
        var whereClause = "WHERE 1=1";
        if (!string.IsNullOrEmpty(search)) whereClause += " AND p.name LIKE @Search";
        if (categoryId.HasValue) whereClause += " AND p.category_id = @CategoryId";
        if (isActive.HasValue) whereClause += " AND p.is_active = @IsActive";

        var countSql = $"SELECT COUNT(1) FROM products p {whereClause}";
        var dataSql = $@"
            SELECT p.*, c.name as CategoryName 
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            {whereClause}
            ORDER BY p.id DESC
            OFFSET @Offset ROWS FETCH NEXT @PageSize ROWS ONLY";

        var parameters = new { Search = $"%{search}%", CategoryId = categoryId, IsActive = isActive, Offset = (page - 1) * pageSize, PageSize = pageSize };

        var totalCount = await connection.ExecuteScalarAsync<int>(countSql, parameters);
        var items = await connection.QueryAsync<Product>(dataSql, parameters);

        return (items, totalCount);
    }

    public async Task<Product?> GetByIdAsync(int id)
    {
        using var connection = _db.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Product>(
            "SELECT p.*, c.name as CategoryName FROM products p INNER JOIN categories c ON p.category_id = c.id WHERE p.id = @Id", new { Id = id });
    }

    public async Task<IEnumerable<Product>> GetActiveProductsAsync(string? search = null)
    {
        using var connection = _db.CreateConnection();
        var sql = "SELECT p.*, c.name as CategoryName FROM products p INNER JOIN categories c ON p.category_id = c.id WHERE p.is_active = 1";
        if (!string.IsNullOrEmpty(search))
        {
            sql += " AND p.name LIKE @Search";
        }
        sql += " ORDER BY p.name";
        return await connection.QueryAsync<Product>(sql, new { Search = $"%{search}%" });
    }

    public async Task<int> CreateAsync(Product product)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            INSERT INTO products (category_id, code, name, purchase_price, selling_price, stock, minimum_stock, unit, is_active, created_at)
            VALUES (@CategoryId, @Code, @Name, @PurchasePrice, @SellingPrice, @Stock, @MinimumStock, @Unit, @IsActive, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);";
        return await connection.ExecuteScalarAsync<int>(sql, product);
    }

    public async Task UpdateAsync(Product product)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            UPDATE products 
            SET category_id = @CategoryId, code = @Code, name = @Name, 
                purchase_price = @PurchasePrice, selling_price = @SellingPrice, 
                minimum_stock = @MinimumStock, unit = @Unit, updated_at = GETDATE()
            WHERE id = @Id";
        await connection.ExecuteAsync(sql, product);
    }

    public async Task UpdateStatusAsync(int id, bool isActive)
    {
        using var connection = _db.CreateConnection();
        await connection.ExecuteAsync("UPDATE products SET is_active = @IsActive, updated_at = GETDATE() WHERE id = @Id", new { Id = id, IsActive = isActive });
    }

    public async Task UpdateStockAsync(int productId, int newStock, IDbTransaction? transaction = null)
    {
        const string sql = "UPDATE products SET stock = @Stock, updated_at = GETDATE() WHERE id = @Id";
        if (transaction != null)
        {
            await transaction.Connection.ExecuteAsync(sql, new { Stock = newStock, Id = productId }, transaction);
        }
        else
        {
            using var connection = _db.CreateConnection();
            await connection.ExecuteAsync(sql, new { Stock = newStock, Id = productId });
        }
    }

    public async Task<bool> CodeExistsAsync(string code, int? excludeId = null)
    {
        if (string.IsNullOrEmpty(code)) return false;
        
        using var connection = _db.CreateConnection();
        var sql = "SELECT COUNT(1) FROM products WHERE code = @Code";
        if (excludeId.HasValue) sql += " AND id != @ExcludeId";
            
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Code = code, ExcludeId = excludeId });
        return count > 0;
    }

    public async Task<IEnumerable<Product>> GetLowStockAsync()
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            SELECT p.*, c.name as CategoryName 
            FROM products p
            INNER JOIN categories c ON p.category_id = c.id
            WHERE p.stock <= p.minimum_stock AND p.is_active = 1
            ORDER BY p.stock ASC";
        return await connection.QueryAsync<Product>(sql);
    }

    public async Task<int> GetTotalCountAsync(bool? isActive = null)
    {
        using var connection = _db.CreateConnection();
        var sql = "SELECT COUNT(1) FROM products";
        if (isActive.HasValue) sql += " WHERE is_active = @IsActive";
        return await connection.ExecuteScalarAsync<int>(sql, new { IsActive = isActive });
    }
}
