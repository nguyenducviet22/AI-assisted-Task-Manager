package com.example.taskmanagement.task.integration;

import com.example.taskmanagement.task.dto.CreateTaskRequest;
import com.example.taskmanagement.task.dto.TaskListResponse;
import com.example.taskmanagement.task.dto.TaskResponse;
import com.example.taskmanagement.task.dto.UpdateTaskRequest;
import com.example.taskmanagement.task.entity.Task;
import com.example.taskmanagement.task.entity.TaskStatus;
import com.example.taskmanagement.task.repository.TaskRepository;
import com.example.taskmanagement.user.entity.User;
import com.example.taskmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.*;
import org.springframework.test.context.DynamicPropertyRegistry;
import org.springframework.test.context.DynamicPropertySource;
import org.testcontainers.containers.PostgreSQLContainer;

import java.util.List;
import java.util.TimeZone;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@DisplayName("Task API End-to-End Integration Tests")
class TaskApiIntegrationTest {

    // Manage container instance manually to handle startup fallbacks gracefully
    static PostgreSQLContainer<?> postgres = new PostgreSQLContainer<>("postgres:16-alpine");

    static {
        // Force the JVM default timezone to UTC for the duration of the test.
        // This prevents the PostgreSQL JDBC driver from automatically negotiating the host's "Asia/Saigon" timezone
        // which causes fatal errors on PostgreSQL instances (like Alpine or minimal docker containers) lacking tzdata.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));

        try {
            postgres.start();
            System.out.println(">>> Testcontainers started successfully! Running tests against dynamic PostgreSQL container. <<<");
        } catch (Exception e) {
            System.err.println(">>> Testcontainers failed to start: " + e.getMessage() + ". <<<");
            System.err.println(">>> Hybrid Fallback: Redirecting integration tests to the local running PostgreSQL instance at localhost:5432. <<<");
        }
    }

    @DynamicPropertySource
    static void configureProperties(DynamicPropertyRegistry registry) {
        if (postgres.isRunning()) {
            registry.add("spring.datasource.url", () -> postgres.getJdbcUrl() + "&options=-c%20timezone=UTC");
            registry.add("spring.datasource.username", postgres::getUsername);
            registry.add("spring.datasource.password", postgres::getPassword);
            registry.add("spring.jpa.hibernate.ddl-auto", () -> "create-drop");
        } else {
            // Fallback to the active database on host running on Docker
            registry.add("spring.datasource.url", () -> "jdbc:postgresql://localhost:5432/tasks2db?options=-c%20timezone=UTC");
            registry.add("spring.datasource.username", () -> "postgres");
            registry.add("spring.datasource.password", () -> "postgres");
            registry.add("spring.jpa.hibernate.ddl-auto", () -> "update");
        }
        registry.add("spring.jpa.show-sql", () -> "true");
    }

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private TaskRepository taskRepository;

    private User testUser;
    private HttpHeaders headers;

    @BeforeEach
    void setUp() {
        taskRepository.deleteAll();
        userRepository.deleteAll();

        // Create and save test owner
        User user = User.builder()
                .id(UUID.randomUUID())
                .username("jane_doe")
                .email("jane.doe@example.com")
                .build();
        testUser = userRepository.saveAndFlush(user);

        // Prepare request headers with X-User-Id
        headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.set("X-User-Id", testUser.getId().toString());
    }

    @AfterEach
    void tearDown() {
        taskRepository.deleteAll();
        userRepository.deleteAll();
    }

    @Test
    @DisplayName("Should successfully create a task via API POST endpoint")
    void createTask_E2E() {
        // Arrange
        CreateTaskRequest request = CreateTaskRequest.builder()
                .title("E2E Task Title")
                .description("E2E Task Description")
                .build();

        HttpEntity<CreateTaskRequest> entity = new HttpEntity<>(request, headers);

        // Act
        ResponseEntity<TaskResponse> response = restTemplate.postForEntity(
                "/api/tasks",
                entity,
                TaskResponse.class
        );

        // Assert
        assertEquals(HttpStatus.CREATED, response.getStatusCode());
        assertNotNull(response.getBody());

        TaskResponse responseBody = response.getBody();
        assertNotNull(responseBody.getId());
        assertEquals("E2E Task Title", responseBody.getTitle());
        assertEquals("E2E Task Description", responseBody.getDescription());
        assertEquals("PENDING", responseBody.getStatus());

        // Verify direct database persistence
        assertTrue(taskRepository.existsById(responseBody.getId()));
    }

