package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.WasteLogDto;
import java.util.List;

public interface WasteLogService {
    WasteLogDto createWasteLog(WasteLogDto dto);
    List<WasteLogDto> getAllWasteLogs();
    List<WasteLogDto> getWasteLogsByOutlet(Long outletId);
}
