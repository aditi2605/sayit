using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SayIt.Core.Entities;

[Table("users")]
public class User
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("email_hash")]
    [MaxLength(128)]
    public string EmailHash { get; set; } = string.Empty;

    [Column("password_hash")]
    [MaxLength(256)]
    public string? PasswordHash { get; set; }

    [Column("anonymous_name")]
    [MaxLength(50)]
    public string AnonymousName { get; set; } = string.Empty;

    [Column("avatar_index")]
    public short AvatarIndex { get; set; }

    [Column("auth_provider")]
    [MaxLength(20)]
    public string AuthProvider { get; set; } = "email";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("is_banned")]
    public bool IsBanned { get; set; } = false;

    // Navigation properties
    public ICollection<Thread> Threads { get; set; } = new List<Thread>();
    public ICollection<Reply> Replies { get; set; } = new List<Reply>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
}
