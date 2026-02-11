# Garage (Angular 20) - Modules Starter (Bootstrap + ngx-translate + Auth + Guards + Interceptor + Docker)

This is a **Module-based** Angular 20 starter (NOT standalone) with:
- Core / Shared / Authentication / Features modules
- Lazy loading (Auth + Features)
- Auth / Unauth guards (SSR-safe style; works fine in SPA too)
- HTTP interceptor (auth token + basic error handling)
- ngx-translate (Arabic default)
- Bootstrap via CDN (no extra npm dependency)
- Docker dev setup

## Quick start (local)
```bash
npm i
npm start
```
Open: http://localhost:4200

## Docker (dev)
```bash
docker build -t garage -f Dockerfile.dev .
docker run -it --rm -p 4200:4200 -v ${PWD}:/app -v /app/node_modules garage
```

## Login flow
- Go to `/auth/login`
- Click **Login (Mock)** to set a fake token
- You'll be redirected to `/features`

## Structure
```
src/app
  core
    guards
    interceptors
    services
  shared
  authentication
  features
```

> Note: This template is **SPA only** (SSR removed) to avoid Router/provider issues during SSR.
