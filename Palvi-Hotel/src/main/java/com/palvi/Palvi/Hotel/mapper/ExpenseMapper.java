package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.ExpenseDto;
import com.palvi.Palvi.Hotel.entity.Expense;
import org.springframework.stereotype.Component;

@Component
public class ExpenseMapper {

    public ExpenseDto toDto(Expense entity) {
        if (entity == null) return null;
        return ExpenseDto.builder()
                .id(entity.getId())
                .expenseName(entity.getExpenseName())
                .amount(entity.getAmount())
                .description(entity.getDescription())
                .expenseDate(entity.getExpenseDate())
                .build();
    }

    public Expense toEntity(ExpenseDto dto) {
        if (dto == null) return null;
        return Expense.builder()
                .id(dto.getId())
                .expenseName(dto.getExpenseName())
                .amount(dto.getAmount())
                .description(dto.getDescription())
                .expenseDate(dto.getExpenseDate())
                .build();
    }
}
