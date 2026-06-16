package com.palvi.Palvi.Hotel.repository;

import com.palvi.Palvi.Hotel.entity.Category;
import org.springframework.data.jpa.repository.JpaRepository;

public interface CategoryRepository extends JpaRepository<Category, Long> {
}
