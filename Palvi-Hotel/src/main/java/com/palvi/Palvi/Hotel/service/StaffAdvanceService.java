package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.StaffAdvanceDto;
import java.time.LocalDate;
import java.util.List;

public interface StaffAdvanceService {
    StaffAdvanceDto addAdvance(StaffAdvanceDto staffAdvanceDto);
    List<StaffAdvanceDto> getAdvancesByStaffId(Long staffId);
    List<StaffAdvanceDto> getAdvancesByStaffIdAndMonth(Long staffId, LocalDate month);
    void deleteAdvance(Long id);
}
