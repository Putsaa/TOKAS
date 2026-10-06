using System.Data;

namespace TOKAS.Application.Interfaces;

public interface IDbConnectionFactory
{
    IDbConnection CreateConnection();
}
