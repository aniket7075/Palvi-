package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.AuditLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    List<AuditLog> findAllByOrderByPerformedAtDesc();
}
