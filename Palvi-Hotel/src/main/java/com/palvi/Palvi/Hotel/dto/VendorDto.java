package com.palvi.Palvi.Hotel.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VendorDto {
    private Long id;

    @NotBlank(message = "Vendor name is required")
    private String vendorName;

    private String mobileNumber;
    private String whatsappNumber;
    private String address;
    private String category;
    private Integer billingCycleDays;
    private List<VendorGroupDto> vendorGroups;
}
