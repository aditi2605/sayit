namespace SayIt.Core.DTOs;

public record CreateReplyRequest(
    string Body,
    Guid? ParentReplyId = null
);

public record ReplyResponse(
    Guid Id,
    string Body,
    string AuthorName,
    short AuthorAvatar,
    Guid? ParentReplyId,
    Dictionary<string, int> Reactions,
    DateTime CreatedAt
);
