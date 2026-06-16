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
public class VendorGroupDto {
    private Long id;

    @NotBlank(message = "Group name is required")
    private String name;

    private List<Long> vendorIds;
}
