# 💬 SayIt

Anonymous discussion forum — say what you actually think.

## Tech Stack

- **Backend**: ASP.NET Core 8 (C#)
- **Frontend**: React + TypeScript + Vite (coming soon)
- **Database**: PostgreSQL 16
- **Real-time**: SignalR (WebSockets)
- **Cache**: Redis

## Quick Start

### Prerequisites
- [.NET 8 SDK](https://dotnet.microsoft.com/download/dotnet/8.0)
- [Docker Desktop](https://www.docker.com/products/docker-desktop/)
- [Node.js 20+](https://nodejs.org/) (for frontend)

### Setup

```bash
# 1. Clone
git clone https://github.com/YOUR_USERNAME/sayit.git
cd sayit

# 2. Run setup script
chmod +x setup.sh
./setup.sh

# 3. Start database
docker-compose up -d

# 4. Run API
cd src/SayIt.Api
dotnet watch run
```

API runs at `http://localhost:5000` with Swagger UI at `/swagger`.

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/api/auth/register` | No | Create account |
| POST | `/api/auth/login` | No | Login → JWT |
| GET | `/api/threads` | No | List threads |
| POST | `/api/threads` | Yes | Create thread |
| GET | `/api/threads/{id}` | No | Get thread + replies |
| DELETE | `/api/threads/{id}` | Yes | Delete own thread |
| POST | `/api/threads/{id}/replies` | Yes | Post reply |
| POST | `/api/reactions/toggle` | Yes | Toggle reaction |
| GET | `/api/channels` | No | List channels |

## Project Structure

```
src/
├── SayIt.Api/              # Web API (controllers, hubs, middleware)
├── SayIt.Core/             # Domain (entities, DTOs, interfaces)
├── SayIt.Infrastructure/   # Data access (EF Core, repositories)
└── SayIt.Tests/            # Unit + integration tests
```

## License

MIT
