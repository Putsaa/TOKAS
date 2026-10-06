using System.ComponentModel.DataAnnotations;

namespace TOKAS.Application.DTOs.Products;

public class UpdateProductRequest
{
    [Required(ErrorMessage = "Kategori wajib dipilih")]
    public int CategoryId { get; set; }

    [MaxLength(50, ErrorMessage = "Kode produk maksimal 50 karakter")]
    public string? Code { get; set; }

    [Required(ErrorMessage = "Nama produk wajib diisi")]
    [MaxLength(200, ErrorMessage = "Nama produk maksimal 200 karakter")]
    public string Name { get; set; } = string.Empty;

    [Range(0, double.MaxValue, ErrorMessage = "Harga beli tidak boleh negatif")]
    public decimal PurchasePrice { get; set; }

    [Required(ErrorMessage = "Harga jual wajib diisi")]
    [Range(0.01, double.MaxValue, ErrorMessage = "Harga jual harus lebih dari 0")]
    public decimal SellingPrice { get; set; }

    [Range(0, int.MaxValue, ErrorMessage = "Stok minimum tidak boleh negatif")]
    public int MinimumStock { get; set; }

    [MaxLength(20, ErrorMessage = "Satuan maksimal 20 karakter")]
    public string Unit { get; set; } = "pcs";
}
