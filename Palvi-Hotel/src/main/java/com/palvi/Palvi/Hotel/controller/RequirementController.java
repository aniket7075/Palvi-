package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.DailyRequirementDto;
import com.palvi.Palvi.Hotel.service.RequirementService;
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
@RequestMapping("/api/requirements")
@Tag(name = "Daily Requirement Controller", description = "Endpoints for compiling raw material requirement lists")
public class RequirementController {

    @Autowired
    private RequirementService requirementService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create Requirement", description = "Logs a draft requirement item for kitchen replenishment.")
    public ResponseEntity<DailyRequirementDto> createRequirement(@Valid @RequestBody DailyRequirementDto dto) {
        DailyRequirementDto created = requirementService.createRequirement(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get All Requirements", description = "Retrieves a listing of all recorded daily requirements.")
    public ResponseEntity<List<DailyRequirementDto>> getAllRequirements() {
        return ResponseEntity.ok(requirementService.getAllRequirements());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update Requirement Item", description = "Modifies quantity or date for a requirement.")
    public ResponseEntity<DailyRequirementDto> updateRequirement(
            @PathVariable Long id, @Valid @RequestBody DailyRequirementDto dto) {
        return ResponseEntity.ok(requirementService.updateRequirement(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Delete Requirement Item", description = "Removes an item from the requirements list.")
    public ResponseEntity<Void> deleteRequirement(@PathVariable Long id) {
        requirementService.deleteRequirement(id);
        return ResponseEntity.noContent().build();
    }
}
