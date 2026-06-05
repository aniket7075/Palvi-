package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.PurchaseDto;
import java.util.List;

public interface PurchaseService {
    PurchaseDto createPurchase(PurchaseDto dto);
    List<PurchaseDto> getAllPurchases();
    PurchaseDto getPurchaseById(Long id);
    PurchaseDto updatePurchase(Long id, PurchaseDto dto);
    void deletePurchase(Long id);
}
