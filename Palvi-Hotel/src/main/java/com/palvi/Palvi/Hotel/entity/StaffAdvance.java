package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "staff_advance")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffAdvance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "staff_id", nullable = false)
    private Staff staff;

    @Column(nullable = false)
    private Double amount;

    @Column(nullable = false)
    private LocalDate advanceDate;

    @Column(length = 255)
    private String reason;

    @PrePersist
    protected void onCreate() {
        if (advanceDate == null) {
            advanceDate = LocalDate.now();
        }
    }
}
