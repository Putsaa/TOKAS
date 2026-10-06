using System.ComponentModel.DataAnnotations;

namespace TOKAS.Application.DTOs.Categories;

public class UpdateCategoryRequest
{
    [Required(ErrorMessage = "Nama kategori wajib diisi")]
    [MaxLength(100, ErrorMessage = "Nama kategori maksimal 100 karakter")]
    public string Name { get; set; } = string.Empty;
    public bool IsActive { get; set; } = true;
}
