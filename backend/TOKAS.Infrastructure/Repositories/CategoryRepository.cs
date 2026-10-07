using Dapper;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;
using TOKAS.Infrastructure.Data;

namespace TOKAS.Infrastructure.Repositories;

public class CategoryRepository : ICategoryRepository
{
    private readonly DbConnectionFactory _db;

    public CategoryRepository(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<IEnumerable<Category>> GetAllAsync(bool? isActive = null)
    {
        using var connection = _db.CreateConnection();
        var sql = "SELECT * FROM categories";
        if (isActive.HasValue)
        {
            sql += " WHERE is_active = @IsActive";
        }
        sql += " ORDER BY name";
        return await connection.QueryAsync<Category>(sql, new { IsActive = isActive });
    }

    public async Task<Category?> GetByIdAsync(int id)
    {
        using var connection = _db.CreateConnection();
        return await connection.QuerySingleOrDefaultAsync<Category>(
            "SELECT * FROM categories WHERE id = @Id", new { Id = id });
    }

    public async Task<int> CreateAsync(Category category)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            INSERT INTO categories (name, is_active, created_at)
            VALUES (@Name, @IsActive, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);";
        return await connection.ExecuteScalarAsync<int>(sql, category);
    }

    public async Task UpdateAsync(Category category)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            UPDATE categories 
            SET name = @Name, is_active = @IsActive, updated_at = GETDATE()
            WHERE id = @Id";
        await connection.ExecuteAsync(sql, category);
    public async Task<Dictionary<int, int>> GetProductCountsAsync()
    {
        using var connection = _db.CreateConnection();
        const string sql = "SELECT category_id, COUNT(*) as cnt FROM products GROUP BY category_id";
        var rows = await connection.QueryAsync<(int category_id, int cnt)>(sql);
        return rows.ToDictionary(r => r.category_id, r => r.cnt);
    }

    public async Task<int> GetProductCountByCategoryIdAsync(int id)
    {
        using var connection = _db.CreateConnection();
        return await connection.ExecuteScalarAsync<int>(
            "SELECT COUNT(1) FROM products WHERE category_id = @Id", new { Id = id });
    }

    public async Task<bool> DeleteAsync(int id)
    {
        using var connection = _db.CreateConnection();
        var rows = await connection.ExecuteAsync("DELETE FROM categories WHERE id = @Id", new { Id = id });
        return rows > 0;
    }
}
