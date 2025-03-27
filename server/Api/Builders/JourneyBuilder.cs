using Api.Data.Entities;
using NodaTime;

namespace Api.Builders;

public class JourneyBuilder(Guid userId, string title)
{
    private readonly List<Tag> _tags = [];
    
    private readonly Journey _journey = new()
    {
        UserId = userId,
        Name = title
    };

    public Journey Build()
    {
        foreach (var tag in _tags)
        {
            _journey.Tags.Add(tag);
        }
        
        return _journey;
    }

    public JourneyBuilder WithDescription(string? description)
    {
        _journey.Description = description?.Trim();
        return this;
    }

    public JourneyBuilder WithStartDate(LocalDate? startDate)
    {
        _journey.StartDate = startDate;
        return this;
    }

    public JourneyBuilder WithEndDate(LocalDate? endDate)
    {
        if (endDate.HasValue && !_journey.StartDate.HasValue)
        {
            throw new InvalidOperationException("StartDate must be set before setting EndDate.");
        }
        _journey.EndDate = endDate;
        return this;
    }

    public JourneyBuilder WithCategory(Guid? categoryId)
    {
        _journey.JourneyCategoryId = categoryId;
        return this;
    }
    
    public JourneyBuilder WithTags(IEnumerable<Tag>? tags)
    {
        var tagsList = tags?.ToList() ?? [];
        _tags.AddRange(tagsList);
        return this;
    }
}
