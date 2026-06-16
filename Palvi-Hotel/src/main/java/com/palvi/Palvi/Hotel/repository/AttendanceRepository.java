package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.Attendance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface AttendanceRepository extends JpaRepository<Attendance, Long> {
    List<Attendance> findByDate(LocalDate date);
    List<Attendance> findByDateBetween(LocalDate startDate, LocalDate endDate);
    List<Attendance> findByStaffId(Long staffId);
    Optional<Attendance> findByStaffIdAndDate(Long staffId, LocalDate date);
}
