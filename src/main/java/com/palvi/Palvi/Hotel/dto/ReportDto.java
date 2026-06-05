package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.Map;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ReportDto {
    private String reportType; // e.g. "SALES_DAILY", "ATTENDANCE_SUMMARY", etc.
    private Double totalSum; // Total sum of sales, purchases, or expenses in range
    private Map<String, Object> summaryStats; // e.g. average, min, max, percentage
    private List<Map<String, Object>> dataPoints; // e.g. list of daily values [{ "date": "2026-06-01", "amount": 5000 }]
}
