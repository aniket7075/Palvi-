package com.palvi.Palvi.Hotel.entity;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "godown_dispatch_item")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GodownDispatchItem {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "dispatch_id", nullable = false)
    @JsonIgnore
    private GodownDispatch dispatch;

    @Column(nullable = false, length = 100)
    private String itemName;

    @Column(nullable = false)
    private Double quantity;

    @Column(length = 20)
    private String unit;
}
