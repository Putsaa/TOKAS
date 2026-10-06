namespace TOKAS.Application.DTOs.Stock;

public class LowStockDto
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Code { get; set; }
    public int Stock { get; set; }
    public int MinimumStock { get; set; }
    public string Unit { get; set; } = string.Empty;
    public string CategoryName { get; set; } = string.Empty;
}
