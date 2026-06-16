package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.Inventory;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import java.util.List;

@Repository
public interface InventoryRepository extends JpaRepository<Inventory, Long> {
    
    @Query("SELECT i FROM Inventory i WHERE i.currentStock <= i.minimumStock")
    List<Inventory> findLowStockItems();
}
