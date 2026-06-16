package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.CategoryDto;
import com.palvi.Palvi.Hotel.entity.Category;

public class CategoryMapper {

    public static Category mapToEntity(CategoryDto dto) {
        Category category = new Category();
        category.setName(dto.getName());
        return category;
    }

    public static CategoryDto mapToDto(Category entity) {
        CategoryDto dto = new CategoryDto();
        dto.setId(entity.getId());
        dto.setName(entity.getName());
        return dto;
    }
}
