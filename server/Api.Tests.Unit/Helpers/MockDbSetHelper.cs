using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Query;
using NSubstitute;
using System.Linq.Expressions;

namespace Api.Tests.Unit.Helpers;

public static class MockDbSetHelper
{
    public static DbSet<T> CreateMockDbSet<T>(List<T> data) where T : class
    {
        var queryable = data.AsQueryable();
        var mockDbSet = Substitute.For<DbSet<T>, IQueryable<T>, IAsyncEnumerable<T>>();
        
        // Setup IQueryable
        ((IQueryable<T>)mockDbSet).Provider.Returns(new TestAsyncQueryProvider<T>(queryable.Provider));
        ((IQueryable<T>)mockDbSet).Expression.Returns(queryable.Expression);
        ((IQueryable<T>)mockDbSet).ElementType.Returns(queryable.ElementType);
        ((IQueryable<T>)mockDbSet).GetEnumerator().Returns(queryable.GetEnumerator());
        
        // Setup async enumeration
        ((IAsyncEnumerable<T>)mockDbSet).GetAsyncEnumerator(Arg.Any<CancellationToken>())
            .Returns(new TestAsyncEnumerator<T>(data.GetEnumerator()));
        
        return mockDbSet;
    }
}

// Helper classes for async operations
internal class TestAsyncQueryProvider<T> : IAsyncQueryProvider
{
    private readonly IQueryProvider _inner;

    public TestAsyncQueryProvider(IQueryProvider inner) => _inner = inner;

    public IQueryable CreateQuery(Expression expression)
        => new TestAsyncEnumerable<T>(expression);

    public IQueryable<TElement> CreateQuery<TElement>(Expression expression)
        => new TestAsyncEnumerable<TElement>(expression);

    public object Execute(Expression expression) => _inner.Execute(expression)!;

    public TResult Execute<TResult>(Expression expression) => _inner.Execute<TResult>(expression);

    public TResult ExecuteAsync<TResult>(Expression expression, CancellationToken cancellationToken)
    {
        var expectedResultType = typeof(TResult).GetGenericArguments()[0];
        var executionResult = Execute(expression);

        return (TResult)(typeof(Task).GetMethod(nameof(Task.FromResult))!
            .MakeGenericMethod(expectedResultType)
            .Invoke(null, [executionResult])!);
    }
}

internal class TestAsyncEnumerable<T> : EnumerableQuery<T>, IAsyncEnumerable<T>, IQueryable<T>
{
    public TestAsyncEnumerable(Expression expression) : base(expression) { }

    public IAsyncEnumerator<T> GetAsyncEnumerator(CancellationToken cancellationToken = default)
        => new TestAsyncEnumerator<T>(this.AsEnumerable().GetEnumerator());
}

internal class TestAsyncEnumerator<T> : IAsyncEnumerator<T>
{
    private readonly IEnumerator<T> _enumerator;

    public TestAsyncEnumerator(IEnumerator<T> enumerator) => _enumerator = enumerator;

    public T Current => _enumerator.Current;

    public ValueTask DisposeAsync() 
    {
        _enumerator.Dispose();
        return ValueTask.CompletedTask;
    }

    public ValueTask<bool> MoveNextAsync() 
        => ValueTask.FromResult(_enumerator.MoveNext());
}
