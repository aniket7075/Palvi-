package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.VendorGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface VendorGroupRepository extends JpaRepository<VendorGroup, Long> {

    @Query("SELECT vg FROM VendorGroup vg WHERE vg.outlet IS NULL OR vg.outlet.id = :outletId")
    List<VendorGroup> findByOutletIdOrGlobal(@Param("outletId") Long outletId);
}
