using System.Security.Claims;
using System.Text.Json;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SayIt.Core.DTOs;
using SayIt.Core.Entities;
using SayIt.Core.Interfaces;

namespace SayIt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ReactionsController : ControllerBase
{
    private readonly IReactionRepository _reactionRepo;
    private readonly IThreadRepository _threadRepo;
    private readonly IReplyRepository _replyRepo;

    public ReactionsController(
        IReactionRepository reactionRepo,
        IThreadRepository threadRepo,
        IReplyRepository replyRepo)
    {
        _reactionRepo = reactionRepo;
        _threadRepo = threadRepo;
        _replyRepo = replyRepo;
    }

    [Authorize]
    [HttpPost("toggle")]
    public async Task<ActionResult<ReactionResponse>> ToggleReaction([FromBody] ToggleReactionRequest request)
    {
        var userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

        // Check if user already reacted
        var existing = await _reactionRepo.GetUserReactionAsync(
            userId, request.TargetType, request.TargetId, request.Emoji);

        bool userReacted;
        if (existing != null)
        {
            // Remove reaction (toggle off)
            await _reactionRepo.DeleteAsync(existing.Id);
            userReacted = false;
        }
        else
        {
            // Add reaction (toggle on)
            var reaction = new Reaction
            {
                UserId = userId,
                TargetType = request.TargetType,
                TargetId = request.TargetId,
                Emoji = request.Emoji,
            };
            await _reactionRepo.CreateAsync(reaction);
            userReacted = true;
        }

        // Get updated counts
        var counts = await _reactionRepo.GetCountsAsync(request.TargetType, request.TargetId);
        var countsJson = JsonSerializer.Serialize(counts);

        // Update denormalized count on thread/reply
        if (request.TargetType == "thread")
            await _threadRepo.UpdateReactionCountAsync(request.TargetId, countsJson);
        else
            await _replyRepo.UpdateReactionCountAsync(request.TargetId, countsJson);

        var emojiCount = counts.GetValueOrDefault(request.Emoji, 0);

        return Ok(new ReactionResponse(
            TargetId: request.TargetId,
            Emoji: request.Emoji,
            Count: emojiCount,
            UserReacted: userReacted
        ));
    }
}
