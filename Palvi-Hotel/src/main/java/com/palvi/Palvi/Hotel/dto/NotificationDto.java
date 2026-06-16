package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationDto {
    private Long id;
    private String type;
    private String title;
    private String message;
    private boolean readStatus;
    private LocalDateTime createdAt;
}
