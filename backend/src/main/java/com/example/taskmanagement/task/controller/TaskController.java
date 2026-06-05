package com.example.taskmanagement.task.controller;

import com.example.taskmanagement.common.exception.ErrorResponse;
import com.example.taskmanagement.task.dto.CreateTaskRequest;
import com.example.taskmanagement.task.dto.TaskListResponse;
import com.example.taskmanagement.task.dto.TaskResponse;
import com.example.taskmanagement.task.dto.UpdateTaskRequest;
import com.example.taskmanagement.task.service.TaskService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

/**
 * REST Controller for managing Task resource endpoints.
 */
@RestController
@RequestMapping("/api/tasks")
@RequiredArgsConstructor
@Tag(name = "Tasks", description = "Endpoints for managing user task entities")
public class TaskController {

    private final TaskService taskService;

    /**
     * POST /api/tasks : Create a new task.
     *
     * @param userId  the UUID of the user creating the task (provided via X-User-Id header)
     * @param request the create task request payload
     * @return the created TaskResponse DTO with HTTP 201 Created
     */
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Create a new task",
            description = "Creates a new task associated with the user ID provided in the header."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "201",
                    description = "Task created successfully",
                    content = @Content(schema = @Schema(implementation = TaskResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid request payload or missing user ID header",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public TaskResponse createTask(
            @Parameter(description = "The UUID of the user creating the task", required = true)
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody CreateTaskRequest request) {
        return taskService.createTask(userId, request);
    }

    /**
     * PUT /api/tasks/{taskId} : Update an existing task.
     *
     * @param taskId  the UUID of the task to update
     * @param userId  the UUID of the user requesting the update (provided via X-User-Id header)
     * @param request the update task request payload
     * @return the updated TaskResponse DTO with HTTP 200 OK
     */
    @PutMapping("/{taskId}")
    @Operation(
            summary = "Update an existing task",
            description = "Updates the title, description, or status of an existing task. Enforces that the requesting user owns the task."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Task updated successfully",
                    content = @Content(schema = @Schema(implementation = TaskResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Invalid input data, invalid task status, or missing user ID header",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Access denied. The requesting user does not own this task.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Task not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public TaskResponse updateTask(
            @Parameter(description = "The UUID of the task to update", required = true)
            @PathVariable UUID taskId,
            @Parameter(description = "The UUID of the user requesting the update", required = true)
            @RequestHeader("X-User-Id") UUID userId,
            @Valid @RequestBody UpdateTaskRequest request) {
        return taskService.updateTask(taskId, userId, request);
    }

    /**
     * DELETE /api/tasks/{taskId} : Delete an existing task.
     *
     * @param taskId the UUID of the task to delete
     * @param userId the UUID of the user requesting deletion (provided via X-User-Id header)
     */
    @DeleteMapping("/{taskId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    @Operation(
            summary = "Delete an existing task",
            description = "Deletes a task by its ID. Enforces that the requesting user owns the task."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "204",
                    description = "Task deleted successfully"
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Missing user ID header",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Access denied. The requesting user does not own this task.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Task not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public void deleteTask(
            @Parameter(description = "The UUID of the task to delete", required = true)
            @PathVariable UUID taskId,
            @Parameter(description = "The UUID of the user requesting deletion", required = true)
            @RequestHeader("X-User-Id") UUID userId) {
        taskService.deleteTask(taskId, userId);
    }

    /**
     * GET /api/tasks : Retrieve list of all tasks for the requesting user.
     *
     * @param userId the UUID of the user (provided via X-User-Id header)
     * @return the TaskListResponse DTO with HTTP 200 OK
     */
    @GetMapping
    @Operation(
            summary = "Retrieve all tasks for the user",
            description = "Returns a list of all tasks owned by the requesting user provided in the header."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Task list retrieved successfully",
                    content = @Content(schema = @Schema(implementation = TaskListResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Missing user ID header",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public TaskListResponse getTaskList(
            @Parameter(description = "The UUID of the user requesting tasks", required = true)
            @RequestHeader("X-User-Id") UUID userId) {
        return taskService.getTaskList(userId);
    }

    /**
     * GET /api/tasks/{taskId} : Retrieve specific task details.
     *
     * @param taskId the UUID of the task to retrieve
     * @param userId the UUID of the user requesting details (provided via X-User-Id header)
     * @return the TaskResponse DTO with HTTP 200 OK
     */
    @GetMapping("/{taskId}")
    @Operation(
            summary = "Retrieve specific task details",
            description = "Returns detailed information of a task by its ID. Enforces that the requesting user owns the task."
    )
    @ApiResponses(value = {
            @ApiResponse(
                    responseCode = "200",
                    description = "Task details retrieved successfully",
                    content = @Content(schema = @Schema(implementation = TaskResponse.class))
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Missing user ID header",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "Access denied. The requesting user does not own this task.",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "Task not found",
                    content = @Content(schema = @Schema(implementation = ErrorResponse.class))
            )
    })
    public TaskResponse getTaskById(
            @Parameter(description = "The UUID of the task to retrieve", required = true)
            @PathVariable UUID taskId,
            @Parameter(description = "The UUID of the user requesting details", required = true)
            @RequestHeader("X-User-Id") UUID userId) {
        return taskService.getTaskById(taskId, userId);
    }
}
