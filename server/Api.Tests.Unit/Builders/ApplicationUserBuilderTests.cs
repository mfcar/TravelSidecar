using Api.Builders;
using Api.Enums;
using FluentAssertions;
using Xunit;

namespace Api.Tests.Unit.Builders;

public class ApplicationUserBuilderTests
{
    [Fact]
    public void Build_ShouldCreateApplicationUserWithRequiredFields()
    {
        // Arrange
        var email = "test.user@example.com";
        var username = "testuser";
        
        // Act
        var user = new ApplicationUserBuilder(email, username).Build();
        
        // Assert
        user.Should().NotBeNull();
        user.Email.Should().Be(email);
        user.UserName.Should().Be(username);
        user.CreatedAt.Should().NotBe(default);
    }

    [Fact]
    public void WithPreferredDateFormat_ShouldSetDateFormat()
    {
        // Arrange
        var email = "user@example.com";
        var username = "user";
        var dateFormat = UserDateFormat.YYYY_MM_DD;
        
        // Act
        var user = new ApplicationUserBuilder(email, username)
            .WithPreferredDateFormat(dateFormat)
            .Build();
        
        // Assert
        user.PreferredDateFormat.Should().Be(dateFormat);
    }

    [Fact]
    public void WithPreferredDateFormat_ShouldUseDefaultWhenNull()
    {
        // Arrange
        var email = "user@example.com";
        var username = "user";
        
        // Act
        var user = new ApplicationUserBuilder(email, username)
            .WithPreferredDateFormat(null)
            .Build();
        
        // Assert
        user.PreferredDateFormat.Should().Be(UserDateFormat.DD_MM_YYYY);
    }

    [Fact]
    public void WithPreferredTimeFormat_ShouldSetTimeFormat()
    {
        // Arrange
        var email = "user@example.com";
        var username = "user";
        var timeFormat = UserTimeFormat.HH_MM_12;
        
        // Act
        var user = new ApplicationUserBuilder(email, username)
            .WithPreferredTimeFormat(timeFormat)
            .Build();
        
        // Assert
        user.PreferredTimeFormat.Should().Be(timeFormat);
    }

    [Fact]
    public void WithPreferredTimeFormat_ShouldUseDefaultWhenNull()
    {
        // Arrange
        var email = "user@example.com";
        var username = "user";
        
        // Act
        var user = new ApplicationUserBuilder(email, username)
            .WithPreferredTimeFormat(null)
            .Build();
        
        // Assert
        user.PreferredTimeFormat.Should().Be(UserTimeFormat.HH_MM_24);
    }

    [Fact]
    public void FluentApi_ShouldAllowMethodChaining()
    {
        // Arrange
        var email = "complete.user@example.com";
        var username = "completeuser";
        var dateFormat = UserDateFormat.MM_DD_YYYY_SLASH;
        var timeFormat = UserTimeFormat.HH_MM_12;
        
        // Act
        var user = new ApplicationUserBuilder(email, username)
            .WithPreferredDateFormat(dateFormat)
            .WithPreferredTimeFormat(timeFormat)
            .Build();
        
        // Assert
        user.Email.Should().Be(email);
        user.UserName.Should().Be(username);
        user.PreferredDateFormat.Should().Be(dateFormat);
        user.PreferredTimeFormat.Should().Be(timeFormat);
    }

    [Theory]
    [InlineData(UserDateFormat.DD_MM_YYYY)]
    [InlineData(UserDateFormat.DD_MM_YYYY_SLASH)]
    [InlineData(UserDateFormat.DD_MM_YYYY_DOT)]
    [InlineData(UserDateFormat.YYYY_MM_DD)]
    [InlineData(UserDateFormat.YYYY_MM_DD_SLASH)]
    [InlineData(UserDateFormat.YYYY_MM_DD_DOT)]
    [InlineData(UserDateFormat.MM_DD_YYYY)]
    [InlineData(UserDateFormat.MM_DD_YYYY_SLASH)]
    [InlineData(UserDateFormat.MM_DD_YYYY_DOT)]
    [InlineData(UserDateFormat.dd_MMMM_yyyy)]
    [InlineData(UserDateFormat.dd_MMM_yyyy)]
    [InlineData(UserDateFormat.MMM_do_yyyy)]
    [InlineData(UserDateFormat.MMMM_do_yyyy)]
    public void WithPreferredDateFormat_ShouldSupportAllDateFormats(UserDateFormat dateFormat)
    {
        // Arrange
        var email = "test@example.com";
        var username = "testuser";
        
        // Act
        var user = new ApplicationUserBuilder(email, username)
            .WithPreferredDateFormat(dateFormat)
            .Build();
        
        // Assert
        user.PreferredDateFormat.Should().Be(dateFormat);
    }

