package com.palvi.Palvi.Hotel.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class VendorBillDto {
    private Long id;
    private Long vendorId;
    private String vendorName;
    private String imagePath;
    private LocalDateTime uploadDate;
}
