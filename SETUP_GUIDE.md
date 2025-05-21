# Email Mass Sender - Setup Guide

## Prerequisites

Before starting, ensure you have the following installed on your system:

- Node.js (v16 or later)
- Docker and Docker Compose
- Git

## Initial Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd email-mass-sender
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Set Up Environment Variables

Create a `.env` file in the root directory with the following variables:

```
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=your_password
DB_DATABASE=email_sender

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRATION=1d

# Google OAuth
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_CALLBACK_URL=http://localhost:3000/api/auth/google/callback

# Encryption
ENCRYPTION_KEY=your_encryption_key

# App
API_PORT=3000
WEB_PORT=4200
WORKER_CONCURRENCY=5
```

### 4. Google API Setup

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Navigate to "APIs & Services" > "Credentials"
4. Create an OAuth 2.0 Client ID
5. Configure the consent screen with the following scopes:
   - `https://www.googleapis.com/auth/gmail.send`
   - `https://www.googleapis.com/auth/userinfo.email`
   - `https://www.googleapis.com/auth/userinfo.profile`
6. Add the callback URL: `http://localhost:3000/api/auth/google/callback`
7. Copy the Client ID and Client Secret to your `.env` file

## Development Setup

### Start Development Environment

```bash
# Start all services in development mode
npm run dev

# Or start individual services
npm run dev:web
npm run dev:api
npm run dev:worker
```

### Database Migrations

```bash
# Generate a new migration
npm run migration:generate -- -n MigrationName

# Run migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

## Docker Setup

### Build and Run with Docker Compose

```bash
# Build all containers
docker-compose build

# Start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

## Testing

```bash
# Run all tests
npm run test

# Run tests for a specific app
npm run test:web
npm run test:api
npm run test:worker

# Run e2e tests
npm run test:e2e
```

## Production Deployment

### Build for Production

```bash
# Build all apps
npm run build

# Build specific app
npm run build:web
npm run build:api
npm run build:worker
```

### Deploy with PM2

```bash
# Install PM2 globally
npm install -g pm2

# Start services with PM2
pm2 start ecosystem.config.js

# Monitor services
pm2 monit

# View logs
pm2 logs
```

## Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check if PostgreSQL is running: `docker-compose ps`
   - Verify database credentials in `.env`
   - Ensure migrations have been run

2. **Redis Connection Issues**
   - Check if Redis is running: `docker-compose ps`
   - Verify Redis connection settings in `.env`

3. **OAuth Authentication Failures**
   - Verify Google API credentials
   - Check that redirect URIs are correctly configured
   - Ensure required scopes are enabled in Google Cloud Console

4. **Worker Not Processing Jobs**
   - Check Redis connection
   - Verify Bull queue configuration
   - Check logs for errors: `docker-compose logs worker-service`

### Logs

Logs are stored in the following locations:

- API Service: `logs/api-service.log`
- Worker Service: `logs/worker-service.log`
- Web App: `logs/web-app.log`

Log rotation is configured to keep files manageable.

## Monitoring

Access the monitoring dashboard at `http://localhost:3000/status` to view:

- Service health
- Queue statistics
- Email sending metrics
- System resource usage
