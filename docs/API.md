# Hakinga API Documentation

## Overview

Hakinga is a typing training platform with a RESTful API built with FastAPI. This document describes the available endpoints, authentication, and data formats.

**Base URL:** `/api/v1`

**Authentication:** JWT Bearer tokens

---

## Authentication

### Register a New User

```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "typist123",
  "password": "SecurePass123"
}
```

**Response:** `201 Created`
```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "username": "typist123",
    "created_at": "2024-01-15T10:30:00Z"
  },
  "access_token": "eyJhbG...",
  "token_type": "bearer"
}
```

### Login

```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "SecurePass123"
}
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer",
  "expires_in": 3600
}
```

### Refresh Token

```http
POST /api/v1/auth/refresh
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "access_token": "eyJhbG...",
  "token_type": "bearer"
}
```

### Password Recovery

```http
POST /api/v1/auth/forgot-password
```

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

---

## User Profile

### Get Current User

```http
GET /api/v1/users/me
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "username": "typist123",
  "level": 15,
  "xp": 4500,
  "total_sessions": 127,
  "avg_wpm": 65.5,
  "avg_accuracy": 94.2,
  "rank_tier": "silver",
  "created_at": "2024-01-15T10:30:00Z"
}
```

### Update Profile

```http
PATCH /api/v1/users/me
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "newusername"
}
```

### Get User Statistics

```http
GET /api/v1/users/me/statistics
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "total_sessions": 127,
  "total_time_minutes": 450,
  "avg_wpm": 65.5,
  "max_wpm": 89,
  "avg_accuracy": 94.2,
  "total_characters": 125000,
  "total_errors": 7500,
  "sessions_by_difficulty": {
    "easy": 30,
    "medium": 70,
    "hard": 27
  },
  "wpm_history": [...],
  "accuracy_history": [...]
}
```

---

## Typing Sessions

### Start Solo Session

```http
POST /api/v1/sessions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "difficulty": "medium",
  "text_type": "quote",
  "mode": "practice"
}
```

**Response:** `201 Created`
```json
{
  "session_id": "uuid",
  "text": {
    "id": "text-uuid",
    "content": "The quick brown fox...",
    "difficulty": "medium",
    "word_count": 25
  },
  "started_at": "2024-01-15T10:30:00Z"
}
```

### Submit Session Results

```http
POST /api/v1/sessions/{session_id}/complete
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "wpm": 65.5,
  "accuracy": 94.2,
  "duration_seconds": 120,
  "errors": 15,
  "keystrokes": [...]  // Optional detailed keystroke data
}
```

**Response:** `200 OK`
```json
{
  "session_id": "uuid",
  "wpm": 65.5,
  "accuracy": 94.2,
  "xp_earned": 150,
  "achievements_unlocked": ["first_session", "speed_demon"],
  "new_level": null,
  "rank_change": null
}
```

### Get Session History

```http
GET /api/v1/sessions
Authorization: Bearer <token>
```

**Query Parameters:**
- `limit` (int): Number of results (default: 20)
- `offset` (int): Pagination offset
- `difficulty` (string): Filter by difficulty
- `date_from` (datetime): Filter by start date
- `date_to` (datetime): Filter by end date

**Response:** `200 OK`
```json
{
  "sessions": [...],
  "total": 127,
  "has_more": true
}
```

---

## Multiplayer Sessions

### Create Private Session

```http
POST /api/v1/private-sessions
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "difficulty": "medium",
  "max_players": 4
}
```

**Response:** `201 Created`
```json
{
  "session_id": "uuid",
  "invite_code": "ABC123",
  "invite_link": "https://hakinga.com/join/ABC123"
}
```

### Join Private Session

```http
POST /api/v1/private-sessions/{invite_code}/join
Authorization: Bearer <token>
```

### WebSocket: Private Session

```
ws://api/v1/private-sessions/{session_id}/ws
```

**Events:**
- `player_joined`: New player joined
- `player_left`: Player left
- `race_starting`: Countdown started
- `race_started`: Race began
- `progress_update`: Player progress
- `race_finished`: Race ended

---

## Competition (Public Matchmaking)

### WebSocket: Matchmaking Queue

```
ws://api/v1/public-sessions/queue
```

**Client Messages:**
```json
{"type": "join_queue", "difficulty": "medium"}
{"type": "leave_queue"}
{"type": "progress", "wpm": 65, "progress": 50, "accuracy": 95}
{"type": "finish", "wpm": 70, "accuracy": 94}
```

**Server Messages:**
```json
{"type": "queue_joined", "position": 3}
{"type": "match_found", "session_id": "uuid", "players": [...]}
{"type": "countdown", "seconds": 5}
{"type": "race_start"}
{"type": "player_progress", "player_id": "uuid", "progress": 50}
{"type": "race_results", "rankings": [...]}
```

---

## Leaderboards

### Get Global Leaderboard

```http
GET /api/v1/leaderboard
```

**Query Parameters:**
- `period` (string): "all_time", "weekly", "daily"
- `limit` (int): Number of results (default: 100)

