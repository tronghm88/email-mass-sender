# Email Mass Sender - File Structure

## Monorepo Structure

```
email-mass-sender/
├── apps/
│   ├── web-app/                  # React frontend application
│   ├── api-service/              # NestJS API backend
│   └── worker-service/           # NestJS worker service
├── libs/                         # Shared libraries
│   ├── common/                   # Common utilities and types
│   ├── database/                 # Database models and migrations
│   └── email/                    # Email sending utilities
├── docker/                       # Docker configuration files
│   ├── api/
│   ├── web/
│   ├── worker/
│   ├── postgres/
│   └── redis/
├── docker-compose.yml            # Docker Compose configuration
├── nx.json                       # Nx configuration
├── package.json                  # Root package.json
├── tsconfig.base.json            # Base TypeScript configuration
└── README.md                     # Project documentation
```

## Detailed Structure

### Web App (React + Tailwind)

```
apps/web-app/
├── public/
│   ├── index.html
│   └── assets/
├── src/
│   ├── app/
│   │   ├── App.tsx              # Main application component
│   │   ├── routes.tsx           # Application routes
│   │   └── store.ts             # State management
│   ├── components/
│   │   ├── common/              # Reusable UI components
│   │   ├── auth/                # Authentication components
│   │   ├── senders/             # Sender management components
│   │   ├── email-jobs/          # Email sending components
│   │   └── users/               # User management components
│   ├── hooks/                   # Custom React hooks
│   ├── pages/
│   │   ├── LoginPage.tsx        # Login page
│   │   ├── SendersPage.tsx      # Sender management page
│   │   ├── EmailSendPage.tsx    # Email sending page
│   │   ├── UsersPage.tsx        # User management page
│   │   └── DashboardPage.tsx    # Dashboard page
│   ├── services/                # API service clients
│   ├── utils/                   # Utility functions
│   ├── styles/                  # Global styles
│   ├── index.tsx                # Entry point
│   └── environment.ts           # Environment configuration
├── tailwind.config.js           # Tailwind CSS configuration
├── package.json                 # Package dependencies
└── tsconfig.json                # TypeScript configuration
```

### API Service (NestJS)

```
apps/api-service/
├── src/
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts            # Root application module
│   ├── config/                  # Configuration files
│   ├── auth/                    # Authentication module
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/          # Authentication strategies
│   │   └── guards/              # Authentication guards
│   ├── senders/                 # Sender management module
│   │   ├── senders.module.ts
│   │   ├── senders.controller.ts
│   │   ├── senders.service.ts
│   │   └── dto/                 # Data transfer objects
│   ├── email-jobs/              # Email job management module
│   │   ├── email-jobs.module.ts
│   │   ├── email-jobs.controller.ts
│   │   ├── email-jobs.service.ts
│   │   └── dto/                 # Data transfer objects
│   ├── users/                   # User management module
│   │   ├── users.module.ts
│   │   ├── users.controller.ts
│   │   ├── users.service.ts
│   │   └── dto/                 # Data transfer objects
│   ├── queue/                   # Queue service for job distribution
│   │   ├── queue.module.ts
│   │   └── queue.service.ts
│   └── common/                  # Common utilities and middleware
│       ├── decorators/
│       ├── filters/
│       ├── interceptors/
│       └── pipes/
├── test/                        # Test files
├── package.json                 # Package dependencies
└── tsconfig.json                # TypeScript configuration
```

### Worker Service (NestJS)

```
apps/worker-service/
├── src/
│   ├── main.ts                  # Application entry point
│   ├── app.module.ts            # Root application module
│   ├── config/                  # Configuration files
│   ├── jobs/                    # Job processing modules
│   │   ├── email-sender.processor.ts
│   │   └── retry.service.ts
│   ├── gmail/                   # Gmail API integration
│   │   ├── gmail.module.ts
│   │   └── gmail.service.ts
│   ├── health/                  # Health check endpoints
│   │   ├── health.module.ts
│   │   └── health.controller.ts
│   └── common/                  # Common utilities
│       ├── logger.service.ts
│       └── utils/
├── test/                        # Test files
├── package.json                 # Package dependencies
└── tsconfig.json                # TypeScript configuration
```

### Shared Libraries

```
libs/common/
├── src/
│   ├── index.ts
│   ├── types/                   # Shared type definitions
│   ├── constants/               # Shared constants
│   └── utils/                   # Shared utility functions

libs/database/
├── src/
│   ├── index.ts
│   ├── entities/                # Database entities
│   │   ├── user.entity.ts
│   │   ├── sender.entity.ts
│   │   ├── email-job.entity.ts
│   │   └── email-recipient.entity.ts
│   ├── migrations/              # Database migrations
│   └── repositories/            # Custom repositories

libs/email/
├── src/
│   ├── index.ts
│   ├── templates/               # Email template utilities
│   └── services/                # Email sending services
```

### Docker Configuration

```
docker/
├── api/
│   └── Dockerfile               # API service Dockerfile
├── web/
│   └── Dockerfile               # Web app Dockerfile
├── worker/
│   └── Dockerfile               # Worker service Dockerfile
├── postgres/
│   ├── Dockerfile               # PostgreSQL Dockerfile
│   └── init.sql                 # Initial database setup
└── redis/
    └── Dockerfile               # Redis Dockerfile
```
