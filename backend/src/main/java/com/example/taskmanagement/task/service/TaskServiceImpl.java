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
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

/**
 * Service implementation for managing Task business workflows.
 */
@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class TaskServiceImpl implements TaskService {

    private final TaskRepository taskRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public TaskResponse createTask(UUID userId, CreateTaskRequest request) {
        // 1. Verify that the owner user exists in the system
        User owner = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with ID: " + userId));

        // 2. Map DTO to Task Entity (initial task status is PENDING by default)
        Task task = Task.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .status(TaskStatus.PENDING)
                .user(owner)
                .build();

        // 3. Persist and map back to DTO
        Task savedTask = taskRepository.save(task);
        return mapToResponse(savedTask);
    }

    @Override
    @Transactional
    public TaskResponse updateTask(UUID taskId, UUID userId, UpdateTaskRequest request) {
        // 1. Retrieve the task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // 2. Validate task ownership
        validateOwnership(task, userId);

        // 3. Parse and map enum status
        TaskStatus status;
        try {
            status = TaskStatus.valueOf(request.getStatus().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Invalid task status: " + request.getStatus());
        }

        // 4. Update the fields
        task.setTitle(request.getTitle());
        task.setDescription(request.getDescription());
        task.setStatus(status);

        // 5. Persist and return response
        Task updatedTask = taskRepository.save(task);
        return mapToResponse(updatedTask);
    }

    @Override
    @Transactional
    public void deleteTask(UUID taskId, UUID userId) {
        // 1. Retrieve the task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // 2. Validate ownership
        validateOwnership(task, userId);

        // 3. Delete the task
        taskRepository.delete(task);
    }

    @Override
    public TaskListResponse getTaskList(UUID userId) {
        // 1. Check if the user exists
        if (!userRepository.existsById(userId)) {
            throw new ResourceNotFoundException("User not found with ID: " + userId);
        }

        // 2. Retrieve all tasks belonging to the user
        List<Task> tasks = taskRepository.findAllByUserId(userId);

        // 3. Map to TaskResponse list and wrap inside TaskListResponse DTO
        List<TaskResponse> taskResponses = tasks.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());

        return TaskListResponse.builder()
                .tasks(taskResponses)
                .build();
    }

    @Override
    public TaskResponse getTaskById(UUID taskId, UUID userId) {
        // 1. Retrieve the task
        Task task = taskRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Task not found with ID: " + taskId));

        // 2. Validate ownership
        validateOwnership(task, userId);

        // 3. Map to response DTO
        return mapToResponse(task);
    }

    /**
     * Validates that the requested user is the owner of the task.
     * Throws 403 FORBIDDEN (via UnauthorizedAccessException) if the user is unauthorized.
     */
    private void validateOwnership(Task task, UUID userId) {
        if (!task.getUser().getId().equals(userId)) {
            throw new UnauthorizedAccessException("Access Denied: You do not have permission to access this task.");
        }
    }

    /**
     * Maps a Task Entity to a TaskResponse DTO.
     */
    private TaskResponse mapToResponse(Task task) {
        return TaskResponse.builder()
                .id(task.getId())
                .title(task.getTitle())
                .description(task.getDescription())
                .status(task.getStatus().name())
                .createdAt(task.getCreatedAt())
                .updatedAt(task.getUpdatedAt())
                .build();
    }
}
