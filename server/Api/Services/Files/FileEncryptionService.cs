using System.Security.Cryptography;
using Api.DTOs.Config.Files;
using Api.Enums;
using Microsoft.Extensions.Options;

namespace Api.Services.Files;

public interface IFileEncryptionService
{
    (Stream EncryptedStream, string KeyId) EncryptFile(Stream fileStream, string fileId);
    Stream DecryptFile(Stream encryptedStream, string keyId);
    bool ShouldEncrypt(string contentType, FileType type);
}

public class FileEncryptionService : IFileEncryptionService
{
    private readonly string _masterKey;

    public FileEncryptionService(IOptions<FileStorageOptions> options)
    {
        _masterKey = options.Value.EncryptionMasterKey;
    }

    public (Stream EncryptedStream, string KeyId) EncryptFile(Stream fileStream, string fileId)
    {
        using var keyDerivation = new Rfc2898DeriveBytes(
            _masterKey,
            System.Text.Encoding.UTF8.GetBytes(fileId),
            50000,
            HashAlgorithmName.SHA256);

        var key = keyDerivation.GetBytes(32);
        var iv = keyDerivation.GetBytes(16);

        var encryptedStream = new MemoryStream();

        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;

        using var cryptoStream = new CryptoStream(
            encryptedStream,
            aes.CreateEncryptor(),
            CryptoStreamMode.Write);

        fileStream.CopyTo(cryptoStream);
        cryptoStream.FlushFinalBlock();

        encryptedStream.Position = 0;

        var keyId = Convert.ToBase64String(
            System.Text.Encoding.UTF8.GetBytes(fileId));

        return (encryptedStream, keyId);
    }

    public Stream DecryptFile(Stream encryptedStream, string keyId)
    {
        var fileId = System.Text.Encoding.UTF8.GetString(
            Convert.FromBase64String(keyId));

        using var keyDerivation = new Rfc2898DeriveBytes(
            _masterKey,
            System.Text.Encoding.UTF8.GetBytes(fileId),
            50000,
            HashAlgorithmName.SHA256);

        var key = keyDerivation.GetBytes(32);
        var iv = keyDerivation.GetBytes(16);

        var decryptedStream = new MemoryStream();

        using var aes = Aes.Create();
        aes.Key = key;
        aes.IV = iv;

        using var cryptoStream = new CryptoStream(
            encryptedStream,
            aes.CreateDecryptor(),
            CryptoStreamMode.Read);

        cryptoStream.CopyTo(decryptedStream);

        decryptedStream.Position = 0;

        return decryptedStream;
    }

    public bool ShouldEncrypt(string contentType, FileType type)
    {
        return type switch
        {
            FileType.UserAvatar => false,
            FileType.JourneyCover => false,
            FileType.JourneyActivityImage => false,
            FileType.BucketListItemImage => false,
            FileType.JourneyDocument or
                FileType.JourneyActivityDocument or
                FileType.JourneyPhoto => true,
            _ => !contentType.StartsWith("image/")
        };
    }
}
