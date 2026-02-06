using ChorePlanner.Api.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

builder.Services.AddSingleton<ZmqWorkerClient>();
builder.Services.AddSingleton<JobQueueService>();
builder.Services.AddHostedService(provider => provider.GetRequiredService<JobQueueService>());

builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

builder.WebHost.UseUrls("http://localhost:5000");

var app = builder.Build();

app.UseCors();

app.MapControllers();

app.Run();
