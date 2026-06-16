package com.palvi.Palvi.Hotel.mapper;

import com.palvi.Palvi.Hotel.dto.SalesDto;
import com.palvi.Palvi.Hotel.entity.Sales;
import org.springframework.stereotype.Component;

@Component
public class SalesMapper {

    public SalesDto toDto(Sales entity) {
        if (entity == null) return null;
        return SalesDto.builder()
                .id(entity.getId())
                .outletId(entity.getOutlet() != null ? entity.getOutlet().getId() : null)
                .outletName(entity.getOutlet() != null ? entity.getOutlet().getOutletName() : null)
                .saleDate(entity.getSaleDate())
                .cashSale(entity.getCashSale())
                .upiSale(entity.getUpiSale())
                .cardSale(entity.getCardSale())
                .swiggySale(entity.getSwiggySale())
                .zomatoSale(entity.getZomatoSale())
                .otherOnlineSale(entity.getOtherOnlineSale())
                .totalSale(entity.getTotalSale())
                .build();
    }

    public Sales toEntity(SalesDto dto) {
        if (dto == null) return null;
        return Sales.builder()
                .id(dto.getId())
                .saleDate(dto.getSaleDate())
                .cashSale(dto.getCashSale())
                .upiSale(dto.getUpiSale())
                .cardSale(dto.getCardSale())
                .swiggySale(dto.getSwiggySale())
                .zomatoSale(dto.getZomatoSale())
                .otherOnlineSale(dto.getOtherOnlineSale())
                .build();
    }
}
