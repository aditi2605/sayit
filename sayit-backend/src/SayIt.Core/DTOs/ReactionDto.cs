namespace SayIt.Core.DTOs;

public record ToggleReactionRequest(
    string TargetType, 
    Guid TargetId,
    string Emoji
);

public record ReactionResponse(
    Guid TargetId,
    string Emoji,
    int Count,
    bool UserReacted
);
