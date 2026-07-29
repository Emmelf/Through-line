# Through-line

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
