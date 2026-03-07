using SayIt.Core.Entities;

namespace SayIt.Core.Interfaces;

public interface IThreadRepository
{
    Task<Entities.Thread?> GetByIdAsync(Guid id);
    Task<(List<Entities.Thread> Threads, int TotalCount)> GetByChannelAsync(
        Guid? channelId, int page, int pageSize, string sort = "recent");
    Task<Entities.Thread> CreateAsync(Entities.Thread thread);
    Task DeleteAsync(Guid id);
    Task IncrementReplyCountAsync(Guid threadId);
    Task UpdateReactionCountAsync(Guid threadId, string reactionJson);
}

public interface IReplyRepository
{
    Task<List<Reply>> GetByThreadIdAsync(Guid threadId);
    Task<Reply> CreateAsync(Reply reply);
    Task UpdateReactionCountAsync(Guid replyId, string reactionJson);
}

public interface IReactionRepository
{
    Task<Reaction?> GetUserReactionAsync(Guid userId, string targetType, Guid targetId, string emoji);
    Task<Reaction> CreateAsync(Reaction reaction);
    Task DeleteAsync(Guid id);
    Task<Dictionary<string, int>> GetCountsAsync(string targetType, Guid targetId);
}

public interface IChannelRepository
{
    Task<List<Channel>> GetAllAsync();
    Task<Channel?> GetBySlugAsync(string slug);
    Task IncrementThreadCountAsync(Guid channelId);
}