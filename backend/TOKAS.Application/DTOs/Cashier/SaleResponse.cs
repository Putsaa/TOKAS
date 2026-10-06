namespace TOKAS.Application.DTOs.Cashier;

public class SaleResponse
{
    public int Id { get; set; }
    public string TransactionNo { get; set; } = string.Empty;
    public string CashierName { get; set; } = string.Empty;
    public List<SaleDetailResponse> Items { get; set; } = new();
    public decimal Subtotal { get; set; }
    public decimal Discount { get; set; }
    public decimal Total { get; set; }
    public decimal PaymentAmount { get; set; }
    public decimal ChangeAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}

public class SaleDetailResponse
{
    public string ProductName { get; set; } = string.Empty;
    public decimal Price { get; set; }
    public int Quantity { get; set; }
    public decimal Subtotal { get; set; }
}
