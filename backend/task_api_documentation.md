# Task Management API Documentation

This document provides a comprehensive REST API reference for managing tasks in the Task Management system.

---

## 🔒 Authentication & Headers

All API endpoints enforce strict user data isolation and require the client to supply the user's identifier in the request header.

| Header Name | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `X-User-Id` | `UUID` | **Yes** | The unique identifier of the requesting user | `550e8400-e29b-41d4-a716-446655440000` |
| `Content-Type` | `string` | **Yes** (write operations) | Must be set to `application/json` | `application/json` |

---

## 🎯 API Endpoints Reference

### 1. Create a Task (`POST /api/tasks`)
Creates a new task associated with the requesting user.

#### 📝 Request Body Specification
* **Format**: JSON
* **Properties**:
  - `title` (`string`, **Required**): The title of the task. Length must be between 1 and 100 characters.
  - `description` (`string`, **Optional**): Detailed description. Maximum 500 characters.

#### 📦 Response Body Specification
* **Format**: JSON
* **Properties**:
  - `id` (`UUID`): Auto-generated unique task identifier.
  - `title` (`string`): The title of the task.
  - `description` (`string`): Detailed description.
  - `status` (`string`): Initialized to `PENDING`.
  - `createdAt` (`ISO-8601 string`): Auto-generated timestamp in UTC.
  - `updatedAt` (`ISO-8601 string`): Auto-generated timestamp in UTC.

#### ⚠️ Error Responses
- **`400 Bad Request`**:
  - Returned if the `X-User-Id` header is missing.
  - Returned if the payload violates validation constraints (e.g. blank title or description exceeds character bounds).

#### 💡 Example Request
```http
POST /api/tasks HTTP/1.1
Host: localhost:8080
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "title": "Setup PostgreSQL Database",
  "description": "Initialize a docker postgres container for task management storage."
}
```

#### 💡 Example Response (`201 Created`)
```json
{
  "id": "e2298bc6-6799-4d64-9669-0260408544ef",
  "title": "Setup PostgreSQL Database",
  "description": "Initialize a docker postgres container for task management storage.",
  "status": "PENDING",
  "createdAt": "2026-05-31T09:25:00Z",
  "updatedAt": "2026-05-31T09:25:00Z"
}
```

---

### 2. Update a Task (`PUT /api/tasks/{taskId}`)
Updates the title, description, or status of an existing task. Enforces that the requesting user owns the task.

#### 📝 Request Body Specification
* **Format**: JSON
* **Properties**:
  - `title` (`string`, **Required**): The updated title of the task (1-100 characters).
  - `description` (`string`, **Optional**): Updated description (max 500 characters).
  - `status` (`string`, **Required**): Updated state. Must parse to a valid status enum: `PENDING`, `IN_PROGRESS`, `COMPLETED` (case-insensitive).

#### 📦 Response Body Specification
* **Format**: JSON (Matches `TaskResponse` schema with updated values).

#### ⚠️ Error Responses
- **`400 Bad Request`**: Returned if the payload contains validation errors or if an invalid status is supplied.
- **`403 Forbidden`**: Returned if the task exists but does not belong to the user ID supplied in the header.
- **`404 Not Found`**: Returned if no task matches the given `taskId`.

#### 💡 Example Request
```http
PUT /api/tasks/e2298bc6-6799-4d64-9669-0260408544ef HTTP/1.1
Host: localhost:8080
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "title": "Setup PostgreSQL Database (Done)",
  "description": "Container successfully initialized and timezones configured to UTC.",
  "status": "COMPLETED"
}
```

#### 💡 Example Response (`200 OK`)
```json
{
  "id": "e2298bc6-6799-4d64-9669-0260408544ef",
  "title": "Setup PostgreSQL Database (Done)",
  "description": "Container successfully initialized and timezones configured to UTC.",
  "status": "COMPLETED",
  "createdAt": "2026-05-31T09:25:00Z",
  "updatedAt": "2026-05-31T09:30:15Z"
}
```

---

### 3. Retrieve All Tasks (`GET /api/tasks`)
Retrieves all tasks belonging to the requesting user.

#### 📦 Response Body Specification
* **Format**: JSON
* **Properties**:
  - `tasks` (`array`): A list of task DTOs containing basic properties (`id`, `title`, `description`, `status`, `createdAt`, `updatedAt`).

#### ⚠️ Error Responses
- **`400 Bad Request`**: Returned if the `X-User-Id` header is missing.

#### 💡 Example Request
```http
GET /api/tasks HTTP/1.1
Host: localhost:8080
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
```

#### 💡 Example Response (`200 OK`)
```json
{
  "tasks": [
    {
      "id": "e2298bc6-6799-4d64-9669-0260408544ef",
      "title": "Setup PostgreSQL Database (Done)",
      "description": "Container successfully initialized and timezones configured to UTC.",
      "status": "COMPLETED",
      "createdAt": "2026-05-31T09:25:00Z",
      "updatedAt": "2026-05-31T09:30:15Z"
    }
  ]
}
```

---

### 4. Retrieve Specific Task Details (`GET /api/tasks/{taskId}`)
Returns detailed information of a task by its ID. Enforces that the requesting user owns the task.

#### 📦 Response Body Specification
* **Format**: JSON (Matches `TaskResponse` schema).

#### ⚠️ Error Responses
- **`403 Forbidden`**: Returned if the task exists but does not belong to the user ID supplied in the header.
- **`404 Not Found`**: Returned if no task matches the given `taskId`.

#### 💡 Example Request
```http
GET /api/tasks/e2298bc6-6799-4d64-9669-0260408544ef HTTP/1.1
Host: localhost:8080
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
```

#### 💡 Example Response (`200 OK`)
```json
{
  "id": "e2298bc6-6799-4d64-9669-0260408544ef",
  "title": "Setup PostgreSQL Database (Done)",
  "description": "Container successfully initialized and timezones configured to UTC.",
  "status": "COMPLETED",
  "createdAt": "2026-05-31T09:25:00Z",
  "updatedAt": "2026-05-31T09:30:15Z"
}
```

---

### 5. Delete a Task (`DELETE /api/tasks/{taskId}`)
Deletes a task by its ID. Enforces that the requesting user owns the task.

#### 📦 Response Body Specification
* **Format**: None (`void`). Returns empty response body.

#### ⚠️ Error Responses
- **`403 Forbidden`**: Returned if the task exists but does not belong to the user ID supplied in the header.
- **`404 Not Found`**: Returned if no task matches the given `taskId`.

#### 💡 Example Request
```http
DELETE /api/tasks/e2298bc6-6799-4d64-9669-0260408544ef HTTP/1.1
Host: localhost:8080
X-User-Id: 550e8400-e29b-41d4-a716-446655440000
```

#### 💡 Example Response (`204 No Content`)
*(Empty response body)*

---

## 🚫 Standardized Error Payload Format

When an API request fails, the backend returns a standardized JSON object structured as follows:

```json
{
  "timestamp": "2026-05-31T09:45:00.123456",
  "status": 400,
  "error": "Bad Request",
  "message": "Validation failed",
  "path": "/api/tasks",
  "details": {
    "title": "must not be blank"
  }
}
```

- **`timestamp`** (`string`): The timestamp when the error was registered by the handler.
- **`status`** (`int`): The HTTP status code.
- **`error`** (`string`): Standard HTTP error message representation.
- **`message`** (`string`): High-level developer exception message.
- **`path`** (`string`): The path request URI that failed.
- **`details`** (`map`, **Optional**): Field-specific validation constraint maps (only present on `400 Bad Request` validation payload failures).
