package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.CategoryDto;
import com.palvi.Palvi.Hotel.entity.Category;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.CategoryMapper;
import com.palvi.Palvi.Hotel.repository.CategoryRepository;
import com.palvi.Palvi.Hotel.service.CategoryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class CategoryServiceImpl implements CategoryService {

    @Autowired
    private CategoryRepository categoryRepository;

    @Override
    public CategoryDto createCategory(CategoryDto dto) {
        Category category = CategoryMapper.mapToEntity(dto);
        Category saved = categoryRepository.save(category);
        return CategoryMapper.mapToDto(saved);
    }

    @Override
    public List<CategoryDto> getAllCategories() {
        return categoryRepository.findAll()
                .stream()
                .map(CategoryMapper::mapToDto)
                .collect(Collectors.toList());
    }

    @Override
    public void deleteCategory(Long id) {
        Category category = categoryRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + id));
        categoryRepository.delete(category);
    }
}
