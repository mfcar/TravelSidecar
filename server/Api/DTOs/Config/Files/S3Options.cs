namespace Api.DTOs.Config.Files;

public class S3CompatibleOptions
{
    public string Endpoint { get; set; } = "";
    public string Region { get; set; } = "us-east-1";
    public string AccessKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
    public bool UseSSL { get; set; } = true;
    public bool ForcePathStyle { get; set; } = true;
}
