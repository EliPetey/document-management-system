document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.getElementById('upload-progress');
    const resultsList = document.getElementById('resultsList');
    const siteButtons = document.querySelectorAll('.site-btn');
    
    // State
    let selectedFiles = [];
    let currentSite = 'LHR086'; // Default site
    
    // Site selection
    siteButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove active class from all buttons
            siteButtons.forEach(btn => btn.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Update current site
            currentSite = this.dataset.site;
            
            console.log(`Selected site: ${currentSite}`);
        });
    });
    
    // Set default active site
    document.querySelector(`.site-btn[data-site="${currentSite}"]`).classList.add('active');
    
    // API endpoints
    const presignedUrlEndpoint = 'https://ya6wa8l0mh.execute-api.us-east-1.amazonaws.com/prod/presigned-url';
    const classifyEndpoint = 'https://ya6wa8l0mh.execute-api.us-east-1.amazonaws.com/prod/classify';
    const moveFileEndpoint = 'https://ya6wa8l0mh.execute-api.us-east-1.amazonaws.com/prod/move-file';
    
    // Folder structure definition
    const fullFolderStructure = `Site (LHR086)
├── 01_Technical_Documentation
│   ├── 01_Drawings
│   │   ├── Electrical
│   │   │   ├── MV_System
│   │   │   │   ├── SLDs
│   │   │   │   │   ├── UP1
│   │   │   │   │   └── EC1
│   │   │   │   ├── SOOs
│   │   │   │   │   ├── UP1
│   │   │   │   │   └── EC1
│   │   │   │   ├── SOPs
│   │   │   │   │   ├── UP1
│   │   │   │   │   └── EC1
│   │   │   │   └── MOPs
│   │   │   │       ├── UP1
│   │   │   │       └── EC1
│   │   │   └── LV_System
│   │   │       ├── SLDs
│   │   │       │   ├── UP1
│   │   │       │   └── EC1
│   │   │       ├── SOOs
│   │   │       │   ├── UP1
│   │   │       │   └── EC1
│   │   │       ├── SOPs
│   │   │       │   ├── UP1
│   │   │       │   └── EC1
│   │   │       └── MOPs
│   │   │           ├── UP1
│   │   │           └── EC1
│   │   ├── Mechanical
│   │   │   ├── HVAC
│   │   │   ├── Cooling_Systems
│   │   │   ├── Ventilation
│   │   │   └── Piping
│   │   ├── Architectural
│   │   │   ├── Floor_Plans
│   │   │   ├── General_Arrangement
│   │   │   └── Room_Layouts
│   │   ├── Fire_Protection
│   │   └── Site_External
│   │       └── Road_Markings_Signage
│   ├── 02_Equipment_Information
│   │   ├── Generators
│   │   │   ├── Specifications
│   │   │   ├── Engine_Data
│   │   │   └── Fuel_System
│   │   ├── Electrical
│   │   │   ├── Transformers
│   │   │   ├── Switchgear
│   │   │   ├── UPS_Systems
│   │   │   └── Breaker_Settings
│   │   ├── HVAC_Equipment
│   │   │   ├── Direct_Air_Optimisers
│   │   │   ├── CRAC_Units
│   │   │   ├── AHUs
│   │   │   └── Fan_Coil_Units
│   │   ├── Building_Systems
│   │   │   ├── Lifts
│   │   │   ├── Loading_Bay
│   │   │   └── Security_Systems
│   │   └── Water_Systems
│   ├── 03_Blade_Room
│   │   ├── Specifications
│   │   ├── Controls
│   │   ├── Operation_Documentation
│   │   └── Training_Materials
│   ├── 04_BOM_Inventories
│   │   ├── Equipment_BOM
│   │   ├── Critical_Spares
│   │   ├── Tools
│   │   └── Chemical_Inventory
│   └── 05_Reference_Documentation
│       ├── CSE_LSE_Guidelines
│       ├── Design_Engineering
│       └── Asset_Lists
├── 02_Operations
│   ├── 01_Procedures
│   │   ├── SOPs
│   │   │   ├── Electrical
│   │   │   ├── Mechanical
│   │   │   ├── Fire_Systems
│   │   │   ├── Controls
│   │   │   └── Water_Systems
│   │   ├── EOPs
│   │   │   ├── Electrical
│   │   │   ├── Mechanical
│   │   │   ├── Fire_Systems
│   │   │   ├── Controls
│   │   │   └── Emergency_Response
│   │   ├── MOPs
│   │   └── Work_Instructions
│   ├── 02_Sequences_Of_Operation
│   │   ├── HVAC_Systems
│   │   ├── Electrical_Systems
│   │   ├── Control_Systems
│   │   ├── Fire_Systems
│   │   └── Water_Systems
│   ├── 03_Training
│   │   ├── Vendor_Training
│   │   ├── Equipment_Training
│   │   ├── Procedures_Training
│   │   └── Safety_Training
│   ├── 04_Daily_Operations
│   │   ├── Shift_Handovers
│   │   ├── Walkrounds
│   │   ├── Weekly_Calls
│   │   └── Status_Reports
│   └── 05_MCM
│       ├── Process_Documentation
│       └── Requirements
├── 03_Maintenance
│   ├── 01_PPM
│   │   ├── Electrical
│   │   │   ├── MV_Equipment
│   │   │   ├── LV_Equipment
│   │   │   └── UPS_Systems
│   │   ├── Mechanical
│   │   │   ├── HVAC_Systems
│   │   │   ├── CRAC_Units
│   │   │   └── Direct_Air_Optimisers
│   │   ├── Generators
│   │   └── Building_Systems
│   │       ├── Lifts
│   │       ├── Fire_Systems
│   │       └── Loading_Bay
│   ├── 02_Equipment_Records
│   │   ├── CRAC_Units
│   │   ├── Direct_Air_Optimisers
│   │   ├── Fan_Coil_Units
│   │   ├── Generators
│   │   ├── UPS_Systems
│   │   ├── Building_Systems
│   │   └── Variable_Frequency_Drives
│   ├── 03_Vendor_Service_Reports
│   │   └── [By_Vendor_Name]
│   └── 04_Corrective_Maintenance
│       ├── Completed_Works
│       └── Outstanding_Issues
├── 04_Compliance
│   ├── 01_Environmental
│   │   ├── Generator_Compliance
│   │   │   ├── Run_Logs
│   │   │   ├── Fuel_Records
│   │   │   └── SCR_Data
│   │   ├── F-Gas_Management
│   │   │   ├── Registers
│   │   │   ├── Certificates
│   │   │   └── Reports
│   │   ├── Waste_Management
│   │   └── COSHH
│   ├── 02_Health_and_Safety
│   │   ├── Risk_Assessments
│   │   ├── Fire_Safety
│   │   ├── LOLER
│   │   └── Equipment_Testing
│   ├── 03_Electrical_Compliance
│   │   ├── Inspection_Reports
│   │   ├── Certifications
│   │   └── Electrical_Rules
│   ├── 04_Fire_Systems
│   │   ├── Inspections
│   │   ├── Testing_Records
│   │   └── Certifications
│   └── 05_Water_Compliance
│       ├── Legionella_Management
│       ├── Water_Sampling
│       └── Temperature_Checks
├── 05_Vendors
│   ├── 01_Vendor_Information
│   │   ├── Contact_Lists
│   │   └── Escalation_Procedures
│   ├── 02_Vendor_Documentation
│   │   └── [By_Vendor_Name]
│   │       ├── Competencies
│   │       ├── RAMS
│   │       ├── Service_Reports
│   │       └── Call-out_Records
│   └── 03_Vendor_Management
│       ├── Onboarding
│       ├── Contracts
│       └── Purchase_Orders
├── 06_Projects
│   ├── 01_Active_Projects
│   │   └── [Project_Name]
│   ├── 02_Commissioning
│   │   ├── FAT
│   │   ├── SAT
│   │   └── Handover
│   └── 03_Construction
│       ├── Documentation
│       └── Reports
└── 07_Administration
    ├── 01_Access_Control
    │   └── Door_Keys_Reference
    ├── 02_Signage
    │   ├── Layouts
    │   ├── Quotes
    │   └── Templates
    ├── 03_Site_Management
    │   ├── Site_Launch_Plan
    │   └── Property_Management
    └── 04_Permits
        ├── E-Permits
        ├── High_Risk_Works
        └── Templates
Site (LHR186)
├── 01_Technical_Documentation
│   ├── 01_Drawings
│   │   ├── Electrical
│   │   │   ├── MV_System
│   │   │   │   ├── SLDs
│   │   │   │   │   ├── UP1
│   │   │   │   │   └── EC1
│   │   │   │   ├── SOOs
│   │   │   │   │   ├── UP1
│   │   │   │   │   └── EC1
│   │   │   │   ├── SOPs
│   │   │   │   │   ├── UP1
│   │   │   │   │   └── EC1
│   │   │   │   └── MOPs
│   │   │   │       ├── UP1
│   │   │   │       └── EC1
│   │   │   └── LV_System
│   │   │       ├── SLDs
│   │   │       │   ├── UP1
│   │   │       │   └── EC1
│   │   │       ├── SOOs
│   │   │       │   ├── UP1
│   │   │       │   └── EC1
│   │   │       ├── SOPs
│   │   │       │   ├── UP1
│   │   │       │   └── EC1
│   │   │       └── MOPs
│   │   │           ├── UP1
│   │   │           └── EC1
│   │   ├── Mechanical
│   │   │   ├── HVAC
│   │   │   ├── Cooling_Systems
│   │   │   ├── Ventilation
│   │   │   └── Piping
│   │   ├── Architectural
│   │   │   ├── Floor_Plans
│   │   │   ├── General_Arrangement
│   │   │   └── Room_Layouts
│   │   ├── Fire_Protection
│   │   └── Site_External
│   │       └── Road_Markings_Signage
│   ├── 02_Equipment_Information
│   │   ├── Generators
│   │   │   ├── Specifications
│   │   │   ├── Engine_Data
│   │   │   └── Fuel_System
│   │   ├── Electrical
│   │   │   ├── Transformers
│   │   │   ├── Switchgear
│   │   │   ├── UPS_Systems
│   │   │   └── Breaker_Settings
│   │   ├── HVAC_Equipment
│   │   │   ├── Direct_Air_Optimisers
│   │   │   ├── CRAC_Units
│   │   │   ├── AHUs
│   │   │   └── Fan_Coil_Units
│   │   ├── Building_Systems
│   │   │   ├── Lifts
│   │   │   ├── Loading_Bay
│   │   │   └── Security_Systems
│   │   └── Water_Systems
│   ├── 03_Blade_Room
│   │   ├── Specifications
│   │   ├── Controls
│   │   ├── Operation_Documentation
│   │   └── Training_Materials
│   ├── 04_BOM_Inventories
│   │   ├── Equipment_BOM
│   │   ├── Critical_Spares
│   │   ├── Tools
│   │   └── Chemical_Inventory
│   └── 05_Reference_Documentation
│       ├── CSE_LSE_Guidelines
│       ├── Design_Engineering
│       └── Asset_Lists
├── 02_Operations
│   ├── 01_Procedures
│   │   ├── SOPs
│   │   │   ├── Electrical
│   │   │   ├── Mechanical
│   │   │   ├── Fire_Systems
│   │   │   ├── Controls
│   │   │   └── Water_Systems
│   │   ├── EOPs
│   │   │   ├── Electrical
│   │   │   ├── Mechanical
│   │   │   ├── Fire_Systems
│   │   │   ├── Controls
│   │   │   └── Emergency_Response
│   │   ├── MOPs
│   │   └── Work_Instructions
│   ├── 02_Sequences_Of_Operation
│   │   ├── HVAC_Systems
│   │   ├── Electrical_Systems
│   │   ├── Control_Systems
│   │   ├── Fire_Systems
│   │   └── Water_Systems
│   ├── 03_Training
│   │   ├── Vendor_Training
│   │   ├── Equipment_Training
│   │   ├── Procedures_Training
│   │   └── Safety_Training
│   ├── 04_Daily_Operations
│   │   ├── Shift_Handovers
│   │   ├── Walkrounds
│   │   ├── Weekly_Calls
│   │   └── Status_Reports
│   └── 05_MCM
│       ├── Process_Documentation
│       └── Requirements
├── 03_Maintenance
│   ├── 01_PPM
│   │   ├── Electrical
│   │   │   ├── MV_Equipment
│   │   │   ├── LV_Equipment
│   │   │   └── UPS_Systems
│   │   ├── Mechanical
│   │   │   ├── HVAC_Systems
│   │   │   ├── CRAC_Units
│   │   │   └── Direct_Air_Optimisers
│   │   ├── Generators
│   │   └── Building_Systems
│   │       ├── Lifts
│   │       ├── Fire_Systems
│   │       └── Loading_Bay
│   ├── 02_Equipment_Records
│   │   ├── CRAC_Units
│   │   ├── Direct_Air_Optimisers
│   │   ├── Fan_Coil_Units
│   │   ├── Generators
│   │   ├── UPS_Systems
│   │   ├── Building_Systems
│   │   └── Variable_Frequency_Drives
│   ├── 03_Vendor_Service_Reports
│   │   └── [By_Vendor_Name]
│   └── 04_Corrective_Maintenance
│       ├── Completed_Works
│       └── Outstanding_Issues
├── 04_Compliance
│   ├── 01_Environmental
│   │   ├── Generator_Compliance
│   │   │   ├── Run_Logs
│   │   │   ├── Fuel_Records
│   │   │   └── SCR_Data
│   │   ├── F-Gas_Management
│   │   │   ├── Registers
│   │   │   ├── Certificates
│   │   │   └── Reports
│   │   ├── Waste_Management
│   │   └── COSHH
│   ├── 02_Health_and_Safety
│   │   ├── Risk_Assessments
│   │   ├── Fire_Safety
│   │   ├── LOLER
│   │   └── Equipment_Testing
│   ├── 03_Electrical_Compliance
│   │   ├── Inspection_Reports
│   │   ├── Certifications
│   │   └── Electrical_Rules
│   ├── 04_Fire_Systems
│   │   ├── Inspections
│   │   ├── Testing_Records
│   │   └── Certifications
│   └── 05_Water_Compliance
│       ├── Legionella_Management
│       ├── Water_Sampling
│       └── Temperature_Checks
├── 05_Vendors
│   ├── 01_Vendor_Information
│   │   ├── Contact_Lists
│   │   └── Escalation_Procedures
│   ├── 02_Vendor_Documentation
│   │   └── [By_Vendor_Name]
│   │       ├── Competencies
│   │       ├── RAMS
│   │       ├── Service_Reports
│   │       └── Call-out_Records
│   └── 03_Vendor_Management
│       ├── Onboarding
│       ├── Contracts
│       └── Purchase_Orders
├── 06_Projects
│   ├── 01_Active_Projects
│   │   └── [Project_Name]
│   ├── 02_Commissioning
│   │   ├── FAT
│   │   ├── SAT
│   │   └── Handover
│   └── 03_Construction
│       ├── Documentation
│       └── Reports
└── 07_Administration
    ├── 01_Access_Control
    │   └── Door_Keys_Reference
    ├── 02_Signage
    │   ├── Layouts
    │   ├── Quotes
    │   └── Templates
    ├── 03_Site_Management
    │   ├── Site_Launch_Plan
    │   └── Property_Management
    └── 04_Permits
        ├── E-Permits
        ├── High_Risk_Works
        └── Templates`;

    function highlightPath(folderStructure, selectedPath) {
    // If there's no path, just return the original structure
    if (!selectedPath) {
        return folderStructure;
    }
    
    // Normalize path - replace backslashes with forward slashes
    const normalizedPath = selectedPath.replace(/\\/g, '/').replace(/\/$/, '');
    
    // Split the path into segments
    const pathSegments = normalizedPath.split('/');
    
    // Extract the site from the path
    const siteMatch = selectedPath.match(/Site\s*\(\s*(LHR\d+)\s*\)/);
    const selectedSite = siteMatch ? siteMatch[1] : null;
    
    // Process the folder structure line by line
    const lines = folderStructure.split('\n');
    const result = [];
    
    // Track which site we're currently in
    let currentSite = null;
    
    // Process each line
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmedLine = line.trim();
        
        // Check if this line defines a site
        const siteLineMatch = trimmedLine.match(/^Site\s*\(\s*(LHR\d+)\s*\)$/);
        if (siteLineMatch) {
            currentSite = siteLineMatch[1];
        }
        
        // Skip highlighting if we're in a different site than the selected path
        if (selectedSite && currentSite && currentSite !== selectedSite) {
            result.push(line);
            continue;
        }
        
        // Check if this line is part of our path
        let isPartOfPath = false;
        let isFinalFolder = false;
        
        // Check each segment of the path
        for (let j = 0; j < pathSegments.length; j++) {
            const segment = pathSegments[j];
            
            // If this line contains the segment name (with proper tree characters removed)
            if (trimmedLine.endsWith(segment) || trimmedLine === segment) {
                isPartOfPath = true;
                
                // If this is the final segment, mark it for flashing
                if (j === pathSegments.length - 1) {
                    isFinalFolder = true;
                }
                break;
            }
        }
        
        // Apply highlighting based on matching
        if (isFinalFolder) {
            // Final folder - add flashing highlight
            result.push(`<span class="final-folder-highlight">${line}</span>`);
        } else if (isPartOfPath) {
            // Parent folder - add regular highlight
            result.push(`<span class="folder-path-highlight">${line}</span>`);
        } else {
            // Regular line - no highlight
            result.push(line);
        }
    }
    
    return result.join('\n');
}
    
    // Event listeners for drag and drop
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, preventDefaults, false);
    });
    
    function preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }
    
    ['dragenter', 'dragover'].forEach(eventName => {
        dropArea.addEventListener(eventName, highlight, false);
    });
    
    ['dragleave', 'drop'].forEach(eventName => {
        dropArea.addEventListener(eventName, unhighlight, false);
    });
    
    function highlight() {
        dropArea.classList.add('highlight');
    }
    
    function unhighlight() {
        dropArea.classList.remove('highlight');
    }
    
    // Handle dropped files
    dropArea.addEventListener('drop', handleDrop, false);
    
    function handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        handleFiles(files);
    }
    
    // Handle selected files from browse button
    browseBtn.addEventListener('click', () => {
        fileInput.click();
    });
    
    fileInput.addEventListener('change', () => {
        handleFiles(fileInput.files);
    });
    
    function handleFiles(files) {
        selectedFiles = Array.from(files);
        updateFileList();
        uploadBtn.disabled = selectedFiles.length === 0;
    }
    
    function updateFileList() {
        resultsList.innerHTML = '';
        selectedFiles.forEach((file, index) => {
            const item = document.createElement('li');
            item.className = 'list-group-item file-item';
            item.innerHTML = `
                <div>
                    <strong>${file.name}</strong> (${formatFileSize(file.size)})
                </div>
                <span class="file-status" id="status-${index}">Ready</span>
            `;
            resultsList.appendChild(item);
        });
    }
    
    function formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    // When uploading, include the site information
    // Handle upload button using presigned URLs
