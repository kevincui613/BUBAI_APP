# StudyPilot Backend

## Quick Start

```bash
npm install
npm run build
npm run start:dev
```

Default server: `http://localhost:3000`
API prefix: `/api/v1`

## Environment

Set in `.env`:

- `DATABASE_URL=mysql://root:password@127.0.0.1:3306/study_pilot`
- `PORT=3000`
- `QWEN_API_KEY=...`
- `QWEN_BASE_URL=https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions`
- `QWEN_MODEL=qwen3.5-plus`

## Prisma

```bash
npx prisma generate
npx prisma migrate dev --name init
```

## Implemented Modules (Skeleton)

- `social` module
  - friend search/request/approve
  - visibility setting
  - buddy recommendations
  - circles and team endpoints
- `ai` module
  - `POST /api/v1/ai/plans/generate`
  - calls Qwen when `QWEN_API_KEY` is configured
  - fallback plan when LLM call fails

## Core API Routes

- `GET /api/v1/social/friends/search`
- `POST /api/v1/social/friends/requests`
- `GET /api/v1/social/friends/requests/incoming`
- `PATCH /api/v1/social/friends/requests/:requestId`
- `GET /api/v1/social/friends`
- `GET /api/v1/social/friends/visibility`
- `PATCH /api/v1/social/friends/visibility`
- `GET /api/v1/social/friends/recommendations`
- `GET /api/v1/social/circles`
- `POST /api/v1/social/circles/:circleId/join`
- `GET /api/v1/social/teams/posts`
- `POST /api/v1/social/teams/posts`
- `GET /api/v1/social/teams/challenges`
- `POST /api/v1/ai/plans/generate`
