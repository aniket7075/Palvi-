package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.VendorBill;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface VendorBillRepository extends JpaRepository<VendorBill, Long> {
    List<VendorBill> findByVendorIdOrderByUploadDateDesc(Long vendorId);
}
