namespace TOKAS.Domain.Entities;

public class StockTransaction
{
    public int Id { get; set; }
    public int ProductId { get; set; }
    public string Type { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public int StockBefore { get; set; }
    public int StockAfter { get; set; }
    public string? Reason { get; set; }
    public int? ReferenceId { get; set; }
    public int UserId { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? ProductName { get; set; }
    public string? UserName { get; set; }
}
