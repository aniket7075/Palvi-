package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.Sales;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface SalesRepository extends JpaRepository<Sales, Long> {
    List<Sales> findByOutletId(Long outletId);
    List<Sales> findBySaleDateBetween(LocalDate start, LocalDate end);
    List<Sales> findByOutletIdAndSaleDateBetween(Long outletId, LocalDate start, LocalDate end);
    Optional<Sales> findByOutletIdAndSaleDate(Long outletId, LocalDate saleDate);
}
