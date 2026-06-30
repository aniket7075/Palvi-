package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.BankDeposit;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BankDepositRepository extends JpaRepository<BankDeposit, Long> {
    List<BankDeposit> findByOutletId(Long outletId);
    List<BankDeposit> findByStatus(String status);
}
