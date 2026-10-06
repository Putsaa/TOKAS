using TOKAS.Application.DTOs.Auth;

namespace TOKAS.Application.Interfaces;

public interface IAuthService
{
    Task<LoginResponse> LoginAsync(LoginRequest request);
}
