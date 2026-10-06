using System.ComponentModel.DataAnnotations;

namespace TOKAS.Application.DTOs.Stock;

public class StockAdjustmentRequest
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(0, int.MaxValue, ErrorMessage = "Stok aktual tidak boleh negatif")]
    public int ActualStock { get; set; }

    [Required(ErrorMessage = "Alasan wajib diisi")]
    public string Reason { get; set; } = string.Empty;
}
