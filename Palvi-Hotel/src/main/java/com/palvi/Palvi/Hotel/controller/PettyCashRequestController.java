package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.PettyCashRequestDto;
import com.palvi.Palvi.Hotel.service.PettyCashRequestService;
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
@RequestMapping("/api/petty-cash/requests")
@CrossOrigin(origins = "*")
@Tag(name = "Petty Cash Requests Controller", description = "Endpoints for managers to request petty cash top-ups and admins to review them")
public class PettyCashRequestController {

    @Autowired
    private PettyCashRequestService pettyCashRequestService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Create Top-up Request", description = "Managers submit a request for extra petty cash.")
    public ResponseEntity<PettyCashRequestDto> createRequest(@Valid @RequestBody PettyCashRequestDto dto) {
        PettyCashRequestDto created = pettyCashRequestService.createRequest(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Get All Requests", description = "Get list of all petty cash requests.")
    public ResponseEntity<List<PettyCashRequestDto>> getAllRequests() {
        return ResponseEntity.ok(pettyCashRequestService.getAllRequests());
    }

    @GetMapping("/outlet/{outletId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Get Requests by Outlet", description = "Get petty cash request history for a specific outlet.")
    public ResponseEntity<List<PettyCashRequestDto>> getRequestsByOutlet(@PathVariable Long outletId) {
        return ResponseEntity.ok(pettyCashRequestService.getRequestsByOutlet(outletId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Resolve Top-up Request", description = "Admins Approve or Reject a petty cash request.")
    public ResponseEntity<PettyCashRequestDto> updateStatus(
            @PathVariable Long id,
            @RequestParam String status,
            @RequestParam(required = false) String notes) {
        return ResponseEntity.ok(pettyCashRequestService.updateRequestStatus(id, status, notes));
    }
}
