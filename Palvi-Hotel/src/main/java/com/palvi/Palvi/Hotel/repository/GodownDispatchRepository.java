package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.GodownDispatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface GodownDispatchRepository extends JpaRepository<GodownDispatch, Long> {
    List<GodownDispatch> findByTargetOutletId(Long targetOutletId);
    List<GodownDispatch> findBySentById(Long sentById);
}
