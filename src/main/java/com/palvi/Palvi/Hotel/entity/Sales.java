package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Entity
@Table(name = "sales", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"outlet_id", "saleDate"})
})
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Sales {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "outlet_id", nullable = false)
    private Outlet outlet;

    @Column(nullable = false)
    private LocalDate saleDate;

    private Double cashSale;
    private Double upiSale;
    private Double cardSale;
    private Double swiggySale;
    private Double zomatoSale;
    private Double otherOnlineSale;

    private Double totalSale;

    @PrePersist
    @PreUpdate
    protected void calculateTotal() {
        if (saleDate == null) {
            saleDate = LocalDate.now();
        }
        double cash = cashSale != null ? cashSale : 0.0;
        double upi = upiSale != null ? upiSale : 0.0;
        double card = cardSale != null ? cardSale : 0.0;
        double swiggy = swiggySale != null ? swiggySale : 0.0;
        double zomato = zomatoSale != null ? zomatoSale : 0.0;
        double other = otherOnlineSale != null ? otherOnlineSale : 0.0;
        this.totalSale = cash + upi + card + swiggy + zomato + other;
    }
}
