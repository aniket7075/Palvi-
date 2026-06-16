package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.NotificationDto;
import com.palvi.Palvi.Hotel.entity.Notification;
import org.springframework.stereotype.Component;

@Component
public class NotificationMapper {

    public NotificationDto toDto(Notification entity) {
        if (entity == null) return null;
        return NotificationDto.builder()
                .id(entity.getId())
                .type(entity.getType())
                .title(entity.getTitle())
                .message(entity.getMessage())
                .readStatus(entity.isReadStatus())
                .createdAt(entity.getCreatedAt())
                .build();
    }

    public Notification toEntity(NotificationDto dto) {
        if (dto == null) return null;
        return Notification.builder()
                .id(dto.getId())
                .type(dto.getType())
                .title(dto.getTitle())
                .message(dto.getMessage())
                .readStatus(dto.isReadStatus())
                .createdAt(dto.getCreatedAt())
                .build();
    }
}
