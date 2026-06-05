# Use a secure, lightweight, and official JRE 21 base image
FROM eclipse-temurin:21-jre-alpine

# Create a non-root group and user for security
RUN addgroup -S spring && adduser -S spring -G spring

# Set the working directory inside the container
WORKDIR /app

# Argument specifying the path to the pre-built JAR file
ARG JAR_FILE=target/*.jar

# Copy the compiled JAR file and change ownership to the 'spring' user
COPY --chown=spring:spring ${JAR_FILE} app.jar

# Switch to the non-root user
USER spring:spring

# Expose the default Spring Boot application port
EXPOSE 8080

# Configure production-ready JVM options for containerized environments:
# - UseContainerSupport: respects container memory limits (enabled by default in Java 10+)
# - MaxRAMPercentage: allocates up to 75% of the container's RAM to the JVM (leaving 25% for the OS/overhead)
# - UseG1GC: uses G1 Garbage Collector (recommended for modern server applications)
ENV JAVA_OPTS="-XX:+UseContainerSupport -XX:MaxRAMPercentage=75.0 -XX:+UseG1GC"

# Run the Spring Boot application jar
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
