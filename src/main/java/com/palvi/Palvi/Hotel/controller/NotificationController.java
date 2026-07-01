package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.NotificationDto;
import com.palvi.Palvi.Hotel.service.NotificationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
@Tag(name = "Notification Controller", description = "Endpoints for viewing and dismissing system alerts and triggers")
public class NotificationController {

    @Autowired
    private NotificationService notificationService;

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get All Notifications", description = "Retrieves all notifications ordered by creation date.")
    public ResponseEntity<List<NotificationDto>> getAllNotifications() {
        return ResponseEntity.ok(notificationService.getAllNotifications());
    }

    @GetMapping("/unread")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get Unread Notifications", description = "Retrieves unread notifications list.")
    public ResponseEntity<List<NotificationDto>> getUnreadNotifications() {
        return ResponseEntity.ok(notificationService.getUnreadNotifications());
    }

    @Autowired
    private com.palvi.Palvi.Hotel.service.FirebaseMessagingService firebaseMessagingService;

    @PutMapping("/{id}/read")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Mark Notification as Read", description = "Dismisses an alert by marking it read.")
    public ResponseEntity<NotificationDto> markAsRead(@PathVariable Long id) {
        return ResponseEntity.ok(notificationService.markAsRead(id));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Delete Notification", description = "Removes a notification record.")
    public ResponseEntity<Void> deleteNotification(@PathVariable Long id) {
        notificationService.deleteNotification(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/test-fcm")
    @Operation(summary = "Send Test FCM Push Notification", description = "Dispatches a manual test push notification to a specific topic.")
    public ResponseEntity<String> sendTestFcm(
            @RequestParam String topic,
            @RequestParam String title,
            @RequestParam String body) {
        firebaseMessagingService.sendNotificationToTopic(topic, title, body);
        return ResponseEntity.ok("Test notification request dispatched to topic: " + topic);
    }
}
