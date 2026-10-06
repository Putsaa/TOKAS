using System.ComponentModel.DataAnnotations;

namespace TOKAS.Application.DTOs.Stock;

public class StockInRequest
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity minimal 1")]
    public int Quantity { get; set; }

    [Required(ErrorMessage = "Alasan wajib diisi")]
    public string Reason { get; set; } = string.Empty;
}
