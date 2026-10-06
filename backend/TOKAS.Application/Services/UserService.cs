using TOKAS.Application.DTOs.Users;
using TOKAS.Application.Interfaces;
using TOKAS.Application.Interfaces.Repositories;
using TOKAS.Domain.Entities;
using BC = BCrypt.Net.BCrypt;

namespace TOKAS.Application.Services;

public class UserService : IUserService
{
    private readonly IUserRepository _userRepository;

    public UserService(IUserRepository userRepository)
    {
        _userRepository = userRepository;
    }

    public async Task<IEnumerable<UserDto>> GetAllAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToDto);
    }

    public async Task<UserDto> GetByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Pengguna tidak ditemukan.");
        return MapToDto(user);
    }

    public async Task<UserDto> CreateAsync(CreateUserRequest request)
    {
        if (await _userRepository.UsernameExistsAsync(request.Username))
            throw new ArgumentException("Username sudah digunakan.");

        var user = new User
        {
            RoleId = request.RoleId,
            Name = request.Name,
            Username = request.Username,
            PasswordHash = BC.HashPassword(request.Password),
            IsActive = true
        };

        var id = await _userRepository.CreateAsync(user);
        return await GetByIdAsync(id);
    }

    public async Task UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await _userRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Pengguna tidak ditemukan.");

        if (!string.IsNullOrEmpty(request.Username) && await _userRepository.UsernameExistsAsync(request.Username, id))
            throw new ArgumentException("Username sudah digunakan.");

        user.Name = request.Name;
        if (!string.IsNullOrEmpty(request.Username)) user.Username = request.Username;
        if (!string.IsNullOrEmpty(request.Password)) user.PasswordHash = BC.HashPassword(request.Password);
        user.IsActive = request.IsActive;

        await _userRepository.UpdateAsync(user);
    }

    private static UserDto MapToDto(User u) => new()
    {
        Id = u.Id,
        Name = u.Name,
        Username = u.Username,
        Role = u.RoleName ?? string.Empty,
        IsActive = u.IsActive,
        CreatedAt = u.CreatedAt
    };
}
