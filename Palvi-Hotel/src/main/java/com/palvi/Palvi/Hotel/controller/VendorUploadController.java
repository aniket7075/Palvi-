package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.dto.VendorBillDto;
import com.palvi.Palvi.Hotel.entity.Vendor;
import com.palvi.Palvi.Hotel.entity.VendorBill;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.repository.VendorBillRepository;
import com.palvi.Palvi.Hotel.repository.VendorRepository;
import com.palvi.Palvi.Hotel.service.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@CrossOrigin(origins = "*") 
@Tag(name = "Vendor Upload Controller", description = "Endpoints for vendor image uploads")
public class VendorUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private VendorRepository vendorRepository;

    @Autowired
    private VendorBillRepository vendorBillRepository;

    @GetMapping(value = "/vendor-upload", produces = MediaType.TEXT_HTML_VALUE)
    public String getUploadPage(@RequestParam Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));
        
        return "<html>" +
                "<head>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Upload Bill - Palvi Hotel</title>" +
                "<style>" +
                "body { font-family: sans-serif; padding: 20px; background-color: #f9f5f0; color: #3d251e; }" +
                ".container { max-width: 400px; margin: 0 auto; background: #fff; padding: 20px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }" +
                "h2 { text-align: center; color: #146e4e; }" +
                "input[type=file] { margin: 20px 0; width: 100%; }" +
                "button { background-color: #146e4e; color: white; border: none; padding: 12px; width: 100%; border-radius: 6px; font-size: 16px; cursor: pointer; }" +
                ".success { color: green; display: none; text-align: center; margin-top: 15px; }" +
                ".error { color: red; display: none; text-align: center; margin-top: 15px; }" +
                "</style>" +
                "</head>" +
                "<body>" +
                "<div class='container'>" +
                "<h2>Upload Bill / Invoice</h2>" +
                "<p><strong>Vendor:</strong> " + vendor.getVendorName() + "</p>" +
                "<form id='uploadForm'>" +
                "<input type='hidden' id='vendorId' value='" + vendorId + "'>" +
                "<input type='file' id='fileInput' accept='image/*' required>" +
                "<button type='button' onclick='uploadFile()'>Upload Now</button>" +
                "</form>" +
                "<div id='successMsg' class='success'>Uploaded successfully! You can close this window.</div>" +
                "<div id='errorMsg' class='error'>Failed to upload. Please try again.</div>" +
                "</div>" +
                "<script>" +
                "function uploadFile() {" +
                "  var fileInput = document.getElementById('fileInput');" +
                "  var vendorId = document.getElementById('vendorId').value;" +
                "  if (fileInput.files.length === 0) { alert('Please select a file.'); return; }" +
                "  var formData = new FormData();" +
                "  formData.append('file', fileInput.files[0]);" +
                "  formData.append('vendorId', vendorId);" +
                "  fetch('/api/vendor-bills/upload', { method: 'POST', body: formData })" +
                "  .then(response => { if(response.ok) { document.getElementById('uploadForm').style.display='none'; document.getElementById('successMsg').style.display='block'; document.getElementById('errorMsg').style.display='none'; } else { document.getElementById('errorMsg').style.display='block'; } })" +
                "  .catch(error => { document.getElementById('errorMsg').style.display='block'; });" +
                "}" +
                "</script>" +
                "</body>" +
                "</html>";
    }

    @PostMapping("/api/vendor-bills/upload")
    public ResponseEntity<?> uploadVendorBill(@RequestParam("file") MultipartFile file, @RequestParam("vendorId") Long vendorId) {
        Vendor vendor = vendorRepository.findById(vendorId)
                .orElseThrow(() -> new ResourceNotFoundException("Vendor not found with id: " + vendorId));
        
        String fileName = fileStorageService.storeFile(file);
        
        VendorBill bill = VendorBill.builder()
                .vendor(vendor)
                .imagePath(fileName)
                .uploadDate(LocalDateTime.now())
                .build();
                
        vendorBillRepository.save(bill);
        
        return ResponseEntity.ok().build();
    }

    @GetMapping("/api/vendor-bills")
    public ResponseEntity<List<VendorBillDto>> getAllVendorBills() {
        List<VendorBillDto> bills = vendorBillRepository.findAll().stream().map(b -> {
            VendorBillDto dto = new VendorBillDto();
            dto.setId(b.getId());
            dto.setVendorId(b.getVendor().getId());
            dto.setVendorName(b.getVendor().getVendorName());
            dto.setImagePath("/uploads/" + b.getImagePath());
            dto.setUploadDate(b.getUploadDate());
            return dto;
        }).collect(Collectors.toList());
        
        return ResponseEntity.ok(bills);
    }
}
