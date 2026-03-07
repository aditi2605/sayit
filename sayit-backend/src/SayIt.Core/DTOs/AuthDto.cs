namespace SayIt.Core.DTOs;

public record RegisterRequest(string Email, string Password);

public record LoginRequest(string Email, string Password);

public record AuthResponse(
    string Token,
    string RefreshToken,
    DateTime ExpiresAt,
    UserInfo User
);

public record UserInfo(
    Guid Id,
    string AnonymousName,
    short AvatarIndex,
    string AuthProvider
);

public record RefreshTokenRequest(string RefreshToken);
