# Palvi Hotel Management System - Setup & APK Build Guide

This guide details how to run, configure, and compile the **React + Capacitor Frontend** and **Spring Boot + Supabase Backend** into a native Android APK.

---

## 1. Spring Boot Backend Configuration

The backend is configured to use **Supabase PostgreSQL** or an in-memory **H2 Database** for local development.

### Step A: Configure Database
Open [application.properties](file:///c:/Users/husuk/Palvi/backend/src/main/resources/application.properties):

1. **For Supabase PostgreSQL (Default)**:
   Uncomment and replace placeholders with your credentials:
   ```properties
   spring.datasource.url=jdbc:postgresql://<your-project-id>.supabase.co:5432/postgres
   spring.datasource.username=postgres
   spring.datasource.password=<your-password>
   ```
2. **For H2 Database (Offline Testing)**:
   Comment out the Supabase database settings and uncomment the local H2 Configuration section.

### Step B: Start Backend via PowerShell
Modern Spring Boot compiles using Java 17. Explicitly configure your shell:
```powershell
# 1. Route session environment to Java 17
$env:JAVA_HOME = "C:\Program Files\Java\jdk-17"
$env:PATH = "$env:JAVA_HOME\bin;$env:PATH"

# 2. Compile and start the backend
cd backend
mvn spring-boot:run
```
The REST API will launch on **`http://localhost:8080`**.

---

## 2. React + Capacitor Frontend Development

The frontend is a mobile-first web app wrapped using **Capacitor** to build the Android package.

### Run in Development:
```powershell
cd frontend
npm run dev
```

---

## 3. How to Compile the Android APK

To bundle your React web pages into the native Android runtime wrapper and build the installable `.apk` file:

### Step 1: Compile React Production Build
This outputs the static build files into the `frontend/dist/` directory:
```powershell
cd frontend
npm run build
```

### Step 2: Sync with Capacitor
This copies the compiled HTML/JS/CSS assets from the `dist/` folder into the native Android project structures:
```powershell
npx cap sync
```

### Step 3: Open in Android Studio
Launch Android Studio with the project context pre-configured:
```powershell
npx cap open android
```

### Step 4: Build APK inside Android Studio
1. Wait for Android Studio to finish indexing and syncing Gradle files.
2. In the top toolbar, go to **Build > Build Bundle(s) / APK(s) > Build APK(s)**.
3. Once compilation finishes, a popup notice appears. Click **Locate** to retrieve:
   📂 `app-debug.apk` (or find it in `android/app/build/outputs/apk/debug/app-debug.apk`).
4. Transfer this `.apk` file to your mobile phone and install it directly!
