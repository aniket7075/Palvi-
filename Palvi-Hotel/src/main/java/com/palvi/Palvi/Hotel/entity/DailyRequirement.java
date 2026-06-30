package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "daily_requirements")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyRequirement {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventoryItem;

    @Column(nullable = false)
    private Double requiredQuantity;

    @Column(nullable = false)
    private LocalDate requiredDate;

    @Column(length = 20)
    @Builder.Default
    private String status = "PENDING_APPROVAL";

    @PrePersist
    protected void onCreate() {
        if (requiredDate == null) {
            requiredDate = LocalDate.now();
        }
        if (status == null) {
            status = "PENDING_APPROVAL";
        }
    }
}
