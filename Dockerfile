FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app
COPY pom.xml .
RUN mvn -q dependency:go-offline
COPY src ./src
RUN mvn -q clean package -DskipTests

FROM eclipse-temurin:17-jre
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
ENV PORT=7860
ENV SESSION_COOKIE_SECURE=true
EXPOSE 7860
USER 1000
ENTRYPOINT ["java", "-jar", "app.jar"]
