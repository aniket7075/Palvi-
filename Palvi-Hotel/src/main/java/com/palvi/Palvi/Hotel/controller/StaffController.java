package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.StaffDto;
import com.palvi.Palvi.Hotel.service.StaffService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/staff")
@Tag(name = "Staff Controller", description = "Endpoints for managing outlet employee information")
public class StaffController {

    @Autowired
    private StaffService staffService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create Staff Profile", description = "Registers a new staff member under an outlet.")
    public ResponseEntity<StaffDto> createStaff(@Valid @RequestBody StaffDto dto) {
        StaffDto created = staffService.createStaff(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get All Staff", description = "Retrieves profiles of all active & inactive staff.")
    public ResponseEntity<List<StaffDto>> getAllStaff() {
        return ResponseEntity.ok(staffService.getAllStaff());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Staff Profile by ID", description = "Retrieves a staff profile by employee primary key.")
    public ResponseEntity<StaffDto> getStaffById(@PathVariable Long id) {
        return ResponseEntity.ok(staffService.getStaffById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update Staff Profile", description = "Updates details of an existing employee.")
    public ResponseEntity<StaffDto> updateStaff(@PathVariable Long id, @Valid @RequestBody StaffDto dto) {
        return ResponseEntity.ok(staffService.updateStaff(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Staff Profile", description = "Deletes an employee from records. Admin access only.")
    public ResponseEntity<Void> deleteStaff(@PathVariable Long id) {
        staffService.deleteStaff(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/outlet/{outletId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Staff by Outlet", description = "Retrieves staff assigned to a specific branch.")
    public ResponseEntity<List<StaffDto>> getStaffByOutlet(@PathVariable Long outletId) {
        return ResponseEntity.ok(staffService.getStaffByOutlet(outletId));
    }
}
