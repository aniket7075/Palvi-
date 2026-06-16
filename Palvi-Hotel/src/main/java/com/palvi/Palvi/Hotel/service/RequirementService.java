package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.DailyRequirementDto;
import java.util.List;

public interface RequirementService {
    DailyRequirementDto createRequirement(DailyRequirementDto dto);
    List<DailyRequirementDto> getAllRequirements();
    DailyRequirementDto updateRequirement(Long id, DailyRequirementDto dto);
    void deleteRequirement(Long id);
}
