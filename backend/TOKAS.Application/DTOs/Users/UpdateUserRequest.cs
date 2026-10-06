using System.ComponentModel.DataAnnotations;

namespace TOKAS.Application.DTOs.Users;

public class UpdateUserRequest
{
    [Required(ErrorMessage = "Nama wajib diisi")]
    [MaxLength(100, ErrorMessage = "Nama maksimal 100 karakter")]
    public string Name { get; set; } = string.Empty;

    [MaxLength(50, ErrorMessage = "Username maksimal 50 karakter")]
    public string? Username { get; set; }

    [MinLength(6, ErrorMessage = "Password minimal 6 karakter")]
    public string? Password { get; set; }

    public bool IsActive { get; set; } = true;
}
