using Microsoft.AspNetCore.Mvc;
using SayIt.Core.Interfaces;

namespace SayIt.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class ChannelsController : ControllerBase
{
    private readonly IChannelRepository _channelRepo;

    public ChannelsController(IChannelRepository channelRepo) => _channelRepo = channelRepo;

    [HttpGet]
    public async Task<ActionResult> GetChannels()
    {
        var channels = await _channelRepo.GetAllAsync();
        return Ok(channels.Select(c => new
        {
            c.Id,
            c.Slug,
            c.Name,
            c.Emoji,
            c.ThreadCount
        }));
    }
}
