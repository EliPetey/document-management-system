document.addEventListener('DOMContentLoaded', function() {
    // Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.getElementById('upload-progress');
    const resultsList = document.getElementById('resultsList');
    
    // API endpoints - replace with your actual API Gateway endpoints
    const presignedUrlEndpoint = 'https://00pvjqoqt9.execute-api.us-east-1.amazonaws.com/prod/presigned-url';
    const classifyEndpoint = 'https://00pvjqoqt9.execute-api.us-east-1.amazonaws.com/prod/classify';
    const moveFileEndpoint = 'https://00pvjqoqt9.execute-api.us-east-1.amazonaws.com/prod/move-file';

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
                
                // Update UI with result
                statusElement.textContent = 'Classified & Stored';
                statusElement.className = 'file-status text-success';
                
                // Add classification result
                const resultItem = document.createElement('div');
                resultItem.className = 'mt-1 small text-muted';
                resultItem.textContent = `Stored in: ${classifyResult.path || 'Appropriate folder'}`;
                statusElement.parentNode.appendChild(resultItem);
                
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
        
        // Reset after processing
        setTimeout(() => {
            uploadBtn.disabled = false;
            progressContainer.style.display = 'none';
        }, 3000);
    });
});