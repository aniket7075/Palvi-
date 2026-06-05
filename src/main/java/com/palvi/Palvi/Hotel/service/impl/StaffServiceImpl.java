package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.StaffDto;
import com.palvi.Palvi.Hotel.entity.Outlet;
import com.palvi.Palvi.Hotel.entity.Staff;
import com.palvi.Palvi.Hotel.exception.BadRequestException;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.StaffMapper;
import com.palvi.Palvi.Hotel.repository.OutletRepository;
import com.palvi.Palvi.Hotel.repository.StaffRepository;
import com.palvi.Palvi.Hotel.service.StaffService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class StaffServiceImpl implements StaffService {

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private OutletRepository outletRepository;

    @Autowired
    private StaffMapper staffMapper;

    @Override
    public StaffDto createStaff(StaffDto dto) {
        if (staffRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new BadRequestException("Employee code already exists: " + dto.getEmployeeCode());
        }

        Outlet outlet = outletRepository.findById(dto.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + dto.getOutletId()));

        Staff staff = staffMapper.toEntity(dto);
        staff.setOutlet(outlet);

        Staff saved = staffRepository.save(staff);
        return staffMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffDto> getAllStaff() {
        return staffRepository.findAll().stream()
                .map(staffMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public StaffDto getStaffById(Long id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));
        return staffMapper.toDto(staff);
    }

    @Override
    public StaffDto updateStaff(Long id, StaffDto dto) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + id));

        if (!staff.getEmployeeCode().equals(dto.getEmployeeCode()) && 
                staffRepository.existsByEmployeeCode(dto.getEmployeeCode())) {
            throw new BadRequestException("Employee code already exists: " + dto.getEmployeeCode());
        }

        Outlet outlet = outletRepository.findById(dto.getOutletId())
                .orElseThrow(() -> new ResourceNotFoundException("Outlet not found with id: " + dto.getOutletId()));

        staff.setEmployeeCode(dto.getEmployeeCode());
        staff.setFullName(dto.getFullName());
        staff.setMobileNumber(dto.getMobileNumber());
        staff.setAddress(dto.getAddress());
        staff.setRole(dto.getRole());
        staff.setSalary(dto.getSalary());
        staff.setJoiningDate(dto.getJoiningDate());
        staff.setOutlet(outlet);
        if (dto.getStatus() != null) {
            staff.setStatus(dto.getStatus());
        }

        Staff saved = staffRepository.save(staff);
        return staffMapper.toDto(saved);
    }

    @Override
    public void deleteStaff(Long id) {
        if (!staffRepository.existsById(id)) {
            throw new ResourceNotFoundException("Staff not found with id: " + id);
        }
        staffRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public List<StaffDto> getStaffByOutlet(Long outletId) {
        if (!outletRepository.existsById(outletId)) {
            throw new ResourceNotFoundException("Outlet not found with id: " + outletId);
        }
        return staffRepository.findByOutletId(outletId).stream()
                .map(staffMapper::toDto)
                .collect(Collectors.toList());
    }
}
