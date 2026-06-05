package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.OutletDto;
import com.palvi.Palvi.Hotel.entity.Outlet;
import org.springframework.stereotype.Component;

@Component
public class OutletMapper {

    public OutletDto toDto(Outlet entity) {
        if (entity == null) return null;
        return OutletDto.builder()
                .id(entity.getId())
                .outletName(entity.getOutletName())
                .address(entity.getAddress())
                .city(entity.getCity())
                .mobileNumber(entity.getMobileNumber())
                .gstNumber(entity.getGstNumber())
                .status(entity.getStatus())
                .createdAt(entity.getCreatedAt())
                .updatedAt(entity.getUpdatedAt())
                .build();
    }

    public Outlet toEntity(OutletDto dto) {
        if (dto == null) return null;
        return Outlet.builder()
                .id(dto.getId())
                .outletName(dto.getOutletName())
                .address(dto.getAddress())
                .city(dto.getCity())
                .mobileNumber(dto.getMobileNumber())
                .gstNumber(dto.getGstNumber())
                .status(dto.getStatus())
                .build();
    }
}
