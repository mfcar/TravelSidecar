using Api.Enums;
using Api.Services.Files;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Processing;
using SixLabors.ImageSharp.Formats;
using SixLabors.ImageSharp.Formats.Jpeg;
using SixLabors.ImageSharp.Formats.Png;
using SixLabors.ImageSharp.Formats.Webp;

namespace Api.Services.Images;

public interface IImageProcessingService
{
    Task<Dictionary<ImageSizeType, (Stream Stream, string ContentType)>> ResizeImageAsync(
        Stream imageStream, string contentType);

    Task<Dictionary<ImageSizeType, string>> SaveResizedImagesAsync(
        Dictionary<ImageSizeType, (Stream Stream, string ContentType)> resizedImages,
        string originalFileName,
        string folderPath);

    string GetResizedImagePath(string originalPath, ImageSizeType sizeType);
}

public class ImageProcessingService : IImageProcessingService
{
    private readonly ILogger<ImageProcessingService> _logger;
    private readonly IFileStorageService _fileStorageService;

    public ImageProcessingService(
        ILogger<ImageProcessingService> logger,
        IFileStorageService fileStorageService)
    {
        _logger = logger;
        _fileStorageService = fileStorageService;
    }

    public async Task<Dictionary<ImageSizeType, (Stream Stream, string ContentType)>> ResizeImageAsync(
        Stream imageStream, string contentType)
    {
        var result = new Dictionary<ImageSizeType, (Stream Stream, string ContentType)>();

        try
        {
            if (imageStream.CanSeek)
                imageStream.Position = 0;

            using var image = await Image.LoadAsync(imageStream);

            if (imageStream.CanSeek)
                imageStream.Position = 0;

            var originalMemStream = new MemoryStream();
            await imageStream.CopyToAsync(originalMemStream);
            originalMemStream.Position = 0;
            result[ImageSizeType.Original] = (originalMemStream, contentType);

            if (imageStream.CanSeek)
                imageStream.Position = 0;

            foreach (var sizeType in Enum.GetValues<ImageSizeType>())
            {
                if (sizeType == ImageSizeType.Original)
                    continue;

                var maxSize = GetDimensionsForSize(sizeType);

                if (image.Width <= maxSize && image.Height <= maxSize)
                {
                    var memStream = new MemoryStream();
                    await imageStream.CopyToAsync(memStream);
                    memStream.Position = 0;
                    if (imageStream.CanSeek)
                        imageStream.Position = 0;

                    result[sizeType] = (memStream, contentType);
                    continue;
                }

                var resizeOptions = new ResizeOptions
                {
                    Mode = ResizeMode.Max,
                    Size = new Size(maxSize, maxSize)
                };

                using var clonedImage = image.Clone(x => x.Resize(resizeOptions));

                var memoryStream = new MemoryStream();
                await EncodeImageAsync(clonedImage, memoryStream, contentType);
                memoryStream.Position = 0;

                result[sizeType] = (memoryStream, contentType);
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error resizing image: {Message}", ex.Message);
            throw;
        }
    }

    public async Task<Dictionary<ImageSizeType, string>> SaveResizedImagesAsync(
        Dictionary<ImageSizeType, (Stream Stream, string ContentType)> resizedImages,
        string originalFileName,
        string folderPath)
    {
        var result = new Dictionary<ImageSizeType, string>();

        if (resizedImages.Count == 0)
            return result;

        try
        {
            foreach (var (sizeType, (stream, contentType)) in resizedImages)
            {
                var fileNameWithoutExt = Path.GetFileNameWithoutExtension(originalFileName);
                var extension = Path.GetExtension(originalFileName);
                var sizedFileName = $"{fileNameWithoutExt}_{sizeType.ToString().ToLowerInvariant()}{extension}";

                if (stream.CanSeek && stream.Position != 0)
                    stream.Position = 0;

                var path = await _fileStorageService.UploadFileAsync(
                    stream,
                    sizedFileName,
                    contentType,
                    folderPath);

                result[sizeType] = path;
            }

            return result;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error saving resized images for {FileName}: {Message}",
                originalFileName, ex.Message);
            throw;
        }
    }

    public string GetResizedImagePath(string originalPath, ImageSizeType sizeType)
    {
        if (string.IsNullOrWhiteSpace(originalPath))
            return originalPath;

        var directory = Path.GetDirectoryName(originalPath);
        var fileName = Path.GetFileNameWithoutExtension(originalPath);
        var extension = Path.GetExtension(originalPath);

        var sizeSuffix = sizeType switch
        {
            ImageSizeType.Normal => "_normal",
            ImageSizeType.Medium => "_medium",
            ImageSizeType.Small => "_small",
            ImageSizeType.Tiny => "_tiny",
            _ => string.Empty
        };

        var newFileName = $"{fileName}{sizeSuffix}{extension}";
        return Path.Combine(directory ?? string.Empty, newFileName).Replace("\\", "/");
    }

    private static int GetDimensionsForSize(ImageSizeType sizeType)
    {
        return sizeType switch
        {
            ImageSizeType.Normal => DefaultProperties.NormalMaxDimension,
            ImageSizeType.Medium => DefaultProperties.MediumMaxDimension,
            ImageSizeType.Small => DefaultProperties.SmallMaxDimension,
            ImageSizeType.Tiny => DefaultProperties.TinyMaxDimension,
            _ => 0
        };
    }

    private static async Task EncodeImageAsync(Image image, Stream stream, string contentType)
    {
        IImageEncoder encoder = contentType switch
        {
            "image/jpeg" => new JpegEncoder { Quality = DefaultProperties.JpegQuality },
            "image/png" => new PngEncoder { CompressionLevel = PngCompressionLevel.BestCompression },
            "image/webp" => new WebpEncoder { Quality = DefaultProperties.WebpQuality },
            _ => new JpegEncoder { Quality = DefaultProperties.JpegQuality }
        };

        await image.SaveAsync(stream, encoder);
    }
}
