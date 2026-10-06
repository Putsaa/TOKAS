namespace TOKAS.Application.DTOs.Products;

public class ProductDto
{
    public int Id { get; set; }
    public int CategoryId { get; set; }
    public string? Code { get; set; }
    public string Name { get; set; } = string.Empty;
    public decimal PurchasePrice { get; set; }
    public decimal SellingPrice { get; set; }
    public int Stock { get; set; }
    public int MinimumStock { get; set; }
    public string Unit { get; set; } = string.Empty;
    public bool IsActive { get; set; }
    public string CategoryName { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public bool IsLowStock => Stock <= MinimumStock;
}
