package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.InventoryDto;
import java.util.List;

public interface InventoryService {
    InventoryDto createInventory(InventoryDto dto);
    List<InventoryDto> getAllInventory();
    InventoryDto getInventoryById(Long id);
    InventoryDto updateInventory(Long id, InventoryDto dto);
    InventoryDto updateQuantity(Long id, Double change);
    void deleteInventory(Long id);
    List<InventoryDto> getLowStockItems();
}
