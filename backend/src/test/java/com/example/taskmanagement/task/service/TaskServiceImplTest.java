package com.example.taskmanagement.task.service;

import com.example.taskmanagement.common.exception.ResourceNotFoundException;
import com.example.taskmanagement.common.exception.UnauthorizedAccessException;
import com.example.taskmanagement.task.dto.CreateTaskRequest;
import com.example.taskmanagement.task.dto.TaskListResponse;
import com.example.taskmanagement.task.dto.TaskResponse;
import com.example.taskmanagement.task.dto.UpdateTaskRequest;
import com.example.taskmanagement.task.entity.Task;
import com.example.taskmanagement.task.entity.TaskStatus;
import com.example.taskmanagement.task.repository.TaskRepository;
import com.example.taskmanagement.user.entity.User;
import com.example.taskmanagement.user.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.http.HttpStatus;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("TaskServiceImpl Unit Tests")
class TaskServiceImplTest {

    @Mock
    private TaskRepository taskRepository;

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private TaskServiceImpl taskService;

    private UUID userId;
    private User owner;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        owner = User.builder()
                .id(userId)
                .username("john_doe")
                .email("john.doe@example.com")
                .createdAt(LocalDateTime.now().minusDays(1))
                .updatedAt(LocalDateTime.now().minusDays(1))
                .build();
    }

    @Nested
    @DisplayName("Create Task Tests")
    class CreateTaskTests {

        @Test
        @DisplayName("Should successfully create a task when user exists")
        void createTask_Success() {
            // Arrange
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title("Complete Assignment")
                    .description("Solve JUnit 5 and Mockito challenges")
                    .build();

            Task savedTask = Task.builder()
                    .id(UUID.randomUUID())
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .status(TaskStatus.PENDING)
                    .user(owner)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(owner));
            when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

            // Act
            TaskResponse response = taskService.createTask(userId, request);

            // Assert
            assertNotNull(response, "Response should not be null");
            assertEquals(savedTask.getId(), response.getId(), "Task ID must match");
            assertEquals(request.getTitle(), response.getTitle(), "Title must match");
            assertEquals(request.getDescription(), response.getDescription(), "Description must match");
            assertEquals(TaskStatus.PENDING.name(), response.getStatus(), "Initial status must be PENDING");
            assertNotNull(response.getCreatedAt(), "Created timestamp should exist");
            assertNotNull(response.getUpdatedAt(), "Updated timestamp should exist");

            // Verify mapping to entity prior to repository save
            ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
            verify(taskRepository, times(1)).save(taskCaptor.capture());
            Task capturedTask = taskCaptor.getValue();
            assertEquals(request.getTitle(), capturedTask.getTitle(), "Entity title should match request title");
            assertEquals(request.getDescription(), capturedTask.getDescription(), "Entity description should match request description");
            assertEquals(TaskStatus.PENDING, capturedTask.getStatus(), "Entity status should be initialized to PENDING");
            assertEquals(owner, capturedTask.getUser(), "Entity owner user must match mock owner");

            verify(userRepository, times(1)).findById(userId);
        }

        @Test
        @DisplayName("Should successfully create a task when description is null")
        void createTask_NullDescription_Success() {
            // Arrange
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title("Task with Null Description")
                    .description(null)
                    .build();

            Task savedTask = Task.builder()
                    .id(UUID.randomUUID())
                    .title(request.getTitle())
                    .description(null)
                    .status(TaskStatus.PENDING)
                    .user(owner)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.of(owner));
            when(taskRepository.save(any(Task.class))).thenReturn(savedTask);

            // Act
            TaskResponse response = taskService.createTask(userId, request);

            // Assert
            assertNotNull(response);
            assertNull(response.getDescription(), "Description should be null");
            assertEquals(request.getTitle(), response.getTitle());
            assertEquals(TaskStatus.PENDING.name(), response.getStatus());

            ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
            verify(taskRepository, times(1)).save(taskCaptor.capture());
            assertNull(taskCaptor.getValue().getDescription(), "Captured entity description should be null");
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user does not exist")
        void createTask_UserNotFound() {
            // Arrange
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title("Learn Mockito")
                    .description("Master stubbing and verifications")
                    .build();

            when(userRepository.findById(userId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                    taskService.createTask(userId, request),
                    "Should throw ResourceNotFoundException when user is not found"
            );

            assertTrue(exception.getMessage().contains("User not found with ID: " + userId));
            verify(userRepository, times(1)).findById(userId);
            verify(taskRepository, never()).save(any(Task.class));
        }
    }

    @Nested
    @DisplayName("Update Task Tests")
    class UpdateTaskTests {

        private UUID taskId;
        private Task existingTask;

        @BeforeEach
        void setUp() {
            taskId = UUID.randomUUID();
            existingTask = Task.builder()
                    .id(taskId)
                    .title("Old Title")
                    .description("Old Description")
                    .status(TaskStatus.PENDING)
                    .user(owner)
                    .createdAt(LocalDateTime.now().minusHours(2))
                    .updatedAt(LocalDateTime.now().minusHours(2))
                    .build();
        }

        @Test
        @DisplayName("Should successfully update task fields when owner matches and status is valid")
        void updateTask_Success() {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("New Title")
                    .description("New Description")
                    .status("IN_PROGRESS")
                    .build();

            Task updatedTask = Task.builder()
                    .id(taskId)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .status(TaskStatus.IN_PROGRESS)
                    .user(owner)
                    .createdAt(existingTask.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
            when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

            // Act
            TaskResponse response = taskService.updateTask(taskId, userId, request);

            // Assert
            assertNotNull(response, "Response should not be null");
            assertEquals(request.getTitle(), response.getTitle(), "Title should match request");
            assertEquals(request.getDescription(), response.getDescription(), "Description should match request");
            assertEquals("IN_PROGRESS", response.getStatus(), "Status should be updated to IN_PROGRESS");

            // Verify updates were applied to the captured entity before save
            ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
            verify(taskRepository, times(1)).save(taskCaptor.capture());
            Task capturedTask = taskCaptor.getValue();
            assertEquals(request.getTitle(), capturedTask.getTitle());
            assertEquals(request.getDescription(), capturedTask.getDescription());
            assertEquals(TaskStatus.IN_PROGRESS, capturedTask.getStatus());

            verify(taskRepository, times(1)).findById(taskId);
        }

        @Test
        @DisplayName("Should successfully update task and map status when status string is in mixed case")
        void updateTask_CaseInsensitiveStatus_Success() {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("New Title")
                    .description("New Description")
                    .status("In_PrOgReSs")
                    .build();

            Task updatedTask = Task.builder()
                    .id(taskId)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .status(TaskStatus.IN_PROGRESS)
                    .user(owner)
                    .createdAt(existingTask.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));
            when(taskRepository.save(any(Task.class))).thenReturn(updatedTask);

            // Act
            TaskResponse response = taskService.updateTask(taskId, userId, request);

            // Assert
            assertNotNull(response);
            assertEquals("IN_PROGRESS", response.getStatus(), "Status should be correctly converted to uppercase IN_PROGRESS");

            ArgumentCaptor<Task> taskCaptor = ArgumentCaptor.forClass(Task.class);
            verify(taskRepository, times(1)).save(taskCaptor.capture());
            assertEquals(TaskStatus.IN_PROGRESS, taskCaptor.getValue().getStatus(), "Captured status should be IN_PROGRESS");
        }

        @Test
        @DisplayName("Should throw NullPointerException when status is null (Service isolation behavior)")
        void updateTask_NullStatus_ThrowsNullPointerException() {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("Updated Title")
                    .description("Updated Description")
                    .status(null)
                    .build();

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));

            // Act & Assert
            assertThrows(NullPointerException.class, () ->
                    taskService.updateTask(taskId, userId, request)
            );
            verify(taskRepository, never()).save(any(Task.class));
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when task is not found")
        void updateTask_TaskNotFound() {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("New Title")
                    .description("New Description")
                    .status("COMPLETED")
                    .build();

            when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                    taskService.updateTask(taskId, userId, request),
                    "Should throw ResourceNotFoundException when task is missing"
            );

            assertTrue(exception.getMessage().contains("Task not found with ID: " + taskId));
            verify(taskRepository, times(1)).findById(taskId);
            verify(taskRepository, never()).save(any(Task.class));
        }

        @Test
        @DisplayName("Should throw UnauthorizedAccessException when caller does not own the task")
        void updateTask_UnauthorizedAccess() {
            // Arrange
            UUID otherUserId = UUID.randomUUID();
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("Malicious Title")
                    .description("Modifying someone else's task")
                    .status("COMPLETED")
                    .build();

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));

            // Act & Assert
            UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () ->
                    taskService.updateTask(taskId, otherUserId, request),
                    "Should throw UnauthorizedAccessException when non-owner updates task"
            );

            assertEquals("Access Denied: You do not have permission to access this task.", exception.getMessage());
            verify(taskRepository, times(1)).findById(taskId);
            verify(taskRepository, never()).save(any(Task.class));
        }

        @Test
        @DisplayName("Should throw ResponseStatusException (BAD_REQUEST) when status is invalid")
        void updateTask_InvalidStatusValue() {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("Updated Title")
                    .description("Updated Description")
                    .status("NOT_A_VALID_STATUS")
                    .build();

            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));

            // Act & Assert
            ResponseStatusException exception = assertThrows(ResponseStatusException.class, () ->
                    taskService.updateTask(taskId, userId, request),
                    "Should throw ResponseStatusException when passing non-existent enum value"
            );

            assertEquals(HttpStatus.BAD_REQUEST, exception.getStatusCode());
            assertTrue(exception.getReason().contains("Invalid task status: NOT_A_VALID_STATUS"));
            verify(taskRepository, times(1)).findById(taskId);
            verify(taskRepository, never()).save(any(Task.class));
        }
    }

    @Nested
    @DisplayName("Delete Task Tests")
    class DeleteTaskTests {

        private UUID taskId;
        private Task existingTask;

        @BeforeEach
        void setUp() {
            taskId = UUID.randomUUID();
            existingTask = Task.builder()
                    .id(taskId)
                    .title("Task to Delete")
                    .description("Delete Me")
                    .status(TaskStatus.PENDING)
                    .user(owner)
                    .build();
        }

        @Test
        @DisplayName("Should successfully delete task when owner matches")
        void deleteTask_Success() {
            // Arrange
            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));

            // Act
            assertDoesNotThrow(() -> taskService.deleteTask(taskId, userId), "Should delete task without throwing exceptions");

            // Assert
            verify(taskRepository, times(1)).findById(taskId);
            verify(taskRepository, times(1)).delete(existingTask);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when task is not found")
        void deleteTask_TaskNotFound() {
            // Arrange
            when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                    taskService.deleteTask(taskId, userId)
            );

            assertTrue(exception.getMessage().contains("Task not found with ID: " + taskId));
            verify(taskRepository, times(1)).findById(taskId);
            verify(taskRepository, never()).delete(any(Task.class));
        }

        @Test
        @DisplayName("Should throw UnauthorizedAccessException when caller is not the owner")
        void deleteTask_UnauthorizedAccess() {
            // Arrange
            UUID otherUserId = UUID.randomUUID();
            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));

            // Act & Assert
            UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () ->
                    taskService.deleteTask(taskId, otherUserId)
            );

            assertEquals("Access Denied: You do not have permission to access this task.", exception.getMessage());
            verify(taskRepository, times(1)).findById(taskId);
            verify(taskRepository, never()).delete(any(Task.class));
        }
    }

    @Nested
    @DisplayName("Get Task List Tests")
    class GetTaskListTests {

        @Test
        @DisplayName("Should return wrapped task responses when user exists and has tasks")
        void getTaskList_Success() {
            // Arrange
            Task task1 = Task.builder()
                    .id(UUID.randomUUID())
                    .title("Task 1")
                    .description("Description 1")
                    .status(TaskStatus.PENDING)
                    .user(owner)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            Task task2 = Task.builder()
                    .id(UUID.randomUUID())
                    .title("Task 2")
                    .description("Description 2")
                    .status(TaskStatus.IN_PROGRESS)
                    .user(owner)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            List<Task> tasks = Arrays.asList(task1, task2);

            when(userRepository.existsById(userId)).thenReturn(true);
            when(taskRepository.findAllByUserId(userId)).thenReturn(tasks);

            // Act
            TaskListResponse response = taskService.getTaskList(userId);

            // Assert
            assertNotNull(response, "Response must not be null");
            assertNotNull(response.getTasks(), "Task list must not be null");
            assertEquals(2, response.getTasks().size(), "Should contain exactly 2 tasks");
            
            TaskResponse response1 = response.getTasks().get(0);
            assertEquals(task1.getId(), response1.getId());
            assertEquals(task1.getTitle(), response1.getTitle());
            assertEquals(task1.getDescription(), response1.getDescription());
            assertEquals(TaskStatus.PENDING.name(), response1.getStatus());

            TaskResponse response2 = response.getTasks().get(1);
            assertEquals(task2.getId(), response2.getId());
            assertEquals(task2.getTitle(), response2.getTitle());
            assertEquals(task2.getDescription(), response2.getDescription());
            assertEquals(TaskStatus.IN_PROGRESS.name(), response2.getStatus());

            verify(userRepository, times(1)).existsById(userId);
            verify(taskRepository, times(1)).findAllByUserId(userId);
        }

        @Test
        @DisplayName("Should return empty task list when user exists but has no tasks")
        void getTaskList_EmptyList() {
            // Arrange
            when(userRepository.existsById(userId)).thenReturn(true);
            when(taskRepository.findAllByUserId(userId)).thenReturn(Collections.emptyList());

            // Act
            TaskListResponse response = taskService.getTaskList(userId);

            // Assert
            assertNotNull(response, "Response must not be null");
            assertNotNull(response.getTasks(), "Task list must not be null");
            assertTrue(response.getTasks().isEmpty(), "Task list should be empty");

            verify(userRepository, times(1)).existsById(userId);
            verify(taskRepository, times(1)).findAllByUserId(userId);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when user does not exist")
        void getTaskList_UserNotFound() {
            // Arrange
            when(userRepository.existsById(userId)).thenReturn(false);

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                    taskService.getTaskList(userId)
            );

            assertTrue(exception.getMessage().contains("User not found with ID: " + userId));
            verify(userRepository, times(1)).existsById(userId);
            verify(taskRepository, never()).findAllByUserId(any(UUID.class));
        }
    }

    @Nested
    @DisplayName("Get Task By ID Tests")
    class GetTaskByIdTests {

        private UUID taskId;
        private Task existingTask;

        @BeforeEach
        void setUp() {
            taskId = UUID.randomUUID();
            existingTask = Task.builder()
                    .id(taskId)
                    .title("Sample Task")
                    .description("Sample Desc")
                    .status(TaskStatus.COMPLETED)
                    .user(owner)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();
        }

        @Test
        @DisplayName("Should successfully return task details when task exists and is owned by the user")
        void getTaskById_Success() {
            // Arrange
            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));

            // Act
            TaskResponse response = taskService.getTaskById(taskId, userId);

            // Assert
            assertNotNull(response, "Response must not be null");
            assertEquals(taskId, response.getId());
            assertEquals(existingTask.getTitle(), response.getTitle());
            assertEquals(existingTask.getDescription(), response.getDescription());
            assertEquals(TaskStatus.COMPLETED.name(), response.getStatus());

            verify(taskRepository, times(1)).findById(taskId);
        }

        @Test
        @DisplayName("Should throw ResourceNotFoundException when task does not exist")
        void getTaskById_TaskNotFound() {
            // Arrange
            when(taskRepository.findById(taskId)).thenReturn(Optional.empty());

            // Act & Assert
            ResourceNotFoundException exception = assertThrows(ResourceNotFoundException.class, () ->
                    taskService.getTaskById(taskId, userId)
            );

            assertTrue(exception.getMessage().contains("Task not found with ID: " + taskId));
            verify(taskRepository, times(1)).findById(taskId);
        }

        @Test
        @DisplayName("Should throw UnauthorizedAccessException when requester does not own the task")
        void getTaskById_UnauthorizedAccess() {
            // Arrange
            UUID otherUserId = UUID.randomUUID();
            when(taskRepository.findById(taskId)).thenReturn(Optional.of(existingTask));

            // Act & Assert
            UnauthorizedAccessException exception = assertThrows(UnauthorizedAccessException.class, () ->
                    taskService.getTaskById(taskId, otherUserId)
            );

            assertEquals("Access Denied: You do not have permission to access this task.", exception.getMessage());
            verify(taskRepository, times(1)).findById(taskId);
        }
    }
}
