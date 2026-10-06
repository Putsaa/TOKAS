using TOKAS.Application.DTOs.Stock;

namespace TOKAS.Application.Interfaces;

public interface IStockService
{
    Task StockInAsync(StockInRequest request, int userId);
    Task StockAdjustmentAsync(StockAdjustmentRequest request, int userId);
    Task<IEnumerable<LowStockDto>> GetLowStockAsync();
}
