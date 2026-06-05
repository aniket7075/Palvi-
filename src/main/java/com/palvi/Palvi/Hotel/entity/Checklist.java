package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "checklists")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checklist {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 150)
    private String checklistName;

    @Builder.Default
    private boolean completed = false;

    @Column(nullable = false)
    private LocalDate checklistDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "outlet_id", nullable = false)
    private Outlet outlet;

    @PrePersist
    protected void onCreate() {
        if (checklistDate == null) {
            checklistDate = LocalDate.now();
        }
    }
}
