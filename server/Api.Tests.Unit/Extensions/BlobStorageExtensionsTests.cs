using Api.Extensions;
using Api.DTOs.Config.Files;
using FluentAssertions;
using Xunit;

namespace Api.Tests.Unit.Extensions;

public class BlobStorageExtensionsTests
{
    [Fact]
    public void GetAccessKey_WithMinIOProvider_ShouldReturnMinIOEnvironmentVariable_WhenSet()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("MINIO_ROOT_USER");
        const string testAccessKey = "test-minio-access-key";
        Environment.SetEnvironmentVariable("MINIO_ROOT_USER", testAccessKey);
        
        var config = new FileStorageOptions
        {
            Provider = "minio",
            Minio = new MinioOptions { AccessKey = "config-access-key" }
        };
        
        try
        {
            // Act
            var result = config.GetAccessKey();
            
            // Assert
            result.Should().Be(testAccessKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("MINIO_ROOT_USER", originalValue);
        }
    }

    [Fact]
    public void GetAccessKey_WithMinIOProvider_ShouldReturnConfigValue_WhenEnvironmentVariableNotSet()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("MINIO_ROOT_USER");
        Environment.SetEnvironmentVariable("MINIO_ROOT_USER", null);
        
        var config = new FileStorageOptions
        {
            Provider = "minio",
            Minio = new MinioOptions { AccessKey = "config-access-key" }
        };
        
