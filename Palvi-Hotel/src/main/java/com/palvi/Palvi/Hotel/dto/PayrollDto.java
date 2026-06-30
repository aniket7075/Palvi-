package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PayrollDto {
    private Long staffId;
    private String fullName;
    private String employeeCode;
    private Double baseSalary;
    private Integer totalDaysInMonth;
    private Double presentDays;
    private Double absentDays;
    private Double halfDays;
    private Double leaveDays;
    private Double workingCredits;
    private Double grossSalary;
    private Double totalAdvances;
    private Double netSalary;
    private String status; // "CALCULATED", "PAID"
}
