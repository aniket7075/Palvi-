package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.DailyRequirement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface DailyRequirementRepository extends JpaRepository<DailyRequirement, Long> {
    List<DailyRequirement> findByRequiredDate(LocalDate requiredDate);
}
