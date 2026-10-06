using System.ComponentModel.DataAnnotations;

namespace TOKAS.Application.DTOs.Categories;

public class CreateCategoryRequest
{
    [Required(ErrorMessage = "Nama kategori wajib diisi")]
    [MaxLength(100, ErrorMessage = "Nama kategori maksimal 100 karakter")]
    public string Name { get; set; } = string.Empty;
}
