using SayIt.Api.Middleware;

namespace SayIt.Api;

public class RateLimitCleanupService : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        while (!stoppingToken.IsCancellationRequested)
        {
            // Clean up expired rate limit entries every 10 minutes
            RateLimitMiddleware.Cleanup();
            await Task.Delay(TimeSpan.FromMinutes(10), stoppingToken);
        }
    }
}
