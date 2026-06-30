package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.BankDepositDto;
import com.palvi.Palvi.Hotel.service.BankDepositService;
import com.palvi.Palvi.Hotel.service.FileStorageService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/bank-deposits")
@CrossOrigin(origins = "*")
@Tag(name = "Bank Deposit Controller", description = "Endpoints for managing cash sales bank deposits")
public class BankDepositController {

    @Autowired
    private BankDepositService bankDepositService;

    @Autowired
    private FileStorageService fileStorageService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Submit Bank Deposit", description = "Log a new bank deposit from outlet.")
    public ResponseEntity<BankDepositDto> createBankDeposit(@Valid @RequestBody BankDepositDto dto) {
        BankDepositDto created = bankDepositService.createBankDeposit(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @PostMapping("/{id}/upload-slip")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Upload Bank Deposit Slip Image", description = "Upload image file for a deposit slip.")
    public ResponseEntity<BankDepositDto> uploadDepositSlip(@PathVariable Long id, @RequestParam("file") MultipartFile file) {
        String fileName = fileStorageService.storeFile(file);
        BankDepositDto updated = bankDepositService.saveSlipUrl(id, "/uploads/" + fileName);
        return ResponseEntity.ok(updated);
    }

    @GetMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Get All Bank Deposits", description = "Get list of all deposits. Admin access only.")
    public ResponseEntity<List<BankDepositDto>> getAllBankDeposits() {
        return ResponseEntity.ok(bankDepositService.getAllBankDeposits());
    }

    @GetMapping("/outlet/{outletId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Get Deposits by Outlet", description = "Get deposits list for a specific outlet.")
    public ResponseEntity<List<BankDepositDto>> getBankDepositsByOutlet(@PathVariable Long outletId) {
        return ResponseEntity.ok(bankDepositService.getBankDepositsByOutlet(outletId));
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Deposit Status", description = "Approve or Reject a bank deposit. Admin access only.")
    public ResponseEntity<BankDepositDto> updateStatus(@PathVariable Long id, @RequestParam String status) {
        return ResponseEntity.ok(bankDepositService.updateBankDepositStatus(id, status));
    }
}
