package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GodownDispatchRequest {
    private Long sentById;
    private Long targetOutletId;
    private List<GodownDispatchItemRequest> items;
}
