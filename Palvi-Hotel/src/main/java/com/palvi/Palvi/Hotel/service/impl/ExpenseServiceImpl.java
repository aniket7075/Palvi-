package com.palvi.Palvi.Hotel.service.impl;

import com.palvi.Palvi.Hotel.dto.ExpenseDto;
import com.palvi.Palvi.Hotel.entity.Expense;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.mapper.ExpenseMapper;
import com.palvi.Palvi.Hotel.repository.ExpenseRepository;
import com.palvi.Palvi.Hotel.service.ExpenseService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class ExpenseServiceImpl implements ExpenseService {

    @Autowired
    private ExpenseRepository expenseRepository;

    @Autowired
    private ExpenseMapper expenseMapper;

    @Override
    public ExpenseDto createExpense(ExpenseDto dto) {
        Expense expense = expenseMapper.toEntity(dto);
        if (expense.getExpenseDate() == null) {
            expense.setExpenseDate(LocalDateTime.now());
        }
        Expense saved = expenseRepository.save(expense);
        return expenseMapper.toDto(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseDto> getAllExpenses() {
        return expenseRepository.findAll().stream()
                .map(expenseMapper::toDto)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseDto getExpenseById(Long id) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));
        return expenseMapper.toDto(expense);
    }

    @Override
    public ExpenseDto updateExpense(Long id, ExpenseDto dto) {
        Expense expense = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found with id: " + id));

        expense.setExpenseName(dto.getExpenseName());
        expense.setAmount(dto.getAmount());
        expense.setDescription(dto.getDescription());
        if (dto.getExpenseDate() != null) {
            expense.setExpenseDate(dto.getExpenseDate());
        }

        Expense saved = expenseRepository.save(expense);
        return expenseMapper.toDto(saved);
    }

    @Override
    public void deleteExpense(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found with id: " + id);
        }
        expenseRepository.deleteById(id);
    }
}
