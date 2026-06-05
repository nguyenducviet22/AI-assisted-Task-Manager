package com.example.taskmanagement.task.service;

import com.example.taskmanagement.task.dto.CreateTaskRequest;
import com.example.taskmanagement.task.dto.TaskListResponse;
import com.example.taskmanagement.task.dto.TaskResponse;
import com.example.taskmanagement.task.dto.UpdateTaskRequest;

import java.util.UUID;

/**
 * Service interface defining operations for managing Tasks.
 */
public interface TaskService {

    /**
     * Creates a new task for the given user.
     *
     * @param userId  the UUID of the user who owns the task
     * @param request the details of the task to be created
     * @return the created task details as a TaskResponse
     */
    TaskResponse createTask(UUID userId, CreateTaskRequest request);

    /**
     * Updates an existing task after validating ownership.
     *
     * @param taskId  the UUID of the task to update
     * @param userId  the UUID of the user requesting the update (for ownership validation)
     * @param request the updated details of the task
     * @return the updated task details as a TaskResponse
     */
    TaskResponse updateTask(UUID taskId, UUID userId, UpdateTaskRequest request);

    /**
     * Deletes a task after validating ownership.
     *
     * @param taskId the UUID of the task to delete
     * @param userId the UUID of the user requesting deletion (for ownership validation)
     */
    void deleteTask(UUID taskId, UUID userId);

    /**
     * Retrieves all tasks belonging to the specified user.
     *
     * @param userId the UUID of the user
     * @return a TaskListResponse wrapping the list of tasks
     */
    TaskListResponse getTaskList(UUID userId);

    /**
     * Retrieves a specific task after validating ownership.
     *
     * @param taskId the UUID of the task to retrieve
     * @param userId the UUID of the user requesting the task (for ownership validation)
     * @return the task details as a TaskResponse
     */
    TaskResponse getTaskById(UUID taskId, UUID userId);
}
