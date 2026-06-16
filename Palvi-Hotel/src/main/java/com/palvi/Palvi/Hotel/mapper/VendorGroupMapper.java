package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.VendorGroupDto;
import com.palvi.Palvi.Hotel.entity.Vendor;
import com.palvi.Palvi.Hotel.entity.VendorGroup;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class VendorGroupMapper {

    public VendorGroupDto toDto(VendorGroup entity) {
        if (entity == null) return null;
        return VendorGroupDto.builder()
                .id(entity.getId())
                .name(entity.getName())
                .vendorIds(entity.getVendors() != null 
                    ? entity.getVendors().stream().map(Vendor::getId).collect(Collectors.toList()) 
                    : null)
                .build();
    }

    public VendorGroup toEntity(VendorGroupDto dto) {
        if (dto == null) return null;
        return VendorGroup.builder()
                .id(dto.getId())
                .name(dto.getName())
                .build();
    }
}
