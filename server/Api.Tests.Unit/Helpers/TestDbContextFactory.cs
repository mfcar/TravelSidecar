using Api.Data.Context;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

namespace Api.Tests.Unit.Helpers;

public static class TestDbContextFactory
{
    public static ApplicationContext CreateInMemoryContext()
    {
        var services = new ServiceCollection();
        
        var databaseName = $"TestDb_{Guid.NewGuid()}";
        
        services.AddDbContext<ApplicationContext>(options =>
            options.UseInMemoryDatabase(databaseName));

        var serviceProvider = services.BuildServiceProvider();
        var context = serviceProvider.GetRequiredService<ApplicationContext>();
        
        context.Database.EnsureCreated();
        
        return context;
    }
}
