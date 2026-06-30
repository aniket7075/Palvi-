package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.BankDepositDto;
import com.palvi.Palvi.Hotel.entity.BankDeposit;
import org.springframework.stereotype.Component;

@Component
public class BankDepositMapper {

    public BankDepositDto toDto(BankDeposit entity) {
        if (entity == null) return null;
        return BankDepositDto.builder()
                .id(entity.getId())
                .outletId(entity.getOutlet() != null ? entity.getOutlet().getId() : null)
                .outletName(entity.getOutlet() != null ? entity.getOutlet().getOutletName() : null)
                .depositDate(entity.getDepositDate())
                .amount(entity.getAmount())
                .depositSlipUrl(entity.getDepositSlipUrl())
                .status(entity.getStatus())
                .notes(entity.getNotes())
                .submittedById(entity.getSubmittedBy() != null ? entity.getSubmittedBy().getId() : null)
                .submittedByName(entity.getSubmittedBy() != null ? entity.getSubmittedBy().getFullName() : null)
                .build();
    }

    public BankDeposit toEntity(BankDepositDto dto) {
        if (dto == null) return null;
        return BankDeposit.builder()
                .id(dto.getId())
                .depositDate(dto.getDepositDate())
                .amount(dto.getAmount())
                .depositSlipUrl(dto.getDepositSlipUrl())
                .status(dto.getStatus())
                .notes(dto.getNotes())
                .build();
    }
}
