package com.example.taskmanagement.task.controller;

import com.example.taskmanagement.common.exception.ResourceNotFoundException;
import com.example.taskmanagement.common.exception.UnauthorizedAccessException;
import com.example.taskmanagement.task.dto.CreateTaskRequest;
import com.example.taskmanagement.task.dto.TaskListResponse;
import com.example.taskmanagement.task.dto.TaskResponse;
import com.example.taskmanagement.task.dto.UpdateTaskRequest;
import com.example.taskmanagement.task.service.TaskService;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.Collections;
import java.util.UUID;

import static org.hamcrest.Matchers.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TaskController.class)
@DisplayName("TaskController WebMvc Tests")
class TaskControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private TaskService taskService;

    private UUID userId;
    private UUID taskId;
    private TaskResponse mockTaskResponse;

    @BeforeEach
    void setUp() {
        userId = UUID.randomUUID();
        taskId = UUID.randomUUID();
        mockTaskResponse = TaskResponse.builder()
                .id(taskId)
                .title("Complete Assignment")
                .description("Solve JUnit 5 and Mockito challenges")
                .status("PENDING")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();
    }

    @Nested
    @DisplayName("POST /api/tasks - Create Task Tests")
    class CreateTaskTests {

        @Test
        @DisplayName("Should return 201 Created and response body when input is valid")
        void createTask_Success() throws Exception {
            // Arrange
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title("Complete Assignment")
                    .description("Solve JUnit 5 and Mockito challenges")
                    .build();

            when(taskService.createTask(eq(userId), any(CreateTaskRequest.class))).thenReturn(mockTaskResponse);

            // Act & Assert
            mockMvc.perform(post("/api/tasks")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isCreated())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(taskId.toString())))
                    .andExpect(jsonPath("$.title", is(request.getTitle())))
                    .andExpect(jsonPath("$.description", is(request.getDescription())))
                    .andExpect(jsonPath("$.status", is("PENDING")))
                    .andExpect(jsonPath("$.createdAt", notNullValue()))
                    .andExpect(jsonPath("$.updatedAt", notNullValue()));

            verify(taskService, times(1)).createTask(eq(userId), any(CreateTaskRequest.class));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when title is blank")
        void createTask_BlankTitle_BadRequest() throws Exception {
            // Arrange
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title("")
                    .description("Description only")
                    .build();

            // Act & Assert
            mockMvc.perform(post("/api/tasks")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(400)))
                    .andExpect(jsonPath("$.error", is("Bad Request")))
                    .andExpect(jsonPath("$.message", is("Validation failed for request payload")))
                    .andExpect(jsonPath("$.details.title", is("Title is required")));

            verifyNoInteractions(taskService);
        }

        @Test
        @DisplayName("Should return 400 Bad Request when title exceeds 255 characters")
        void createTask_TitleTooLong_BadRequest() throws Exception {
            // Arrange
            String longTitle = "a".repeat(256);
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title(longTitle)
                    .description("Valid description")
                    .build();

            // Act & Assert
            mockMvc.perform(post("/api/tasks")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.details.title", is("Title must not exceed 255 characters")));

            verifyNoInteractions(taskService);
        }

        @Test
        @DisplayName("Should return 400 Bad Request when description exceeds 2000 characters")
        void createTask_DescriptionTooLong_BadRequest() throws Exception {
            // Arrange
            String longDescription = "b".repeat(2001);
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title("Valid Title")
                    .description(longDescription)
                    .build();

            // Act & Assert
            mockMvc.perform(post("/api/tasks")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.details.description", is("Description must not exceed 2000 characters")));

            verifyNoInteractions(taskService);
        }

        @Test
        @DisplayName("Should return 400 Bad Request when X-User-Id header is missing")
        void createTask_MissingUserHeader_BadRequest() throws Exception {
            // Arrange
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title("Valid Title")
                    .description("Valid description")
                    .build();

            // Act & Assert
            mockMvc.perform(post("/api/tasks")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest());

            verifyNoInteractions(taskService);
        }

        @Test
        @DisplayName("Should return 404 Not Found when service throws ResourceNotFoundException")
        void createTask_UserNotFound_NotFound() throws Exception {
            // Arrange
            CreateTaskRequest request = CreateTaskRequest.builder()
                    .title("Valid Title")
                    .description("Valid description")
                    .build();

            String errorMessage = "User not found with ID: " + userId;
            when(taskService.createTask(eq(userId), any(CreateTaskRequest.class)))
                    .thenThrow(new ResourceNotFoundException(errorMessage));

            // Act & Assert
            mockMvc.perform(post("/api/tasks")
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(404)))
                    .andExpect(jsonPath("$.error", is("Not Found")))
                    .andExpect(jsonPath("$.message", is(errorMessage)));

            verify(taskService, times(1)).createTask(eq(userId), any(CreateTaskRequest.class));
        }
    }

    @Nested
    @DisplayName("PUT /api/tasks/{taskId} - Update Task Tests")
    class UpdateTaskTests {

        @Test
        @DisplayName("Should return 200 OK and updated payload when update is successful")
        void updateTask_Success() throws Exception {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("Updated Title")
                    .description("Updated Description")
                    .status("IN_PROGRESS")
                    .build();

            TaskResponse updatedResponse = TaskResponse.builder()
                    .id(taskId)
                    .title(request.getTitle())
                    .description(request.getDescription())
                    .status(request.getStatus())
                    .createdAt(mockTaskResponse.getCreatedAt())
                    .updatedAt(LocalDateTime.now())
                    .build();

            when(taskService.updateTask(eq(taskId), eq(userId), any(UpdateTaskRequest.class))).thenReturn(updatedResponse);

            // Act & Assert
            mockMvc.perform(put("/api/tasks/{taskId}", taskId)
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.title", is(request.getTitle())))
                    .andExpect(jsonPath("$.description", is(request.getDescription())))
                    .andExpect(jsonPath("$.status", is("IN_PROGRESS")));

            verify(taskService, times(1)).updateTask(eq(taskId), eq(userId), any(UpdateTaskRequest.class));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when status pattern is invalid")
        void updateTask_InvalidStatusPattern_BadRequest() throws Exception {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("Updated Title")
                    .description("Updated Description")
                    .status("INVALID_STATUS_VALUE")
                    .build();

            // Act & Assert
            mockMvc.perform(put("/api/tasks/{taskId}", taskId)
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.details.status", is("Status must be one of: PENDING, IN_PROGRESS, COMPLETED")));

            verifyNoInteractions(taskService);
        }

        @Test
        @DisplayName("Should return 403 Forbidden when user is unauthorized to update task")
        void updateTask_UnauthorizedAccess_Forbidden() throws Exception {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("Updated Title")
                    .description("Updated Description")
                    .status("COMPLETED")
                    .build();

            String errorMessage = "Access Denied: You do not have permission to access this task.";
            when(taskService.updateTask(eq(taskId), eq(userId), any(UpdateTaskRequest.class)))
                    .thenThrow(new UnauthorizedAccessException(errorMessage));

            // Act & Assert
            mockMvc.perform(put("/api/tasks/{taskId}", taskId)
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isForbidden())
                    .andExpect(jsonPath("$.status", is(403)))
                    .andExpect(jsonPath("$.error", is("Forbidden")))
                    .andExpect(jsonPath("$.message", is(errorMessage)));

            verify(taskService, times(1)).updateTask(eq(taskId), eq(userId), any(UpdateTaskRequest.class));
        }

        @Test
        @DisplayName("Should return 400 Bad Request when service throws ResponseStatusException")
        void updateTask_ResponseStatusException_BadRequest() throws Exception {
            // Arrange
            UpdateTaskRequest request = UpdateTaskRequest.builder()
                    .title("Updated Title")
                    .description("Updated Description")
                    .status("COMPLETED")
                    .build();

            String errorMessage = "Invalid task status: COMPLETED";
            when(taskService.updateTask(eq(taskId), eq(userId), any(UpdateTaskRequest.class)))
                    .thenThrow(new ResponseStatusException(HttpStatus.BAD_REQUEST, errorMessage));

            // Act & Assert
            mockMvc.perform(put("/api/tasks/{taskId}", taskId)
                            .header("X-User-Id", userId.toString())
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(objectMapper.writeValueAsString(request)))
                    .andExpect(status().isBadRequest())
                    .andExpect(jsonPath("$.status", is(400)))
                    .andExpect(jsonPath("$.message", is(errorMessage)));

            verify(taskService, times(1)).updateTask(eq(taskId), eq(userId), any(UpdateTaskRequest.class));
        }
    }

    @Nested
    @DisplayName("DELETE /api/tasks/{taskId} - Delete Task Tests")
    class DeleteTaskTests {

        @Test
        @DisplayName("Should return 244 No Content when delete is successful")
        void deleteTask_Success() throws Exception {
            // Arrange
            doNothing().when(taskService).deleteTask(taskId, userId);

            // Act & Assert
            mockMvc.perform(delete("/api/tasks/{taskId}", taskId)
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNoContent())
                    .andExpect(content().string(""));

            verify(taskService, times(1)).deleteTask(taskId, userId);
        }

        @Test
        @DisplayName("Should return 404 Not Found when task is missing")
        void deleteTask_TaskNotFound_NotFound() throws Exception {
            // Arrange
            String errorMessage = "Task not found with ID: " + taskId;
            doThrow(new ResourceNotFoundException(errorMessage))
                    .when(taskService).deleteTask(taskId, userId);

            // Act & Assert
            mockMvc.perform(delete("/api/tasks/{taskId}", taskId)
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(404)))
                    .andExpect(jsonPath("$.message", is(errorMessage)));

            verify(taskService, times(1)).deleteTask(taskId, userId);
        }
    }

    @Nested
    @DisplayName("GET /api/tasks - Get Task List Tests")
    class GetTaskListTests {

        @Test
        @DisplayName("Should return 200 OK and TaskListResponse with elements")
        void getTaskList_Success() throws Exception {
            // Arrange
            TaskResponse responseItem = TaskResponse.builder()
                    .id(taskId)
                    .title("Complete Assignment")
                    .description("Solve JUnit 5 and Mockito challenges")
                    .status("PENDING")
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build();

            TaskListResponse listResponse = TaskListResponse.builder()
                    .tasks(Arrays.asList(responseItem))
                    .build();

            when(taskService.getTaskList(userId)).thenReturn(listResponse);

            // Act & Assert
            mockMvc.perform(get("/api/tasks")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.tasks", hasSize(1)))
                    .andExpect(jsonPath("$.tasks[0].id", is(taskId.toString())))
                    .andExpect(jsonPath("$.tasks[0].title", is("Complete Assignment")));

            verify(taskService, times(1)).getTaskList(userId);
        }

        @Test
        @DisplayName("Should return 200 OK and empty tasks when user has no tasks")
        void getTaskList_Empty_Success() throws Exception {
            // Arrange
            TaskListResponse listResponse = TaskListResponse.builder()
                    .tasks(Collections.emptyList())
                    .build();

            when(taskService.getTaskList(userId)).thenReturn(listResponse);

            // Act & Assert
            mockMvc.perform(get("/api/tasks")
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.tasks", hasSize(0)));

            verify(taskService, times(1)).getTaskList(userId);
        }
    }

    @Nested
    @DisplayName("GET /api/tasks/{taskId} - Get Task By ID Tests")
    class GetTaskByIdTests {

        @Test
        @DisplayName("Should return 200 OK and TaskResponse when task exists")
        void getTaskById_Success() throws Exception {
            // Arrange
            when(taskService.getTaskById(taskId, userId)).thenReturn(mockTaskResponse);

            // Act & Assert
            mockMvc.perform(get("/api/tasks/{taskId}", taskId)
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isOk())
                    .andExpect(content().contentType(MediaType.APPLICATION_JSON))
                    .andExpect(jsonPath("$.id", is(taskId.toString())))
                    .andExpect(jsonPath("$.title", is("Complete Assignment")));

            verify(taskService, times(1)).getTaskById(taskId, userId);
        }

        @Test
        @DisplayName("Should return 404 Not Found when task is missing")
        void getTaskById_NotFound() throws Exception {
            // Arrange
            String errorMessage = "Task not found with ID: " + taskId;
            when(taskService.getTaskById(taskId, userId)).thenThrow(new ResourceNotFoundException(errorMessage));

            // Act & Assert
            mockMvc.perform(get("/api/tasks/{taskId}", taskId)
                            .header("X-User-Id", userId.toString()))
                    .andExpect(status().isNotFound())
                    .andExpect(jsonPath("$.status", is(404)))
                    .andExpect(jsonPath("$.message", is(errorMessage)));

            verify(taskService, times(1)).getTaskById(taskId, userId);
        }
    }
}
