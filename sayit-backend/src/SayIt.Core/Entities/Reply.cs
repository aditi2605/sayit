using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SayIt.Core.Entities;

[Table("replies")]
public class Reply
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("thread_id")]
    public Guid ThreadId { get; set; }

    [Column("author_id")]
    public Guid AuthorId { get; set; }

    /// <summary>
    /// Null = top-level reply. Set = nested reply to another reply.
    /// </summary>
    [Column("parent_reply_id")]
    public Guid? ParentReplyId { get; set; }

    [Column("body")]
    public string Body { get; set; } = string.Empty;

    /// <summary>
    /// Stored as JSONB — e.g. {"💀": 12, "💯": 5}
    /// </summary>
    [Column("reaction_count", TypeName = "jsonb")]
    public string ReactionCount { get; set; } = "{}";

    [Column("created_at")]
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    // Navigation properties
    [ForeignKey("ThreadId")]
    public Thread Thread { get; set; } = null!;

    [ForeignKey("AuthorId")]
    public User Author { get; set; } = null!;

    [ForeignKey("ParentReplyId")]
    public Reply? ParentReply { get; set; }

    public ICollection<Reply> ChildReplies { get; set; } = new List<Reply>();
}
