package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.Checklist;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ChecklistRepository extends JpaRepository<Checklist, Long> {
    List<Checklist> findByOutletId(Long outletId);
    List<Checklist> findByChecklistDate(LocalDate date);
    List<Checklist> findByOutletIdAndChecklistDate(Long outletId, LocalDate date);
}
