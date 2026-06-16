package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.VendorGroupDto;
import java.util.List;

public interface VendorGroupService {
    VendorGroupDto createVendorGroup(VendorGroupDto dto);
    VendorGroupDto getVendorGroupById(Long id);
    List<VendorGroupDto> getAllVendorGroups(Long outletId);
    VendorGroupDto updateVendorGroup(Long id, VendorGroupDto dto);
    void deleteVendorGroup(Long id);
    VendorGroupDto assignVendorsToGroup(Long id, List<Long> vendorIds);
}
