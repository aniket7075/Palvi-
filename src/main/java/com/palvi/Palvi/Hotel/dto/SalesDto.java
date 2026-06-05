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
public class SalesDto {
    private Long id;

    @NotNull(message = "Outlet ID is required")
    private Long outletId;
    private String outletName;

    private LocalDate saleDate;

    private Double cashSale;
    private Double upiSale;
    private Double cardSale;
    private Double swiggySale;
    private Double zomatoSale;
    private Double otherOnlineSale;

    private Double totalSale;
}
