package com.palvi.Palvi.Hotel.dto;

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
public class DailyRequirementDto {
    private Long id;

    @NotNull(message = "Inventory item ID is required")
    private Long inventoryItemId;
    private String inventoryItemName;
    private String inventoryUnit;

    @NotNull(message = "Required quantity is required")
    private Double requiredQuantity;

    private LocalDate requiredDate;
    private String status;
}
