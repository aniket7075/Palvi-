package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.GodownDispatchRequest;
import com.palvi.Palvi.Hotel.dto.GodownDispatchResponse;
import com.palvi.Palvi.Hotel.service.GodownDispatchService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/godown-dispatch")
@CrossOrigin(origins = "*")
public class GodownDispatchController {

    @Autowired
    private GodownDispatchService dispatchService;

    @PostMapping
    public ResponseEntity<GodownDispatchResponse> createDispatch(@RequestBody GodownDispatchRequest request) {
        GodownDispatchResponse response = dispatchService.createDispatch(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<GodownDispatchResponse>> getAllDispatches() {
        return ResponseEntity.ok(dispatchService.getAllDispatches());
    }

    @GetMapping("/outlet/{outletId}")
    public ResponseEntity<List<GodownDispatchResponse>> getDispatchesByOutlet(@PathVariable Long outletId) {
        return ResponseEntity.ok(dispatchService.getDispatchesByOutlet(outletId));
    }

    @PutMapping("/{id}/received")
    public ResponseEntity<GodownDispatchResponse> markAsReceived(@PathVariable Long id) {
        return ResponseEntity.ok(dispatchService.markAsReceived(id));
    }
}
