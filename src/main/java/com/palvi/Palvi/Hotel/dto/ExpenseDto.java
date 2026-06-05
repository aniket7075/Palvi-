package com.palvi.Palvi.Hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ExpenseDto {
    private Long id;

    @NotBlank(message = "Expense name is required")
    private String expenseName;

    @NotNull(message = "Amount is required")
    private Double amount;

    private String description;
    private LocalDateTime expenseDate;
}
