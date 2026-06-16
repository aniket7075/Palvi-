package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.NotificationDto;
import java.util.List;

public interface NotificationService {
    NotificationDto createNotification(String type, String title, String message);
    List<NotificationDto> getAllNotifications();
    List<NotificationDto> getUnreadNotifications();
    NotificationDto markAsRead(Long id);
    void deleteNotification(Long id);
}
