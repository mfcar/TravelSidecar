namespace Api.DTOs.Config.Files;

public class FileStorageOptions
{
    public string Provider { get; set; } = "Minio";
    public string BucketName { get; set; } = "travelsidecar";
    
    public S3CompatibleOptions S3 { get; set; } = new();
    public MinioOptions Minio { get; set; } = new();
    public string EncryptionMasterKey { get; set; } = "";
}
