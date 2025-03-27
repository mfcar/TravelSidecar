using Api.Data.Context;
using Api.Data.Entities;
using Microsoft.EntityFrameworkCore;
using NodaTime;

namespace Api.Services;

public interface IOidcProviderService
{
    Task<List<OidcProvider>> GetAllProvidersAsync();
    Task<OidcProvider> GetProviderByIdAsync(Guid id);
    Task<OidcProvider> GetProviderByNameAsync(string name);
    Task<OidcProvider> CreateProviderAsync(OidcProvider provider);
    Task<OidcProvider> UpdateProviderAsync(OidcProvider provider);
    Task DeleteProviderAsync(Guid id);
}

public class OidcProviderService(ApplicationContext dbContext) : IOidcProviderService
{
    public async Task<List<OidcProvider>> GetAllProvidersAsync()
    {
        return await dbContext.OidcProviders
            .AsNoTracking()
            .OrderBy(p => p.DisplayName)
            .ToListAsync();
    }

    public async Task<OidcProvider> GetProviderByIdAsync(Guid id)
    {
        var provider = await dbContext.OidcProviders
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Id == id);

        if (provider is null)
            throw new KeyNotFoundException($"OIDC provider with ID {id} not found");

        return provider;
    }

    public async Task<OidcProvider> GetProviderByNameAsync(string name)
    {
        var provider = await dbContext.OidcProviders
            .AsNoTracking()
            .FirstOrDefaultAsync(p => p.Name == name);

        if (provider is null)
            throw new KeyNotFoundException($"OIDC provider with name {name} not found");

        return provider;
    }

    public async Task<OidcProvider> CreateProviderAsync(OidcProvider provider)
    {
        if (await dbContext.OidcProviders.AnyAsync(p => p.Name == provider.Name))
            throw new InvalidOperationException($"OIDC provider with name {provider.Name} already exists");

        provider.CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);

        dbContext.OidcProviders.Add(provider);
        await dbContext.SaveChangesAsync();

        return provider;
    }

    public async Task<OidcProvider> UpdateProviderAsync(OidcProvider provider)
    {
        var existingProvider = await dbContext.OidcProviders
            .FirstOrDefaultAsync(p => p.Id == provider.Id);

        if (existingProvider is null)
            throw new KeyNotFoundException($"OIDC provider with ID {provider.Id} not found");

        // Check if name is changed and if new name already exists
        if (existingProvider.Name != provider.Name &&
            await dbContext.OidcProviders.AnyAsync(p => p.Name == provider.Name && p.Id != provider.Id))
            throw new InvalidOperationException($"OIDC provider with name {provider.Name} already exists");

        existingProvider.Name = provider.Name;
        existingProvider.DisplayName = provider.DisplayName;
        existingProvider.Authority = provider.Authority;
        existingProvider.ClientId = provider.ClientId;
        existingProvider.ClientSecret = provider.ClientSecret;
        existingProvider.Scope = provider.Scope;
        existingProvider.Enabled = provider.Enabled;
        existingProvider.AutoRegisterUsers = provider.AutoRegisterUsers;
        existingProvider.UpdatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow);;

        dbContext.OidcProviders.Update(existingProvider);
        await dbContext.SaveChangesAsync();

        return existingProvider;
    }

    public async Task DeleteProviderAsync(Guid id)
    {
        var provider = await dbContext.OidcProviders
            .FirstOrDefaultAsync(p => p.Id == id);

        if (provider is null)
            throw new KeyNotFoundException($"OIDC provider with ID {id} not found");

        dbContext.OidcProviders.Remove(provider);
        await dbContext.SaveChangesAsync();
    }
}
