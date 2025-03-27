using Api.Data.Entities;

namespace Api.Builders;

public class JourneyCategoryBuilder(Guid userId, string name)
{
    private readonly JourneyCategory _journeyCategory = new()
    {
        UserId = userId,
        Name = name.Trim()
    };
    public JourneyCategory Build() => _journeyCategory;
    
    public JourneyCategoryBuilder WithDescription(string? description)
    {
        _journeyCategory.Description = description?.Trim();
        return this;
    }
}
