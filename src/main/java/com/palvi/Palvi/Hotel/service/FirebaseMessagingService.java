package com.palvi.Palvi.Hotel.service;

import com.google.firebase.messaging.FirebaseMessaging;
import com.google.firebase.messaging.Message;
import com.google.firebase.messaging.Notification;
import org.springframework.stereotype.Service;

@Service
public class FirebaseMessagingService {

    public void sendNotificationToTopic(String topic, String title, String body) {
        try {
            Notification notification = Notification.builder()
                    .setTitle(title)
                    .setBody(body)
                    .build();

            Message message = Message.builder()
                    .setTopic(topic)
                    .setNotification(notification)
                    .build();

            String response = FirebaseMessaging.getInstance().send(message);
            System.out.println("Successfully sent message to topic " + topic + ": " + response);
        } catch (Exception e) {
            System.err.println("Error sending notification to topic " + topic + ": " + e.getMessage());
            e.printStackTrace();
        }
    }
}
