package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.Staff;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface StaffRepository extends JpaRepository<Staff, Long> {
    boolean existsByEmployeeCode(String employeeCode);
    List<Staff> findByOutletId(Long outletId);
}
