package com.example.taskmanagement.task.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * DTO response class wrapping a list of TaskResponses.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TaskListResponse {

    private List<TaskResponse> tasks;
}
