using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Transactions;
using TOKAS.Application.Interfaces;
using TOKAS.Application.Interfaces.Repositories;

namespace TOKAS.Application.Services;

public class TransactionService : ITransactionService
{
    private readonly ISaleRepository _saleRepository;

    public TransactionService(ISaleRepository saleRepository)
    {
        _saleRepository = saleRepository;
    }

    public async Task<PagedResult<TransactionListDto>> GetAllAsync(string? search, DateTime? startDate, DateTime? endDate, int? userId, int page, int pageSize)
    {
        var (items, totalCount) = await _saleRepository.GetAllAsync(search, startDate, endDate, userId, page, pageSize);

        return new PagedResult<TransactionListDto>
        {
            Items = items.Select(s => new TransactionListDto
            {
                Id = s.Id,
                TransactionNo = s.TransactionNo,
                CashierName = s.CashierName ?? string.Empty,
                Total = s.Total,
                PaymentAmount = s.PaymentAmount,
                ChangeAmount = s.ChangeAmount,
                PaymentMethod = s.PaymentMethod,
                CreatedAt = s.CreatedAt
            }).ToList(),
            TotalCount = totalCount,
            Page = page,
            PageSize = pageSize
        };
    }

    public async Task<TransactionDetailDto> GetByIdAsync(int id)
    {
        var sale = await _saleRepository.GetByIdAsync(id) ?? throw new KeyNotFoundException("Transaksi tidak ditemukan.");
        
        return new TransactionDetailDto
        {
            Id = sale.Id,
            TransactionNo = sale.TransactionNo,
            CashierName = sale.CashierName ?? string.Empty,
            Subtotal = sale.Subtotal,
            Discount = sale.Discount,
            Total = sale.Total,
            PaymentAmount = sale.PaymentAmount,
            ChangeAmount = sale.ChangeAmount,
            PaymentMethod = sale.PaymentMethod,
            Notes = sale.Notes,
            CreatedAt = sale.CreatedAt,
            Items = sale.Items.Select(i => new TransactionItemDto
            {
                ProductName = i.ProductName,
                Price = i.Price,
                Quantity = i.Quantity,
                Subtotal = i.Subtotal
            }).ToList()
        };
    }
}
