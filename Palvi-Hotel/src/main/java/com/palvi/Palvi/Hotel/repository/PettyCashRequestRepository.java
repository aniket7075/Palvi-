package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.PettyCashRequest;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PettyCashRequestRepository extends JpaRepository<PettyCashRequest, Long> {
    List<PettyCashRequest> findByOutletId(Long outletId);
}
