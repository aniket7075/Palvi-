package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.PurchaseDto;
import com.palvi.Palvi.Hotel.service.PurchaseService;
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
@RequestMapping("/api/purchases")
@Tag(name = "Purchase Controller", description = "Endpoints for managing raw stock purchases invoices")
public class PurchaseController {

    @Autowired
    private PurchaseService purchaseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Log Purchase", description = "Creates a new purchase record and increments targeted stock items quantity automatically")
    public ResponseEntity<PurchaseDto> createPurchase(@Valid @RequestBody PurchaseDto dto) {
        PurchaseDto created = purchaseService.createPurchase(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get All Purchase Records", description = "Lists all purchase logs in details.")
    public ResponseEntity<List<PurchaseDto>> getAllPurchases() {
        return ResponseEntity.ok(purchaseService.getAllPurchases());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get Purchase by ID", description = "Retrieves details of a purchase record.")
    public ResponseEntity<PurchaseDto> getPurchaseById(@PathVariable Long id) {
        return ResponseEntity.ok(purchaseService.getPurchaseById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update Purchase Record", description = "Updates a purchase record, adjusting stocks accordingly.")
    public ResponseEntity<PurchaseDto> updatePurchase(@PathVariable Long id, @Valid @RequestBody PurchaseDto dto) {
        return ResponseEntity.ok(purchaseService.updatePurchase(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Purchase Record", description = "Removes a purchase record and decrements stock levels. Admin access only.")
    public ResponseEntity<Void> deletePurchase(@PathVariable Long id) {
        purchaseService.deletePurchase(id);
        return ResponseEntity.noContent().build();
    }
}
