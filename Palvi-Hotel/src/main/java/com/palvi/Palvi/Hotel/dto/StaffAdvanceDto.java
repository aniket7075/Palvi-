package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class StaffAdvanceDto {
    private Long id;
    private Long staffId;
    private String staffName;
    private Double amount;
    private LocalDate advanceDate;
    private String reason;
}
