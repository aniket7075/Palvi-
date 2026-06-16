package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.StaffAdvanceDto;
import com.palvi.Palvi.Hotel.service.StaffAdvanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/staff-advances")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffAdvanceController {

    private final StaffAdvanceService staffAdvanceService;

    @PostMapping
    public ResponseEntity<StaffAdvanceDto> addAdvance(@RequestBody StaffAdvanceDto dto) {
        return ResponseEntity.ok(staffAdvanceService.addAdvance(dto));
    }

    @GetMapping("/staff/{staffId}")
    public ResponseEntity<List<StaffAdvanceDto>> getAdvancesByStaffId(@PathVariable Long staffId) {
        return ResponseEntity.ok(staffAdvanceService.getAdvancesByStaffId(staffId));
    }

    @GetMapping("/staff/{staffId}/month")
    public ResponseEntity<List<StaffAdvanceDto>> getAdvancesByStaffIdAndMonth(
            @PathVariable Long staffId,
            @RequestParam(required = false) String date) {
        
        LocalDate targetDate = (date != null && !date.isEmpty()) ? LocalDate.parse(date) : LocalDate.now();
        return ResponseEntity.ok(staffAdvanceService.getAdvancesByStaffIdAndMonth(staffId, targetDate));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteAdvance(@PathVariable Long id) {
        staffAdvanceService.deleteAdvance(id);
        return ResponseEntity.noContent().build();
    }
}
