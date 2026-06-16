package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.InventoryDto;
import com.palvi.Palvi.Hotel.entity.Inventory;
import org.springframework.stereotype.Component;

@Component
public class InventoryMapper {

    public InventoryDto toDto(Inventory entity) {
        if (entity == null) return null;
        return InventoryDto.builder()
                .id(entity.getId())
                .itemName(entity.getItemName())
                .category(entity.getCategory())
                .quantity(entity.getQuantity())
                .unit(entity.getUnit())
                .purchasePrice(entity.getPurchasePrice())
                .currentStock(entity.getCurrentStock())
                .minimumStock(entity.getMinimumStock())
                .build();
    }

    public Inventory toEntity(InventoryDto dto) {
        if (dto == null) return null;
        return Inventory.builder()
                .id(dto.getId())
                .itemName(dto.getItemName())
                .category(dto.getCategory())
                .quantity(dto.getQuantity())
                .unit(dto.getUnit())
                .purchasePrice(dto.getPurchasePrice())
                .currentStock(dto.getCurrentStock())
                .minimumStock(dto.getMinimumStock())
                .build();
    }
}
