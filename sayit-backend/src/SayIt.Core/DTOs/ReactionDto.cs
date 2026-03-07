namespace SayIt.Core.DTOs;

public record ToggleReactionRequest(
    string TargetType,  // "thread" or "reply"
    Guid TargetId,
    string Emoji
);

public record ReactionResponse(
    Guid TargetId,
    string Emoji,
    int Count,
    bool UserReacted
);
