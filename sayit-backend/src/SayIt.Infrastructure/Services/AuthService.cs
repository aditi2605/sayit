using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using SayIt.Core.DTOs;
using SayIt.Core.Entities;
using SayIt.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace SayIt.Infrastructure.Services;

public class AuthService
{
    private readonly AppDbContext _db;
    private readonly IConfiguration _config;

    // Animal-based anonymous names
    private static readonly string[] Animals = [
        "fox", "owl", "wolf", "bear", "hawk", "lynx", "crow", "deer",
        "dove", "frog", "moth", "newt", "puma", "seal", "swan", "toad",
        "vole", "wren", "boar", "crab", "duck", "goat", "hare", "ibis",
        "kiwi", "lark", "mink", "orca", "pike", "quail", "rook", "slug",
        "tern", "wasp", "yak", "bat", "eel", "fly", "gnu", "hen",
        "jay", "koi", "asp", "ape", "bug", "cat", "dog", "elk",
        "emu", "ram", "rat", "ray", "ant", "bee", "cod", "dab"
    ];

    public AuthService(AppDbContext db, IConfiguration config)
    {
        _db = db;
        _config = config;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest request)
    {
        // Hash email for privacy 
        var emailHash = HashEmail(request.Email);

        // Check if user already exists
        var existing = await _db.Users.FirstOrDefaultAsync(u => u.EmailHash == emailHash);
        if (existing != null)
            throw new InvalidOperationException("Account already exists");

        // Generate anonymous identity
        var rng = new Random();
        var anonName = $"anon_{Animals[rng.Next(Animals.Length)]}_{rng.Next(100, 999)}";
        var avatarIndex = (short)rng.Next(0, 12);

        var user = new User
        {
            EmailHash = emailHash,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password, workFactor: 12),
            AnonymousName = anonName,
            AvatarIndex = avatarIndex,
            AuthProvider = "email"
        };

        _db.Users.Add(user);
        await _db.SaveChangesAsync();

        return GenerateAuthResponse(user);
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request)
    {
        var emailHash = HashEmail(request.Email);
        var user = await _db.Users.FirstOrDefaultAsync(u => u.EmailHash == emailHash);

        if (user == null || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
            throw new UnauthorizedAccessException("Invalid email or password");

        if (user.IsBanned)
            throw new UnauthorizedAccessException("Account is banned");

        return GenerateAuthResponse(user);
    }

    private AuthResponse GenerateAuthResponse(User user)
    {
        var token = GenerateJwtToken(user);
        var refreshToken = GenerateRefreshToken();
        var expiresAt = DateTime.UtcNow.AddMinutes(15);

        return new AuthResponse(
            Token: token,
            RefreshToken: refreshToken,
            ExpiresAt: expiresAt,
            User: new UserInfo(
                Id: user.Id,
                AnonymousName: user.AnonymousName,
                AvatarIndex: user.AvatarIndex,
                AuthProvider: user.AuthProvider
            )
        );
    }

    private string GenerateJwtToken(User user)
    {
        var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET");

        if (string.IsNullOrEmpty(jwtSecret))
            throw new Exception("JWT_SECRET not configured");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim("anon_name", user.AnonymousName),
            new Claim("avatar", user.AvatarIndex.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: "sayit-api",
            audience: "sayit-web",
            claims: claims,
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // private string GenerateJwtToken(User user)
    // {
    //     var key = new SymmetricSecurityKey(
    //         Encoding.UTF8.GetBytes(_config["Jwt:Secret"] ?? "dev-secret-key-change-in-production-min-32-chars!!")
    //     );

    //     var claims = new[]
    //     {
    //         new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
    //         new Claim("anon_name", user.AnonymousName),
    //         new Claim("avatar", user.AvatarIndex.ToString()),
    //     };

    //     var token = new JwtSecurityToken(
    //         issuer: _config["Jwt:Issuer"] ?? "sayit-api",
    //         audience: _config["Jwt:Audience"] ?? "sayit-web",
    //         claims: claims,
    //         expires: DateTime.UtcNow.AddMinutes(15),
    //         signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256)
    //     );

    //     return new JwtSecurityTokenHandler().WriteToken(token);
    // }

    private static string GenerateRefreshToken()
    {
        var bytes = new byte[64];
        using var rng = RandomNumberGenerator.Create();
        rng.GetBytes(bytes);
        return Convert.ToBase64String(bytes);
    }

    private static string HashEmail(string email)
    {
        var bytes = SHA256.HashData(Encoding.UTF8.GetBytes(email.ToLowerInvariant().Trim()));
        return Convert.ToHexString(bytes).ToLowerInvariant();
    }
}
