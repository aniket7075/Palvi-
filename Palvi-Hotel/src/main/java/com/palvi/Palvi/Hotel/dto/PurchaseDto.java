package com.palvi.Palvi.Hotel.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PurchaseDto {
    private Long id;

    @NotNull(message = "Vendor ID is required")
    private Long vendorId;
    private String vendorName;

    @NotNull(message = "Inventory item ID is required")
    private Long inventoryItemId;
    private String inventoryItemName;
    private String inventoryUnit;

    @NotNull(message = "Quantity is required")
    private Double quantity;

    @NotNull(message = "Unit price is required")
    private Double unitPrice;

    private Double totalAmount;
    private LocalDateTime purchaseDate;
    private String billImagePath;
    private Boolean isPaid;
}
