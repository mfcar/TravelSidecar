using Api.Data.Entities;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Npgsql.EntityFrameworkCore.PostgreSQL.ValueGeneration;

namespace Api.Data.Context;

public class ApplicationContext(DbContextOptions<ApplicationContext> options)
    : IdentityDbContext<ApplicationUser, ApplicationRole, Guid>(options)
{
    public DbSet<ApplicationSetting> ApplicationSettings { get; init; } = null!;
    public DbSet<ApplicationUser> ApplicationUsers { get; init; } = null!;
    public DbSet<BucketListItem> BucketListItems { get; init; } = null!;
    public DbSet<FileMetadata> Files { get; init; } = null!;
    public DbSet<InstalledVersion> InstalledVersions { get; init; } = null!;
    public DbSet<OidcProvider> OidcProviders { get; init; } = null!;
    public DbSet<JourneyCategory> JourneyCategories { get; init; } = null!;
    public DbSet<Journey> Journeys { get; init; } = null!;
    public DbSet<Tag> Tags { get; init; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.UseOpenIddict<Guid>();

        modelBuilder.Entity<ApplicationSetting>(entity =>
        {
            entity.Property(x => x.Key).IsRequired();

            entity.HasIndex(x => x.Key).IsUnique();
        });

        modelBuilder.Entity<ApplicationUser>(entity =>
        {
            entity.Property(x => x.Id)
                .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

            entity.HasQueryFilter(x => !x.IsDeleted);
        });

        modelBuilder
            .Entity<ApplicationRole>()
            .Property(x => x.Id)
            .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

        modelBuilder
            .Entity<BucketList>(entity =>
                {
                    entity.Property(x => x.Id)
                        .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

                    entity.HasOne(x => x.User)
                        .WithMany(u => u.BucketLists)
                        .HasForeignKey(jc => jc.UserId);

                    entity.HasIndex(x => x.UserId);

                    entity.HasQueryFilter(x => !x.IsDeleted);
                }
            );

        modelBuilder
            .Entity<BucketListItem>(entity =>
            {
                entity.Property(x => x.Id)
                    .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

                entity.HasQueryFilter(x => !x.IsDeleted);

                entity.HasOne(x => x.User)
                    .WithMany(u => u.BucketListItems)
                    .HasForeignKey(jc => jc.UserId);

                entity.HasOne(x => x.OriginalCurrency)
                    .WithMany()
                    .HasForeignKey(x => x.OriginalCurrencyCode)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasMany(b => b.Tags)
                    .WithMany(t => t.BucketListItems)
                    .UsingEntity<Dictionary<string, object>>(
                        "BucketListItemTags",
                        b => b.HasOne<Tag>()
                            .WithMany()
                            .HasForeignKey("TagId")
                            .OnDelete(DeleteBehavior.Cascade),
                        t => t.HasOne<BucketListItem>()
                            .WithMany()
                            .HasForeignKey("BucketListItemId")
                            .OnDelete(DeleteBehavior.Cascade),
                        jbt =>
                        {
                            jbt.HasKey("BucketListItemId", "TagId");
                            jbt.ToTable("BucketListItemTags");
                            jbt.HasIndex("TagId");
                        });

                entity.HasOne(b => b.Image)
                    .WithOne()
                    .HasForeignKey<FileMetadata>(b => b.BucketListItemId)
                    .IsRequired(false)
                    .OnDelete(DeleteBehavior.SetNull);

                entity.HasIndex(x => x.UserId);
                entity.HasIndex(x => x.Type);
                entity.HasIndex(x => x.BucketListId);
                entity.HasIndex(x => x.OriginalCurrencyCode);
            });

        modelBuilder
            .Entity<Currency>(entity => { entity.HasKey(x => x.Code); });

        modelBuilder
            .Entity<FileMetadata>(entity =>
            {
                entity.Property(x => x.Id)
                    .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

                entity.HasMany(f => f.Tags)
                    .WithMany(t => t.Files)
                    .UsingEntity<Dictionary<string, object>>(
                        "FileMetadataTags",
                        f => f.HasOne<Tag>()
                            .WithMany()
                            .HasForeignKey("TagId")
                            .OnDelete(DeleteBehavior.Cascade),
                        t => t.HasOne<FileMetadata>()
                            .WithMany()
                            .HasForeignKey("FileMetadataId")
                            .OnDelete(DeleteBehavior.Cascade),
                        ft =>
                        {
                            ft.HasKey("FileMetadataId", "TagId");
                            ft.ToTable("FileMetadataTags");
                            ft.HasIndex("TagId");
                        });

                entity.HasQueryFilter(x => !x.IsDeleted);

                entity.HasIndex(x => x.UserId);
                entity.HasIndex(x => x.JourneyId);
                entity.HasIndex(x => x.ActivityId);
                entity.HasIndex(x => x.BucketListItemId);
                entity.HasIndex(x => x.Category);
                entity.HasIndex(x => x.Type);
            });

        modelBuilder
            .Entity<InstalledVersion>(entity =>
            {
                entity.Property(x => x.Id)
                    .ValueGeneratedOnAdd();

                entity.HasIndex(x => x.Version)
                    .IsUnique();
            });

        modelBuilder.Entity<OidcProvider>(entity =>
        {
            entity.Property(x => x.Id)
                .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

            entity.HasIndex(x => x.Name).IsUnique();
        });

        modelBuilder
            .Entity<JourneyCategory>(entity =>
                {
                    entity.Property(x => x.Id)
                        .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

                    entity.HasOne(x => x.User)
                        .WithMany(u => u.JourneyCategories)
                        .HasForeignKey(jc => jc.UserId);

                    entity.HasIndex(x => x.UserId);

                    entity.HasQueryFilter(x => !x.IsDeleted);
                }
            );

        modelBuilder
            .Entity<Journey>(entity =>
            {
                entity.Property(x => x.Id)
                    .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

                entity.HasOne(x => x.JourneyCategory)
                    .WithMany(c => c.Journeys)
                    .HasForeignKey(j => j.JourneyCategoryId)
                    .IsRequired(false);

                entity.HasMany(j => j.Tags)
                    .WithMany(t => t.Journeys)
                    .UsingEntity<Dictionary<string, object>>("JourneyTags",
                        j => j.HasOne<Tag>()
                            .WithMany()
                            .HasForeignKey("TagId")
                            .OnDelete(DeleteBehavior.Cascade),
                        t => t.HasOne<Journey>()
                            .WithMany()
                            .HasForeignKey("JourneyId")
                            .OnDelete(DeleteBehavior.Cascade),
                        jt =>
                        {
                            jt.HasKey("JourneyId", "TagId");
                            jt.HasIndex("TagId");
                            jt.HasIndex("JourneyId");
                        });

                entity.HasIndex(x => x.UserId);
                entity.HasIndex(x => x.JourneyCategoryId);

                entity.HasQueryFilter(x => !x.IsDeleted);
            });

        modelBuilder
            .Entity<Tag>(entity =>
            {
                entity.Property(x => x.Id)
                    .HasValueGenerator<NpgsqlSequentialGuidValueGenerator>();

                entity.HasIndex(x => x.UserId);
            });


        base.OnModelCreating(modelBuilder);
    }
}
