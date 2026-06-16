package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.SalesDto;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.entity.Sales;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.SalesMapper;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.repository.SalesRepository;
import com.palvi.Palvi.Hotel.service.SalesService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class SalesServiceImpl implements SalesService {

    @Autowired
    private SalesRepository salesRepository;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private SalesMapper salesMapper;

    @Override
    public SalesDto saveSales(SalesDto dto) {
        Outlet outlet = outletRepository.findById(dto.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + dto.getOutletId()));

        LocalDate targetDate = dto.getSaleDate() != null ? dto.getSaleDate() : LocalDate.now();

        // Idempotent upsert: check if sales exist for this branch and date
        Optional<Sales> existing = salesRepository.findByOutletIdAndSaleDate(dto.getOutletId(), targetDate);
        Sales sales;
        if (existing.isPresent()) {
            sales = existing.get();
            sales.setCashSale(dto.getCashSale());
            sales.setUpiSale(dto.getUpiSale());
            sales.setCardSale(dto.getCardSale());
            sales.setSwiggySale(dto.getSwiggySale());
            sales.setZomatoSale(dto.getZomatoSale());
            sales.setOtherOnlineSale(dto.getOtherOnlineSale());
        } else {
            sales = salesMapper.toEntity(dto);
            sales.setOutlet(outlet);
            sales.setSaleDate(targetDate);
        }

        // PrePersist/PreUpdate triggers will recalculate totalSale automatically
        Sales saved = salesRepository.save(sales);
        return salesMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesDto> getAllSales() {
        return salesRepository.findAll().stream()
                .map(salesMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesDto> getDailySales(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return salesRepository.findBySaleDateBetween(targetDate, targetDate).stream()
                .map(salesMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesDto> getWeeklySales() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        return salesRepository.findBySaleDateBetween(start, end).stream()
                .map(salesMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesDto> getMonthlySales() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        return salesRepository.findBySaleDateBetween(start, end).stream()
                .map(salesMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<SalesDto> getSalesByOutlet(Long outletId) {
        if (!outletRepository.existsById(outletId)) {
            throw new ResourceNotFoundException("Outlet not found with id: " + outletId);
        }
        return salesRepository.findByOutletId(outletId).stream()
                .map(salesMapper::toDto)
                .collect(Collectors.toList());
    }
}
