package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.ExpenseDto;
import com.palvi.Palvi.Hotel.service.ExpenseService;
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
@RequestMapping("/api/expenses")
@Tag(name = "Expense Controller", description = "Endpoints for logging and auditing general operating expenses")
public class ExpenseController {

    @Autowired
    private ExpenseService expenseService;

    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Log Expense", description = "Records a new operating expense.")
    public ResponseEntity<ExpenseDto> createExpense(@Valid @RequestBody ExpenseDto dto) {
        ExpenseDto created = expenseService.createExpense(dto);
        return new ResponseEntity<>(created, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get All Expenses", description = "Lists all recorded expenses.")
    public ResponseEntity<List<ExpenseDto>> getAllExpenses() {
        return ResponseEntity.ok(expenseService.getAllExpenses());
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Get Expense by ID", description = "Retrieves specific expense record.")
    public ResponseEntity<ExpenseDto> getExpenseById(@PathVariable Long id) {
        return ResponseEntity.ok(expenseService.getExpenseById(id));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE', 'INVENTORY_MANAGER')")
    @Operation(summary = "Update Expense Record", description = "Modifies an existing expense record.")
    public ResponseEntity<ExpenseDto> updateExpense(@PathVariable Long id, @Valid @RequestBody ExpenseDto dto) {
        return ResponseEntity.ok(expenseService.updateExpense(id, dto));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Expense Record", description = "Removes an expense record. Admin access only.")
    public ResponseEntity<Void> deleteExpense(@PathVariable Long id) {
        expenseService.deleteExpense(id);
        return ResponseEntity.noContent().build();
    }
}