    [Theory]
    [InlineData(UserTimeFormat.HH_MM_24)]
    [InlineData(UserTimeFormat.HH_MM_12)]
    public void WithPreferredTimeFormat_ShouldSupportAllTimeFormats(UserTimeFormat timeFormat)
    {
        // Arrange
        var email = "test@example.com";
        var username = "testuser";
        
        // Act
        var user = new ApplicationUserBuilder(email, username)
            .WithPreferredTimeFormat(timeFormat)
            .Build();
        
        // Assert
        user.PreferredTimeFormat.Should().Be(timeFormat);
    }

    [Fact]
    public void Build_ShouldHaveEmptyIdByDefault()
    {
        // Arrange & Act
        var user1 = new ApplicationUserBuilder("user1@example.com", "user1").Build();
        var user2 = new ApplicationUserBuilder("user2@example.com", "user2").Build();
        
        // Assert
        // Note: Entity IDs are typically generated by the database/identity system
        user1.Id.Should().Be(Guid.Empty);
        user2.Id.Should().Be(Guid.Empty);
    }

    [Fact]
    public void Build_ShouldHandleEmailWithSpecialCharacters()
    {
        // Arrange
        var email = "user+test@sub-domain.example-site.com";
        var username = "usertest";
        
        // Act
        var user = new ApplicationUserBuilder(email, username).Build();
        
        // Assert
        user.Email.Should().Be(email);
    }

    [Fact]
    public void Build_ShouldHandleUsernameWithSpecialCharacters()
    {
        // Arrange
        var email = "user@example.com";
        var username = "user_name-123";
        
        // Act
        var user = new ApplicationUserBuilder(email, username).Build();
        
        // Assert
        user.UserName.Should().Be(username);
    }

    [Fact]
    public void Build_ShouldSetCreatedAtTimestamp()
    {
        // Arrange
        var email = "timestamp@example.com";
        var username = "timestampuser";
        var beforeCreation = DateTime.UtcNow.AddSeconds(-1);
        
        // Act
        var user = new ApplicationUserBuilder(email, username).Build();
        var afterCreation = DateTime.UtcNow.AddSeconds(1);
        
        // Assert
        var createdAtUtc = user.CreatedAt.ToDateTimeUtc();
        createdAtUtc.Should().BeAfter(beforeCreation);
        createdAtUtc.Should().BeBefore(afterCreation);
    }

    [Fact]
    public void Build_ShouldCreateUserWithDefaultPreferences_WhenNoPreferencesSet()
    {
        // Arrange
        var email = "default@example.com";
        var username = "defaultuser";
        
        // Act
        var user = new ApplicationUserBuilder(email, username).Build();
        
        // Assert
        user.PreferredDateFormat.Should().Be(UserDateFormat.DD_MM_YYYY);
        user.PreferredTimeFormat.Should().Be(UserTimeFormat.HH_MM_24);
    }

    [Fact]
    public void Build_ShouldReturnSameInstanceFromSameBuilder()
    {
        // Arrange
        var builder = new ApplicationUserBuilder("shared@example.com", "shareduser");
        
        // Act
        var user1 = builder.WithPreferredDateFormat(UserDateFormat.YYYY_MM_DD).Build();
        var user2 = builder.WithPreferredTimeFormat(UserTimeFormat.HH_MM_12).Build();
        
        // Assert
        user1.Should().BeSameAs(user2); // Same builder instance returns same user object
        user1.Id.Should().Be(user2.Id);
        user1.PreferredDateFormat.Should().Be(UserDateFormat.YYYY_MM_DD);
        user2.PreferredTimeFormat.Should().Be(UserTimeFormat.HH_MM_12);
        // Note: user2 will also have the date format from user1 since it's the same object
        user2.PreferredDateFormat.Should().Be(UserDateFormat.YYYY_MM_DD);
    }

    [Fact]
    public void Build_ShouldHandleLongEmailAddress()
    {
        // Arrange
        var longLocalPart = new string('a', 60);
        var longDomainPart = new string('b', 50);
        var longEmail = $"{longLocalPart}@{longDomainPart}.com";
        var username = "longuser";
        
        // Act
        var user = new ApplicationUserBuilder(longEmail, username).Build();
        
        // Assert
        user.Email.Should().Be(longEmail);
    }

    [Fact]
    public void Build_ShouldHandleLongUsername()
    {
        // Arrange
        var email = "user@example.com";
        var longUsername = new string('u', 100);
        
        // Act
        var user = new ApplicationUserBuilder(email, longUsername).Build();
        
        // Assert
        user.UserName.Should().Be(longUsername);
    }
}