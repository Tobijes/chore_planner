FROM mcr.microsoft.com/dotnet/sdk:10.0 AS build
WORKDIR /src

COPY ChorePlanner.Api/ChorePlanner.Api.csproj ChorePlanner.Api/
RUN dotnet restore ChorePlanner.Api/ChorePlanner.Api.csproj

COPY ChorePlanner.Api/ ChorePlanner.Api/
RUN dotnet publish ChorePlanner.Api/ChorePlanner.Api.csproj -c Release -o /app/publish

FROM mcr.microsoft.com/dotnet/aspnet:10.0

## Install curl for health check
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=build /app/publish .

ENV PORT=80
EXPOSE 80

ENTRYPOINT ["dotnet", "ChorePlanner.Api.dll"]
