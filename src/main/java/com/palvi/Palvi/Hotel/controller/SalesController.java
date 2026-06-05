package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.SalesDto;
import com.palvi.Palvi.Hotel.service.SalesService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/sales")
@Tag(name = "Sales Controller", description = "Endpoints for logging daily sales by channels and branch")
public class SalesController {

    @Autowired
    private SalesService salesService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Log/Update Sales", description = "Registers daily sales breakdown by channels. Auto calculates totalSale.")
    public ResponseEntity<SalesDto> saveSales(@Valid @RequestBody SalesDto dto) {
        return ResponseEntity.ok(salesService.saveSales(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get All Sales Logs", description = "Retrieves all daily sales records.")
    public ResponseEntity<List<SalesDto>> getAllSales() {
        return ResponseEntity.ok(salesService.getAllSales());
    }

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Daily Sales", description = "Retrieves sales logs for a specific date (defaults to today)")
    public ResponseEntity<List<SalesDto>> getDailySales(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(salesService.getDailySales(date));
    }

    @GetMapping("/weekly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Weekly Sales Logs", description = "Retrieves daily sales logs for the past 7 days.")
    public ResponseEntity<List<SalesDto>> getWeeklySales() {
        return ResponseEntity.ok(salesService.getWeeklySales());
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Monthly Sales Logs", description = "Retrieves daily sales logs for the past 30 days.")
    public ResponseEntity<List<SalesDto>> getMonthlySales() {
        return ResponseEntity.ok(salesService.getMonthlySales());
    }

    @GetMapping("/outlet/{outletId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Sales by Outlet", description = "Retrieves daily sales list for a specific branch.")
    public ResponseEntity<List<SalesDto>> getSalesByOutlet(@PathVariable Long outletId) {
        return ResponseEntity.ok(salesService.getSalesByOutlet(outletId));
    }
}
