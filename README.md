# AnimeWeb

Vue 3 + Vite project for reading comics with OTruyen API and Supabase authentication.

## Features

- Browse comics from OTruyen API
- Search, category pages, comic detail, and reader view
- Local library state with optional Supabase sync
- Email/password and Google sign-in with Supabase
- Responsive layout for desktop and mobile

## Tech Stack

- Vue 3
- Vite
- Vue Router
- Pinia
- Supabase

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Create a local env file:

```bash
cp .env.example .env
```

3. Update `.env` with your values:

- `VITE_PUBLIC_WEB_URL`
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`

4. Start the dev server:

```bash
npm run dev
```

5. Build for production:

```bash
npm run build
```

## Supabase Setup

- Run [supabase-schema.sql](./supabase-schema.sql) in your Supabase SQL editor
- Configure Google auth and redirect URLs in Supabase Authentication settings

## Project Structure

- `src/api`: OTruyen API helpers
- `src/components`: reusable UI components
- `src/stores`: Pinia stores for auth and library
- `src/views`: page-level views
- `src/router`: app routes

