package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.InventoryDto;
import com.palvi.Palvi.Hotel.service.InventoryService;
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
@RequestMapping("/api/inventory")
@Tag(name = "Inventory Controller", description = "Endpoints for kitchen inventory items and low stock detection")
public class InventoryController {

    @Autowired
    private InventoryService inventoryService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Create Inventory Item", description = "Adds a new raw material/ingredient to the stock list.")
    public ResponseEntity<InventoryDto> createInventory(@Valid @RequestBody InventoryDto dto) {
        InventoryDto created = inventoryService.createInventory(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get All Inventory Items", description = "Retrieves status of all items in inventory.")
    public ResponseEntity<List<InventoryDto>> getAllInventory() {
        return ResponseEntity.ok(inventoryService.getAllInventory());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get Inventory Item by ID", description = "Retrieves inventory item details.")
    public ResponseEntity<InventoryDto> getInventoryById(@PathVariable Long id) {
        return ResponseEntity.ok(inventoryService.getInventoryById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update Inventory Item", description = "Updates pricing, safety levels, and quantities.")
    public ResponseEntity<InventoryDto> updateInventory(@PathVariable Long id, @Valid @RequestBody InventoryDto dto) {
        return ResponseEntity.ok(inventoryService.updateInventory(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Inventory Item", description = "Deletes an item from inventory. Admin access only.")
    public ResponseEntity<Void> deleteInventory(@PathVariable Long id) {
        inventoryService.deleteInventory(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/low-stock")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get Low Stock Items", description = "Retrieves list of items where current stock <= minimum stock limits.")
    public ResponseEntity<List<InventoryDto>> getLowStockItems() {
        return ResponseEntity.ok(inventoryService.getLowStockItems());
    }

    @PatchMapping("/{id}/quantity")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update Inventory Quantity", description = "Increments or decrements the current stock of an inventory item.")
    public ResponseEntity<InventoryDto> updateQuantity(
            @PathVariable Long id,
            @RequestParam Double change) {
        return ResponseEntity.ok(inventoryService.updateQuantity(id, change));
    }
}
