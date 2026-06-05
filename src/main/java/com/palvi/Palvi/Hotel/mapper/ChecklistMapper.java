package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.ChecklistDto;
import com.palvi.Palvi.Hotel.entity.Checklist;
import org.springframework.stereotype.Component;

@Component
public class ChecklistMapper {

    public ChecklistDto toDto(Checklist entity) {
        if (entity == null) return null;
        return ChecklistDto.builder()
                .id(entity.getId())
                .checklistName(entity.getChecklistName())
                .completed(entity.isCompleted())
                .checklistDate(entity.getChecklistDate())
                .outletId(entity.getOutlet() != null ? entity.getOutlet().getId() : null)
                .outletName(entity.getOutlet() != null ? entity.getOutlet().getOutletName() : null)
                .build();
    }

    public Checklist toEntity(ChecklistDto dto) {
        if (dto == null) return null;
        return Checklist.builder()
                .id(dto.getId())
                .checklistName(dto.getChecklistName())
                .completed(dto.isCompleted())
                .checklistDate(dto.getChecklistDate())
                .build();
    }
}
