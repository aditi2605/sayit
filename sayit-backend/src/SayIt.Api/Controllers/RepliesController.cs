using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SayIt.Core.DTOs;
using SayIt.Core.Entities;
using SayIt.Core.Interfaces;

namespace SayIt.Api.Controllers;

[ApiController]
[Route("api/threads/{threadId:guid}/replies")]
public class RepliesController : ControllerBase
{
    private readonly IReplyRepository _replyRepo;
    private readonly IThreadRepository _threadRepo;

    public RepliesController(IReplyRepository replyRepo, IThreadRepository threadRepo)
    {
        _replyRepo = replyRepo;
        _threadRepo = threadRepo;
    }

    [HttpGet]
    public async Task<ActionResult<List<ReplyResponse>>> GetReplies(Guid threadId)
    {
        var replies = await _replyRepo.GetByThreadIdAsync(threadId);

        return Ok(replies.Select(r => new ReplyResponse(
            Id: r.Id,
            Body: r.Body,
            AuthorName: r.Author.AnonymousName,
            AuthorAvatar: r.Author.AvatarIndex,
            ParentReplyId: r.ParentReplyId,
            Reactions: System.Text.Json.JsonSerializer.Deserialize<Dictionary<string, int>>(r.ReactionCount) ?? new(),
            CreatedAt: r.CreatedAt
        )).ToList());
    }

    [Authorize]
    [HttpPost]
    public async Task<ActionResult<ReplyResponse>> CreateReply(Guid threadId, [FromBody] CreateReplyRequest request)
    {
        var thread = await _threadRepo.GetByIdAsync(threadId);
        if (thread == null) return NotFound(new { error = "Thread not found" });

        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        var reply = new Reply
        {
            ThreadId = threadId,
            AuthorId = userId,
            ParentReplyId = request.ParentReplyId,
            Body = request.Body,
        };

        var created = await _replyRepo.CreateAsync(reply);
        await _threadRepo.IncrementReplyCountAsync(threadId);

        return CreatedAtAction(nameof(GetReplies), new { threadId }, new ReplyResponse(
            Id: created.Id,
            Body: created.Body,
            AuthorName: User.FindFirstValue("anon_name") ?? "anon",
            AuthorAvatar: short.Parse(User.FindFirstValue("avatar") ?? "0"),
            ParentReplyId: created.ParentReplyId,
            Reactions: new(),
            CreatedAt: created.CreatedAt
        ));
    }
}
