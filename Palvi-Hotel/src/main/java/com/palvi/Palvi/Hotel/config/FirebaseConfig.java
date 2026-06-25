package com.palvi.Palvi.Hotel.config;

import com.google.auth.oauth2.GoogleCredentials;
import com.google.firebase.FirebaseApp;
import com.google.firebase.FirebaseOptions;
import org.springframework.context.annotation.Configuration;
import jakarta.annotation.PostConstruct;

import java.io.InputStream;

@Configuration
public class FirebaseConfig {

    @PostConstruct
    public void initialize() {
        try {
            // Check if already initialized
            if (FirebaseApp.getApps().isEmpty()) {
                InputStream serviceAccount = 
                    getClass().getClassLoader().getResourceAsStream("palvi-hotel-firebase-adminsdk-fbsvc-7a8c5aef71.json");
                
                if (serviceAccount == null) {
                    System.err.println("WARNING: palvi-hotel-firebase-adminsdk-fbsvc-7a8c5aef71.json not found in resources folder. Firebase Push Notifications will not work.");
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
