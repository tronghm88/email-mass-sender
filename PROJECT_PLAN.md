# Email Mass Sender - Project Plan

## Overview
This project is a web application that allows users to send mass emails (up to 10k emails/day) using multiple Gmail accounts to overcome the Google Workspace limit of 2000 emails per day per account. The system will distribute emails evenly among registered sender accounts.

## Architecture
The project follows a monorepo structure using Nx with three main components:
1. `web-app`: React + Tailwind CSS frontend
2. `api-service`: NestJS REST API backend
3. `worker-service`: Two NestJS worker processes for handling email sending

## Technology Stack
- **Frontend**: React, Tailwind CSS
- **Backend**: NestJS (TypeScript)
- **Queue**: Redis + Bull
- **Database**: PostgreSQL
- **Deployment**: Docker Compose
- **Process Management**: PM2

## Implementation Plan (Sprint-Based)

### Sprint 1: Project Setup (1 week)
- [x] Create Nx monorepo structure
- [x] Set up Docker and Docker Compose configuration
- [x] Configure PostgreSQL database
- [x] Set up Redis for job queue
- [x] Create initial project structure for all three services
- [x] Set up CI/CD pipeline basics
- [x] Configure logging foundation

**Deliverable:** Project infrastructure ready for development

### Sprint 2: Authentication & Login (1 week)
- [ ] Implement basic database models and migrations for users
- [x] Set up Google OAuth2 authentication (backend)
- [x] Create login screen with Google authentication (frontend)
- [ ] Implement JWT token handling and session management
- [x] Add basic dashboard after login
- [ ] Set up security features (token encryption, etc.)

**Deliverable:** Users can log in to the system using Google authentication

### Sprint 3: Email Sender Management (1 week)
- [x] Extend database models for sender accounts
- [x] Implement Google OAuth for Gmail API access
- [x] Develop sender management APIs
- [x] Create sender management UI

**Deliverable:** Users can add and manage multiple Gmail sender accounts

### Sprint 4: User Management (1 week)
- [x] Implement user management APIs
- [x] Create user management UI for admins

**Deliverable:** Admins can manage system users

### Sprint 5: Direct Email Sending (1 week)
- [x] Create simple email sending interface
- [x] Implement CSV upload for recipient email addresses
- [x] Add HTML content input area with preview
- [x] Develop email validation and processing
- [x] Implement immediate job creation for sending

**Deliverable:** Users can upload CSV with email addresses and HTML content to send emails directly

### Sprint 6: Email Sending System (1-2 weeks)
- [ ] Implement job queue system for email distribution
- [ ] Develop worker service for processing email jobs
- [ ] Set up Gmail API integration for sending emails
- [ ] Create retry mechanism for failed jobs
- [ ] Implement sender rotation and quota management
- [ ] Add concurrency handling

**Deliverable:** System can send emails using multiple Gmail accounts

### Sprint 7: Monitoring & Optimization (1 week)
- [ ] Create campaign monitoring dashboard
- [ ] Implement detailed logging and error tracking
- [ ] Add performance metrics and monitoring
- [ ] Optimize database queries and indexes
- [ ] Implement caching strategies
- [ ] Add health checks and system status page

**Deliverable:** Users can monitor campaign progress and system health

### Sprint 8: Testing & Production Readiness (1 week)
- [ ] Write comprehensive tests (unit, integration)
- [ ] Perform security audit and fixes
- [ ] Optimize Docker configuration for production
- [ ] Prepare deployment documentation
- [ ] Final testing and bug fixes
- [ ] Create user documentation

**Deliverable:** Production-ready system with documentation

## Timeline
Total estimated time: 8-10 weeks with incremental feature delivery

## Next Steps
1. Review and approve sprint-based project plan
2. Begin Sprint 1 (Project Setup)
3. Prepare for early demo after Sprint 2
