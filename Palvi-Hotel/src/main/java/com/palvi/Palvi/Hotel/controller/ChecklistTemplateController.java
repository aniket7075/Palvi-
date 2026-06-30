package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.entity.ChecklistTemplate;
import com.palvi.Palvi.Hotel.repository.ChecklistTemplateRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/checklist-templates")
@CrossOrigin(origins = "*")
@Tag(name = "Checklist Templates Controller", description = "Endpoints for Admins to create and manage standard daily checklist templates")
public class ChecklistTemplateController {

    @Autowired
    private ChecklistTemplateRepository checklistTemplateRepository;

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create Checklist Template", description = "Add a new standard task template. Admin access only.")
    public ResponseEntity<ChecklistTemplate> createTemplate(@RequestBody ChecklistTemplate template) {
        ChecklistTemplate saved = checklistTemplateRepository.save(template);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'FRANCHISEE')")
    @Operation(summary = "Get All Templates", description = "Retrieves all standard checklist templates.")
    public ResponseEntity<List<ChecklistTemplate>> getAllTemplates() {
        return ResponseEntity.ok(checklistTemplateRepository.findAll());
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update Template", description = "Modify an existing checklist template.")
    public ResponseEntity<ChecklistTemplate> updateTemplate(
            @PathVariable Long id,
            @RequestBody ChecklistTemplate details) {
        ChecklistTemplate template = checklistTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template not found with id: " + id));

        template.setTaskName(details.getTaskName());
        template.setTimeRange(details.getTimeRange());
        template.setActive(details.getActive());

        ChecklistTemplate saved = checklistTemplateRepository.save(template);
        return ResponseEntity.ok(saved);
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete Template", description = "Deletes a checklist template permanently.")
    public ResponseEntity<Void> deleteTemplate(@PathVariable Long id) {
        if (!checklistTemplateRepository.existsById(id)) {
            return ResponseEntity.notFound().build();
        }
        checklistTemplateRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
