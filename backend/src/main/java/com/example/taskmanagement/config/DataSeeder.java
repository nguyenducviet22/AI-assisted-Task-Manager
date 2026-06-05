package com.example.taskmanagement.config;

import com.example.taskmanagement.user.entity.User;
import com.example.taskmanagement.user.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * Automatically seeds the database with the default mock users required by the React frontend
 * at application startup.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;

    @Override
    public void run(String... args) throws Exception {
        seedUser(UUID.fromString("11111111-1111-1111-1111-111111111111"), "Alex Sterling", "alex.sterling@example.com");
        seedUser(UUID.fromString("22222222-2222-2222-2222-222222222222"), "Marcus Vance", "marcus.vance@example.com");
        seedUser(UUID.fromString("f1012345-1111-1111-1111-111111111111"), "Custom Developer", "custom.dev@example.com");
    }

    private void seedUser(UUID id, String username, String email) {
        if (!userRepository.existsById(id) && userRepository.findByEmail(email).isEmpty()) {
            User user = User.builder()
                    .id(id)
                    .username(username)
                    .email(email)
                    .build();
            userRepository.save(user);
            log.info("Successfully seeded mock user: {} with ID: {}", username, id);
        } else {
            log.info("Mock user already exists (by ID or Email): {}", username);
        }
    }
}
