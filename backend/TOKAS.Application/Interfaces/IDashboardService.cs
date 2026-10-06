using TOKAS.Application.DTOs.Dashboard;

namespace TOKAS.Application.Interfaces;

public interface IDashboardService
{
    Task<DashboardDto> GetDashboardDataAsync();
}