uploadBtn.addEventListener('click', async () => {
    if (selectedFiles.length === 0) return;
    
    uploadBtn.disabled = true;
    progressContainer.style.display = 'block';
    
    for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];
        const statusElement = document.getElementById(`status-${i}`);
        
        try {
            statusElement.textContent = 'Preparing upload...';
            statusElement.className = 'file-status text-primary';
            
            // Update progress bar
            progressBar.style.width = `${(i / selectedFiles.length) * 30}%`;
            
            // Step 1: Get presigned URL
            const presignedResponse = await fetch(presignedUrlEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    filename: file.name,
                    contentType: file.type,
                    site: currentSite  // Include site information
                })
            });
            
            if (!presignedResponse.ok) {
                throw new Error(`Failed to get upload URL: ${presignedResponse.status}`);
            }
            
            const presignedData = await presignedResponse.json();
            const { uploadUrl, key } = presignedData;
            
            // Step 2: Upload file directly to S3 using presigned URL
            statusElement.textContent = 'Uploading to S3...';
            const uploadResponse = await fetch(uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                credentials: 'include',
                body: file
            });
            
            if (!uploadResponse.ok) {
                throw new Error(`Failed to upload file: ${uploadResponse.status}`);
            }
            
            progressBar.style.width = `${(i / selectedFiles.length) * 60 + 30}%`;
            
            // Step 3: Trigger classification
            statusElement.textContent = 'Classifying...';
            const classifyResponse = await fetch(classifyEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    key: key,
                    filename: file.name,
                    site: currentSite  // Include site information
                })
            });
            
            if (!classifyResponse.ok) {
                throw new Error(`Classification failed: ${classifyResponse.status}`);
            }
            
            const classifyResult = await classifyResponse.json();
            
            // Show confirmation dialog with highlighted folder structure
            statusElement.textContent = 'Awaiting confirmation';
            const confirmationDiv = document.createElement('div');
            confirmationDiv.className = 'mt-2';

            // PASTE THE CODE BELOW THIS LINE
            // Create the site selector buttons
            const siteSelectorHtml = `
            <div class="site-selector mb-2">
              <div class="d-flex align-items-center">
                <label class="mr-2 mb-0">Site:</label>
                <div class="btn-group btn-group-sm" role="group">
                  <button type="button" class="btn ${currentSite === 'LHR086' ? 'btn-primary' : 'btn-outline-primary'} site-btn" data-site="LHR086" data-index="${i}">LHR086</button>
                  <button type="button" class="btn ${currentSite === 'LHR186' ? 'btn-primary' : 'btn-outline-primary'} site-btn" data-index="${i}">LHR186</button>
                </div>
              </div>
            </div>
            `;
            
            // Format the UI with both input field and folder structure
            confirmationDiv.innerHTML = `
                ${siteSelectorHtml}
                <div class="input-group mb-2">
                    <input type="text" class="form-control" value="${classifyResult.suggestedPath}" id="path-${i}">
                    <div class="input-group-append">
                        <button class="btn btn-success confirm-btn" data-index="${i}" data-key="${classifyResult.key}">Accept</button>
                        <button class="btn btn-secondary edit-btn" data-index="${i}">Edit</button>
                        <button class="btn btn-info rename-btn" data-index="${i}" data-key="${classifyResult.key}">Rename</button>
                    </div>
                </div>
                <div id="rename-container-${i}" class="d-none mb-2">
                    <div class="input-group">
                        <input type="text" class="form-control" value="${file.name}" id="rename-${i}">
                        <div class="input-group-append">
                            <button class="btn btn-primary apply-rename-btn" data-index="${i}">Apply</button>
                            <button class="btn btn-secondary cancel-rename-btn" data-index="${i}">Cancel</button>
                            <button class="btn btn-warning generate-name-btn" data-index="${i}" data-key="${classifyResult.key}">Generate Name</button>
                        </div>
                    </div>
                </div>
                <div class="small mb-2">
                    <strong>Suggested location:</strong> ${classifyResult.suggestedPath}
                </div>
                <div class="folder-structure-container">
                    <small class="text-muted">Folder structure (destination highlighted):</small>
                    <pre class="folder-structure">${highlightPath(fullFolderStructure, classifyResult.suggestedPath)}</pre>
                </div>
            `;
            
            // Add the confirmation div to the DOM
            statusElement.parentNode.appendChild(confirmationDiv);
            
            // Add event listeners for the site buttons
            const siteButtons = confirmationDiv.querySelectorAll('.site-btn');
            siteButtons.forEach(button => {
                button.addEventListener('click', async function() {
                    const selectedSite = this.dataset.site;
                    const index = this.dataset.index;
                    
                    // Update button styles
                    siteButtons.forEach(btn => {
                        btn.classList.remove('btn-primary');
                        btn.classList.add('btn-outline-primary');
                    });
                    this.classList.remove('btn-outline-primary');
                    this.classList.add('btn-primary');
                    
                    // Update the current site
                    currentSite = selectedSite;
                    
                    // Update the path to reflect the new site
                    const pathInput = document.getElementById(`path-${index}`);
                    const currentPath = pathInput.value;
                    
                    // Replace the site in the path
                    if (currentPath.startsWith('Site (')) {
                        // Get everything after "Site (LHRXXX)/"
                        const sitePath = currentPath.match(/Site \([^)]+\)\/(.*)/);
                        if (sitePath && sitePath[1]) {
                            pathInput.value = `Site (${selectedSite})/${sitePath[1]}`;
                        } else {
                            pathInput.value = `Site (${selectedSite})/`;
                        }
                    } else {
                        // If path doesn't start with Site, add it
                        pathInput.value = `Site (${selectedSite})/${currentPath}`;
                    }
                    
                    // Re-generate the folder structure with the updated path
                    const folderStructureElement = confirmationDiv.querySelector('.folder-structure');
                    folderStructureElement.innerHTML = highlightPath(fullFolderStructure, pathInput.value);
                });
            });
                
            } catch (error) {
                console.error(`Error processing ${file.name}:`, error);
                statusElement.textContent = 'Error';
                statusElement.className = 'file-status text-danger';
                
                // Add error details
                const errorItem = document.createElement('div');
                errorItem.className = 'mt-1 small text-danger';
                errorItem.textContent = error.message || 'Failed to process file';
                statusElement.parentNode.appendChild(errorItem);
            }
        }
        
        // Complete progress bar
        progressBar.style.width = '100%';
    });
    
    // Handle confirmation buttons
