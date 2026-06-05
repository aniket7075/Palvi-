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
public class AttendanceDto {
    private Long id;

    @NotNull(message = "Staff ID is required")
    private Long staffId;
    private String staffName;
    private String employeeCode;

    private LocalDate date;

    @NotBlank(message = "Attendance status is required")
    private String attendanceStatus; // PRESENT, ABSENT, HALF_DAY, LEAVE
}
