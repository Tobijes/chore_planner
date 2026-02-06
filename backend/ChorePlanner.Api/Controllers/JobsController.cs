using ChorePlanner.Api.Models;
using ChorePlanner.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace ChorePlanner.Api.Controllers;

[ApiController]
[Route("api/jobs")]
public class JobsController : ControllerBase
{
    private readonly JobQueueService _jobQueue;

    public JobsController(JobQueueService jobQueue)
    {
        _jobQueue = jobQueue;
    }

    [HttpPost]
    public IActionResult SubmitJob([FromBody] SubmitJobRequest request)
    {
        var jobId = _jobQueue.EnqueueJob(request);
        return Ok(new { jobId });
    }

    [HttpGet("{id:guid}/events")]
    public async Task GetEvents(Guid id, CancellationToken cancellationToken)
    {
        var job = _jobQueue.GetJob(id);
        if (job is null)
        {
            Response.StatusCode = 404;
            return;
        }

        Response.Headers.ContentType = "text/event-stream";
        Response.Headers.CacheControl = "no-cache";
        Response.Headers.Connection = "keep-alive";

        async Task WriteSseEvent(JobStatus status)
        {
            var line = $"data: {status}\n\n";
            await Response.WriteAsync(line, cancellationToken);
            await Response.Body.FlushAsync(cancellationToken);
        }

        // Send current status immediately
        await WriteSseEvent(job.Status);

        if (job.Status is JobStatus.Done or JobStatus.Failed)
        {
            return;
        }

        var tcs = new TaskCompletionSource(TaskCreationOptions.RunContinuationsAsynchronously);

        cancellationToken.Register(() => tcs.TrySetCanceled());

        _jobQueue.RegisterListener(id, async status =>
        {
            try
            {
                await WriteSseEvent(status);

                if (status is JobStatus.Done or JobStatus.Failed)
                {
                    tcs.TrySetResult();
                }
            }
            catch
            {
                tcs.TrySetResult();
            }
        });

        try
        {
            await tcs.Task;
        }
        catch (TaskCanceledException)
        {
            // Client disconnected
        }
    }

    [HttpGet("{id:guid}/result")]
    public IActionResult GetResult(Guid id)
    {
        var job = _jobQueue.GetJob(id);
        if (job is null)
        {
            return NotFound();
        }

        if (job.Status != JobStatus.Done)
        {
            return BadRequest(new { error = "Job is not done yet", status = job.Status.ToString() });
        }

        return Ok(job.Result);
    }

    [HttpDelete("{id:guid}")]
    public IActionResult DeleteJob(Guid id)
    {
        var removed = _jobQueue.RemoveJob(id);
        if (!removed)
        {
            return NotFound();
        }

        return NoContent();
    }
}
