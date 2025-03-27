using System.ComponentModel.DataAnnotations;
using Api.Enums;
using Microsoft.AspNetCore.Identity;
using NodaTime;

namespace Api.Data.Entities;

public class ApplicationUser : IdentityUser<Guid>
{
    // User preferences
    public bool IsInitialSetupComplete { get; set; } = false;
    public UserDateFormat PreferredDateFormat { get; set; } = UserDateFormat.DD_MM_YYYY;
    public UserTimeFormat PreferredTimeFormat { get; set; } = UserTimeFormat.HH_MM_24;
    [MaxLength(50)]
    public string PreferredTimezone { get; set; } = "UTC";
    [MaxLength(3)]
    public string PreferredCurrencyCode { get; set; } = "EUR";
    public UserThemeMode PreferredThemeMode { get; set; } = UserThemeMode.System;
    [Range(1, 100)]
    public int PreferredItemsPerPage { get; set; } = 25;
    [MaxLength(10)]
    public string PreferredLanguage { get; set; } = "en";
    [MaxLength]
    public string? PagePreferences { get; set; }
    
    // External auth properties
    [MaxLength(50)]
    public string? ExternalProviderId { get; set; }
    [MaxLength(50)]
    public string? ExternalProviderName { get; set; }
    public Instant? LastExternalLoginAt { get; set; }
    public bool RequirePasswordChange { get; set; } = false;
    
    // Tracking properties
    public Instant CreatedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant LastModifiedAt { get; set; } = Instant.FromDateTimeUtc(DateTime.UtcNow);
    public Instant? LastActiveAt { get; set; }
    public bool IsDeleted { get; set; }
    public Instant? DeletedAt { get; set; }
    
    // Navigation properties
    public ICollection<BucketList> BucketLists { get; set; } = new List<BucketList>();
    public ICollection<BucketListItem> BucketListItems { get; set; } = new List<BucketListItem>();
    public ICollection<FileMetadata> Files { get; set; } = new List<FileMetadata>();
    public ICollection<JourneyCategory>? JourneyCategories { get; set; }
    public ICollection<Journey>? Journeys { get; set; }
}
