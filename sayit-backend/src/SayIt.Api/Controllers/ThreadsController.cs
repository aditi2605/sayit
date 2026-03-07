using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SayIt.Core.DTOs;
using SayIt.Core.Interfaces;

namespace SayIt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ThreadsController : ControllerBase
{
    private readonly IThreadRepository _threadRepo;
    private readonly IChannelRepository _channelRepo;

    public ThreadsController(IThreadRepository threadRepo, IChannelRepository channelRepo)
    {
        _threadRepo = threadRepo;
        _channelRepo = channelRepo;
    }

    [HttpGet]
    public async Task<ActionResult<ThreadListResponse>> GetThreads(
        [FromQuery] string? channel = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string sort = "recent")
    {
        Guid? channelId = null;
        if (!string.IsNullOrEmpty(channel))
        {
            var ch = await _channelRepo.GetBySlugAsync(channel);
            if (ch == null) return NotFound(new { error = "Channel not found" });
            channelId = ch.Id;
        }

        var (threads, totalCount) = await _threadRepo.GetByChannelAsync(channelId, page, pageSize, sort);

        var response = new ThreadListResponse(
            Threads: threads.Select(t => new ThreadResponse(
                Id: t.Id,
                Title: t.Title,
                Body: t.Body,
                AuthorName: t.Author.AnonymousName,
                AuthorAvatar: t.Author.AvatarIndex,
                ChannelSlug: t.Channel.Slug,
                ChannelEmoji: t.Channel.Emoji,
                ReplyCount: t.ReplyCount,
                Reactions: JsonSerializer.Deserialize<Dictionary<string, int>>(t.ReactionCount) ?? new(),
                CreatedAt: t.CreatedAt
            )).ToList(),
            TotalCount: totalCount,
            Page: page,
            PageSize: pageSize
        );

        return Ok(response);
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ThreadResponse>> GetThread(Guid id)
    {
        var thread = await _threadRepo.GetByIdAsync(id);
        if (thread == null) return NotFound();

        return Ok(new ThreadResponse(
            Id: thread.Id,
            Title: thread.Title,
            Body: thread.Body,
            AuthorName: thread.Author.AnonymousName,
            AuthorAvatar: thread.Author.AvatarIndex,
            ChannelSlug: thread.Channel.Slug,
            ChannelEmoji: thread.Channel.Emoji,
            ReplyCount: thread.ReplyCount,
            Reactions: JsonSerializer.Deserialize<Dictionary<string, int>>(thread.ReactionCount) ?? new(),
            CreatedAt: thread.CreatedAt
        ));
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ThreadResponse>> CreateThread([FromBody] CreateThreadRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var thread = new Core.Entities.Thread
        {
            AuthorId = userId,
            ChannelId = request.ChannelId,
            Title = request.Title,
            Body = request.Body,
            AutoDeleteAt = request.AutoDeleteHours.HasValue
                ? DateTime.UtcNow.AddHours(request.AutoDeleteHours.Value)
                : null
        };

        var created = await _threadRepo.CreateAsync(thread);
        await _channelRepo.IncrementThreadCountAsync(request.ChannelId);

        // Reload with includes
        var full = await _threadRepo.GetByIdAsync(created.Id);

        return CreatedAtAction(nameof(GetThread), new { id = created.Id }, new ThreadResponse(
            Id: full!.Id,
            Title: full.Title,
            Body: full.Body,
            AuthorName: full.Author.AnonymousName,
            AuthorAvatar: full.Author.AvatarIndex,
            ChannelSlug: full.Channel.Slug,
            ChannelEmoji: full.Channel.Emoji,
            ReplyCount: 0,
            Reactions: new(),
            CreatedAt: full.CreatedAt
        ));
    }

    [Authorize]
    [HttpDelete("{id:guid}")]
    public async Task<ActionResult> DeleteThread(Guid id)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
        var thread = await _threadRepo.GetByIdAsync(id);

        if (thread == null) return NotFound();
        if (thread.AuthorId != userId) return Forbid();

        await _threadRepo.DeleteAsync(id);
        return NoContent();
    }
}
