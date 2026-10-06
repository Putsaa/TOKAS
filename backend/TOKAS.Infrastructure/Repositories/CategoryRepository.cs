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
    }
}
