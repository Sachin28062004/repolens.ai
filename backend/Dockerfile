FROM gradle:9.4.0-jdk25 AS build
WORKDIR /workspace

COPY build.gradle.kts settings.gradle.kts ./
COPY src ./src

RUN gradle clean bootJar -x test

FROM eclipse-temurin:25-jre
WORKDIR /app

COPY --from=build /workspace/build/libs/*.jar app.jar

EXPOSE 8080
ENTRYPOINT ["java", "-jar", "/app/app.jar"]
