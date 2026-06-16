package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.OutletDto;
import com.palvi.Palvi.Hotel.service.OutletService;
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
@RequestMapping("/api/outlets")
@Tag(name = "Outlet Controller", description = "Endpoints for managing restaurant & hotel branches (outlets)")
public class OutletController {

    @Autowired
    private OutletService outletService;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Outlet", description = "Registers a new branch outlet. Admin access only.")
    public ResponseEntity<OutletDto> createOutlet(@Valid @RequestBody OutletDto dto) {
        OutletDto created = outletService.createOutlet(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @Operation(summary = "Get All Outlets", description = "Retrieves a list of all hotel & restaurant branches.")
    public ResponseEntity<List<OutletDto>> getAllOutlets() {
        return ResponseEntity.ok(outletService.getAllOutlets());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get Outlet by ID", description = "Retrieves details of a branch by its unique identifier.")
    public ResponseEntity<OutletDto> getOutletById(@PathVariable Long id) {
        return ResponseEntity.ok(outletService.getOutletById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Outlet", description = "Updates details of an existing branch. Admin access only.")
    public ResponseEntity<OutletDto> updateOutlet(@PathVariable Long id, @Valid @RequestBody OutletDto dto) {
        return ResponseEntity.ok(outletService.updateOutlet(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Outlet", description = "Removes a branch outlet. Admin access only.")
    public ResponseEntity<Void> deleteOutlet(@PathVariable Long id) {
        outletService.deleteOutlet(id);
        return ResponseEntity.noContent().build();
    }
}
