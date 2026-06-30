package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.WasteLogDto;
import com.palvi.Palvi.Hotel.entity.Inventory;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.entity.User;
import com.palvi.Palvi.Hotel.entity.WasteLog;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.WasteLogMapper;
import com.palvi.Palvi.Hotel.repository.InventoryRepository;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.repository.UserRepository;
import com.palvi.Palvi.Hotel.repository.WasteLogRepository;
import com.palvi.Palvi.Hotel.service.WasteLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class WasteLogServiceImpl implements WasteLogService {

    @Autowired
    private WasteLogRepository wasteLogRepository;

    @Autowired
    private WasteLogMapper wasteLogMapper;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private UserRepository userRepository;

    @Override
    public WasteLogDto createWasteLog(WasteLogDto dto) {
        WasteLog log = wasteLogMapper.toEntity(dto);

        Outlet outlet = outletRepository.findById(dto.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + dto.getOutletId()));
        log.setOutlet(outlet);

        Inventory item = inventoryRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + dto.getInventoryItemId()));
        log.setInventoryItem(item);

        if (dto.getLoggedById() != null) {
            User user = userRepository.findById(dto.getLoggedById())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + dto.getLoggedById()));
            log.setLoggedBy(user);
        }

        // Subtract quantity from inventory item
        double currentStock = item.getCurrentStock() != null ? item.getCurrentStock() : 0.0;
        double wasteQty = dto.getQuantity() != null ? dto.getQuantity() : 0.0;
        item.setCurrentStock(Math.max(0.0, currentStock - wasteQty));
        inventoryRepository.save(item);

        WasteLog saved = wasteLogRepository.save(log);
        return wasteLogMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<WasteLogDto> getAllWasteLogs() {
        return wasteLogRepository.findAll().stream()
                .map(wasteLogMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<WasteLogDto> getWasteLogsByOutlet(Long outletId) {
        return wasteLogRepository.findByOutletId(outletId).stream()
                .map(wasteLogMapper::toDto)
                .collect(Collectors.toList());
    }
}
