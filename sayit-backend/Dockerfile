FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src

# Copy solution and project files
COPY SayIt.sln ./
COPY src/SayIt.Api/SayIt.Api.csproj src/SayIt.Api/
COPY src/SayIt.Core/SayIt.Core.csproj src/SayIt.Core/
COPY src/SayIt.Infrastructure/SayIt.Infrastructure.csproj src/SayIt.Infrastructure/

# Restore
# RUN dotnet restore
RUN dotnet restore src/SayIt.Api/SayIt.Api.csproj

# Copy everything else
COPY src/ src/

# Build
RUN dotnet publish src/SayIt.Api/SayIt.Api.csproj -c Release -o /app

# Runtime image (slim)
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app
COPY --from=build /app .

# Render sets PORT env var
ENV ASPNETCORE_ENVIRONMENT=Production
ENV ASPNETCORE_URLS=http://+:8080
EXPOSE 8080

ENTRYPOINT ["dotnet", "SayIt.Api.dll"]
