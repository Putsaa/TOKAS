namespace TOKAS.Application.DTOs.Transactions;

public class TransactionDetailDto
{
    public int Id { get; set; }
    public string TransactionNo { get; set; } = string.Empty;
    public string CashierName { get; set; } = string.Empty;
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public decimal PaymentAmount { get; set; }
    public decimal ChangeAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<TransactionItemDto> Items { get; set; } = new();
}

public class TransactionItemDto
{
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
