package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.ToString;
import java.util.Set;

@Entity
@Table(name = "vendors")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Vendor {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String vendorName;

    @Column(length = 15)
    private String mobileNumber;

    @Column(length = 15)
    private String whatsappNumber;

    @Column(length = 255)
    private String address;

    @Column(length = 100)
    private String category; // e.g. "Vegetables", "Dairy", "Meat"

    @Column(nullable = false)
    @Builder.Default
    private Integer billingCycleDays = 10;

    @ManyToMany(mappedBy = "vendors", fetch = FetchType.LAZY)
    @EqualsAndHashCode.Exclude
    @ToString.Exclude
    private Set<VendorGroup> vendorGroups;
}
