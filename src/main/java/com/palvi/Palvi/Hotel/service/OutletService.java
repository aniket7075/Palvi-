package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.OutletDto;
import java.util.List;

public interface OutletService {
    OutletDto createOutlet(OutletDto dto);
    List<OutletDto> getAllOutlets();
    OutletDto getOutletById(Long id);
    OutletDto updateOutlet(Long id, OutletDto dto);
    void deleteOutlet(Long id);
}
