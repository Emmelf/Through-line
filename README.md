# Through-line

[![CI](https://github.com/Emmelf/Through-line/actions/workflows/ci.yml/badge.svg)](https://github.com/Emmelf/Through-line/actions/workflows/ci.yml)

## Getting Started

### Dependencies

* Docker & Docker Compose

### Installation

Clone the repository:

```bash
git clone https://github.com/Emmelf/Through-line.git
cd Through-line
```

### Environment Setup

Before running the application, configure the environment variables:

1. **Docker environment variables**

   ```bash
   cp .env.example .env
   ```

2. **Symfony local environment variables**

   ```bash
   cp api/.env.local.example api/.env.local
   ```
3. **Symfony test environment variables**

   ```bash
   cp api/.env.test.example api/.env.test
   ```

Edit files and add the required values for your environment.

### Running the Application

1. Start the containers:

   ```bash
   docker compose up -d
   ```

2. Install backend dependencies:

   ```bash
   docker exec -it symfony_php composer install
   ```

3. Install frontend dependencies:

   ```bash
   docker exec -it react_node npm install
   ```

4. Run database migrations:

   ```bash
   docker exec -it symfony_php php bin/console doctrine:migrations:migrate
   ```

5. Access the application:

    * API: http://localhost:8000
    * Frontend: http://localhost:5173

## Production deployment (OVH VPS)

### Branch strategy

- Deploy only from `main`
- Keep ongoing work on `dev`

### Production files

- `docker-compose.prod.yml`
- `nginx/default.conf`
- `api/Dockerfile.prod`
- `.env.prod.example`

### One-time VPS setup

1. Clone repository on VPS:

   ```bash
   git clone https://github.com/Emmelf/Through-line.git /opt/Through-line
   cd /opt/Through-line
   ```

2. Create production env file:

   ```bash
   cp .env.prod.example .env.prod
   ```

3. Ensure Let's Encrypt certificates exist on the VPS for:
   - `through-line.online`
   - `www.through-line.online`

### GitHub Actions deploy secrets

- `OVH_SSH_HOST`
- `OVH_SSH_USER`
- `OVH_SSH_PRIVATE_KEY`
- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `JWT_SECRET` (used as `JWT_PASSPHRASE`)
- `MYSQL_PASSWORD`
- `APP_SECRET`
- `SONAR_TOKEN`

On push to `main`, CI runs backend tests + SonarCloud, builds frontend, uploads build artifacts to VPS, updates `/opt/Through-line`, then runs:

```bash
docker compose -f docker-compose.prod.yml --env-file .env.prod up -d --build
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T php-fpm php bin/console lexik:jwt:generate-keypair --skip-if-exists --no-interaction
docker compose -f docker-compose.prod.yml --env-file .env.prod exec -T php-fpm php bin/console doctrine:migrations:migrate --no-interaction
```

## Useful Commands

### Database Migrations

Generate a new migration after modifying entities:

```bash
docker exec -it symfony_php php bin/console make:migration --formatted
```

Apply pending migrations:

```bash
docker exec -it symfony_php php bin/console doctrine:migrations:migrate
```

## License

This project is licensed under the MIT License. See `LICENSE.md` for details.
