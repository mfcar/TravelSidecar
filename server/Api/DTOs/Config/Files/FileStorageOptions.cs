namespace Api.DTOs.Config.Files;

public class FileStorageOptions
{
    public string Provider { get; set; } = "Minio";
    public string BucketName { get; set; } = "travelsidecar";
    
    public MinioOptions Minio { get; set; } = new();
    public S3Options S3 { get; set; } = new();
    public string EncryptionMasterKey { get; set; } = "";
}
