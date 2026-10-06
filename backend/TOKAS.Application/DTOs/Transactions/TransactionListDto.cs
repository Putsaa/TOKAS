namespace TOKAS.Application.DTOs.Transactions;

public class TransactionListDto
{
    public int Id { get; set; }
    public string TransactionNo { get; set; } = string.Empty;
    public string CashierName { get; set; } = string.Empty;
    public decimal Total { get; set; }
    public decimal PaymentAmount { get; set; }
    public decimal ChangeAmount { get; set; }
    public string PaymentMethod { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
}
