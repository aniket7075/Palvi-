package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.OutletDto;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.OutletMapper;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.service.OutletService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class OutletServiceImpl implements OutletService {

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private OutletMapper outletMapper;

    @Override
    public OutletDto createOutlet(OutletDto dto) {
        Outlet outlet = outletMapper.toEntity(dto);
        Outlet saved = outletRepository.save(outlet);
        return outletMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<OutletDto> getAllOutlets() {
        return outletRepository.findAll().stream()
                .map(outletMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public OutletDto getOutletById(Long id) {
        Outlet outlet = outletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + id));
        return outletMapper.toDto(outlet);
    }

    @Override
    public OutletDto updateOutlet(Long id, OutletDto dto) {
        Outlet outlet = outletRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + id));
        
        outlet.setOutletName(dto.getOutletName());
        outlet.setAddress(dto.getAddress());
        outlet.setCity(dto.getCity());
        outlet.setMobileNumber(dto.getMobileNumber());
        outlet.setGstNumber(dto.getGstNumber());
        if (dto.getStatus() != null) {
            outlet.setStatus(dto.getStatus());
        }

        Outlet saved = outletRepository.save(outlet);
        return outletMapper.toDto(saved);
    }

    @Override
    public void deleteOutlet(Long id) {
        if (!outletRepository.existsById(id)) {
            throw new ResourceNotFoundException("Outlet not found with id: " + id);
        }
        outletRepository.deleteById(id);
    }
}
