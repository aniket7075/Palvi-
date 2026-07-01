package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.NotificationDto;
import com.palvi.Palvi.Hotel.entity.Notification;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.NotificationMapper;
import com.palvi.Palvi.Hotel.repository.NotificationRepository;
import com.palvi.Palvi.Hotel.service.NotificationService;
import com.palvi.Palvi.Hotel.service.FirebaseMessagingService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificationServiceImpl implements NotificationService {

    @Autowired
    private NotificationRepository notificationRepository;

    @Autowired
    private NotificationMapper notificationMapper;

    @Autowired
    private FirebaseMessagingService firebaseMessagingService;

    @Override
    public NotificationDto createNotification(String type, String title, String message) {
        Notification notification = Notification.builder()
                .type(type)
                .title(title)
                .message(message)
                .readStatus(false)
                .createdAt(LocalDateTime.now())
                .build();
        Notification saved = notificationRepository.save(notification);

        try {
            String topic = determineTopic(type);
            firebaseMessagingService.sendNotificationToTopic(topic, title, message);
        } catch (Exception e) {
            System.err.println("FCM Notification delivery failed: " + e.getMessage());
        }

        return notificationMapper.toDto(saved);
    }

    private String determineTopic(String type) {
        if (type == null) return "admin";
        switch (type.toUpperCase()) {
            case "LOW_STOCK":
            case "MISSING_ATTENDANCE":
            case "PENDING_CHECKLIST":
            case "DAILY_SALES":
            case "NEW_REQUIREMENT":
            case "NEW_PETTY_CASH_REQUEST":
            case "NEW_BANK_DEPOSIT":
                return "admin";
            case "REQUIREMENT_AUDIT":
            case "PETTY_CASH_AUDIT":
            case "BANK_DEPOSIT_AUDIT":
                return "manager";
            default:
                return "admin";
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getAllNotifications() {
        return notificationRepository.findAllByOrderByCreatedAtDesc().stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<NotificationDto> getUnreadNotifications() {
        return notificationRepository.findByReadStatusFalseOrderByCreatedAtDesc().stream()
                .map(notificationMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public NotificationDto markAsRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found with id: " + id));

        notification.setReadStatus(true);
        Notification saved = notificationRepository.save(notification);
        return notificationMapper.toDto(saved);
    }

    @Override
    public void deleteNotification(Long id) {
        if (!notificationRepository.existsById(id)) {
            throw new ResourceNotFoundException("Notification not found with id: " + id);
        }
        notificationRepository.deleteById(id);
    }
}
