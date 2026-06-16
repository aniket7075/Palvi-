package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.VendorDto;
import com.palvi.Palvi.Hotel.service.VendorService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import com.palvi.Palvi.Hotel.entity.Purchase;
import com.palvi.Palvi.Hotel.repository.PurchaseRepository;
import java.util.List;

@RestController
@RequestMapping("/api/vendors")
@Tag(name = "Vendor Controller", description = "Endpoints for managing supplier profiles")
public class VendorController {

    @Autowired
    private VendorService vendorService;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Create Vendor Profile", description = "Adds a supplier directory item.")
    public ResponseEntity<VendorDto> createVendor(@Valid @RequestBody VendorDto dto) {
        VendorDto created = vendorService.createVendor(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get All Vendors", description = "Retrieves active vendors list.")
    public ResponseEntity<List<VendorDto>> getAllVendors(@RequestParam(required = false) Long outletId) {
        return ResponseEntity.ok(vendorService.getAllVendors(outletId));
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Get Vendor by ID", description = "Retrieves a vendor by primary key.")
    public ResponseEntity<VendorDto> getVendorById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorService.getVendorById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Update Vendor Details", description = "Modifies WhatsApp contact or address details for a supplier.")
    public ResponseEntity<VendorDto> updateVendor(@PathVariable Long id, @Valid @RequestBody VendorDto dto) {
        return ResponseEntity.ok(vendorService.updateVendor(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Vendor Profile", description = "Deletes a supplier. Admin access only.")
    public ResponseEntity<Void> deleteVendor(@PathVariable Long id) {
        vendorService.deleteVendor(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/settle")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @Operation(summary = "Settle Vendor Bill", description = "Marks all unpaid purchases for a vendor as paid.")
    public ResponseEntity<Void> settleVendorBill(@PathVariable Long id) {
        List<Purchase> unpaidPurchases = purchaseRepository.findByVendorIdAndIsPaidFalse(id);
        for (Purchase p : unpaidPurchases) {
            p.setIsPaid(true);
        }
        purchaseRepository.saveAll(unpaidPurchases);
        return ResponseEntity.ok().build();
    }
}
