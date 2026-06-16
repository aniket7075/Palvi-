package com.palvi.Palvi.Hotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OutletDto {
    private Long id;

    @NotBlank(message = "Outlet name is required")
    private String outletName;

    private String address;
    private String city;
    private String mobileNumber;
    private String gstNumber;
    private String status; // ACTIVE, INACTIVE
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
