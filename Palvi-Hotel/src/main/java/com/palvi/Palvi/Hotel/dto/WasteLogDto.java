package com.palvi.Palvi.Hotel.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDate;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class WasteLogDto {
    private Long id;
    private Long outletId;
    private String outletName;
    private Long inventoryItemId;
    private String inventoryItemName;
    private Double quantity;
    private String unit;
    private LocalDate date;
    private String reason;
    private Long loggedById;
    private String loggedByName;
}
