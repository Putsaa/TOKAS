using System.Data;
using TOKAS.Domain.Entities;

namespace TOKAS.Application.Interfaces.Repositories;

public interface ISaleRepository
{
    Task<int> CreateAsync(Sale sale, IDbTransaction transaction);
    Task CreateDetailAsync(SaleDetail detail, IDbTransaction transaction);
    Task<Sale?> GetByIdAsync(int id);
    Task<(IEnumerable<Sale> Items, int TotalCount)> GetAllAsync(string? search = null, DateTime? startDate = null, DateTime? endDate = null, int? userId = null, int page = 1, int pageSize = 20);
    Task<int> GetTodayCountAsync();
    Task<decimal> GetTodayTotalAsync();
    Task<string> GetLastTransactionNoAsync(string datePrefix);
    Task<IEnumerable<Sale>> GetRecentAsync(int count = 5);
}
