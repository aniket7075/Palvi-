package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "purchases")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Purchase {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "vendor_id", nullable = false)
    private Vendor vendor;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_id", nullable = false)
    private Inventory inventoryItem;

    @Column(nullable = false)
    private Double quantity;

    @Column(nullable = false)
    private Double unitPrice;

    private Double totalAmount;

    @Column(nullable = false)
    private LocalDateTime purchaseDate;

    @PrePersist
    protected void onCreate() {
        if (purchaseDate == null) {
            purchaseDate = LocalDateTime.now();
        }
        if (quantity != null && unitPrice != null) {
            totalAmount = quantity * unitPrice;
        }
    }
}
