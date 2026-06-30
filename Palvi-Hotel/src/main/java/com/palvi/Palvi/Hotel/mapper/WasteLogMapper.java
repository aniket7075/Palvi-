package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.WasteLogDto;
import com.palvi.Palvi.Hotel.entity.WasteLog;
import org.springframework.stereotype.Component;

@Component
public class WasteLogMapper {

    public WasteLogDto toDto(WasteLog entity) {
        if (entity == null) return null;
        return WasteLogDto.builder()
                .id(entity.getId())
                .outletId(entity.getOutlet() != null ? entity.getOutlet().getId() : null)
                .outletName(entity.getOutlet() != null ? entity.getOutlet().getOutletName() : null)
                .inventoryItemId(entity.getInventoryItem() != null ? entity.getInventoryItem().getId() : null)
                .inventoryItemName(entity.getInventoryItem() != null ? entity.getInventoryItem().getItemName() : null)
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .date(entity.getDate())
                .reason(entity.getReason())
                .loggedById(entity.getLoggedBy() != null ? entity.getLoggedBy().getId() : null)
                .loggedByName(entity.getLoggedBy() != null ? entity.getLoggedBy().getFullName() : null)
                .build();
    }

    public WasteLog toEntity(WasteLogDto dto) {
        if (dto == null) return null;
        return WasteLog.builder()
                .id(dto.getId())
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .date(dto.getDate())
                .reason(dto.getReason())
                .build();
    }
}
