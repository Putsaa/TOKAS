using TOKAS.Application.DTOs.Common;
using TOKAS.Application.DTOs.Transactions;

namespace TOKAS.Application.Interfaces;

public interface ITransactionService
{
    Task<PagedResult<TransactionListDto>> GetAllAsync(string? search, DateTime? startDate, DateTime? endDate, int? userId, int page, int pageSize);
    Task<TransactionDetailDto> GetByIdAsync(int id);
}
