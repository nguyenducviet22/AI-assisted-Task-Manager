# Task Management API Backend Design

## 1. Domain Entities and Relationships

### User

| Attribute | Type      | Description       |
| --------- | --------- | ----------------- |
| id        | UUID      | Unique identifier |
| username  | String    | User login name   |
| email     | String    | User email        |
| createdAt | Timestamp | Creation time     |
| updatedAt | Timestamp | Last update time  |

### Task

| Attribute   | Type      | Description       |
| ----------- | --------- | ----------------- |
| id          | UUID      | Unique identifier |
| title       | String    | Task title        |
| description | Text      | Task details      |
| status      | Enum      | Task status       |
| createdAt   | Timestamp | Creation time     |
| updatedAt   | Timestamp | Last update time  |
| userId      | UUID      | Owner reference   |

### Task Status

* PENDING
* IN_PROGRESS
* COMPLETED

### Relationships

```text
User (1) -------- (N) Task
```

* One User owns multiple Tasks.
* One Task belongs to exactly one User.

---

## 2. DTO Definitions

### CreateTaskRequest

| Field       | Type   |
| ----------- | ------ |
| title       | String |
| description | String |

### UpdateTaskRequest

| Field       | Type   |
| ----------- | ------ |
| title       | String |
| description | String |
| status      | String |

### TaskResponse

| Field       | Type      |
| ----------- | --------- |
| id          | UUID      |
| title       | String    |
| description | String    |
| status      | String    |
| createdAt   | Timestamp |
| updatedAt   | Timestamp |

### TaskListResponse

| Field | Type               |
| ----- | ------------------ |
| tasks | List<TaskResponse> |

### DeleteTaskResponse

| Field   | Type   |
| ------- | ------ |
| message | String |

---

## 3. Repository Design

### User Repository

**Responsibilities**

* Find user by id
* Find user by email
* Check user existence

**Operations**

```text
findById(id)
findByEmail(email)
existsById(id)
```

### Task Repository

**Responsibilities**

* Persist task data
* Retrieve task data
* Delete task data

**Operations**

```text
save(task)
findById(id)
findAllByUserId(userId)
deleteById(id)
existsById(id)
```

---

## 4. Service Responsibilities and Methods

### Task Service

**Responsibilities**

* Create task
* Update task
* Delete task
* Retrieve task list
* Validate ownership
* Apply business rules

**Methods**

```text
createTask(userId, CreateTaskRequest)

updateTask(taskId, userId, UpdateTaskRequest)

deleteTask(taskId, userId)

getTaskList(userId)

getTaskById(taskId, userId)
```

### User Service

**Responsibilities**

* Retrieve user information
* Validate user existence

**Methods**

```text
getUserById(userId)

validateUser(userId)
```

---

## 5. Controller Endpoints

### Create Task

```http
POST /api/tasks
```

**Request Body**

```json
{
  "title": "Complete report",
  "description": "Finish monthly report"
}
```

### Update Task

```http
PUT /api/tasks/{taskId}
```

**Request Body**

```json
{
  "title": "Updated title",
  "description": "Updated description",
  "status": "IN_PROGRESS"
}
```

### Delete Task

```http
DELETE /api/tasks/{taskId}
```

### Get Task List

```http
GET /api/tasks
```

### Get Task Detail

```http
GET /api/tasks/{taskId}
```

---

## 6. Package / Module Structure

```text
com.example.taskmanagement

├── user
│   ├── entity
│   ├── dto
│   ├── repository
│   ├── service
│   └── controller
│
├── task
│   ├── entity
│   ├── dto
│   ├── repository
│   ├── service
│   └── controller
│
├── common
│   ├── exception
│   ├── response
│   ├── validation
│   └── util
│
└── config
```

---

## 7. Request / Response Flow

### Create Task Flow

```text
Client
  ↓
Task Controller
  ↓
Task Service
  ↓
User Repository
  ↓
Validate User
  ↓
Task Repository
  ↓
PostgreSQL
  ↓
Task Repository
  ↓
Task Service
  ↓
Task Controller
  ↓
Client Response
```

### Update Task Flow

```text
Client
  ↓
Task Controller
  ↓
Task Service
  ↓
Task Repository
  ↓
Ownership Validation
  ↓
Update Task
  ↓
PostgreSQL
  ↓
Response
```

### Delete Task Flow

```text
Client
  ↓
Task Controller
  ↓
Task Service
  ↓
Task Repository
  ↓
Ownership Validation
  ↓
Delete Task
  ↓
PostgreSQL
  ↓
Response
```

### View Task List Flow

```text
Client
  ↓
Task Controller
  ↓
Task Service
  ↓
Task Repository
  ↓
PostgreSQL
  ↓
Task Service
  ↓
Task Controller
  ↓
Client
```

---

## 8. Database Schema Overview

### users

| Column     | Type         | Constraints |
| ---------- | ------------ | ----------- |
| id         | UUID         | PK          |
| username   | VARCHAR(100) | NOT NULL    |
| email      | VARCHAR(255) | UNIQUE      |
| created_at | TIMESTAMP    | NOT NULL    |
| updated_at | TIMESTAMP    | NOT NULL    |

### tasks

| Column      | Type         | Constraints   |
| ----------- | ------------ | ------------- |
| id          | UUID         | PK            |
| title       | VARCHAR(255) | NOT NULL      |
| description | TEXT         | NULL          |
| status      | VARCHAR(50)  | NOT NULL      |
| user_id     | UUID         | FK → users.id |
| created_at  | TIMESTAMP    | NOT NULL      |
| updated_at  | TIMESTAMP    | NOT NULL      |

### Database Relationship

```text
users
 └───< tasks

users.id
    ↓
tasks.user_id
```

### Index Recommendation

```text
PK_users(id)

PK_tasks(id)

IDX_tasks_user_id

IDX_tasks_status

UNIQUE_users_email
```
