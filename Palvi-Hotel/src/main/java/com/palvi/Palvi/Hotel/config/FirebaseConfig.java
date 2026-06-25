package com.palvi.Palvi.Hotel.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

import java.io.ByteArrayInputStream;
import java.io.InputStream;
import java.nio.charset.StandardCharsets;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // Check if already initialized
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = null;
                
                // 1. Check if we have an Environment Variable (For Render/Production)
                String firebaseEnv = System.getenv("FIREBASE_CREDENTIALS");
                if (firebaseEnv != null && !firebaseEnv.trim().isEmpty()) {
                    serviceAccount = new ByteArrayInputStream(firebaseEnv.getBytes(StandardCharsets.UTF_8));
                } else {
                    // 2. Fallback to local file (For Local Development)
                    serviceAccount = getClass().getClassLoader().getResourceAsStream("palvi-hotel-firebase-adminsdk-fbsvc-7a8c5aef71.json");
                }
                
                if (serviceAccount == null) {
                    System.err.println("WARNING: Firebase credentials not found. Set FIREBASE_CREDENTIALS env var or add the json file. Notifications will not work.");
                    return;
                }

                FirebaseOptions options = FirebaseOptions.builder()
                        .setCredentials(GoogleCredentials.fromStream(serviceAccount))
                        .build();

                FirebaseApp.initializeApp(options);
                System.out.println("Firebase Admin SDK initialized successfully.");
            }
        } catch (Exception e) {
            System.err.println("ERROR: Failed to initialize Firebase Admin SDK: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
