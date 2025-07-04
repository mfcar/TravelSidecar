using System.Security.Claims;
using Api.Data.Entities;
using Api.Services;
using Api.Tests.Unit.Helpers;
using FluentAssertions;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Identity;
using NSubstitute;
using Xunit;

namespace Api.Tests.Unit.Services;

public class AuthenticatedUserServiceTests
{
    private readonly IHttpContextAccessor _httpContextAccessor;
    private readonly UserManager<ApplicationUser> _userManager;
    private readonly HttpContext _httpContext;
    private readonly AuthenticatedUserService _authenticatedUserService;

    public AuthenticatedUserServiceTests()
    {
        _httpContextAccessor = Substitute.For<IHttpContextAccessor>();
        _httpContext = Substitute.For<HttpContext>();
        _httpContextAccessor.HttpContext.Returns(_httpContext);
        
        var userStore = Substitute.For<IUserStore<ApplicationUser>>();
        _userManager = Substitute.For<UserManager<ApplicationUser>>(
            userStore, null, null, null, null, null, null, null, null);
        
        _authenticatedUserService = new AuthenticatedUserService(_httpContextAccessor, _userManager);
    }

    [Fact]
    public void Constructor_ShouldThrowArgumentNullException_WhenHttpContextIsNull()
    {
        // Arrange
        var accessor = Substitute.For<IHttpContextAccessor>();
        accessor.HttpContext.Returns((HttpContext)null!);
        
        // Act
        var act = () => new AuthenticatedUserService(accessor, _userManager);
        
        // Assert
        act.Should().Throw<ArgumentNullException>()
            .WithParameterName("httpContextAccessor");
    }

    [Fact]
    public async Task GetUserAsync_ShouldReturnUser_WhenUserIsAuthenticated()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = TestDataBuilder.CreateUser("auth@example.com");
        user.Id = userId;
        
        var identity = Substitute.For<ClaimsIdentity>();
        identity.IsAuthenticated.Returns(true);
        
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        
        _httpContext.User.Returns(principal);
        _userManager.GetUserAsync(principal).Returns(user);
        
        // Act
        var result = await _authenticatedUserService.GetUserAsync();
        
        // Assert
        result.Should().NotBeNull();
        result!.Id.Should().Be(userId);
        result.Email.Should().Be("auth@example.com");
    }

    [Fact]
    public async Task GetUserAsync_ShouldReturnNull_WhenUserIsNotAuthenticated()
    {
        // Arrange
        var identity = Substitute.For<ClaimsIdentity>();
        identity.IsAuthenticated.Returns(false);
        
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        
        _httpContext.User.Returns(principal);
        
        // Act
        var result = await _authenticatedUserService.GetUserAsync();
        
        // Assert
        result.Should().BeNull();
        await _userManager.DidNotReceive().GetUserAsync(Arg.Any<ClaimsPrincipal>());
    }

    [Fact]
    public async Task GetUserAsync_ShouldReturnNull_WhenIdentityIsNull()
    {
        // Arrange
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns((ClaimsIdentity)null!);
        
        _httpContext.User.Returns(principal);
        
        // Act
        var result = await _authenticatedUserService.GetUserAsync();
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserAsync_ShouldCacheUserAfterFirstCall()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("cached@example.com");
        
        var identity = Substitute.For<ClaimsIdentity>();
        identity.IsAuthenticated.Returns(true);
        
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        
        _httpContext.User.Returns(principal);
        _userManager.GetUserAsync(principal).Returns(user);
        
        // Act - Call twice
        var result1 = await _authenticatedUserService.GetUserAsync();
        var result2 = await _authenticatedUserService.GetUserAsync();
        
        // Assert
        result1.Should().BeSameAs(result2);
        await _userManager.Received(1).GetUserAsync(principal);
    }

    [Fact]
    public async Task GetUserAsync_ShouldReturnNull_WhenUserManagerReturnsNull()
    {
        // Arrange
        var identity = Substitute.For<ClaimsIdentity>();
        identity.IsAuthenticated.Returns(true);
        
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        
        _httpContext.User.Returns(principal);
        _userManager.GetUserAsync(principal).Returns((ApplicationUser)null!);
        
        // Act
        var result = await _authenticatedUserService.GetUserAsync();
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserIdAsync_ShouldReturnUserId_WhenUserExists()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = TestDataBuilder.CreateUser("id@example.com");
        user.Id = userId;
        
        var identity = Substitute.For<ClaimsIdentity>();
        identity.IsAuthenticated.Returns(true);
        
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        
        _httpContext.User.Returns(principal);
        _userManager.GetUserAsync(principal).Returns(user);
        
        // Act
        var result = await _authenticatedUserService.GetUserIdAsync();
        
        // Assert
        result.Should().Be(userId);
    }

    [Fact]
    public async Task GetUserIdAsync_ShouldReturnNull_WhenUserDoesNotExist()
    {
        // Arrange
        var identity = Substitute.For<ClaimsIdentity>();
        identity.IsAuthenticated.Returns(false);
        
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        
        _httpContext.User.Returns(principal);
        
        // Act
        var result = await _authenticatedUserService.GetUserIdAsync();
        
        // Assert
        result.Should().BeNull();
    }

    [Fact]
    public async Task GetUserIdAsync_ShouldUseCachedUser()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = TestDataBuilder.CreateUser("cachedid@example.com");
        user.Id = userId;
        
        var identity = Substitute.For<ClaimsIdentity>();
        identity.IsAuthenticated.Returns(true);
        
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        
        _httpContext.User.Returns(principal);
        _userManager.GetUserAsync(principal).Returns(user);
        
        // Act - Call GetUserAsync first to cache the user
        await _authenticatedUserService.GetUserAsync();
        var result = await _authenticatedUserService.GetUserIdAsync();
        
        // Assert
        result.Should().Be(userId);
        await _userManager.Received(1).GetUserAsync(principal);
    }

    [Fact]
    public async Task Service_ShouldHandleMultipleConcurrentCalls()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("concurrent@example.com");
        user.Id = Guid.NewGuid();
        
        var identity = Substitute.For<ClaimsIdentity>();
        identity.IsAuthenticated.Returns(true);
        
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        
        _httpContext.User.Returns(principal);
        _userManager.GetUserAsync(principal).Returns(user);
        
        // Act - Simulate concurrent calls
        var tasks = new Task[]
        {
            _authenticatedUserService.GetUserAsync(),
            _authenticatedUserService.GetUserIdAsync(),
            _authenticatedUserService.GetUserAsync(),
            _authenticatedUserService.GetUserIdAsync()
        };
        
        await Task.WhenAll(tasks);
        
        // Assert
        await _userManager.Received(1).GetUserAsync(principal);
    }

    [Fact]
    public async Task Service_ShouldWorkWithDifferentAuthenticationStates()
    {
        // Arrange
        var user = TestDataBuilder.CreateUser("states@example.com");
        var identity = Substitute.For<ClaimsIdentity>();
        var principal = Substitute.For<ClaimsPrincipal>();
        principal.Identity.Returns(identity);
        _httpContext.User.Returns(principal);
        
        // Test 1: Not authenticated
        identity.IsAuthenticated.Returns(false);
        var result1 = await _authenticatedUserService.GetUserAsync();
        result1.Should().BeNull();
        
        // Create new service instance to clear cache
        var newService = new AuthenticatedUserService(_httpContextAccessor, _userManager);
        
        // Test 2: Authenticated
        identity.IsAuthenticated.Returns(true);
        _userManager.GetUserAsync(principal).Returns(user);
        var result2 = await newService.GetUserAsync();
        result2.Should().NotBeNull();
    }
}
