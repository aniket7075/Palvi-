package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GodownDispatchItemResponse {
    private Long id;
    private String itemName;
    private Double quantity;
    private String unit;
}
