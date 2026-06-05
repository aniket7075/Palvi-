package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "staff")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Staff {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true, length = 50)
    private String employeeCode;

    @Column(nullable = false, length = 100)
    private String fullName;

    @Column(length = 15)
    private String mobileNumber;

    @Column(length = 255)
    private String address;

    @Column(nullable = false, length = 50)
    private String role; // e.g. Chef, Waiter, Cleaner

    private Double salary;

    private LocalDate joiningDate;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "outlet_id", nullable = false)
    private Outlet outlet;

    @Column(length = 20)
    private String status; // "ACTIVE", "INACTIVE"

    @PrePersist
    protected void onCreate() {
        if (status == null) {
            status = "ACTIVE";
        }
        if (joiningDate == null) {
            joiningDate = LocalDate.now();
        }
    }
}
