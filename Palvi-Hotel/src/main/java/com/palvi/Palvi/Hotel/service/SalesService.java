package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.SalesDto;
import java.time.LocalDate;
import java.util.List;

public interface SalesService {
    SalesDto saveSales(SalesDto dto);
    List<SalesDto> getAllSales();
    List<SalesDto> getDailySales(LocalDate date);
    List<SalesDto> getWeeklySales();
    List<SalesDto> getMonthlySales();
    List<SalesDto> getSalesByOutlet(Long outletId);
}
