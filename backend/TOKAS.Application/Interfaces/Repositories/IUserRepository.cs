using TOKAS.Domain.Entities;

namespace TOKAS.Application.Interfaces.Repositories;

public interface IUserRepository
{
    Task<User?> GetByUsernameAsync(string username);
    Task<User?> GetByIdAsync(int id);
    Task<IEnumerable<User>> GetAllAsync();
    Task<int> CreateAsync(User user);
    Task UpdateAsync(User user);
    Task<bool> UsernameExistsAsync(string username, int? excludeId = null);
}
