package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.DailyRequirementDto;
import com.palvi.Palvi.Hotel.entity.DailyRequirement;
import com.palvi.Palvi.Hotel.entity.Inventory;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.DailyRequirementMapper;
import com.palvi.Palvi.Hotel.repository.DailyRequirementRepository;
import com.palvi.Palvi.Hotel.repository.InventoryRepository;
import com.palvi.Palvi.Hotel.service.NotificationService;
import com.palvi.Palvi.Hotel.service.RequirementService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class RequirementServiceImpl implements RequirementService {

    @Autowired
    private DailyRequirementRepository requirementRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private DailyRequirementMapper requirementMapper;

    @Autowired
    private NotificationService notificationService;

    @Override
    public DailyRequirementDto createRequirement(DailyRequirementDto dto) {
        Inventory item = inventoryRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + dto.getInventoryItemId()));

        DailyRequirement req = requirementMapper.toEntity(dto);
        req.setInventoryItem(item);
        if (req.getRequiredDate() == null) {
            req.setRequiredDate(LocalDate.now());
        }
        req.setStatus("PENDING_APPROVAL");

        DailyRequirement saved = requirementRepository.save(req);

        try {
            notificationService.createNotification(
                "NEW_REQUIREMENT",
                "New Stock Order Request",
                "A draft request for " + saved.getRequiredQuantity() + " " + item.getUnit() + " of " + item.getItemName() + " has been submitted."
            );
        } catch (Exception e) {
            // ignore and continue
        }

        return requirementMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<DailyRequirementDto> getAllRequirements() {
        return requirementRepository.findAll().stream()
                .map(requirementMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public DailyRequirementDto updateRequirement(Long id, DailyRequirementDto dto) {
        DailyRequirement req = requirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement not found with id: " + id));

        Inventory item = inventoryRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + dto.getInventoryItemId()));

        req.setInventoryItem(item);
        req.setRequiredQuantity(dto.getRequiredQuantity());
        if (dto.getRequiredDate() != null) {
            req.setRequiredDate(dto.getRequiredDate());
        }

        DailyRequirement saved = requirementRepository.save(req);
        return requirementMapper.toDto(saved);
    }

    @Override
    public DailyRequirementDto updateRequirementStatus(Long id, String status) {
        DailyRequirement req = requirementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Requirement not found with id: " + id));
        req.setStatus(status);
        DailyRequirement saved = requirementRepository.save(req);

        try {
            notificationService.createNotification(
                "REQUIREMENT_AUDIT",
                "Requirement " + status,
                "The order request for " + saved.getRequiredQuantity() + " " + saved.getInventoryItem().getUnit() + " of " + saved.getInventoryItem().getItemName() + " was " + status.toLowerCase()
            );
        } catch (Exception e) {
            // ignore and continue
        }

        return requirementMapper.toDto(saved);
    }

    @Override
    public void deleteRequirement(Long id) {
        if (!requirementRepository.existsById(id)) {
            throw new ResourceNotFoundException("Requirement not found with id: " + id);
        }
        requirementRepository.deleteById(id);
    }
}
