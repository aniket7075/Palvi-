FROM eclipse-temurin:17-jdk-jammy AS build

WORKDIR /app

COPY . .

# Run maven wrapper build inside the complete Palvi-Hotel project folder
RUN sed -i 's/\r$//' Palvi-Hotel/mvnw && chmod +x Palvi-Hotel/mvnw
RUN cd Palvi-Hotel && ./mvnw clean package -DskipTests

FROM eclipse-temurin:17-jre-jammy

WORKDIR /app

# Copy the compiled war package from Palvi-Hotel's target folder
COPY --from=build /app/Palvi-Hotel/target/*.war app.war

EXPOSE 8080

ENTRYPOINT ["java","-jar","app.war"]