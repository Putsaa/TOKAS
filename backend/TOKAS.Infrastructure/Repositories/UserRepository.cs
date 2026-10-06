using Dapper;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;
using TOKAS.Infrastructure.Data;

namespace TOKAS.Infrastructure.Repositories;

public class UserRepository : IUserRepository
{
    private readonly DbConnectionFactory _db;

    public UserRepository(DbConnectionFactory db)
    {
        _db = db;
    }

    public async Task<User?> GetByUsernameAsync(string username)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            SELECT u.*, r.Name as RoleName 
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE u.username = @Username";
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Username = username });
    }

    public async Task<User?> GetByIdAsync(int id)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            SELECT u.*, r.Name as RoleName 
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            WHERE u.id = @Id";
        return await connection.QuerySingleOrDefaultAsync<User>(sql, new { Id = id });
    }

    public async Task<IEnumerable<User>> GetAllAsync()
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            SELECT u.*, r.Name as RoleName 
            FROM users u
            INNER JOIN roles r ON u.role_id = r.id
            ORDER BY u.id DESC";
        return await connection.QueryAsync<User>(sql);
    }

    public async Task<int> CreateAsync(User user)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            INSERT INTO users (role_id, name, username, password_hash, is_active, created_at)
            VALUES (@RoleId, @Name, @Username, @PasswordHash, @IsActive, GETDATE());
            SELECT CAST(SCOPE_IDENTITY() as int);";
        return await connection.ExecuteScalarAsync<int>(sql, user);
    }

    public async Task UpdateAsync(User user)
    {
        using var connection = _db.CreateConnection();
        const string sql = @"
            UPDATE users 
            SET name = @Name, username = @Username, password_hash = @PasswordHash, 
                is_active = @IsActive, updated_at = GETDATE()
            WHERE id = @Id";
        await connection.ExecuteAsync(sql, user);
    }

    public async Task<bool> UsernameExistsAsync(string username, int? excludeId = null)
    {
        using var connection = _db.CreateConnection();
        var sql = "SELECT COUNT(1) FROM users WHERE username = @Username";
        if (excludeId.HasValue)
            sql += " AND id != @ExcludeId";
            
        var count = await connection.ExecuteScalarAsync<int>(sql, new { Username = username, ExcludeId = excludeId });
        return count > 0;
    }
}
