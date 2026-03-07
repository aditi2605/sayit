namespace SayIt.Core.DTOs;

public record CreateThreadRequest(
    string Title,
    string Body,
    Guid ChannelId,
    int? AutoDeleteHours = null
);

public record ThreadResponse(
    Guid Id,
    string Title,
    string Body,
    string AuthorName,
    short AuthorAvatar,
    string ChannelSlug,
    string ChannelEmoji,
    int ReplyCount,
    Dictionary<string, int> Reactions,
    DateTime CreatedAt
);

public record ThreadListResponse(
    List<ThreadResponse> Threads,
    int TotalCount,
    int Page,
    int PageSize
);
