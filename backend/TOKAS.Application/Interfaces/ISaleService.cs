using TOKAS.Application.DTOs.Cashier;

namespace TOKAS.Application.Interfaces;

public interface ISaleService
{
    Task<SaleResponse> CreateSaleAsync(CreateSaleRequest request, int userId);
}
