package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GodownDispatchResponse {
    private Long id;
    private Long sentById;
    private String sentByName;
    private Long targetOutletId;
    private String targetOutletName;
    private String status;
    private LocalDateTime dispatchDate;
    private LocalDateTime receivedDate;
    private List<GodownDispatchItemResponse> items;
}
