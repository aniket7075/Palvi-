package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.VendorGroupDto;
import com.palvi.Palvi.Hotel.service.VendorGroupService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/vendor-groups")
@CrossOrigin(origins = "*")
public class VendorGroupController {

    @Autowired
    private VendorGroupService vendorGroupService;

    @PostMapping
    public ResponseEntity<VendorGroupDto> createVendorGroup(@Valid @RequestBody VendorGroupDto dto) {
        return new ResponseEntity<>(vendorGroupService.createVendorGroup(dto), HttpStatus.CREATED);
    }

    @GetMapping("/{id}")
    public ResponseEntity<VendorGroupDto> getVendorGroupById(@PathVariable Long id) {
        return ResponseEntity.ok(vendorGroupService.getVendorGroupById(id));
    }

    @GetMapping
    public ResponseEntity<List<VendorGroupDto>> getAllVendorGroups(@RequestParam(required = false) Long outletId) {
        return ResponseEntity.ok(vendorGroupService.getAllVendorGroups(outletId));
    }

    @PutMapping("/{id}")
    public ResponseEntity<VendorGroupDto> updateVendorGroup(@PathVariable Long id, @Valid @RequestBody VendorGroupDto dto) {
        return ResponseEntity.ok(vendorGroupService.updateVendorGroup(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVendorGroup(@PathVariable Long id) {
        vendorGroupService.deleteVendorGroup(id);
        return ResponseEntity.noContent().build();
    }

    @PutMapping("/{id}/vendors")
    public ResponseEntity<VendorGroupDto> assignVendorsToGroup(@PathVariable Long id, @RequestBody List<Long> vendorIds) {
        return ResponseEntity.ok(vendorGroupService.assignVendorsToGroup(id, vendorIds));
    }
}
