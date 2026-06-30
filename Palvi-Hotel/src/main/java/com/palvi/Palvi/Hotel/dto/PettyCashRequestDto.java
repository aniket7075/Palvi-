package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PettyCashRequestDto {
    private Long id;
    private Long outletId;
    private String outletName;
    private LocalDate requestDate;
    private Double amount;
    private String reason;
    private String status;
    private LocalDate resolvedDate;
    private String notes;
}