        try
        {
            // Act
            var result = config.GetAccessKey();
            
            // Assert
            result.Should().Be("config-access-key");
        }
        finally
        {
            Environment.SetEnvironmentVariable("MINIO_ROOT_USER", originalValue);
        }
    }

    [Fact]
    public void GetAccessKey_WithS3Provider_ShouldReturnAWSEnvironmentVariable_WhenSet()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
        const string testAccessKey = "test-aws-access-key";
        Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", testAccessKey);
        
        var config = new FileStorageOptions
        {
            Provider = "s3",
            S3 = new S3CompatibleOptions { AccessKey = "config-access-key" }
        };
        
        try
        {
            // Act
            var result = config.GetAccessKey();
            
            // Assert
            result.Should().Be(testAccessKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", originalValue);
        }
    }

    [Fact]
    public void GetAccessKey_WithS3Provider_ShouldReturnConfigValue_WhenEnvironmentVariableNotSet()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
        Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", null);
        
        var config = new FileStorageOptions
        {
            Provider = "s3",
            S3 = new S3CompatibleOptions { AccessKey = "config-access-key" }
        };
        
        try
        {
            // Act
            var result = config.GetAccessKey();
            
            // Assert
            result.Should().Be("config-access-key");
        }
        finally
        {
            Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", originalValue);
        }
    }

    [Fact]
    public void GetSecretKey_WithMinIOProvider_ShouldReturnMinIOEnvironmentVariable_WhenSet()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("MINIO_ROOT_PASSWORD");
        const string testSecretKey = "test-minio-secret-key";
        Environment.SetEnvironmentVariable("MINIO_ROOT_PASSWORD", testSecretKey);
        
        var config = new FileStorageOptions
        {
            Provider = "minio",
            Minio = new MinioOptions { SecretKey = "config-secret-key" }
        };
        
        try
        {
            // Act
            var result = config.GetSecretKey();
            
            // Assert
            result.Should().Be(testSecretKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("MINIO_ROOT_PASSWORD", originalValue);
        }
    }

    [Fact]
    public void GetSecretKey_WithMinIOProvider_ShouldReturnConfigValue_WhenEnvironmentVariableNotSet()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("MINIO_ROOT_PASSWORD");
        Environment.SetEnvironmentVariable("MINIO_ROOT_PASSWORD", null);
        
        var config = new FileStorageOptions
        {
            Provider = "minio",
            Minio = new MinioOptions { SecretKey = "config-secret-key" }
        };
        
        try
        {
            // Act
            var result = config.GetSecretKey();
            
            // Assert
            result.Should().Be("config-secret-key");
        }
        finally
        {
            Environment.SetEnvironmentVariable("MINIO_ROOT_PASSWORD", originalValue);
        }
    }

    [Fact]
    public void GetSecretKey_WithS3Provider_ShouldReturnAWSEnvironmentVariable_WhenSet()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");
        const string testSecretKey = "test-aws-secret-key";
        Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", testSecretKey);
        
        var config = new FileStorageOptions
        {
            Provider = "s3",
            S3 = new S3CompatibleOptions { SecretKey = "config-secret-key" }
        };
        
        try
        {
            // Act
            var result = config.GetSecretKey();
            
            // Assert
            result.Should().Be(testSecretKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", originalValue);
        }
    }

    [Fact]
    public void GetSecretKey_WithS3Provider_ShouldReturnConfigValue_WhenEnvironmentVariableNotSet()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");
        Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", null);
        
        var config = new FileStorageOptions
        {
            Provider = "s3",
            S3 = new S3CompatibleOptions { SecretKey = "config-secret-key" }
        };
        
        try
        {
            // Act
            var result = config.GetSecretKey();
            
            // Assert
            result.Should().Be("config-secret-key");
        }
        finally
        {
            Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", originalValue);
        }
    }

    [Theory]
    [InlineData("MINIO")]
    [InlineData("MinIO")]
    [InlineData("minio")]
    [InlineData("MiNiO")]
    public void GetAccessKey_WithMinIOProvider_ShouldBeCaseInsensitive(string provider)
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("MINIO_ROOT_USER");
        const string testAccessKey = "test-minio-access-key";
        Environment.SetEnvironmentVariable("MINIO_ROOT_USER", testAccessKey);
        
        var config = new FileStorageOptions
        {
            Provider = provider,
            Minio = new MinioOptions { AccessKey = "config-access-key" }
        };
        
        try
        {
            // Act
            var result = config.GetAccessKey();
            
            // Assert
            result.Should().Be(testAccessKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("MINIO_ROOT_USER", originalValue);
        }
    }

    [Theory]
    [InlineData("s3")]
    [InlineData("S3")]
    [InlineData("aws")]
    [InlineData("AWS")]
    public void GetAccessKey_WithS3Provider_ShouldBeCaseInsensitive(string provider)
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
        const string testAccessKey = "test-aws-access-key";
        Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", testAccessKey);
        
        var config = new FileStorageOptions
        {
            Provider = provider,
            S3 = new S3CompatibleOptions { AccessKey = "config-access-key" }
        };
        
        try
        {
            // Act
            var result = config.GetAccessKey();
            
            // Assert
            result.Should().Be(testAccessKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", originalValue);
        }
    }

    [Theory]
    [InlineData("unknown")]
    [InlineData("azure")]
    [InlineData("gcp")]
    [InlineData("")]
    public void GetAccessKey_WithUnknownProvider_ShouldDefaultToS3Behavior(string? provider)
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("AWS_ACCESS_KEY_ID");
        const string testAccessKey = "test-aws-access-key";
        Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", testAccessKey);
        
        var config = new FileStorageOptions
        {
            Provider = provider,
            S3 = new S3CompatibleOptions { AccessKey = "config-access-key" }
        };
        
        try
        {
            // Act
            var result = config.GetAccessKey();
            
            // Assert
            result.Should().Be(testAccessKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("AWS_ACCESS_KEY_ID", originalValue);
        }
    }

    [Theory]
    [InlineData("unknown")]
    [InlineData("azure")]
    [InlineData("gcp")]
    [InlineData("")]
    public void GetSecretKey_WithUnknownProvider_ShouldDefaultToS3Behavior(string? provider)
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("AWS_SECRET_ACCESS_KEY");
        const string testSecretKey = "test-aws-secret-key";
        Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", testSecretKey);
        
        var config = new FileStorageOptions
        {
            Provider = provider,
            S3 = new S3CompatibleOptions { SecretKey = "config-secret-key" }
        };
        
        try
        {
            // Act
            var result = config.GetSecretKey();
            
            // Assert
            result.Should().Be(testSecretKey);
        }
        finally
        {
            Environment.SetEnvironmentVariable("AWS_SECRET_ACCESS_KEY", originalValue);
        }
    }

    [Fact]
    public void GetAccessKey_WithEmptyEnvironmentVariable_ShouldReturnEmptyString()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("MINIO_ROOT_USER");
        Environment.SetEnvironmentVariable("MINIO_ROOT_USER", "");
        
        var config = new FileStorageOptions
        {
            Provider = "minio",
            Minio = new MinioOptions { AccessKey = "fallback-config-value" }
        };
        
        try
        {
            // Act
            var result = config.GetAccessKey();
            
            // Assert - Environment variable empty string takes precedence over config
            result.Should().Be("");
        }
        finally
        {
            Environment.SetEnvironmentVariable("MINIO_ROOT_USER", originalValue);
        }
    }

    [Fact]
    public void GetSecretKey_WithEmptyEnvironmentVariable_ShouldReturnEmptyString()
    {
        // Arrange
        var originalValue = Environment.GetEnvironmentVariable("MINIO_ROOT_PASSWORD");
        Environment.SetEnvironmentVariable("MINIO_ROOT_PASSWORD", "");
        
        var config = new FileStorageOptions
        {
            Provider = "minio",
            Minio = new MinioOptions { SecretKey = "fallback-config-value" }
        };
        
        try
        {
            // Act
            var result = config.GetSecretKey();
            
            // Assert - Environment variable empty string takes precedence over config
            result.Should().Be("");
        }
        finally
        {
            Environment.SetEnvironmentVariable("MINIO_ROOT_PASSWORD", originalValue);
        }
    }

    [Fact]
    public void GetAccessKey_WithNullProvider_ShouldThrowNullReferenceException()
    {
        // Arrange
        var config = new FileStorageOptions
        {
            Provider = null!,
            S3 = new S3CompatibleOptions { AccessKey = "config-access-key" }
        };
        
        // Act
        var act = () => config.GetAccessKey();
        
        // Assert
        act.Should().Throw<NullReferenceException>();
    }

    [Fact]
    public void GetSecretKey_WithNullProvider_ShouldThrowNullReferenceException()
    {
        // Arrange
        var config = new FileStorageOptions
        {
            Provider = null!,
            S3 = new S3CompatibleOptions { SecretKey = "config-secret-key" }
        };
        
        // Act
        var act = () => config.GetSecretKey();
        
        // Assert
        act.Should().Throw<NullReferenceException>();
    }
}