**Response:** `200 OK`
```json
{
  "leaderboard": [
    {
      "rank": 1,
      "user_id": "uuid",
      "username": "speedtyper",
      "avg_wpm": 120.5,
      "sessions_count": 500,
      "rank_tier": "diamond"
    },
    ...
  ]
}
```

### Get Friends Leaderboard

```http
GET /api/v1/leaderboard/friends
Authorization: Bearer <token>
```

---

## Friends

### Add Friend

```http
POST /api/v1/friends
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "username": "friend_username"
}
```

### Get Friends List

```http
GET /api/v1/friends
Authorization: Bearer <token>
```

### Remove Friend

```http
DELETE /api/v1/friends/{friend_id}
Authorization: Bearer <token>
```

---

## Texts

### Get Random Text

```http
GET /api/v1/texts/random
```

**Query Parameters:**
- `difficulty` (string): "easy", "medium", "hard"
- `type` (string): "quote", "paragraph", "code"
- `language` (string): For code: "python", "javascript", etc.

### Get Text by ID

```http
GET /api/v1/texts/{text_id}
```

---

## ML & Analytics

### Get Difficulty Recommendation

```http
GET /api/v1/ml/recommended-difficulty
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "recommended_difficulty": "medium",
  "reason": "Your speed (65 WPM) is perfect for medium difficulty.",
  "confidence": 0.85
}
```

### Get Typing Profile

```http
GET /api/v1/ml/typing-profile
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "skill_level": "intermediate",
  "problematic_chars": ["q", "z", "x"],
  "problematic_bigrams": ["qu", "th"],
  "strengths": ["Good accuracy", "Consistent speed"],
  "weaknesses": ["Pinky finger weakness", "Number row"],
  "recommendations": [...]
}
```

### Get Daily Insights

```http
GET /api/v1/ml/insights
Authorization: Bearer <token>
```

---

## Settings

### Get User Settings

```http
GET /api/v1/settings
Authorization: Bearer <token>
```

### Update Settings

```http
PATCH /api/v1/settings
Authorization: Bearer <token>
```

**Request Body:**
```json
{
  "sound_enabled": true,
  "keyboard_layout": "qwerty",
  "font_size": "medium"
}
```

---

## Achievements

### Get User Achievements

```http
GET /api/v1/achievements
Authorization: Bearer <token>
```

**Response:** `200 OK`
```json
{
  "unlocked": [
    {
      "id": "first_session",
      "name": "First Steps",
      "description": "Complete your first typing session",
      "unlocked_at": "2024-01-15T10:30:00Z",
      "xp_reward": 50
    }
  ],
  "locked": [
    {
      "id": "speed_demon",
      "name": "Speed Demon",
      "description": "Reach 100 WPM",
      "progress": 65,
      "target": 100
    }
  ]
}
```

---

## Error Responses

All endpoints may return the following error responses:

### 400 Bad Request
```json
{
  "detail": "Validation error",
  "errors": [
    {"field": "email", "message": "Invalid email format"}
  ]
}
```

### 401 Unauthorized
```json
{
  "detail": "Not authenticated"
}
```

### 403 Forbidden
```json
{
  "detail": "Not authorized to access this resource"
}
```

### 404 Not Found
```json
{
  "detail": "Resource not found"
}
```

### 429 Too Many Requests
```json
{
  "detail": "Rate limit exceeded",
  "retry_after": 60
}
```

### 500 Internal Server Error
```json
{
  "detail": "Internal server error"
}
```

---

## Rate Limits

| Endpoint | Limit |
|----------|-------|
| `/auth/login` | 5 requests / 15 minutes |
| `/auth/register` | 3 requests / hour |
| `/sessions` | 30 requests / hour |
| Other endpoints | 100 requests / minute |

---

## WebSocket Protocol

### Connection

```javascript
const ws = new WebSocket('wss://api.hakinga.com/api/v1/ws');

// Authenticate after connection
ws.send(JSON.stringify({
  type: 'authenticate',
  token: 'your-jwt-token'
}));
```

### Message Format

All WebSocket messages follow this format:
```json
{
  "type": "event_type",
  "data": {...},
  "timestamp": "2024-01-15T10:30:00Z"
}
```

---

## SDK Usage Examples

### Python
```python
import httpx

client = httpx.Client(base_url="https://api.hakinga.com/api/v1")

# Login
response = client.post("/auth/login", json={
    "email": "user@example.com",
    "password": "password123"
})
token = response.json()["access_token"]

# Make authenticated request
client.headers["Authorization"] = f"Bearer {token}"
profile = client.get("/users/me").json()
```

### JavaScript
```javascript
const API_BASE = 'https://api.hakinga.com/api/v1';

async function login(email, password) {
  const response = await fetch(`${API_BASE}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });
  return response.json();
}

async function getProfile(token) {
  const response = await fetch(`${API_BASE}/users/me`, {
    headers: { 'Authorization': `Bearer ${token}` }
  });
  return response.json();
}
```

---

## Changelog

### v1.0.0 (2024-01)
- Initial API release
- Authentication endpoints
- Solo typing sessions
- Multiplayer support
- Leaderboards
- Achievements system
