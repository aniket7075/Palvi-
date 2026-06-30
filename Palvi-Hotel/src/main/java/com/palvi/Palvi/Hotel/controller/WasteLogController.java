package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.WasteLogDto;
import com.palvi.Palvi.Hotel.service.WasteLogService;
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
@RequestMapping("/api/waste-logs")
@CrossOrigin(origins = "*")
@Tag(name = "Waste Log Controller", description = "Endpoints for logging food spoilage, expired items, and kitchen waste")
public class WasteLogController {

    @Autowired
    private WasteLogService wasteLogService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Log Waste", description = "Records kitchen waste or food spoilage and updates stock level.")
    public ResponseEntity<WasteLogDto> createWasteLog(@Valid @RequestBody WasteLogDto dto) {
        WasteLogDto created = wasteLogService.createWasteLog(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Get All Waste Logs", description = "Retrieves all waste records. Admin/Global view.")
    public ResponseEntity<List<WasteLogDto>> getAllWasteLogs() {
        return ResponseEntity.ok(wasteLogService.getAllWasteLogs());
    }

    @GetMapping("/outlet/{outletId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Get Waste Logs by Outlet", description = "Retrieves waste records for a specific outlet.")
    public ResponseEntity<List<WasteLogDto>> getWasteLogsByOutlet(@PathVariable Long outletId) {
        return ResponseEntity.ok(wasteLogService.getWasteLogsByOutlet(outletId));
    }
}
