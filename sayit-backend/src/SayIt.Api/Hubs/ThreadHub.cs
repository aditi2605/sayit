using Microsoft.AspNetCore.SignalR;

namespace SayIt.Api.Hubs;

public class ThreadHub : Hub
{
    /// <summary>
    /// Client joins a thread room to receive real-time replies
    /// </summary>
    public async Task JoinThread(string threadId)
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, $"thread_{threadId}");
    }

    /// <summary>
    /// Client leaves a thread room
    /// </summary>
    public async Task LeaveThread(string threadId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, $"thread_{threadId}");
    }

    /// <summary>
    /// Join the main feed to receive new thread notifications
    /// </summary>
    public async Task JoinFeed()
    {
        await Groups.AddToGroupAsync(Context.ConnectionId, "feed");
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        await base.OnDisconnectedAsync(exception);
    }
}
