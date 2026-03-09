using System.Collections.Concurrent;
using System.Net;
using System.Security.Claims;

namespace SayIt.Api.Middleware;

public class RateLimitMiddleware
{
    private readonly RequestDelegate _next;

    // Store: key → list of timestamps
    private static readonly ConcurrentDictionary<string, List<DateTime>> _requests = new();

    // Rate limit rules
    private static readonly Dictionary<string, RateRule> _rules = new()
    {
        // Auth endpoints: 5 attempts per hour
        { "POST:/api/auth/login", new RateRule(5, TimeSpan.FromHours(1)) },
        { "POST:/api/auth/register", new RateRule(5, TimeSpan.FromHours(1)) },

        // Thread creation: 5 per hour
        { "POST:/api/threads", new RateRule(5, TimeSpan.FromHours(1)) },

        // Replies: 15 per hour (more generous since discussions need flow)
        { "POST:/api/threads/*/replies", new RateRule(15, TimeSpan.FromHours(1)) },

        // Reactions: 30 per hour (quick actions, need more allowance)
        { "POST:/api/reactions/toggle", new RateRule(30, TimeSpan.FromHours(1)) },
    };

    public RateLimitMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task InvokeAsync(HttpContext context)
    {
        var method = context.Request.Method;
        var path = context.Request.Path.Value?.ToLowerInvariant() ?? "";

        // Find matching rule
        var rule = FindRule(method, path);
        if (rule == null)
        {
            await _next(context);
            return;
        }

        // Build rate limit key: IP for anonymous, UserId for authenticated
        var userId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var ip = context.Connection.RemoteIpAddress?.ToString() ?? "unknown";
        var key = $"{method}:{path}:{userId ?? ip}";

        // Check rate limit
        var now = DateTime.UtcNow;
        var timestamps = _requests.GetOrAdd(key, _ => new List<DateTime>());

        lock (timestamps)
        {
            // Remove expired entries
            timestamps.RemoveAll(t => now - t > rule.Window);

            if (timestamps.Count >= rule.MaxRequests)
            {
                // Rate limited!
                var oldestRequest = timestamps.Min();
                var retryAfter = (int)(rule.Window - (now - oldestRequest)).TotalSeconds;

                context.Response.StatusCode = (int)HttpStatusCode.TooManyRequests;
                context.Response.Headers["Retry-After"] = retryAfter.ToString();
                context.Response.Headers["X-RateLimit-Limit"] = rule.MaxRequests.ToString();
                context.Response.Headers["X-RateLimit-Remaining"] = "0";
                context.Response.Headers["X-RateLimit-Reset"] = retryAfter.ToString();
                context.Response.ContentType = "application/json";

                var message = path.Contains("/auth/")
                    ? $"Too many login attempts. Try again in {retryAfter / 60} minutes."
                    : $"Rate limit exceeded. Try again in {retryAfter / 60} minutes.";

                context.Response.WriteAsync($"{{\"error\":\"{message}\",\"retryAfterSeconds\":{retryAfter}}}");
                return;
            }

            // Add current request
            timestamps.Add(now);

            // Set response headers
            context.Response.Headers["X-RateLimit-Limit"] = rule.MaxRequests.ToString();
            context.Response.Headers["X-RateLimit-Remaining"] = (rule.MaxRequests - timestamps.Count).ToString();
        }

        await _next(context);
    }

    private static RateRule? FindRule(string method, string path)
    {
        // Exact match first
        var exactKey = $"{method}:{path}";
        if (_rules.TryGetValue(exactKey, out var exactRule))
            return exactRule;

        // Wildcard match (for paths like /api/threads/{id}/replies)
        foreach (var (pattern, rule) in _rules)
        {
            var parts = pattern.Split(':');
            if (parts[0] != method) continue;

            var patternPath = parts[1];
            if (patternPath.Contains('*'))
            {
                var regex = "^" + patternPath.Replace("*", "[^/]+") + "$";
                if (System.Text.RegularExpressions.Regex.IsMatch(path, regex))
                    return rule;
            }
        }

        return null;
    }

    // Cleanup old entries periodically (call from a background service or timer)
    public static void Cleanup()
    {
        var now = DateTime.UtcNow;
        var keysToRemove = new List<string>();

        foreach (var (key, timestamps) in _requests)
        {
            lock (timestamps)
            {
                timestamps.RemoveAll(t => now - t > TimeSpan.FromHours(2));
                if (timestamps.Count == 0)
                    keysToRemove.Add(key);
            }
        }

        foreach (var key in keysToRemove)
            _requests.TryRemove(key, out _);
    }
}

public record RateRule(int MaxRequests, TimeSpan Window);
