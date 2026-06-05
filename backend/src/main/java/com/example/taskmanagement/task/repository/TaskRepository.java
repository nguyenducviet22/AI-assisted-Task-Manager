package com.example.taskmanagement.task.repository;

import com.example.taskmanagement.task.entity.Task;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

/**
 * Spring Data JPA Repository for managing Task entity persistence.
 */
@Repository
public interface TaskRepository extends JpaRepository<Task, UUID> {

    /**
     * Find all tasks owned by a specific user.
     *
     * @param userId the UUID of the owner user
     * @return a list of Tasks belonging to the user
     */
    List<Task> findAllByUserId(UUID userId);
}
