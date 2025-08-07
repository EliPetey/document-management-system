document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.getElementById('upload-progress');
    const resultsList = document.getElementById('resultsList');
    
    // API endpoints
    const presignedUrlEndpoint = 'https://ya6wa8l0mh.execute-api.us-east-1.amazonaws.com/prod/presigned-url';
    const classifyEndpoint = 'https://ya6wa8l0mh.execute-api.us-east-1.amazonaws.com/prod/classify';
    const moveFileEndpoint = 'https://ya6wa8l0mh.execute-api.us-east-1.amazonaws.com/prod/move-file';
    
    // Folder structure definition
    const fullFolderStructure = `Site (LHR086)
├── 01_Technical_Documentation
│   ├── 01_Drawings
│   │   ├── Electrical
│   │   │   ├── SLDs
│   │   │   ├── MV_System
│   │   │   ├── LV_System
│   │   │   ├── Circuit_Schedules
│   │   │   ├── Discrimination_Studies
│   │   │   └── Earthing
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

    // Function to highlight the path in the folder structure
    function highlightPath(folderStructure, selectedPath) {
        if (!selectedPath) return folderStructure;
        
        // Split the path into segments and clean them
        const pathSegments = selectedPath.split('/').filter(s => s.trim() !== '');
        if (pathSegments.length === 0) return folderStructure;
        
        // Process line by line
        const lines = folderStructure.split('\n');
        const result = [];
        
        // Match exact segments to avoid highlighting wrong folders with same name
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            // Calculate indent level
            const indent = line.search(/\S|$/);
            
            // Check if this line contains any of our path segments
            let matchFound = false;
            let isFinalSegment = false;
            
            // Extract the folder name from the line
            const folderNameMatch = line.trim().match(/^[├└]── (.+)$/) || line.trim().match(/^(.+)$/);
            const folderName = folderNameMatch ? folderNameMatch[1].trim() : '';
            
            // Check if this folder matches any segment in our path
            for (let j = 0; j < pathSegments.length; j++) {
                if (folderName === pathSegments[j]) {
                    // Check if this is the correct level for this segment
                    const expectedIndent = j * 4; // 4 spaces per level
                    
                    if (Math.abs(indent - expectedIndent) <= 4) { // Allow some flexibility
                        matchFound = true;
                        isFinalSegment = (j === pathSegments.length - 1);
                        break;
                    }
                }
            }
            
            if (matchFound) {
                if (isFinalSegment) {
                    // This is the final folder - add flashing highlight
                    result.push(`<span class="final-folder-highlight">${line}</span>`);
                } else {
                    // This is a parent folder in the path - add regular highlight
                    result.push(`<span class="folder-path-highlight">${line}</span>`);
                }
            } else {
                // Not part of our path
                result.push(line);
            }
        }
        
        return result.join('\n');
    }
    
    // Selected files
    let selectedFiles = [];
    
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
                        contentType: file.type
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
                        filename: file.name
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
                
                // Display the suggested path and allow editing
                confirmationDiv.innerHTML = `
                    <div class="input-group mb-2">
                        <input type="text" class="form-control" value="${classifyResult.suggestedPath}" id="path-${i}">
                        <div class="input-group-append">
                            <button class="btn btn-success confirm-btn" data-index="${i}" data-key="${classifyResult.key}">Accept</button>
                            <button class="btn btn-secondary edit-btn" data-index="${i}">Edit</button>
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
                
                statusElement.parentNode.appendChild(confirmationDiv);
                
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
                        filename: selectedFiles[index].name
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
    });
});