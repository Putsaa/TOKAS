using Microsoft.Extensions.DependencyInjection;
using TOKAS.Infrastructure.Data;
using TOKAS.Infrastructure.Repositories;
using TOKAS.Application.Interfaces.Repositories;

namespace TOKAS.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services)
    {
        services.AddSingleton<IDbConnectionFactory, DbConnectionFactory>();
        services.AddSingleton<DbConnectionFactory>();
        
        services.AddScoped<IUserRepository, UserRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ISaleRepository, SaleRepository>();
        services.AddScoped<IStockTransactionRepository, StockTransactionRepository>();
        services.AddScoped<IReportRepository, ReportRepository>();

        return services;
    }
}
