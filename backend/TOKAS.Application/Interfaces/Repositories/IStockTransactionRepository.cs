using System.Data;
using TOKAS.Domain.Entities;

namespace TOKAS.Application.Interfaces.Repositories;

public interface IStockTransactionRepository
{
    Task<int> CreateAsync(StockTransaction stockTransaction, IDbTransaction? transaction = null);
    Task<IEnumerable<StockTransaction>> GetByProductIdAsync(int productId, int page = 1, int pageSize = 20);
}
