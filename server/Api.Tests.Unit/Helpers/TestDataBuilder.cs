using Api.Data.Entities;
using Api.Enums;
using NodaTime;

namespace Api.Tests.Unit.Helpers;

public static class TestDataBuilder
{
    private static readonly string[] TailwindColors =
    [
        "red", "orange", "amber", "yellow", "lime", "green", "emerald", "teal",
        "cyan", "sky", "blue", "indigo", "violet", "purple", "fuchsia", "pink",
        "rose", "slate", "gray", "zinc", "neutral", "stone"
    ];

    public static Tag CreateTag(Guid userId, string? name = null, bool isDeleted = false, string? color = null)
    {
        var randomColor = TailwindColors[Random.Shared.Next(TailwindColors.Length)];
        return new Tag
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name ?? $"Tag_{Guid.NewGuid()}",
            Color = color ?? randomColor,
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            IsDeleted = isDeleted,
            DeletedAt = isDeleted ? Instant.FromDateTimeUtc(DateTime.UtcNow) : null
        };
    }

    public static JourneyCategory CreateCategory(Guid userId, string? name = null, string? description = null)
    {
        return new JourneyCategory
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name ?? $"Category_{Guid.NewGuid()}",
            Description = description,
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow)
        };
    }

    public static ApplicationUser CreateUser(string? email = null)
    {
        var id = Guid.NewGuid();
        email ??= $"user_{id}@example.com";
        
        return new ApplicationUser
        {
            Id = id,
            UserName = email,
            Email = email,
            EmailConfirmed = true,
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow)
        };
    }

    public static Data.Entities.Journey CreateJourney(Guid userId, string? name = null, Guid? categoryId = null, 
        LocalDate? startDate = null, LocalDate? endDate = null, string? description = null)
    {
        return new Data.Entities.Journey
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name ?? $"Journey_{Guid.NewGuid()}",
            Description = description,
            JourneyCategoryId = categoryId,
            StartDate = startDate,
            EndDate = endDate,
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow)
        };
    }

    public static BucketListItem CreateBucketListItem(Guid userId, string? name = null, 
        BucketListItemType type = BucketListItemType.Place)
    {
        return new BucketListItem
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name ?? $"BucketItem_{Guid.NewGuid()}",
            Type = type,
            OriginalCurrencyCode = "USD",
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            UpdatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow)
        };
    }

    public static BucketList CreateBucketList(Guid userId, string? name = null)
    {
        return new BucketList
        {
            Id = Guid.NewGuid(),
            UserId = userId,
            Name = name ?? $"BucketList_{Guid.NewGuid()}",
            CreatedAt = Instant.FromDateTimeUtc(DateTime.UtcNow),
            LastModifiedAt = Instant.FromDateTimeUtc(DateTime.UtcNow)
        };
    }

    public static ApplicationSetting CreateApplicationSetting(SettingKey key, object value)
    {
        return new ApplicationSetting
        {
            Key = key,
            Value = System.Text.Json.JsonSerializer.Serialize(value)
        };
    }

    public static InstalledVersion CreateInstalledVersion(string version)
    {
        return new InstalledVersion
        {
            Version = version,
            InstalledAt = Instant.FromDateTimeUtc(DateTime.UtcNow)
        };
    }

}
