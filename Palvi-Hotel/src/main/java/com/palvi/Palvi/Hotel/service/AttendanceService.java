package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.AttendanceDto;
import java.time.LocalDate;
import java.util.List;

public interface AttendanceService {
    AttendanceDto saveAttendance(AttendanceDto dto);
    List<AttendanceDto> getAllAttendance();
    List<AttendanceDto> getDailyAttendance(LocalDate date);
    List<AttendanceDto> getWeeklyAttendance();
    List<AttendanceDto> getMonthlyAttendance();
}