document.addEventListener('click', async function(e) {
    if (e.target.classList.contains('confirm-btn')) {
        const index = e.target.dataset.index;
        const key = e.target.dataset.key;
        const finalPath = document.getElementById(`path-${index}`).value;
        const statusElement = document.getElementById(`status-${index}`);
        
        // Use the new name if available, otherwise use original filename
        const finalFilename = selectedFiles[index].newName || selectedFiles[index].name;
        
        try {
            statusElement.textContent = 'Moving file...';
            
            // Call API to move file to final location
            const moveResponse = await fetch(moveFileEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    key: key,
                    targetPath: finalPath,
                    filename: selectedFiles[index].name,
                    newFilename: finalFilename,
                    site: currentSite
                })
            });
            
            if (!moveResponse.ok) {
                throw new Error(`Failed to move file: ${moveResponse.status}`);
            }
            
            const moveResult = await moveResponse.json();
            
            // Update UI with result
            statusElement.textContent = 'Classified & Stored';
            statusElement.className = 'file-status text-success';
            
            // Replace confirmation with result
            e.target.parentNode.parentNode.parentNode.innerHTML = `
                <div class="mt-1 small text-success">
                    <strong>Successfully stored:</strong> ${moveResult.path}
                </div>
            `;
            
        } catch (error) {
            console.error(`Error finalizing ${selectedFiles[index].name}:`, error);
            statusElement.textContent = 'Error';
            statusElement.className = 'file-status text-danger';
            
            // Add error details
            const errorItem = document.createElement('div');
            errorItem.className = 'mt-1 small text-danger';
            errorItem.textContent = error.message || 'Failed to finalize file';
            e.target.parentNode.parentNode.appendChild(errorItem);
        }
    }
    
    if (e.target.classList.contains('edit-btn')) {
        const index = e.target.dataset.index;
        const pathInput = document.getElementById(`path-${index}`);
        pathInput.focus();
        pathInput.select();
    }

    // Add handlers for rename functionality
    if (e.target.classList.contains('rename-btn')) {
        const index = e.target.dataset.index;
        document.getElementById(`rename-container-${index}`).classList.remove('d-none');
    }

    if (e.target.classList.contains('cancel-rename-btn')) {
        const index = e.target.dataset.index;
        document.getElementById(`rename-container-${index}`).classList.add('d-none');
    }

    if (e.target.classList.contains('apply-rename-btn')) {
        const index = e.target.dataset.index;
        const newName = document.getElementById(`rename-${index}`).value;
        // Store the new name to be used when accepting the file
        selectedFiles[index].newName = newName;
        document.getElementById(`rename-container-${index}`).classList.add('d-none');
        // Update the file display name
        const fileNameEl = document.querySelector(`#resultsList li:nth-child(${parseInt(index)+1}) strong`);
        if (fileNameEl) {
            fileNameEl.textContent = newName;
        }
    }

    if (e.target.classList.contains('generate-name-btn')) {
        const index = e.target.dataset.index;
        const key = e.target.dataset.key;
        const generateBtn = e.target;
        
        // Disable button and show loading state
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span> Generating...';
        
        try {
            // Call API to generate a descriptive name
            const response = await fetch('https://ya6wa8l0mh.execute-api.us-east-1.amazonaws.com/prod/generate-filename', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    key: key,
                    filename: selectedFiles[index].name,
                    path: document.getElementById(`path-${index}`).value,
                    site: currentSite
                })
            });
            
            if (!response.ok) {
                throw new Error(`Failed to generate filename: ${response.status}`);
            }
            
            const result = await response.json();
            
            // Update the rename input with the generated name
            document.getElementById(`rename-${index}`).value = result.suggestedName;
            
        } catch (error) {
            console.error('Error generating filename:', error);
            alert('Failed to generate filename: ' + error.message);
        } finally {
            // Re-enable button
            generateBtn.disabled = false;
            generateBtn.textContent = 'Generate Name';
        }
    }
});
})