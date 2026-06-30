package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.PayrollDto;
import com.palvi.Palvi.Hotel.entity.Attendance;
import com.palvi.Palvi.Hotel.entity.AttendanceStatus;
import com.palvi.Palvi.Hotel.entity.Staff;
import com.palvi.Palvi.Hotel.entity.StaffAdvance;
import com.palvi.Palvi.Hotel.repository.AttendanceRepository;
import com.palvi.Palvi.Hotel.repository.StaffAdvanceRepository;
import com.palvi.Palvi.Hotel.repository.StaffRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.ArrayList;
import java.util.List;

@RestController
@RequestMapping("/api/payroll")
@CrossOrigin(origins = "*")
@Tag(name = "Payroll Controller", description = "Endpoints for calculating monthly staff salaries and payroll based on attendance and advances")
public class PayrollController {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StaffAdvanceRepository staffAdvanceRepository;

    @GetMapping("/calculate")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Calculate Monthly Payroll", description = "Calculate gross salary, deductions for advances, and net salary for all staff at an outlet.")
    public ResponseEntity<List<PayrollDto>> calculatePayroll(
            @RequestParam(required = false) Long outletId,
            @RequestParam int month,
            @RequestParam int year) {

        List<Staff> staffList;
        if (outletId != null) {
            staffList = staffRepository.findByOutletId(outletId);
        } else {
            staffList = staffRepository.findAll();
        }

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();
        int totalDays = yearMonth.lengthOfMonth();

        List<PayrollDto> results = new ArrayList<>();

        for (Staff staff : staffList) {
            // Fetch attendance
            List<Attendance> attendances = attendanceRepository.findByStaffIdAndDateBetween(staff.getId(), startDate, endDate);
            
            double present = 0;
            double absent = 0;
            double halfDay = 0;
            double leave = 0;

            for (Attendance att : attendances) {
                if (att.getAttendanceStatus() == AttendanceStatus.PRESENT) {
                    present++;
                } else if (att.getAttendanceStatus() == AttendanceStatus.ABSENT) {
                    absent++;
                } else if (att.getAttendanceStatus() == AttendanceStatus.HALF_DAY) {
                    halfDay++;
                } else if (att.getAttendanceStatus() == AttendanceStatus.LEAVE) {
                    leave++;
                }
            }

            // workingCredits = PRESENT (1.0) + HALF_DAY (0.5) + LEAVE (1.0 - paid leave)
            double workingCredits = present + (halfDay * 0.5) + leave;

            // Fetch advances
            List<StaffAdvance> advances = staffAdvanceRepository.findByStaffIdAndAdvanceDateBetweenOrderByAdvanceDateDesc(
                    staff.getId(), startDate, endDate);
            
            double totalAdvances = 0;
            for (StaffAdvance adv : advances) {
                totalAdvances += adv.getAmount() != null ? adv.getAmount() : 0.0;
            }

            double baseSalary = staff.getSalary() != null ? staff.getSalary() : 0.0;
            double grossSalary = Math.round(((baseSalary / totalDays) * workingCredits) * 100.0) / 100.0;
            double netSalary = Math.round((grossSalary - totalAdvances) * 100.0) / 100.0;

            PayrollDto dto = PayrollDto.builder()
                    .staffId(staff.getId())
                    .fullName(staff.getFullName())
                    .employeeCode(staff.getEmployeeCode())
                    .baseSalary(baseSalary)
                    .totalDaysInMonth(totalDays)
                    .presentDays(present)
                    .absentDays(absent)
                    .halfDays(halfDay)
                    .leaveDays(leave)
                    .workingCredits(workingCredits)
                    .grossSalary(grossSalary)
                    .totalAdvances(totalAdvances)
                    .netSalary(Math.max(0.0, netSalary))
                    .status("CALCULATED")
                    .build();

            results.add(dto);
        }

        return ResponseEntity.ok(results);
    }

    @PostMapping("/payout")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Confirm Payroll Payout", description = "Mark payroll as paid for records (simulation).")
    public ResponseEntity<String> recordPayout(
            @RequestParam Long staffId,
            @RequestParam int month,
            @RequestParam int year,
            @RequestParam Double amount) {
        
        // Simulating the payroll processing log.
        // In production, this can create a transaction or save in a payroll database table.
        return ResponseEntity.ok("Successfully logged payout of ₹" + amount + " to staff ID " + staffId + " for period " + month + "/" + year);
    }
}
