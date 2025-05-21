# Email Mass Sender - Technical Specifications

## System Requirements
- Server with 2 vCPU (optimized for this configuration)
- Docker and Docker Compose for deployment
- PostgreSQL database
- Redis for job queue management
- PM2 for process management and monitoring

## Database Schema

### Users Table
```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) NOT NULL UNIQUE,
  name VARCHAR(255),
  picture VARCHAR(255),
  google_id VARCHAR(255) UNIQUE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Senders Table
```sql
CREATE TABLE senders (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  refresh_token TEXT NOT NULL,
  access_token TEXT,
  token_expires_at TIMESTAMP,
  daily_quota INTEGER DEFAULT 2000,
  daily_sent INTEGER DEFAULT 0,
  last_sent_date DATE,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, email)
);
```

### Email Jobs Table
```sql
CREATE TABLE email_jobs (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  subject VARCHAR(255) NOT NULL,
  html_content TEXT NOT NULL,
  total_recipients INTEGER NOT NULL DEFAULT 0,
  sent_count INTEGER NOT NULL DEFAULT 0,
  failed_count INTEGER NOT NULL DEFAULT 0,
  status VARCHAR(50) NOT NULL DEFAULT 'queued', -- queued, in_progress, completed, failed
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);
```

### Email Recipients Table
```sql
CREATE TABLE email_recipients (
  id SERIAL PRIMARY KEY,
  job_id INTEGER NOT NULL REFERENCES email_jobs(id) ON DELETE CASCADE,
  email VARCHAR(255) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, sent, failed
  sender_id INTEGER REFERENCES senders(id),
  sent_at TIMESTAMP,
  error_message TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  UNIQUE(job_id, email)
);
```

## API Endpoints

### Authentication
- `POST /auth/google` - Generate Google OAuth2 URL
- `GET /auth/callback` - Handle Google OAuth2 callback
- `GET /auth/me` - Get current user information
- `POST /auth/logout` - Logout user

### Senders
- `GET /senders` - List all senders for current user
- `POST /senders` - Add a new sender (triggers OAuth2 flow)
- `GET /senders/:id` - Get sender details
- `DELETE /senders/:id` - Remove a sender
- `GET /senders/stats` - Get sending statistics for all senders

### Email Jobs
- `GET /email-jobs` - List all email jobs for current user
- `POST /email-jobs` - Create and start a new email job
- `GET /email-jobs/:id` - Get email job details
- `DELETE /email-jobs/:id` - Cancel an email job (if still in queue)
- `GET /email-jobs/:id/status` - Get email job status with statistics
- `GET /email-jobs/:id/recipients` - Get job recipients with status

## Worker Service

### Job Processing
1. **Email Job Creation**:
   - When a user uploads CSV and HTML content, an email job is created
   - The system divides recipients into batches
   - Each batch is assigned to available senders based on their daily quota
   - Jobs are immediately pushed to Redis queue

2. **Email Sending**:
   - Worker processes pick up jobs from the queue
   - Check and refresh Google OAuth tokens if needed
   - Send emails using Gmail API
   - Update recipient status and sender statistics
   - Handle retries for temporary failures

3. **Concurrency Control**:
   - Use Bull queue with concurrency settings
   - Implement distributed locks using Redis
   - Track sender quotas to prevent exceeding Gmail limits

### Error Handling
- Categorize errors as temporary (retry) or permanent (fail)
- Implement exponential backoff for retries
- Log detailed error information for debugging

## Security Implementation

### OAuth2 Integration
- Use Google OAuth2 for authentication
- Request minimal scopes: `profile email https://www.googleapis.com/auth/gmail.send`
- Store refresh tokens encrypted in the database

### Token Security
- Encrypt all OAuth tokens before storing in database
- Use environment variables for encryption keys
- Implement token rotation and secure handling

### API Security
- JWT-based authentication for API endpoints
- Role-based access control
- Rate limiting to prevent abuse
- Input validation and sanitization

## Frontend Features

### Authentication Screen
- Google Sign-In button
- Authentication state management

### Sender Management
- List of connected Gmail accounts
- Add new sender with OAuth flow
- Remove sender functionality
- Sender statistics display

### Email Sending
- Simple form for creating new email jobs
- CSV upload for recipient list
- HTML editor with preview functionality
- Job progress tracking

### User Management
- Admin interface for managing users
- User role assignment
- User profile management

## Deployment Configuration

### Docker Compose Setup
- Separate containers for each service
- Volume mounts for persistent data
- Environment variable configuration
- Health checks and restart policies

### Logging and Monitoring
- Centralized logging with log rotation
- Health check endpoints
- PM2 for process monitoring and auto-restart
- Performance metrics collection

## Performance Optimization
- Batch processing for email sending
- Connection pooling for database
- Caching strategies for frequent queries
- Optimized database indexes
- Horizontal scaling capability for worker processes
