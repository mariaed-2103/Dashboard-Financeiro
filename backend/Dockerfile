# Estágio 1: Build
FROM maven:3.8.5-openjdk-17 AS build
COPY . .
RUN mvn clean package -DskipTests

# Estágio 2: Run
FROM eclipse-temurin:17-jdk-alpine
# Criar a pasta de uploads e dar permissão
RUN mkdir -p /uploads && chmod 777 /uploads
COPY --from=build /target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app.jar"]