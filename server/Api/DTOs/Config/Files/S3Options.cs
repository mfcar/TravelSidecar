namespace Api.DTOs.Config.Files;

public class S3Options
{
    public string Region { get; set; } = "us-east-1";
    public string AccessKey { get; set; } = "";
    public string SecretKey { get; set; } = "";
}
