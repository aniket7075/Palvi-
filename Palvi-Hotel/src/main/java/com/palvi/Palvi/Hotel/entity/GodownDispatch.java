package com.palvi.Palvi.Hotel.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "godown_dispatch")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GodownDispatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "sent_by_user_id", nullable = false)
    private User sentBy;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "target_outlet_id", nullable = false)
    private Outlet targetOutlet;

    @Column(nullable = false, length = 50)
    private String status; // e.g., "DISPATCHED", "RECEIVED"

    @Column(nullable = false)
    private LocalDateTime dispatchDate;

    private LocalDateTime receivedDate;

    @OneToMany(mappedBy = "dispatch", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<GodownDispatchItem> items;

    @PrePersist
    protected void onCreate() {
        if (dispatchDate == null) {
            dispatchDate = LocalDateTime.now();
        }
        if (status == null) {
            status = "DISPATCHED";
        }
    }
}
