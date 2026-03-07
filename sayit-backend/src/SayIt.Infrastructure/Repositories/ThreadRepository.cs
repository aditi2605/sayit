using Microsoft.EntityFrameworkCore;
using SayIt.Core.Entities;
using SayIt.Core.Interfaces;
using SayIt.Infrastructure.Data;

namespace SayIt.Infrastructure.Repositories;

public class ThreadRepository : IThreadRepository
{
    private readonly AppDbContext _db;

    public ThreadRepository(AppDbContext db) => _db = db;

    public async Task<Core.Entities.Thread?> GetByIdAsync(Guid id)
    {
        return await _db.Threads
            .Include(t => t.Author)
            .Include(t => t.Channel)
            .Include(t => t.Replies.OrderBy(r => r.CreatedAt))
                .ThenInclude(r => r.Author)
            .FirstOrDefaultAsync(t => t.Id == id);
    }

    public async Task<(List<Core.Entities.Thread> Threads, int TotalCount)> GetByChannelAsync(
        Guid? channelId, int page, int pageSize, string sort = "recent")
    {
        var query = _db.Threads
            .Include(t => t.Author)
            .Include(t => t.Channel)
            .AsQueryable();

        if (channelId.HasValue)
            query = query.Where(t => t.ChannelId == channelId.Value);

        var totalCount = await query.CountAsync();

        query = sort switch
        {
            "hot" => query.OrderByDescending(t => t.ReplyCount),
            "top" => query.OrderByDescending(t => t.ReactionCount),
            _ => query.OrderByDescending(t => t.CreatedAt),
        };

        var threads = await query
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync();

        return (threads, totalCount);
    }

    public async Task<Core.Entities.Thread> CreateAsync(Core.Entities.Thread thread)
    {
        _db.Threads.Add(thread);
        await _db.SaveChangesAsync();
        return thread;
    }

    public async Task DeleteAsync(Guid id)
    {
        var thread = await _db.Threads.FindAsync(id);
        if (thread != null)
        {
            _db.Threads.Remove(thread);
            await _db.SaveChangesAsync();
        }
    }

    public async Task IncrementReplyCountAsync(Guid threadId)
    {
        await _db.Threads
            .Where(t => t.Id == threadId)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.ReplyCount, t => t.ReplyCount + 1));
    }

    public async Task UpdateReactionCountAsync(Guid threadId, string reactionJson)
    {
        await _db.Threads
            .Where(t => t.Id == threadId)
            .ExecuteUpdateAsync(s => s.SetProperty(t => t.ReactionCount, reactionJson));
    }
}
