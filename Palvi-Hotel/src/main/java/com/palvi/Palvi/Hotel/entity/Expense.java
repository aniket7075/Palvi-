package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "expenses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String expenseName;

    @Column(nullable = false)
    private Double amount;

    @Column(length = 255)
    private String description;

    @Column(nullable = false)
    private LocalDateTime expenseDate;

    @PrePersist
    protected void onCreate() {
        if (expenseDate == null) {
            expenseDate = LocalDateTime.now();
        }
    }
}
