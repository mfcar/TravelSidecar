namespace Api.DTOs.Config.Files;

public class MinioOptions
{
    public string Endpoint { get; set; } = "localhost:9000";
    public string AccessKey { get; set; } = "minio";
    public string SecretKey { get; set; } = "minio123";
    public bool UseSSL { get; set; } = false;
}
