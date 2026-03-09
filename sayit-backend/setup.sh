set -e  # Exit on any error

echo ""
echo "SayIt "
echo ""
echo ""

# Check prerequisites
echo " Checking prerequisites..."

if ! command -v dotnet &> /dev/null; then
    echo " dotnet not found. Install with: brew install dotnet@8"
    exit 1
fi
echo "   dotnet $(dotnet --version)"

if ! command -v git &> /dev/null; then
    echo "git not found."
    exit 1
fi
echo "  git $(git --version | awk '{print $3}')"

if ! command -v docker &> /dev/null; then
    echo " docker not found — you'll need it for local Postgres/Redis"
fi

echo ""

# Create solution 
echo "Creating .NET solution..."
dotnet new sln -n SayIt --force

# Create projects
echo "Creating projects..."
mkdir -p src

dotnet new webapi -n SayIt.Api -o src/SayIt.Api --no-https --use-controllers --force
dotnet new classlib -n SayIt.Core -o src/SayIt.Core --force
dotnet new classlib -n SayIt.Infrastructure -o src/SayIt.Infrastructure --force
dotnet new xunit -n SayIt.Tests -o src/SayIt.Tests --force

# Add to solution 
echo "Adding projects to solution..."
dotnet sln add src/SayIt.Api
dotnet sln add src/SayIt.Core
dotnet sln add src/SayIt.Infrastructure
dotnet sln add src/SayIt.Tests

# Set up project references 
echo " Setting up project references..."
dotnet add src/SayIt.Api reference src/SayIt.Core
dotnet add src/SayIt.Api reference src/SayIt.Infrastructure
dotnet add src/SayIt.Infrastructure reference src/SayIt.Core
dotnet add src/SayIt.Tests reference src/SayIt.Core
dotnet add src/SayIt.Tests reference src/SayIt.Infrastructure
dotnet add src/SayIt.Tests reference src/SayIt.Api

# Install NuGet packages 
echo ""
echo "Installing NuGet packages..."

echo "  → SayIt.Api packages..."
dotnet add src/SayIt.Api package Microsoft.AspNetCore.Authentication.JwtBearer --version 9.0.*
dotnet add src/SayIt.Api package Swashbuckle.AspNetCore
dotnet add src/SayIt.Api package Microsoft.AspNetCore.Identity.EntityFrameworkCore --version 9.0.*
dotnet add src/SayIt.Api package Microsoft.EntityFrameworkCore.Design --version 9.0.*

echo "  → SayIt.Infrastructure packages..."
dotnet add src/SayIt.Infrastructure package Npgsql.EntityFrameworkCore.PostgreSQL
dotnet add src/SayIt.Infrastructure package Microsoft.EntityFrameworkCore.Tools --version 9.0.*
dotnet add src/SayIt.Infrastructure package BCrypt.Net-Next
dotnet add src/SayIt.Infrastructure package StackExchange.Redis

echo "  → SayIt.Tests packages..."
dotnet add src/SayIt.Tests package Microsoft.EntityFrameworkCore.InMemory --version 9.0.*
dotnet add src/SayIt.Tests package Moq

#Set up local dotnet-ef tool 
echo ""
echo "Setting up dotnet-ef as local tool..."
dotnet new tool-manifest --force
dotnet tool install dotnet-ef

# Create folder structure 
echo ""
echo "Creating folder structure..."

# Clean up auto-generated template files
rm -f src/SayIt.Core/Class1.cs
rm -f src/SayIt.Infrastructure/Class1.cs
rm -f src/SayIt.Api/Controllers/WeatherForecastController.cs
rm -f src/SayIt.Api/WeatherForecast.cs

# Core
mkdir -p src/SayIt.Core/Entities
mkdir -p src/SayIt.Core/DTOs
mkdir -p src/SayIt.Core/Interfaces

# Infrastructure
mkdir -p src/SayIt.Infrastructure/Data/Migrations
mkdir -p src/SayIt.Infrastructure/Repositories
mkdir -p src/SayIt.Infrastructure/Services

# Api
mkdir -p src/SayIt.Api/Controllers
mkdir -p src/SayIt.Api/Hubs
mkdir -p src/SayIt.Api/Middleware

# Tests
mkdir -p src/SayIt.Tests/Unit
mkdir -p src/SayIt.Tests/Integration

# Build to verify 
echo ""
echo " Building solution to verify..."
dotnet build

echo ""
echo ""
echo "SayIt backend setup complete!"
echo ""
echo "Next steps:"
echo "  1. docker-compose up -d        (start Postgres + Redis)"
echo "  2. dotnet ef migrations add Init -p src/SayIt.Infrastructure -s src/SayIt.Api"
echo "  3. dotnet ef database update -p src/SayIt.Infrastructure -s src/SayIt.Api"
echo "  4. cd src/SayIt.Api && dotnet watch run"
echo ""
