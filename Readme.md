# SayIt

Anonymous conversations where ideas take the spotlight.

SayIt is a fun anonymous discussion platform where anyone can start conversations, reply to threads, and react with emojis, all without needing to reveal their identity.

Think of it as a mix of a **forum and a chat app**, designed to make conversations feel natural and interactive.

---

# Live Demo 
https://sayit-eight.vercel.app/

---

# What is SayIt💬?

SayIt is a space for simple and open discussions.

Users can:

- start conversation threads
- reply to discussions
- react with emojis
- interact in real time

The platform focuses on **ideas and conversations**, keeping the experience light and easy to join.

---

# Features

## Threaded Discussions
Users can create threads and others can reply to them.  
Replies can also have replies, creating natural conversation flows.

---

## Emoji Reactions
Instead of traditional likes, SayIt uses emoji reactions so people can respond with emotion.

---

## Real-Time Updates
New replies and reactions appear instantly using real-time connections.

---

## Anonymous Participation
Users can participate in conversations without sharing personal identity.

---

## Responsive Interface
The UI works smoothly across desktop and mobile screens.

---

# Tech Stack

## Frontend

- **React**
- **TypeScript**
- **Tailwind CSS**
- **Axios**

Responsibilities:

- UI rendering
- API communication
- thread interaction
- responsive layout

Deployed on **Vercel**.

---

## Backend

- **C#**
- **.NET 9**

Handles:

- authentication
- thread creation
- replies
- reactions
- API endpoints

Deployed on **Render**.

---

## Real-Time

- **SignalR**

Used for:

- live replies
- real-time reaction updates
- thread activity updates

---

## Database

- **PostgreSQL**
- Hosted on **Neon**

Stores:

- users
- threads
- replies
- reactions

---

# Architecture

User Browser  
↓  
Vercel (React Frontend)  
↓  
Axios API Requests  
↓  
Render (.NET API Backend)  
↓  
PostgreSQL Database (Neon)

Real-time communication is handled through **SignalR connections**.

---

# Running Locally

Clone the repository
git clone https://github.com/aditi2605/SayIt.git


## Frontend
cd frontend
npm install
npm run dev


## Backend


cd backend
dotnet restore
dotnet run


---

#  Future Ideas

- Redis caching layer
- More topic-based channels
- improved search
- enhanced more real-time features
