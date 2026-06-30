package com.palvi.Palvi.Hotel.service;

import com.palvi.Palvi.Hotel.dto.PettyCashRequestDto;
import java.util.List;

public interface PettyCashRequestService {
    PettyCashRequestDto createRequest(PettyCashRequestDto dto);
    List<PettyCashRequestDto> getAllRequests();
    List<PettyCashRequestDto> getRequestsByOutlet(Long outletId);
    PettyCashRequestDto updateRequestStatus(Long id, String status, String notes);
}
