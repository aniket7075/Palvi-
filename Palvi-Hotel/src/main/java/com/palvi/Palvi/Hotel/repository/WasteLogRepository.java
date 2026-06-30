package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.WasteLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WasteLogRepository extends JpaRepository<WasteLog, Long> {
    List<WasteLog> findByOutletId(Long outletId);
}
