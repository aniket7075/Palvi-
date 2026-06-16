package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.AttendanceDto;
import com.palvi.Palvi.Hotel.entity.Attendance;
import com.palvi.Palvi.Hotel.entity.AttendanceStatus;
import com.palvi.Palvi.Hotel.entity.Staff;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.AttendanceMapper;
import com.palvi.Palvi.Hotel.repository.AttendanceRepository;
import com.palvi.Palvi.Hotel.repository.StaffRepository;
import com.palvi.Palvi.Hotel.service.AttendanceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@Transactional
public class AttendanceServiceImpl implements AttendanceService {

    @Autowired
    private AttendanceRepository attendanceRepository;

    @Autowired
    private StaffRepository staffRepository;

    @Autowired
    private AttendanceMapper attendanceMapper;

    @Override
    public AttendanceDto saveAttendance(AttendanceDto dto) {
        Staff staff = staffRepository.findById(dto.getStaffId())
                .orElseThrow(() -> new ResourceNotFoundException("Staff not found with id: " + dto.getStaffId()));

        LocalDate targetDate = dto.getDate() != null ? dto.getDate() : LocalDate.now();

        // Check if attendance already exists, update it if so
        Optional<Attendance> existing = attendanceRepository.findByStaffIdAndDate(dto.getStaffId(), targetDate);
        Attendance attendance;
        if (existing.isPresent()) {
            attendance = existing.get();
            attendance.setAttendanceStatus(AttendanceStatus.valueOf(dto.getAttendanceStatus().toUpperCase()));
        } else {
            attendance = attendanceMapper.toEntity(dto);
            attendance.setStaff(staff);
            attendance.setDate(targetDate);
        }

        Attendance saved = attendanceRepository.save(attendance);
        return attendanceMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getAllAttendance() {
        return attendanceRepository.findAll().stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getDailyAttendance(LocalDate date) {
        LocalDate targetDate = date != null ? date : LocalDate.now();
        return attendanceRepository.findByDate(targetDate).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getWeeklyAttendance() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(6);
        return attendanceRepository.findByDateBetween(start, end).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public List<AttendanceDto> getMonthlyAttendance() {
        LocalDate end = LocalDate.now();
        LocalDate start = end.minusDays(29);
        return attendanceRepository.findByDateBetween(start, end).stream()
                .map(attendanceMapper::toDto)
                .collect(Collectors.toList());
    }
}
