namespace TOKAS.Domain.Entities;

public class Sale
{
    public int Id { get; set; }
    public string TransactionNo { get; set; } = string.Empty;
    public int UserId { get; set; }
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public decimal PaymentAmount { get; set; }
    public decimal ChangeAmount { get; set; }
    public string PaymentMethod { get; set; } = "cash";
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public string? CashierName { get; set; }
    public List<SaleDetail> Items { get; set; } = new();
}
