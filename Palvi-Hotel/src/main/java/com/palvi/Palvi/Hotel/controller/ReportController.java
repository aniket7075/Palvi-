package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.ReportDto;
import com.palvi.Palvi.Hotel.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/reports")
@Tag(name = "Report Controller", description = "Endpoints for fetching aggregated analytics reports (sales, attendance, stock, purchases, expenses)")
public class ReportController {

    @Autowired
    private ReportService reportService;

    @GetMapping("/sales/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Daily Sales Report", description = "Generates today's total sales stats grouped by payment channels.")
    public ResponseEntity<ReportDto> getDailySalesReport() {
        return ResponseEntity.ok(reportService.getDailySalesReport());
    }

    @GetMapping("/sales/weekly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Weekly Sales Report", description = "Generates daily total sales over the past 7 days.")
    public ResponseEntity<ReportDto> getWeeklySalesReport() {
        return ResponseEntity.ok(reportService.getWeeklySalesReport());
    }

    @GetMapping("/sales/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Monthly Sales Report", description = "Generates daily total sales over the past 30 days.")
    public ResponseEntity<ReportDto> getMonthlySalesReport() {
        return ResponseEntity.ok(reportService.getMonthlySalesReport());
    }

    @GetMapping("/attendance")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Attendance Rates Summary", description = "Aggregates employee attendance percentages and statuses counts over past 30 days.")
    public ResponseEntity<ReportDto> getAttendanceReport() {
        return ResponseEntity.ok(reportService.getAttendanceReport());
    }

    @GetMapping("/inventory")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Inventory Value and Limits Summary", description = "Aggregates overall stock items count, low stock warnings, and monetary value valuation.")
    public ResponseEntity<ReportDto> getInventoryReport() {
        return ResponseEntity.ok(reportService.getInventoryReport());
    }

    @GetMapping("/purchases")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Purchases Monthly Report", description = "Summarizes purchase invoices amounts grouped by ingredient categories over past 30 days.")
    public ResponseEntity<ReportDto> getPurchasesReport() {
        return ResponseEntity.ok(reportService.getPurchasesReport());
    }

    @GetMapping("/expenses")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Expenses Monthly Report", description = "Summarizes overhead costs and descriptions over past 30 days.")
    public ResponseEntity<ReportDto> getExpensesReport() {
        return ResponseEntity.ok(reportService.getExpensesReport());
    }
}
