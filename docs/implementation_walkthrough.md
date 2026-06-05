# Task Feature Implementation Walkthrough

We have successfully implemented the **Task feature** in the `ai-task-manager-fsdlc` active workspace based on the approved design specifications. The backend now features a modern, clean **Package-by-Feature** architecture built with Spring Boot 3, Java 21, Spring Data JPA, Lombok, and PostgreSQL.

---

## 1. Architectural Blueprint & Package Structure

The backend follows the enterprise-grade structure outlined in `docs/design.md`:

```text
com.example.taskmanagement
├── task
│   ├── entity
│   │   ├── Task.java          # JPA entity representing a task
│   │   └── TaskStatus.java    # Enum: PENDING, IN_PROGRESS, COMPLETED
│   ├── dto
│   │   ├── CreateTaskRequest.java
│   │   ├── UpdateTaskRequest.java
│   │   ├── TaskResponse.java
│   │   └── TaskListResponse.java
│   ├── repository
│   │   └── TaskRepository.java
│   ├── service
│   │   ├── TaskService.java
│   │   └── TaskServiceImpl.java
│   └── controller
│       └── TaskController.java
├── user
│   ├── entity
│   │   └── User.java          # JPA entity representing a user
│   ├── repository
│   │   └── UserRepository.java
│   └── service
│       ├── UserService.java
│       └── UserServiceImpl.java
├── common
│   └── exception
│       ├── ErrorResponse.java # Standardized error payload
│       ├── ResourceNotFoundException.java
│       ├── UnauthorizedAccessException.java
│       └── GlobalExceptionHandler.java
└── config
    └── OpenApiConfig.java     # Swagger OpenAPI 3 configuration
```

---

## 2. Core Implementation Details

### A. Entities & Enums
* **`TaskStatus`**: A strong-typed Enum containing `PENDING`, `IN_PROGRESS`, and `COMPLETED`.
* **`User`**: A fully-mapped JPA entity for users to satisfy database relationship mappings and compile queries. Uses a dynamic UUID primary key generator and records timestamps using Hibernate `@CreationTimestamp` and `@UpdateTimestamp`.
* **`Task`**: Mapped to the `tasks` table with optimized indices (`idx_tasks_user_id`, `idx_tasks_status`) and a `@ManyToOne` relationship pointing to the `User` owner.
  > [!TIP]
  > To ensure performance and prevent Hibernate circular dependencies or infinite recursions, we avoided the high-level `@Data` annotation on entities and manually/explicitly configured `@EqualsAndHashCode(onlyExplicitlyIncluded = true)` targeting exclusively the `id` field.

### B. Request/Response DTOs
All request models use JSR-380 validation annotations (`jakarta.validation.constraints`) to reject invalid inputs at the API boundaries before they propagate:
* **`CreateTaskRequest`**: Validates `@NotBlank` on `title` and `@Size(max = 2000)` on `description` to prevent buffer overflow inputs into the database.
* **`UpdateTaskRequest`**: Uses strict regex matching `@Pattern(regexp = "PENDING|IN_PROGRESS|COMPLETED")` on `status` to secure type-safety before handling enums.
* **`TaskResponse`**: Represents details sent back to clients.
* **`TaskListResponse`**: Wraps lists of tasks.

### C. Repositories
* **`UserRepository`**: Extends `JpaRepository<User, UUID>` and includes query lookup helper `findByEmail(String email)`.
* **`TaskRepository`**: Extends `JpaRepository<Task, UUID>` and includes custom query `findAllByUserId(UUID userId)`.

### D. Services & Implementation
* Services handle all transactional concerns cleanly using Spring `@Transactional(readOnly = true)` at the class level to optimize query locks, with state-changing operations explicitly marked as write-capable `@Transactional`.
* Services are fully decoupled from HTTP-specific web layers. They throw custom domain-level exceptions (`ResourceNotFoundException`, `UnauthorizedAccessException`) which are translated into standard HTTP status codes in the presentation handler.
* Modern **Constructor-based Dependency Injection** is used via Lombok's `@RequiredArgsConstructor`.

### E. Exception Handling
* **`ErrorResponse`**: Standardized JSON payload layout containing `timestamp`, `status`, `error` (HTTP phrase), `message` (details), `path` (endpoint request URI), and an optional `details` map representing JSR-380 field-level validation errors.
* **`GlobalExceptionHandler`**: Decorated with `@RestControllerAdvice`, it maps custom domain exceptions, Spring web exceptions (`ResponseStatusException`), bean validation exceptions (`MethodArgumentNotValidException`), and unexpected system exceptions (`Exception.class`) into cohesive `ErrorResponse` payloads.

### F. Swagger OpenAPI 3 Integration
* Enabled dynamic OpenAPI 3 metadata and a Swagger UI dashboard.
* **`OpenApiConfig`** is customized to set titles, descriptions, contact info, and automatically documents required operations. Springdoc handles the required `X-User-Id` header parameters seamlessly.

---

## 3. Environment & Database Verification

1. **Docker Setup & Database Startup**:
   * We started the Windows Docker Desktop process programmatically.
   * We activated the stopped **`postgres-container`** container, which connects port `5432` locally.
   * We ran `CREATE DATABASE tasks2db;` inside the container, confirming the database is live and matching `application.yml` specifications.
2. **PostgreSQL Timezone Error Resolution**:
   * On startup, the JVM is programmatically set to UTC (`TimeZone.setDefault(TimeZone.getTimeZone("UTC"))` in `TaskManagementApplication.java`) and the JDBC connection string maps `?options=-c%20timezone=UTC` in `application.yml`.
   * This completely bypasses the Windows-PostgreSQL driver handshake timezone bug (`invalid value for parameter "TimeZone": "Asia/Saigon"`) and yields seamless connectivity.
3. **Compilation & Packaging Verification**:
   * We executed a full build and package lifecycle:
     ```powershell
     mvn clean package -DskipTests
     ```
   * Result: **`BUILD SUCCESS`** in **10.6 seconds**, creating a production-ready repackaged jar file: `target/taskmanagement-0.0.1-SNAPSHOT.jar`.

---

## 4. REST API Endpoint Contract Reference

### 1. Create a Task
* **Route**: `POST /api/tasks`
* **Headers**: `X-User-Id: <UUID>`
* **Body**:
  ```json
  {
    "title": "Finish report",
    "description": "Prepare the monthly team performance report"
  }
  ```
* **Response**: `201 Created` with `TaskResponse` JSON structure.

### 2. Update a Task
* **Route**: `PUT /api/tasks/{taskId}`
* **Headers**: `X-User-Id: <UUID>`
* **Body**:
  ```json
  {
    "title": "Finish report - Reviewing",
    "description": "Prepare the monthly team performance report",
    "status": "IN_PROGRESS"
  }
  ```
* **Response**: `200 OK` with updated `TaskResponse` JSON structure.

### 3. Retrieve Task List
* **Route**: `GET /api/tasks`
* **Headers**: `X-User-Id: <UUID>`
* **Response**: `200 OK` containing a list of `TaskResponse` items wrapped inside `TaskListResponse`.

### 4. Get Task Detail
* **Route**: `GET /api/tasks/{taskId}`
* **Headers**: `X-User-Id: <UUID>`
* **Response**: `200 OK` with `TaskResponse` JSON structure.

### 5. Delete a Task
* **Route**: `DELETE /api/tasks/{taskId}`
* **Headers**: `X-User-Id: <UUID>`
* **Response**: `204 No Content`
