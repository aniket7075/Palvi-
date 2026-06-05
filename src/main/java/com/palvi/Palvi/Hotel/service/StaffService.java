package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.StaffDto;
import java.util.List;

public interface StaffService {
    StaffDto createStaff(StaffDto dto);
    List<StaffDto> getAllStaff();
    StaffDto getStaffById(Long id);
    StaffDto updateStaff(Long id, StaffDto dto);
    void deleteStaff(Long id);
    List<StaffDto> getStaffByOutlet(Long outletId);
}
