# Through-line

## Getting Started

### Dependencies

- Docker & Docker Compose (for containerized development)
- Node.js 18+ (for frontend development)
- PHP 8.3+ (for backend development)
- Composer (PHP dependency manager)

### Installing

Clone the repository:

  ```bash
  git clone https://github.com/Emmelf/Through-line.git
  ```

Install backend dependencies:

  ```bash
  docker exec -it symfony_php composer install
  ```

Install frontend dependencies:

  ```bash
  docker exec -it react_node npm install
  ```

### Environment Setup

Before running the application, you need to configure the environment variables:

1. **Database configuration** (root `.env`) - Database credentials for Docker:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` and configure your database credentials


2. **Symfony secrets** (`api/.env.local`) - Local overrides with sensitive data:
   ```bash
   cp api/.env.local.example api/.env.local
   ```
   Edit `api/.env.local` and add your secrets (use the values from your environment)

### Executing program

1. Start the Docker containers and development servers:

  ```bash
  docker-compose up
  ```

2. Access the application:
  - API: http://localhost:8000
  - Frontend: http://localhost:5173

## Useful Commands

### Database Migrations

1. **Generate a new migration** (run after modifying entities):
   ```bash
   docker exec -it symfony_php php bin/console make:migration --formatted
   ```

2. **Apply pending migrations** to the database:
   ```bash
   docker exec -it symfony_php php bin/console doctrine:migrations:migrate
   ```

## License

This project is licensed under the MIT License - see the LICENSE.md file for details