package com.palvi.Palvi.Hotel.controller;

import com.palvi.Palvi.Hotel.entity.Purchase;
import com.palvi.Palvi.Hotel.exception.ResourceNotFoundException;
import com.palvi.Palvi.Hotel.repository.PurchaseRepository;
import com.palvi.Palvi.Hotel.service.FileStorageService;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@CrossOrigin(origins = "*") 
@Tag(name = "Purchase Upload Controller", description = "Endpoints for manager to upload bills for a purchase")
public class PurchaseUploadController {

    @Autowired
    private FileStorageService fileStorageService;

    @Autowired
    private PurchaseRepository purchaseRepository;

    @GetMapping(value = "/purchase-upload", produces = MediaType.TEXT_HTML_VALUE)
    public String getPurchaseUploadPage(@RequestParam Long purchaseId) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + purchaseId));
        
        return "<html>" +
                "<head>" +
                "<meta name='viewport' content='width=device-width, initial-scale=1.0'>" +
                "<title>Upload Purchase Bill - Palvi Hotel</title>" +
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
                "<h2>Upload Bill for Purchase</h2>" +
                "<p><strong>Vendor:</strong> " + purchase.getVendor().getVendorName() + "</p>" +
                "<p><strong>Item:</strong> " + purchase.getInventoryItem().getItemName() + "</p>" +
                "<form id='uploadForm'>" +
                "<input type='hidden' id='purchaseId' value='" + purchaseId + "'>" +
                "<input type='file' id='fileInput' accept='image/*' required>" +
                "<button type='button' onclick='uploadFile()'>Upload Now</button>" +
                "</form>" +
                "<div id='successMsg' class='success'>Uploaded successfully! You can close this window and return to the app.</div>" +
                "<div id='errorMsg' class='error'>Failed to upload. Please try again.</div>" +
                "</div>" +
                "<script>" +
                "function uploadFile() {" +
                "  var fileInput = document.getElementById('fileInput');" +
                "  var purchaseId = document.getElementById('purchaseId').value;" +
                "  if (fileInput.files.length === 0) { alert('Please select a file.'); return; }" +
                "  var formData = new FormData();" +
                "  formData.append('file', fileInput.files[0]);" +
                "  fetch('/api/purchases/' + purchaseId + '/upload-bill', { method: 'POST', body: formData })" +
                "  .then(response => { if(response.ok) { document.getElementById('uploadForm').style.display='none'; document.getElementById('successMsg').style.display='block'; document.getElementById('errorMsg').style.display='none'; } else { document.getElementById('errorMsg').style.display='block'; } })" +
                "  .catch(error => { document.getElementById('errorMsg').style.display='block'; });" +
                "}" +
                "</script>" +
                "</body>" +
                "</html>";
    }

    @PostMapping("/api/purchases/{purchaseId}/upload-bill")
    public ResponseEntity<?> uploadPurchaseBill(@PathVariable Long purchaseId, @RequestParam("file") MultipartFile file) {
        Purchase purchase = purchaseRepository.findById(purchaseId)
                .orElseThrow(() -> new ResourceNotFoundException("Purchase not found with id: " + purchaseId));
        
        String fileName = fileStorageService.storeFile(file);
        
        purchase.setBillImagePath(fileName);
        purchaseRepository.save(purchase);
        
        return ResponseEntity.ok().build();
    }
}
