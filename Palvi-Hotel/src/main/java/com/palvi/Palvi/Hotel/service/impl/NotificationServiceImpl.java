package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.NotificationDto;
import com.palvi.Palvi.Hotel.entity.Notification;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.NotificationMapper;
import com.palvi.Palvi.Hotel.repository.NotificationRepository;
import com.palvi.Palvi.Hotel.service.NotificationService;
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
        return notificationMapper.toDto(saved);
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
