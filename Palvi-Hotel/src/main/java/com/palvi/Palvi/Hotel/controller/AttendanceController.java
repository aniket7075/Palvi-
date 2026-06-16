package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.AttendanceDto;
import com.palvi.Palvi.Hotel.service.AttendanceService;
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
@RequestMapping("/api/attendance")
@Tag(name = "Attendance Controller", description = "Endpoints for logging daily attendance and tracking metrics")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Log/Update Attendance", description = "Creates or updates attendance record for a staff member on a specific date")
    public ResponseEntity<AttendanceDto> saveAttendance(@Valid @RequestBody AttendanceDto dto) {
        return ResponseEntity.ok(attendanceService.saveAttendance(dto));
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get All Attendance Logs", description = "Retrieves all attendance logs historically.")
    public ResponseEntity<List<AttendanceDto>> getAllAttendance() {
        return ResponseEntity.ok(attendanceService.getAllAttendance());
    }

    @GetMapping("/daily")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Daily Attendance", description = "Retrieves attendance logs for a specific date (defaults to today)")
    public ResponseEntity<List<AttendanceDto>> getDailyAttendance(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(attendanceService.getDailyAttendance(date));
    }

    @GetMapping("/weekly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Weekly Attendance", description = "Retrieves attendance logs for the past 7 days")
    public ResponseEntity<List<AttendanceDto>> getWeeklyAttendance() {
        return ResponseEntity.ok(attendanceService.getWeeklyAttendance());
    }

    @GetMapping("/monthly")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Monthly Attendance", description = "Retrieves attendance logs for the past 30 days")
    public ResponseEntity<List<AttendanceDto>> getMonthlyAttendance() {
        return ResponseEntity.ok(attendanceService.getMonthlyAttendance());
    }
}
