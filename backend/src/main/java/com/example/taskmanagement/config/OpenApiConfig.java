package com.example.taskmanagement.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuration class to customize Swagger OpenAPI documentation.
 */
@Configuration
public class OpenApiConfig {

    /**
     * Define the OpenAPI standard metadata title, description, version, and contact.
     */
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Task Management System REST API")
                        .version("1.0.0")
                        .description("Enterprise-grade REST API backend built with Spring Boot 3, Java 21, JPA/Hibernate, and PostgreSQL.")
                        .contact(new Contact()
                                .name("Development Team")
                                .email("support@example.com")));
    }
}
