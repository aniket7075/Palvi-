package com.palvi.Palvi.Hotel.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryDto {
    private Long id;

    @NotBlank(message = "Item name is required")
    private String itemName;

    @NotBlank(message = "Category is required")
    private String category;

    private Double quantity; // Capacity/Total base
    private String unit;
    private Double purchasePrice;

    @NotNull(message = "Current stock is required")
    private Double currentStock;

    @NotNull(message = "Minimum stock is required")
    private Double minimumStock;
}
