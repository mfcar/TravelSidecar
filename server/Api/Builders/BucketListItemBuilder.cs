using Api.Data.Entities;
using Api.Enums;
using NodaTime;
using NodaTime.Text;

namespace Api.Builders;

public class BucketListItemBuilder
{
    private readonly BucketListItem _bucketListItem;
    private readonly List<Tag> _tags = [];
    
    public BucketListItem Build() 
    {
        foreach (var tag in _tags)
        {
            _bucketListItem.Tags.Add(tag);
        }
        
        return _bucketListItem;
    }
    
    public BucketListItemBuilder(Guid userId, string name, string? description, BucketListItemType type)
    {
        _bucketListItem = new BucketListItem
        {
            UserId = userId,
            Name = name,
            Description = description,
            Type = type
        };
    }
    
    public BucketListItemBuilder WithTags(IEnumerable<Tag>? tags)
    {
        var tagsList = tags?.ToList() ?? [];
        _tags.AddRange(tagsList);
        return this;
    }
    
    public BucketListItemBuilder WithBucketListId(Guid? bucketListId)
    {
        _bucketListItem.BucketListId = bucketListId;
        return this;
    }
    
    public BucketListItemBuilder WithStartDate(LocalDate? startDate)
    {
        _bucketListItem.StartDate = startDate;
        return this;
    }
    
    public BucketListItemBuilder WithStartTime(string? timeString, string? timeZoneId)
    {
        if (string.IsNullOrEmpty(timeString))
        {
            return this;
        }

        var timeZone = !string.IsNullOrEmpty(timeZoneId)
            ? DateTimeZoneProviders.Tzdb[timeZoneId]
            : DateTimeZoneProviders.Tzdb.GetSystemDefault();

        _bucketListItem.StartDate ??= LocalDate.FromDateTime(DateTime.Today);
        
        var localTimePattern = LocalTimePattern.CreateWithInvariantCulture("HH:mm");
        if (localTimePattern.Parse(timeString).Success)
        {
            var localTime = localTimePattern.Parse(timeString).Value;
            var localDateTime = new LocalDateTime(_bucketListItem.StartDate.Value.Year, 
                _bucketListItem.StartDate.Value.Month,
                _bucketListItem.StartDate.Value.Day, 
                localTime.Hour, 
                localTime.Minute);
            
            _bucketListItem.StartTimeUtc = localDateTime.InZoneStrictly(timeZone).ToInstant();
            _bucketListItem.StartTimeZoneId = timeZoneId;
        }
        
        return this;
    }

    public BucketListItemBuilder WithEndDate(LocalDate? endDate)
    {
        _bucketListItem.EndDate = endDate;
        return this;
    }
    
    public BucketListItemBuilder WithEndTime(string? timeString, string? timeZoneId)
    {
        if (string.IsNullOrEmpty(timeString))
        {
            return this;
        }

        var timeZone = !string.IsNullOrEmpty(timeZoneId)
            ? DateTimeZoneProviders.Tzdb[timeZoneId]
            : DateTimeZoneProviders.Tzdb.GetSystemDefault();

        _bucketListItem.EndDate ??= LocalDate.FromDateTime(DateTime.Today);
        
        var localTimePattern = LocalTimePattern.CreateWithInvariantCulture("HH:mm");
        if (localTimePattern.Parse(timeString).Success)
        {
            var localTime = localTimePattern.Parse(timeString).Value;
            var localDateTime = new LocalDateTime(_bucketListItem.EndDate.Value.Year, 
                _bucketListItem.EndDate.Value.Month,
                _bucketListItem.EndDate.Value.Day, 
                localTime.Hour, 
                localTime.Minute);
            
            _bucketListItem.EndTimeUtc = localDateTime.InZoneStrictly(timeZone).ToInstant();
            _bucketListItem.EndTimeZoneId = timeZoneId;
        }
        
        return this;
    }
    
    public BucketListItemBuilder WithPrice(decimal? price, string? currencyCode)
    {
        if (price.HasValue && !string.IsNullOrEmpty(currencyCode))
        {
            _bucketListItem.OriginalPrice = price;
            _bucketListItem.OriginalCurrencyCode = currencyCode;
        }
        
        return this;
    }
}
