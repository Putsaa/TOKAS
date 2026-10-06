using System.ComponentModel.DataAnnotations;

namespace TOKAS.Application.DTOs.Cashier;

public class CreateSaleRequest
{
    [Required(ErrorMessage = "Item penjualan wajib diisi")]
    [MinLength(1, ErrorMessage = "Minimal 1 item")]
    public List<SaleItemRequest> Items { get; set; } = new();

    [Required]
    [Range(0.01, double.MaxValue, ErrorMessage = "Jumlah pembayaran harus lebih dari 0")]
    public decimal PaymentAmount { get; set; }

    public string PaymentMethod { get; set; } = "cash";

    public string? Notes { get; set; }
}

public class SaleItemRequest
{
    [Required]
    public int ProductId { get; set; }

    [Required]
    [Range(1, int.MaxValue, ErrorMessage = "Quantity minimal 1")]
    public int Quantity { get; set; }
}
