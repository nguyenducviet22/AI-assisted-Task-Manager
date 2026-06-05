package com.example.taskmanagement.common.exception;

/**
 * Exception thrown when a user attempts to perform an operation on a resource
 * they do not own or are not authorized to access.
 */
public class UnauthorizedAccessException extends RuntimeException {

    public UnauthorizedAccessException(String message) {
        super(message);
    }
}
