using Microsoft.EntityFrameworkCore;
using SayIt.Core.Entities;

namespace SayIt.Infrastructure.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

    public DbSet<User> Users => Set<User>();
    public DbSet<Core.Entities.Thread> Threads => Set<Core.Entities.Thread>();
    public DbSet<Reply> Replies => Set<Reply>();
    public DbSet<Reaction> Reactions => Set<Reaction>();
    public DbSet<Channel> Channels => Set<Channel>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // ─── User ───
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(e => e.EmailHash).IsUnique();
        });

        // ─── Thread ───
        modelBuilder.Entity<Core.Entities.Thread>(entity =>
        {
            entity.HasIndex(e => new { e.ChannelId, e.CreatedAt })
                  .IsDescending(false, true)
                  .HasDatabaseName("idx_threads_channel_created");

            entity.HasIndex(e => e.CreatedAt)
                  .IsDescending(true)
                  .HasDatabaseName("idx_threads_created");

            entity.HasIndex(e => e.AutoDeleteAt)
                  .HasFilter("auto_delete_at IS NOT NULL")
                  .HasDatabaseName("idx_threads_auto_delete");

            entity.HasOne(e => e.Author)
                  .WithMany(u => u.Threads)
                  .HasForeignKey(e => e.AuthorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Channel)
                  .WithMany(c => c.Threads)
                  .HasForeignKey(e => e.ChannelId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── Reply ───
        modelBuilder.Entity<Reply>(entity =>
        {
            entity.HasIndex(e => new { e.ThreadId, e.CreatedAt })
                  .HasDatabaseName("idx_replies_thread");

            entity.HasOne(e => e.Thread)
                  .WithMany(t => t.Replies)
                  .HasForeignKey(e => e.ThreadId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.Author)
                  .WithMany(u => u.Replies)
                  .HasForeignKey(e => e.AuthorId)
                  .OnDelete(DeleteBehavior.Cascade);

            entity.HasOne(e => e.ParentReply)
                  .WithMany(r => r.ChildReplies)
                  .HasForeignKey(e => e.ParentReplyId)
                  .OnDelete(DeleteBehavior.Restrict);
        });

        // ─── Reaction ───
        modelBuilder.Entity<Reaction>(entity =>
        {
            entity.HasIndex(e => new { e.TargetType, e.TargetId })
                  .HasDatabaseName("idx_reactions_target");

            // One reaction per user per target per emoji
            entity.HasIndex(e => new { e.UserId, e.TargetType, e.TargetId, e.Emoji })
                  .IsUnique()
                  .HasDatabaseName("idx_reactions_unique");

            entity.HasOne(e => e.User)
                  .WithMany(u => u.Reactions)
                  .HasForeignKey(e => e.UserId)
                  .OnDelete(DeleteBehavior.Cascade);
        });

        // Channel
        modelBuilder.Entity<Channel>(entity =>
        {
            entity.HasIndex(e => e.Slug).IsUnique();
        });

        //Seed default channels
        SeedChannels(modelBuilder);
    }

    private static void SeedChannels(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Channel>().HasData(
            new Channel { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000001"), Slug = "hot-takes", Name = "Hot Takes", Emoji = "🔥" },
            new Channel { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000002"), Slug = "confessions", Name = "Confessions", Emoji = "🫣" },
            new Channel { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000003"), Slug = "rants", Name = "Rants", Emoji = "💢" },
            new Channel { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000004"), Slug = "advice", Name = "Advice", Emoji = "🧠" },
            new Channel { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000005"), Slug = "dreams", Name = "Dreams", Emoji = "✨" },
            new Channel { Id = Guid.Parse("a1b2c3d4-0001-0001-0001-000000000006"), Slug = "spill-the-tea", Name = "Spill the Tea", Emoji = "🍵" }
        );
    }
}
