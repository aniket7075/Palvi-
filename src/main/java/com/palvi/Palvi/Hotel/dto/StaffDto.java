package com.palvi.Palvi.Hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffDto {
    private Long id;

    @NotBlank(message = "Employee code is required")
    private String employeeCode;

    @NotBlank(message = "Full name is required")
    private String fullName;

    private String mobileNumber;
    private String address;

    @NotBlank(message = "Role is required")
    private String role; // Chef, Waiter, Cleaner, etc.

    private Double salary;
    private LocalDate joiningDate;

    @NotNull(message = "Outlet ID is required")
    private Long outletId;
    private String outletName;

    private String status; // ACTIVE, INACTIVE
}
