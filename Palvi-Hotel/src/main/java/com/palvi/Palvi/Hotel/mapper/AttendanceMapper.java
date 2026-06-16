package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.AttendanceDto;
import com.palvi.Palvi.Hotel.entity.Attendance;
import com.palvi.Palvi.Hotel.entity.AttendanceStatus;
import org.springframework.stereotype.Component;

@Component
public class AttendanceMapper {

    public AttendanceDto toDto(Attendance entity) {
        if (entity == null) return null;
        return AttendanceDto.builder()
                .id(entity.getId())
                .staffId(entity.getStaff() != null ? entity.getStaff().getId() : null)
                .staffName(entity.getStaff() != null ? entity.getStaff().getFullName() : null)
                .employeeCode(entity.getStaff() != null ? entity.getStaff().getEmployeeCode() : null)
                .date(entity.getDate())
                .attendanceStatus(entity.getAttendanceStatus().name())
                .build();
    }

    public Attendance toEntity(AttendanceDto dto) {
        if (dto == null) return null;
        return Attendance.builder()
                .id(dto.getId())
                .date(dto.getDate())
                .attendanceStatus(dto.getAttendanceStatus() != null ? 
                        AttendanceStatus.valueOf(dto.getAttendanceStatus().toUpperCase()) : null)
                .build();
    }
}
