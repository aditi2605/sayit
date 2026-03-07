using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace SayIt.Core.Entities;

[Table("channels")]
public class Channel
{
    [Key]
    [Column("id")]
    public Guid Id { get; set; } = Guid.NewGuid();

    [Column("slug")]
    [MaxLength(50)]
    public string Slug { get; set; } = string.Empty;

    [Column("name")]
    [MaxLength(100)]
    public string Name { get; set; } = string.Empty;

    [Column("emoji")]
    [MaxLength(10)]
    public string Emoji { get; set; } = string.Empty;

    [Column("thread_count")]
    public int ThreadCount { get; set; } = 0;

    // Navigation
    public ICollection<Thread> Threads { get; set; } = new List<Thread>();
}
