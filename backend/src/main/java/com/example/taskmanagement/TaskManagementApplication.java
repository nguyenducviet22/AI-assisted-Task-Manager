package com.example.taskmanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import java.util.TimeZone;

/**
 * Spring Boot Application Entry Point.
 */
@SpringBootApplication
public class TaskManagementApplication {

    public static void main(String[] args) {
        // Set the default JVM timezone to UTC to bypass PostgreSQL driver's Asia/Saigon timezone bug
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"));
        SpringApplication.run(TaskManagementApplication.class, args);
    }
}
