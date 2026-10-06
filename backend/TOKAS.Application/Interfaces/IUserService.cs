using TOKAS.Application.DTOs.Users;

namespace TOKAS.Application.Interfaces;

public interface IUserService
{
    Task<IEnumerable<UserDto>> GetAllAsync();
    Task<UserDto> GetByIdAsync(int id);
    Task<UserDto> CreateAsync(CreateUserRequest request);
    Task UpdateAsync(int id, UpdateUserRequest request);
}
