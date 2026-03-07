using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SayIt.Core.Entities;

[Table("threads")]
public class Thread
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("author_id")]
    public Guid AuthorId { get; set; }

    [Column("channel_id")]
    public Guid ChannelId { get; set; }

    [Column("title")]
    [MaxLength(300)]
    public string Title { get; set; } = string.Empty;

    [Column("body")]
    public string Body { get; set; } = string.Empty;

    [Column("is_pinned")]
    public bool IsPinned { get; set; } = false;

    [Column("reply_count")]
    public int ReplyCount { get; set; } = 0;

    /// <summary>
    /// Stored as JSONB in PostgreSQL — e.g. {"🔥": 24, "🤔": 18}
    /// </summary>
    [Column("reaction_count", TypeName = "jsonb")]
    public string ReactionCount { get; set; } = "{}";

    [Column("auto_delete_at")]
    public DateTime? AutoDeleteAt { get; set; }

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    [Column("updated_at")]
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("AuthorId")]
    public User Author { get; set; } = null!;

    [ForeignKey("ChannelId")]
    public Channel Channel { get; set; } = null!;

    public ICollection<Reply> Replies { get; set; } = new List<Reply>();
    public ICollection<Reaction> Reactions { get; set; } = new List<Reaction>();
}
