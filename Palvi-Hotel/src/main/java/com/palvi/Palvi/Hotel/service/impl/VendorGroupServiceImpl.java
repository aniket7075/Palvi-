package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.VendorGroupDto;
import com.palvi.Palvi.Hotel.entity.Vendor;
import com.palvi.Palvi.Hotel.entity.VendorGroup;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.VendorGroupMapper;
import com.palvi.Palvi.Hotel.repository.VendorGroupRepository;
import com.palvi.Palvi.Hotel.repository.VendorRepository;
import com.palvi.Palvi.Hotel.service.VendorGroupService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.HashSet;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class VendorGroupServiceImpl implements VendorGroupService {

    @Autowired
    private VendorGroupRepository vendorGroupRepository;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private VendorGroupMapper vendorGroupMapper;

    @Override
    public VendorGroupDto createVendorGroup(VendorGroupDto dto) {
        VendorGroup group = vendorGroupMapper.toEntity(dto);
        if (dto.getVendorIds() != null && !dto.getVendorIds().isEmpty()) {
            List<Vendor> vendors = vendorRepository.findAllById(dto.getVendorIds());
            group.setVendors(new HashSet<>(vendors));
        }
        VendorGroup saved = vendorGroupRepository.save(group);
        return vendorGroupMapper.toDto(saved);
    }

    @Override
    public VendorGroupDto getVendorGroupById(Long id) {
        VendorGroup group = vendorGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VendorGroup not found with id: " + id));
        return vendorGroupMapper.toDto(group);
    }

    @Override
    public List<VendorGroupDto> getAllVendorGroups() {
        return vendorGroupRepository.findAll().stream()
                .map(vendorGroupMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    public VendorGroupDto updateVendorGroup(Long id, VendorGroupDto dto) {
        VendorGroup group = vendorGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VendorGroup not found with id: " + id));
        group.setName(dto.getName());
        
        if (dto.getVendorIds() != null) {
            List<Vendor> vendors = vendorRepository.findAllById(dto.getVendorIds());
            group.setVendors(new HashSet<>(vendors));
        }
        
        VendorGroup updated = vendorGroupRepository.save(group);
        return vendorGroupMapper.toDto(updated);
    }

    @Override
    public void deleteVendorGroup(Long id) {
        VendorGroup group = vendorGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VendorGroup not found with id: " + id));
        vendorGroupRepository.delete(group);
    }

    @Override
    public VendorGroupDto assignVendorsToGroup(Long id, List<Long> vendorIds) {
        VendorGroup group = vendorGroupRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("VendorGroup not found with id: " + id));
        
        List<Vendor> vendors = vendorRepository.findAllById(vendorIds);
        group.setVendors(new HashSet<>(vendors));
        
        VendorGroup updated = vendorGroupRepository.save(group);
        return vendorGroupMapper.toDto(updated);
    }
}
