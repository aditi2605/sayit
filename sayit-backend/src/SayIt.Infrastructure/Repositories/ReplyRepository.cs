using Microsoft.EntityFrameworkCore;
using SayIt.Core.Entities;
using SayIt.Core.Interfaces;
using SayIt.Infrastructure.Data;

namespace SayIt.Infrastructure.Repositories;

public class ReplyRepository : IReplyRepository
{
    private readonly AppDbContext _db;

    public ReplyRepository(AppDbContext db) => _db = db;

    public async Task<List<Reply>> GetByThreadIdAsync(Guid threadId)
    {
        return await _db.Replies
            .Include(r => r.Author)
            .Where(r => r.ThreadId == threadId)
            .OrderBy(r => r.CreatedAt)
            .ToListAsync();
    }

    public async Task<Reply> CreateAsync(Reply reply)
    {
        _db.Replies.Add(reply);
        await _db.SaveChangesAsync();
        return reply;
    }

    public async Task UpdateReactionCountAsync(Guid replyId, string reactionJson)
    {
        await _db.Replies
            .Where(r => r.Id == replyId)
            .ExecuteUpdateAsync(s => s.SetProperty(r => r.ReactionCount, reactionJson));
    }
}

public class ReactionRepository : IReactionRepository
{
    private readonly AppDbContext _db;

    public ReactionRepository(AppDbContext db) => _db = db;

    public async Task<Reaction?> GetUserReactionAsync(Guid userId, string targetType, Guid targetId, string emoji)
    {
        return await _db.Reactions.FirstOrDefaultAsync(r =>
            r.UserId == userId &&
            r.TargetType == targetType &&
            r.TargetId == targetId &&
            r.Emoji == emoji);
    }

    public async Task<Reaction> CreateAsync(Reaction reaction)
    {
        _db.Reactions.Add(reaction);
        await _db.SaveChangesAsync();
        return reaction;
    }

    public async Task DeleteAsync(Guid id)
    {
        var reaction = await _db.Reactions.FindAsync(id);
        if (reaction != null)
        {
            _db.Reactions.Remove(reaction);
            await _db.SaveChangesAsync();
        }
    }

    public async Task<Dictionary<string, int>> GetCountsAsync(string targetType, Guid targetId)
    {
        return await _db.Reactions
            .Where(r => r.TargetType == targetType && r.TargetId == targetId)
            .GroupBy(r => r.Emoji)
            .ToDictionaryAsync(g => g.Key, g => g.Count());
    }
}

public class ChannelRepository : IChannelRepository
{
    private readonly AppDbContext _db;

    public ChannelRepository(AppDbContext db) => _db = db;

    public async Task<List<Channel>> GetAllAsync()
    {
        return await _db.Channels.OrderBy(c => c.Name).ToListAsync();
    }

    public async Task<Channel?> GetBySlugAsync(string slug)
    {
        return await _db.Channels.FirstOrDefaultAsync(c => c.Slug == slug);
    }

    public async Task IncrementThreadCountAsync(Guid channelId)
    {
        await _db.Channels
            .Where(c => c.Id == channelId)
            .ExecuteUpdateAsync(s => s.SetProperty(c => c.ThreadCount, c => c.ThreadCount + 1));
    }
}
