package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.ExpenseDto;
import java.util.List;

public interface ExpenseService {
    ExpenseDto createExpense(ExpenseDto dto);
    List<ExpenseDto> getAllExpenses();
    ExpenseDto getExpenseById(Long id);
    ExpenseDto updateExpense(Long id, ExpenseDto dto);
    void deleteExpense(Long id);
}
