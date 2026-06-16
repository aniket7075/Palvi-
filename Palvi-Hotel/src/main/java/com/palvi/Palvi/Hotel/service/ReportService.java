package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.ReportDto;

public interface ReportService {
    ReportDto getDailySalesReport();
    ReportDto getWeeklySalesReport();
    ReportDto getMonthlySalesReport();
    ReportDto getAttendanceReport();
    ReportDto getInventoryReport();
    ReportDto getPurchasesReport();
    ReportDto getExpensesReport();
}