    @Test
    @DisplayName("Should successfully update a task's title, description, and status via API PUT endpoint")
    void updateTask_E2E() {
        // Arrange
        Task task = Task.builder()
                .title("Initial Task Title")
                .description("Initial Description")
                .status(TaskStatus.PENDING)
                .user(testUser)
                .build();
        Task savedTask = taskRepository.saveAndFlush(task);

        UpdateTaskRequest request = UpdateTaskRequest.builder()
                .title("Updated Task Title")
                .description("Updated Description")
                .status("IN_PROGRESS")
                .build();

        HttpEntity<UpdateTaskRequest> entity = new HttpEntity<>(request, headers);

        // Act
        ResponseEntity<TaskResponse> response = restTemplate.exchange(
                "/api/tasks/" + savedTask.getId(),
                HttpMethod.PUT,
                entity,
                TaskResponse.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        TaskResponse responseBody = response.getBody();
        assertEquals(savedTask.getId(), responseBody.getId());
        assertEquals("Updated Task Title", responseBody.getTitle());
        assertEquals("Updated Description", responseBody.getDescription());
        assertEquals("IN_PROGRESS", responseBody.getStatus());

        // Verify DB update
        Task updatedTaskDb = taskRepository.findById(savedTask.getId()).orElseThrow();
        assertEquals("Updated Task Title", updatedTaskDb.getTitle());
        assertEquals(TaskStatus.IN_PROGRESS, updatedTaskDb.getStatus());
    }

    @Test
    @DisplayName("Should successfully delete a task via API DELETE endpoint")
    void deleteTask_E2E() {
        // Arrange
        Task task = Task.builder()
                .title("Task to Delete")
                .description("Will be deleted")
                .status(TaskStatus.PENDING)
                .user(testUser)
                .build();
        Task savedTask = taskRepository.saveAndFlush(task);
        assertTrue(taskRepository.existsById(savedTask.getId()));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Act
        ResponseEntity<Void> response = restTemplate.exchange(
                "/api/tasks/" + savedTask.getId(),
                HttpMethod.DELETE,
                entity,
                Void.class
        );

        // Assert
        assertEquals(HttpStatus.NO_CONTENT, response.getStatusCode());
        assertFalse(taskRepository.existsById(savedTask.getId()), "Task must be deleted from the database");
    }

    @Test
    @DisplayName("Should successfully retrieve details of an existing task via API GET by ID endpoint")
    void getTaskById_E2E() {
        // Arrange
        Task task = Task.builder()
                .title("E2E Detail Task")
                .description("Detail description")
                .status(TaskStatus.COMPLETED)
                .user(testUser)
                .build();
        Task savedTask = taskRepository.saveAndFlush(task);

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Act
        ResponseEntity<TaskResponse> response = restTemplate.exchange(
                "/api/tasks/" + savedTask.getId(),
                HttpMethod.GET,
                entity,
                TaskResponse.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        TaskResponse responseBody = response.getBody();
        assertEquals(savedTask.getId(), responseBody.getId());
        assertEquals("E2E Detail Task", responseBody.getTitle());
        assertEquals("COMPLETED", responseBody.getStatus());
    }

    @Test
    @DisplayName("Should successfully retrieve all tasks belonging to the requesting user via API GET list endpoint")
    void getTaskList_E2E() {
        // Arrange
        Task task1 = Task.builder()
                .title("E2E Task One")
                .description("Description One")
                .status(TaskStatus.PENDING)
                .user(testUser)
                .build();

        Task task2 = Task.builder()
                .title("E2E Task Two")
                .description("Description Two")
                .status(TaskStatus.IN_PROGRESS)
                .user(testUser)
                .build();

        taskRepository.saveAllAndFlush(List.of(task1, task2));

        HttpEntity<Void> entity = new HttpEntity<>(headers);

        // Act
        ResponseEntity<TaskListResponse> response = restTemplate.exchange(
                "/api/tasks",
                HttpMethod.GET,
                entity,
                TaskListResponse.class
        );

        // Assert
        assertEquals(HttpStatus.OK, response.getStatusCode());
        assertNotNull(response.getBody());

        TaskListResponse responseBody = response.getBody();
        assertNotNull(responseBody.getTasks());
        assertEquals(2, responseBody.getTasks().size());
        assertTrue(responseBody.getTasks().stream().anyMatch(t -> t.getTitle().equals("E2E Task One")));
        assertTrue(responseBody.getTasks().stream().anyMatch(t -> t.getTitle().equals("E2E Task Two")));
    }
}
