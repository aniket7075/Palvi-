package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.StaffAdvanceDto;
import com.palvi.Palvi.Hotel.entity.Staff;
import com.palvi.Palvi.Hotel.entity.StaffAdvance;
import com.palvi.Palvi.Hotel.repository.StaffAdvanceRepository;
import com.palvi.Palvi.Hotel.repository.StaffRepository;
import com.palvi.Palvi.Hotel.service.StaffAdvanceService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.YearMonth;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffAdvanceServiceImpl implements StaffAdvanceService {

    private final StaffAdvanceRepository advanceRepository;
    private final StaffRepository staffRepository;

    @Override
    public StaffAdvanceDto addAdvance(StaffAdvanceDto dto) {
        Staff staff = staffRepository.findById(dto.getStaffId())
                .orElseThrow(() -> new RuntimeException("Staff not found with ID: " + dto.getStaffId()));

        StaffAdvance advance = StaffAdvance.builder()
                .staff(staff)
                .amount(dto.getAmount())
                .advanceDate(dto.getAdvanceDate() != null ? dto.getAdvanceDate() : LocalDate.now())
                .reason(dto.getReason())
                .build();

        StaffAdvance saved = advanceRepository.save(advance);
        return mapToDto(saved);
    }

    @Override
    public List<StaffAdvanceDto> getAdvancesByStaffId(Long staffId) {
        return advanceRepository.findByStaffIdOrderByAdvanceDateDesc(staffId)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public List<StaffAdvanceDto> getAdvancesByStaffIdAndMonth(Long staffId, LocalDate dateInMonth) {
        YearMonth yearMonth = YearMonth.from(dateInMonth);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        return advanceRepository.findByStaffIdAndAdvanceDateBetweenOrderByAdvanceDateDesc(staffId, startDate, endDate)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Override
    public void deleteAdvance(Long id) {
        advanceRepository.deleteById(id);
    }

    private StaffAdvanceDto mapToDto(StaffAdvance advance) {
        return StaffAdvanceDto.builder()
                .id(advance.getId())
                .staffId(advance.getStaff().getId())
                .staffName(advance.getStaff().getFullName())
                .amount(advance.getAmount())
                .advanceDate(advance.getAdvanceDate())
                .reason(advance.getReason())
                .build();
    }
}
