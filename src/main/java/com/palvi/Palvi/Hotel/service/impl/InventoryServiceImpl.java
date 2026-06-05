package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.InventoryDto;
import com.palvi.Palvi.Hotel.entity.Inventory;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.InventoryMapper;
import com.palvi.Palvi.Hotel.repository.InventoryRepository;
import com.palvi.Palvi.Hotel.service.InventoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class InventoryServiceImpl implements InventoryService {

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryMapper inventoryMapper;

    @Override
    public InventoryDto createInventory(InventoryDto dto) {
        Inventory inventory = inventoryMapper.toEntity(dto);
        if (inventory.getQuantity() == null) {
            inventory.setQuantity(dto.getCurrentStock());
        }
        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDto> getAllInventory() {
        return inventoryRepository.findAll().stream()
                .map(inventoryMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public InventoryDto getInventoryById(Long id) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));
        return inventoryMapper.toDto(inventory);
    }

    @Override
    public InventoryDto updateInventory(Long id, InventoryDto dto) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        inventory.setItemName(dto.getItemName());
        inventory.setCategory(dto.getCategory());
        inventory.setQuantity(dto.getQuantity());
        inventory.setUnit(dto.getUnit());
        inventory.setPurchasePrice(dto.getPurchasePrice());
        inventory.setCurrentStock(dto.getCurrentStock());
        inventory.setMinimumStock(dto.getMinimumStock());

        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.toDto(saved);
    }

    @Override
    public InventoryDto updateQuantity(Long id, Double change) {
        Inventory inventory = inventoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + id));

        double newStock = Math.max(0.0, (inventory.getCurrentStock() != null ? inventory.getCurrentStock() : 0.0) + change);
        inventory.setCurrentStock(newStock);
        inventory.setQuantity(newStock);

        Inventory saved = inventoryRepository.save(inventory);
        return inventoryMapper.toDto(saved);
    }

    @Override
    public void deleteInventory(Long id) {
        if (!inventoryRepository.existsById(id)) {
            throw new ResourceNotFoundException("Inventory item not found with id: " + id);
        }
        inventoryRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<InventoryDto> getLowStockItems() {
        return inventoryRepository.findLowStockItems().stream()
                .map(inventoryMapper::toDto)
                .collect(Collectors.toList());
    }
}
