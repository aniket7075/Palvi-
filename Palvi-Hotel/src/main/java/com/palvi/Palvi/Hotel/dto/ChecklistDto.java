package com.palvi.Palvi.Hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ChecklistDto {
    private Long id;

    @NotBlank(message = "Checklist name is required")
    private String checklistName;

    private boolean completed;
    private LocalDate checklistDate;
    private String timeRange;

    @NotNull(message = "Outlet ID is required")
    private Long outletId;
    private String outletName;
}
