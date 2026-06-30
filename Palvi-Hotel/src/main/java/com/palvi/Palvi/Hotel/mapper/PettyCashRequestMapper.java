package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.PettyCashRequestDto;
import com.palvi.Palvi.Hotel.entity.PettyCashRequest;
import org.springframework.stereotype.Component;

@Component
public class PettyCashRequestMapper {

    public PettyCashRequestDto toDto(PettyCashRequest entity) {
        if (entity == null) return null;
        return PettyCashRequestDto.builder()
                .id(entity.getId())
                .outletId(entity.getOutlet() != null ? entity.getOutlet().getId() : null)
                .outletName(entity.getOutlet() != null ? entity.getOutlet().getOutletName() : null)
                .requestDate(entity.getRequestDate())
                .amount(entity.getAmount())
                .reason(entity.getReason())
                .status(entity.getStatus())
                .resolvedDate(entity.getResolvedDate())
                .notes(entity.getNotes())
                .build();
    }

    public PettyCashRequest toEntity(PettyCashRequestDto dto) {
        if (dto == null) return null;
        return PettyCashRequest.builder()
                .id(dto.getId())
                .requestDate(dto.getRequestDate())
                .amount(dto.getAmount())
                .reason(dto.getReason())
                .status(dto.getStatus())
                .resolvedDate(dto.getResolvedDate())
                .notes(dto.getNotes())
                .build();
    }
}
