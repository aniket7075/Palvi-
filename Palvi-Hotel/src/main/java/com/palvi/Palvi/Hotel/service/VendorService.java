package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.VendorDto;
import java.util.List;

public interface VendorService {
    VendorDto createVendor(VendorDto dto);
    List<VendorDto> getAllVendors(Long outletId);
    VendorDto getVendorById(Long id);
    VendorDto updateVendor(Long id, VendorDto dto);
    void deleteVendor(Long id);
}
