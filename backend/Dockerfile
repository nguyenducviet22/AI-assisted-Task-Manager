# Stage 1: Build the application using Maven
FROM maven:3.9.6-eclipse-temurin-21-alpine AS builder
WORKDIR /build

# Copy the pom.xml and resolve dependencies (this helps cache dependencies)
COPY pom.xml .
RUN mvn dependency:go-offline -B

# Copy the source code and build the application
COPY src ./src
RUN mvn -B clean package -DskipTests

# Stage 2: Create the secure, lightweight runtime container
FROM eclipse-temurin:21-jre-alpine

# Create a non-root group and user for security
RUN addgroup -S spring && adduser -S spring -G spring

WORKDIR /app

# Copy the compiled JAR file from the builder stage
COPY --from=builder --chown=spring:spring /build/target/*.jar app.jar

# Switch to the non-root user
USER spring:spring

# Expose the default Spring Boot application port
EXPOSE 8080

# Configure production-ready JVM options
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Run the Spring Boot application jar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
