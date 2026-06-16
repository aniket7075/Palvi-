package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.Vendor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;

@Repository
public interface VendorRepository extends JpaRepository<Vendor, Long> {
    
    @Query("SELECT v FROM Vendor v WHERE v.outlet IS NULL OR v.outlet.id = :outletId")
    List<Vendor> findByOutletIdOrGlobal(@Param("outletId") Long outletId);
}
