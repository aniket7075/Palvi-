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
public class BankDepositDto {
    private Long id;
    private Long outletId;
    private String outletName;
    private LocalDate depositDate;
    private Double amount;
    private String depositSlipUrl;
    private String status;
    private String notes;
    private Long submittedById;
    private String submittedByName;
}
