package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.ChecklistDto;
import java.time.LocalDate;
import java.util.List;

public interface ChecklistService {
    ChecklistDto createChecklist(ChecklistDto dto);
    List<ChecklistDto> getAllChecklists();
    List<ChecklistDto> getChecklistsByOutletAndDate(Long outletId, LocalDate date);
    ChecklistDto toggleChecklist(Long id);
    ChecklistDto updateChecklist(Long id, ChecklistDto dto);
    void deleteChecklist(Long id);
}
