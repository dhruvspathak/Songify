# Environment Variables Setup Guide

## Security Notice ⚠️

**CRITICAL**: This document helps you set up secure environment variables for the Songify application.

## Recent Security Fix

**Vulnerability Fixed**: Hardcoded Redis password in `docker-compose.yml`
- **Issue**: Line 79 contained a hardcoded default password `songify_redis_pass`
- **Fix**: Removed hardcoded password and enforced environment variable usage
- **Status**: ✅ **RESOLVED** - Redis now requires `REDIS_PASSWORD` environment variable

## Required Environment Variables

### Root Level (.env)
Create a `.env` file in the project root with:

```bash
# Redis Database Password - REQUIRED for security
# Generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
REDIS_PASSWORD=your_secure_redis_password_here
```

### Backend Environment (backend/.env)
Copy `backend/env.template` to `backend/.env` and configure:

```bash
# Spotify OAuth Credentials
CLIENT_ID=your_spotify_client_id_here
CLIENT_SECRET=your_spotify_client_secret_here

# Application URLs (Development - for manual setup)
REDIRECT_URI=http://localhost:5173/callback
FRONTEND_URL=http://localhost:5173

# Server Configuration
PORT=3000

# Session Security - Generate with: 
# node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
SESSION_SECRET=your_random_session_secret_here

# CORS Origins
CORS_ORIGINS=http://localhost:5173,http://127.0.0.1:5173

# Redis Configuration
REDIS_PASSWORD=your_secure_redis_password_here
```

### Frontend Environment (frontend/.env)
Copy `frontend/env.template` to `frontend/.env` and configure:

```bash
# Frontend Environment Variables
VITE_CLIENT_ID=your_spotify_client_id_here
VITE_REDIRECT_URI=http://localhost:5173/callback
VITE_BACKEND_URL=http://localhost:3000
```

## Security Best Practices

1. **Never commit .env files** to version control
2. **Use strong, randomly generated passwords**
3. **Rotate credentials regularly**
4. **Use different passwords for different environments**
5. **Store production secrets in secure vaults**

## Password Generation Commands

```bash
# For Redis password (32 bytes)
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"

# For session secret (64 bytes)
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

## Deployment Security

- For production deployments, use secure secret management systems
- Never use the example passwords in production
- Ensure environment files have proper file permissions (600)
- Regularly audit and rotate all credentials
