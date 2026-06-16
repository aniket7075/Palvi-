package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.GodownDispatchItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface GodownDispatchItemRepository extends JpaRepository<GodownDispatchItem, Long> {
}
