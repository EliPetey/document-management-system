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
                    body: JSON.stringify({
                        key: key,
                        filename: file.name
                    })
                });
                
                if (!classifyResponse.ok) {
                    throw new Error(`Classification failed: ${classifyResponse.status}`);
                }
                
                const classifyResult = await classifyResponse.json();
                
                // Show confirmation dialog
                statusElement.textContent = 'Awaiting confirmation';
                const confirmationDiv = document.createElement('div');
                confirmationDiv.className = 'mt-2';
                confirmationDiv.innerHTML = `
                    <div class="input-group">
                        <input type="text" class="form-control" value="${classifyResult.suggestedPath}" id="path-${i}">
                        <button class="btn btn-success confirm-btn" data-index="${i}" data-key="${classifyResult.key}">Accept</button>
                        <button class="btn btn-secondary edit-btn" data-index="${i}">Edit</button>
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
                e.target.parentNode.parentNode.innerHTML = `
                    <div class="mt-1 small text-success">
                        Stored in: ${moveResult.path}
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