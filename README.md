# Library Management System

A RESTful Library Management System built with Java and Spring Boot. It provides book and member management, borrowing and returning, loan history, overdue-loan reporting, fine calculation, and JWT-based authentication with role-based authorization.

## Tech Stack

- Java 21
- Spring Boot
- Spring Data JPA / Hibernate
- MySQL 8
- Flyway database migrations
- Spring Security and JWT
- Springdoc OpenAPI / Swagger UI
- Maven
- Docker and Docker Compose

## Features

- Book CRUD, search, and availability tracking
- Member registration and login
- ADMIN and MEMBER roles
- JWT-based authentication
- Borrow and return operations
- Loan history and overdue-loan reporting
- Fine calculation for overdue returns
- Input validation and centralized error handling
- Flyway-managed database schema
- REST API documentation through Swagger UI

## Prerequisites

For Docker Compose:
- Docker Desktop with Docker Compose v2
- Git, if cloning the repository

For running locally without Docker:
- Java 21
- Maven (or the included Maven Wrapper, if present)
- MySQL 8

## Configuration

Secrets are supplied through environment variables. Never commit your real `.env` file or production secrets.

1. Copy the example file in the project root:

   **Windows PowerShell**
   ```powershell
   Copy-Item .env.example .env
   ```

   **macOS/Linux**
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and replace the example database passwords and `JWT_SECRET` with your own values.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DB_NAME` | Database/schema name used by Docker Compose |
| `DB_USERNAME` | MySQL application user and Spring datasource username |
| `DB_PASSWORD` | MySQL application password and Spring datasource password |
| `DB_ROOT_PASSWORD` | Root password for the MySQL container |
| `DB_URL` | JDBC URL for running the app directly on the host; Compose overrides it for the app container |
| `JWT_SECRET` | Secret used to sign JWTs |
| `JWT_EXPIRATION` | JWT lifetime in milliseconds; defaults to `3600000` (one hour) |

The Compose network uses `mysql:3306` for the application-to-database connection. The database is published on host port `3307` so it does not conflict with a local MySQL installation using port `3306`.

## Run with Docker Compose (recommended)

Run these commands from the project root, where `Dockerfile`, `docker-compose.yml`, `pom.xml`, and `.env` are located.

If you previously started the app as a standalone container and it is still using port `8080`, stop and remove that old app container before starting Compose:

```powershell
docker stop library-management-system-container
docker rm library-management-system-container
```

If the container does not exist, continue to the next step.

Start the application and MySQL:

```bash
docker compose up --build
```

After the first successful build, you can usually start it with:

```bash
docker compose up
```

To run in the background:

```bash
docker compose up -d --build
```

Check service status and logs:

```bash
docker compose ps
docker compose logs -f app
docker compose logs -f mysql
```

Open Swagger UI:

- http://localhost:8080/swagger-ui.html
- OpenAPI JSON: http://localhost:8080/v3/api-docs

Stop the services:

```bash
docker compose down
```

The named `mysql_data` volume keeps database data when containers are stopped or recreated. To delete the containers **and permanently delete the Compose database data**, run:

```bash
docker compose down -v
```

Do not use `down -v` if you need to preserve your data.

## Run locally without Docker

1. Make sure MySQL is running and create the database named in your `.env` file (the example uses `library_management`).
2. Set `DB_URL` to your local MySQL JDBC URL, normally `jdbc:mysql://localhost:3306/library_management`.
3. Ensure `DB_USERNAME`, `DB_PASSWORD`, and `JWT_SECRET` match your local setup.
4. Run the app from the project root:

   ```bash
   mvn spring-boot:run
   ```

   On Windows, if Maven Wrapper files are present, you can use `.\mvnw.cmd spring-boot:run`.

Flyway runs the migrations on startup. The datasource uses the environment values configured in `.env` or the process environment.

## Swagger and API usage

1. Start the app and open http://localhost:8080/swagger-ui.html.
2. Find the registration and login endpoints in Swagger. Register a MEMBER account, then use the login endpoint to obtain a JWT.
3. For ADMIN-only operations, log in using an ADMIN account that has been configured for this project. Do not assume a newly registered MEMBER has ADMIN privileges.
4. In Swagger, click **Authorize** and enter the token in the format expected by the configured bearer-token scheme (usually the JWT itself if the scheme is HTTP Bearer).
5. Try the documented book, loan, member-history, and report endpoints. Requests without a valid token should receive `401 Unauthorized`; a valid user without the required role should receive `403 Forbidden`.

Exact endpoint paths and request/response schemas are documented by the running Swagger UI.

## Run tests

Run the test suite from the project root:

```bash
mvn test
```

On Windows, use `.\mvnw.cmd test` if the Maven Wrapper is present. Docker image creation currently skips tests in the Dockerfile, so run the test command separately before committing changes.

## Design documentation

See the [`docs/`](docs/) directory for the project's design documents, such as requirements, user stories, and the ER diagram, when present.

## Troubleshooting

- **App cannot connect to MySQL:** inside Compose, the JDBC hostname must be `mysql`, not `localhost`. Confirm the MySQL health check is passing with `docker compose ps`.
- **Port 8080 is already allocated:** stop the standalone app container or another service using port `8080`.
- **Port 3307 is already allocated:** change the host side of the mapping in `docker-compose.yml`, for example from `3307:3306` to `3308:3306`.
- **Environment variable errors:** confirm `.env` exists beside `docker-compose.yml` and contains all required values. Do not put `${...}` placeholders in `.env` for required secrets.
- **Database schema validation fails:** check the Flyway migration logs and make sure the database is the one expected by the app.

## Security notes

- Keep `.env` out of Git. Ensure `.gitignore` includes `.env` and does not ignore `.env.example`.
- Never publish real database passwords, JWT secrets, access tokens, or private keys.
- Use a unique, strong JWT secret and strong database passwords outside development.
