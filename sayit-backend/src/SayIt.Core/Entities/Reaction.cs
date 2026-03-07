using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SayIt.Core.Entities;

[Table("reactions")]
public class Reaction
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("user_id")]
    public Guid UserId { get; set; }

    /// <summary>
    /// "thread" or "reply"
    /// </summary>
    [Column("target_type")]
    [MaxLength(10)]
    public string TargetType { get; set; } = string.Empty;

    [Column("target_id")]
    public Guid TargetId { get; set; }

    [Column("emoji")]
    [MaxLength(10)]
    public string Emoji { get; set; } = string.Empty;

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation
    [ForeignKey("UserId")]
    public User User { get; set; } = null!;
}
