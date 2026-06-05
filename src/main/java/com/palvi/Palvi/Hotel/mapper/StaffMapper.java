package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.StaffDto;
import com.palvi.Palvi.Hotel.entity.Staff;
import org.springframework.stereotype.Component;

@Component
public class StaffMapper {

    public StaffDto toDto(Staff entity) {
        if (entity == null) return null;
        return StaffDto.builder()
                .id(entity.getId())
                .employeeCode(entity.getEmployeeCode())
                .fullName(entity.getFullName())
                .mobileNumber(entity.getMobileNumber())
                .address(entity.getAddress())
                .role(entity.getRole())
                .salary(entity.getSalary())
                .joiningDate(entity.getJoiningDate())
                .outletId(entity.getOutlet() != null ? entity.getOutlet().getId() : null)
                .outletName(entity.getOutlet() != null ? entity.getOutlet().getOutletName() : null)
                .status(entity.getStatus())
                .build();
    }

    public Staff toEntity(StaffDto dto) {
        if (dto == null) return null;
        return Staff.builder()
                .id(dto.getId())
                .employeeCode(dto.getEmployeeCode())
                .fullName(dto.getFullName())
                .mobileNumber(dto.getMobileNumber())
                .address(dto.getAddress())
                .role(dto.getRole())
                .salary(dto.getSalary())
                .joiningDate(dto.getJoiningDate())
                .status(dto.getStatus())
                .build();
    }
}
