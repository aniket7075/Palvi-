package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.CategoryDto;
import java.util.List;

public interface CategoryService {
    CategoryDto createCategory(CategoryDto categoryDto);
    List<CategoryDto> getAllCategories();
    void deleteCategory(Long id);
}
