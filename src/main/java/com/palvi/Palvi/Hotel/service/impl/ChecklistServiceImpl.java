package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.ChecklistDto;
import com.palvi.Palvi.Hotel.entity.Checklist;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.ChecklistMapper;
import com.palvi.Palvi.Hotel.repository.ChecklistRepository;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.service.ChecklistService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ChecklistServiceImpl implements ChecklistService {

    @Autowired
    private ChecklistRepository checklistRepository;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private ChecklistMapper checklistMapper;

    @Override
    public ChecklistDto createChecklist(ChecklistDto dto) {
        Outlet outlet = outletRepository.findById(dto.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + dto.getOutletId()));

        Checklist checklist = checklistMapper.toEntity(dto);
        checklist.setOutlet(outlet);
        if (checklist.getChecklistDate() == null) {
            checklist.setChecklistDate(LocalDate.now());
        }

        Checklist saved = checklistRepository.save(checklist);
        return checklistMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChecklistDto> getAllChecklists() {
        return checklistRepository.findAll().stream()
                .map(checklistMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<ChecklistDto> getChecklistsByOutletAndDate(Long outletId, LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return checklistRepository.findByOutletIdAndChecklistDate(outletId, targetDate).stream()
                .map(checklistMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public ChecklistDto toggleChecklist(Long id) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found with id: " + id));

        checklist.setCompleted(!checklist.isCompleted());
        Checklist saved = checklistRepository.save(checklist);
        return checklistMapper.toDto(saved);
    }

    @Override
    public ChecklistDto updateChecklist(Long id, ChecklistDto dto) {
        Checklist checklist = checklistRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Checklist not found with id: " + id));

        Outlet outlet = outletRepository.findById(dto.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + dto.getOutletId()));

        checklist.setChecklistName(dto.getChecklistName());
        checklist.setCompleted(dto.isCompleted());
        checklist.setOutlet(outlet);
        if (dto.getChecklistDate() != null) {
            checklist.setChecklistDate(dto.getChecklistDate());
        }

        Checklist saved = checklistRepository.save(checklist);
        return checklistMapper.toDto(saved);
    }

    @Override
    public void deleteChecklist(Long id) {
        if (!checklistRepository.existsById(id)) {
            throw new ResourceNotFoundException("Checklist not found with id: " + id);
        }
        checklistRepository.deleteById(id);
    }
}
