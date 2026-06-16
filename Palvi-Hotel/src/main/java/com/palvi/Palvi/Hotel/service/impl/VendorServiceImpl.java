package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.VendorDto;
import com.palvi.Palvi.Hotel.entity.Vendor;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.VendorMapper;
import com.palvi.Palvi.Hotel.repository.VendorRepository;
import com.palvi.Palvi.Hotel.service.VendorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class VendorServiceImpl implements VendorService {

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private VendorMapper vendorMapper;

    @Override
    public VendorDto createVendor(VendorDto dto) {
        Vendor vendor = vendorMapper.toEntity(dto);
        Vendor saved = vendorRepository.save(vendor);
        return vendorMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<VendorDto> getAllVendors() {
        return vendorRepository.findAll().stream()
                .map(vendorMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public VendorDto getVendorById(Long id) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));
        return vendorMapper.toDto(vendor);
    }

    @Override
    public VendorDto updateVendor(Long id, VendorDto dto) {
        Vendor vendor = vendorRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + id));

        vendor.setVendorName(dto.getVendorName());
        vendor.setMobileNumber(dto.getMobileNumber());
        vendor.setWhatsappNumber(dto.getWhatsappNumber());
        vendor.setAddress(dto.getAddress());
        vendor.setCategory(dto.getCategory());

        Vendor saved = vendorRepository.save(vendor);
        return vendorMapper.toDto(saved);
    }

    @Override
    public void deleteVendor(Long id) {
        if (!vendorRepository.existsById(id)) {
            throw new ResourceNotFoundException("Vendor not found with id: " + id);
        }
        vendorRepository.deleteById(id);
    }
}
