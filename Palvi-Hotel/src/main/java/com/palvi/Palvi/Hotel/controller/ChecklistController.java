package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.ChecklistDto;
import com.palvi.Palvi.Hotel.service.ChecklistService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/api/checklists")
@Tag(name = "Checklist Controller", description = "Endpoints for managing and completing daily outlet checklists")
public class ChecklistController {

    @Autowired
    private ChecklistService checklistService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Checklist Task", description = "Adds a checklist task for an outlet.")
    public ResponseEntity<ChecklistDto> createChecklist(@Valid @RequestBody ChecklistDto dto) {
        ChecklistDto created = checklistService.createChecklist(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get All Checklist Tasks", description = "Retrieves all checklist records.")
    public ResponseEntity<List<ChecklistDto>> getAllChecklists() {
        return ResponseEntity.ok(checklistService.getAllChecklists());
    }

    @PutMapping("/{id}/toggle")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Toggle Checklist Completion", description = "Flips the completed boolean status of a checklist item")
    public ResponseEntity<ChecklistDto> toggleChecklist(@PathVariable Long id) {
        return ResponseEntity.ok(checklistService.toggleChecklist(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update Checklist Task", description = "Modifies checklist details.")
    public ResponseEntity<ChecklistDto> updateChecklist(@PathVariable Long id, @Valid @RequestBody ChecklistDto dto) {
        return ResponseEntity.ok(checklistService.updateChecklist(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Checklist Task", description = "Removes a checklist item.")
    public ResponseEntity<Void> deleteChecklist(@PathVariable Long id) {
        checklistService.deleteChecklist(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/outlet/{outletId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get Outlet Daily Checklist", description = "Retrieves checklist status for a branch and date (defaults to today)")
    public ResponseEntity<List<ChecklistDto>> getOutletDailyChecklist(
            @PathVariable Long outletId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        return ResponseEntity.ok(checklistService.getChecklistsByOutletAndDate(outletId, date));
    }
}
