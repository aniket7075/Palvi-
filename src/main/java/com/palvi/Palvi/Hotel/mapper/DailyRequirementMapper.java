package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.DailyRequirementDto;
import com.palvi.Palvi.Hotel.entity.DailyRequirement;
import org.springframework.stereotype.Component;

@Component
public class DailyRequirementMapper {

    public DailyRequirementDto toDto(DailyRequirement entity) {
        if (entity == null) return null;
        return DailyRequirementDto.builder()
                .id(entity.getId())
                .inventoryItemId(entity.getInventoryItem() != null ? entity.getInventoryItem().getId() : null)
                .inventoryItemName(entity.getInventoryItem() != null ? entity.getInventoryItem().getItemName() : null)
                .inventoryUnit(entity.getInventoryItem() != null ? entity.getInventoryItem().getUnit() : null)
                .requiredQuantity(entity.getRequiredQuantity())
                .requiredDate(entity.getRequiredDate())
                .build();
    }

    public DailyRequirement toEntity(DailyRequirementDto dto) {
        if (dto == null) return null;
        return DailyRequirement.builder()
                .id(dto.getId())
                .requiredQuantity(dto.getRequiredQuantity())
                .requiredDate(dto.getRequiredDate())
                .build();
    }
}
