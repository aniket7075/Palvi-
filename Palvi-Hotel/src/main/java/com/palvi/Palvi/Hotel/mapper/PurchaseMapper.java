package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.PurchaseDto;
import com.palvi.Palvi.Hotel.entity.Purchase;
import org.springframework.stereotype.Component;

@Component
public class PurchaseMapper {

    public PurchaseDto toDto(Purchase entity) {
        if (entity == null) return null;
        return PurchaseDto.builder()
                .id(entity.getId())
                .vendorId(entity.getVendor() != null ? entity.getVendor().getId() : null)
                .vendorName(entity.getVendor() != null ? entity.getVendor().getVendorName() : null)
                .inventoryItemId(entity.getInventoryItem() != null ? entity.getInventoryItem().getId() : null)
                .inventoryItemName(entity.getInventoryItem() != null ? entity.getInventoryItem().getItemName() : null)
                .inventoryUnit(entity.getInventoryItem() != null ? entity.getInventoryItem().getUnit() : null)
                .quantity(entity.getQuantity())
                .unitPrice(entity.getUnitPrice())
                .totalAmount(entity.getTotalAmount())
                .purchaseDate(entity.getPurchaseDate())
                .billImagePath(entity.getBillImagePath())
                .isPaid(entity.getIsPaid())
                .build();
    }

    public Purchase toEntity(PurchaseDto dto) {
        if (dto == null) return null;
        return Purchase.builder()
                .id(dto.getId())
                .quantity(dto.getQuantity())
                .unitPrice(dto.getUnitPrice())
                .purchaseDate(dto.getPurchaseDate())
                .billImagePath(dto.getBillImagePath())
                .isPaid(dto.getIsPaid() != null ? dto.getIsPaid() : false)
                .build();
    }
}
