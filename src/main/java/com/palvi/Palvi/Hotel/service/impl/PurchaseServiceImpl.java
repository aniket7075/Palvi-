package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.PurchaseDto;
import com.palvi.Palvi.Hotel.entity.*;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.PurchaseMapper;
import com.palvi.Palvi.Hotel.repository.*;
import com.palvi.Palvi.Hotel.service.PurchaseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class PurchaseServiceImpl implements PurchaseService {

    @Autowired
    private PurchaseRepository purchaseRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private InventoryRepository inventoryRepository;

    @Autowired
    private InventoryTransactionRepository transactionRepository;

    @Autowired
    private PurchaseMapper purchaseMapper;

    @Override
    public PurchaseDto createPurchase(PurchaseDto dto) {
        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + dto.getVendorId()));

        Inventory item = inventoryRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + dto.getInventoryItemId()));

        // Create purchase entity
        Purchase purchase = purchaseMapper.toEntity(dto);
        purchase.setVendor(vendor);
        purchase.setInventoryItem(item);
        if (purchase.getPurchaseDate() == null) {
            purchase.setPurchaseDate(LocalDateTime.now());
        }
        purchase.setTotalAmount(purchase.getQuantity() * purchase.getUnitPrice());

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Update inventory stock
        item.setCurrentStock(item.getCurrentStock() + dto.getQuantity());
        inventoryRepository.save(item);

        // Create inventory transaction audit log
        InventoryTransaction tx = InventoryTransaction.builder()
                .inventory(item)
                .transactionType("STOCK_IN")
                .quantity(dto.getQuantity())
                .transactionDate(LocalDateTime.now())
                .description("Inventory purchased from vendor: " + vendor.getVendorName() + " (Purchase Ref: #" + savedPurchase.getId() + ")")
                .build();
        transactionRepository.save(tx);

        return purchaseMapper.toDto(savedPurchase);
    }

    @Override
    @Transactional(readOnly = true)
    public List<PurchaseDto> getAllPurchases() {
        return purchaseRepository.findAll().stream()
                .map(purchaseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public PurchaseDto getPurchaseById(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));
        return purchaseMapper.toDto(purchase);
    }

    @Override
    public PurchaseDto updatePurchase(Long id, PurchaseDto dto) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        Vendor vendor = vendorRepository.findById(dto.getVendorId())
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + dto.getVendorId()));

        Inventory item = inventoryRepository.findById(dto.getInventoryItemId())
                .orElseThrow(() -> new ResourceNotFoundException("Inventory item not found with id: " + dto.getInventoryItemId()));

        // Adjust previous stock levels first
        Inventory oldItem = purchase.getInventoryItem();
        oldItem.setCurrentStock(oldItem.getCurrentStock() - purchase.getQuantity());
        inventoryRepository.save(oldItem);

        // Map and update new values
        purchase.setVendor(vendor);
        purchase.setInventoryItem(item);
        purchase.setQuantity(dto.getQuantity());
        purchase.setUnitPrice(dto.getUnitPrice());
        purchase.setTotalAmount(dto.getQuantity() * dto.getUnitPrice());
        if (dto.getPurchaseDate() != null) {
            purchase.setPurchaseDate(dto.getPurchaseDate());
        }

        Purchase savedPurchase = purchaseRepository.save(purchase);

        // Increment new stock levels
        item.setCurrentStock(item.getCurrentStock() + dto.getQuantity());
        inventoryRepository.save(item);

        // Log adjustment transaction
        InventoryTransaction tx = InventoryTransaction.builder()
                .inventory(item)
                .transactionType("STOCK_IN_ADJUSTMENT")
                .quantity(dto.getQuantity())
                .transactionDate(LocalDateTime.now())
                .description("Purchase record updated: " + vendor.getVendorName() + " (Purchase Ref: #" + savedPurchase.getId() + ")")
                .build();
        transactionRepository.save(tx);

        return purchaseMapper.toDto(savedPurchase);
    }

    @Override
    public void deletePurchase(Long id) {
        Purchase purchase = purchaseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + id));

        // Revert stock update
        Inventory item = purchase.getInventoryItem();
        item.setCurrentStock(Math.max(0.0, item.getCurrentStock() - purchase.getQuantity()));
        inventoryRepository.save(item);

        // Log reversion transaction
        InventoryTransaction tx = InventoryTransaction.builder()
                .inventory(item)
                .transactionType("STOCK_OUT")
                .quantity(purchase.getQuantity())
                .transactionDate(LocalDateTime.now())
                .description("Purchase record deleted: (Purchase Ref: #" + id + ")")
                .build();
        transactionRepository.save(tx);

        purchaseRepository.delete(purchase);
    }
}
