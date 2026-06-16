package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.VendorDto;
import com.palvi.Palvi.Hotel.entity.Vendor;
import org.springframework.stereotype.Component;

@Component
public class VendorMapper {

    public VendorDto toDto(Vendor entity) {
        if (entity == null) return null;
        return VendorDto.builder()
                .id(entity.getId())
                .vendorName(entity.getVendorName())
                .mobileNumber(entity.getMobileNumber())
                .whatsappNumber(entity.getWhatsappNumber())
                .address(entity.getAddress())
                .category(entity.getCategory())
                .billingCycleDays(entity.getBillingCycleDays())
                .build();
    }

    public Vendor toEntity(VendorDto dto) {
        if (dto == null) return null;
        return Vendor.builder()
                .id(dto.getId())
                .vendorName(dto.getVendorName())
                .mobileNumber(dto.getMobileNumber())
                .whatsappNumber(dto.getWhatsappNumber())
                .address(dto.getAddress())
                .category(dto.getCategory())
                .billingCycleDays(dto.getBillingCycleDays() != null ? dto.getBillingCycleDays() : 10)
                .build();
    }
}
