package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "inventory")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Inventory {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String itemName;

    @Column(nullable = false, length = 100)
    private String category;

    private Double quantity; // Total initial/base or capacity

    @Column(length = 20)
    private String unit; // KG, Ltr, Pcs, etc.

    private Double purchasePrice;

    @Column(nullable = false)
    private Double currentStock;

    @Column(nullable = false)
    private Double minimumStock;
}
