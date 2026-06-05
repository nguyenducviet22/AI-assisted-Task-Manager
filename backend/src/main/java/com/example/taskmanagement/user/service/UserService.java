package com.example.taskmanagement.user.service;

import com.example.taskmanagement.user.entity.User;

import java.util.UUID;

/**
 * Service interface defining operations for managing Users.
 */
public interface UserService {

    /**
     * Retrieves a user by their unique identifier.
     *
     * @param userId the UUID of the user
     * @return the User entity if found
     */
    User getUserById(UUID userId);

    /**
     * Validates that a user exists in the system.
     * Throws an exception if the user does not exist.
     *
     * @param userId the UUID of the user to validate
     */
    void validateUser(UUID userId);
}
