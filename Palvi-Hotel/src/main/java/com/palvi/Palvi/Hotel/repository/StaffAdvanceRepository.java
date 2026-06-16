package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.StaffAdvance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface StaffAdvanceRepository extends JpaRepository<StaffAdvance, Long> {
    List<StaffAdvance> findByStaffIdOrderByAdvanceDateDesc(Long staffId);
    List<StaffAdvance> findByStaffIdAndAdvanceDateBetweenOrderByAdvanceDateDesc(Long staffId, LocalDate startDate, LocalDate endDate);
}
