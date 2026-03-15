FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY TaskPlan.Api/TaskPlan.Api.csproj TaskPlan.Api/
RUN dotnet restore TaskPlan.Api/TaskPlan.Api.csproj

COPY TaskPlan.Api/ TaskPlan.Api/
RUN dotnet publish TaskPlan.Api/TaskPlan.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

## Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

ENV PORT=80
EXPOSE 80

ENTRYPOINT ["dotnet", "TaskPlan.Api.dll"]
