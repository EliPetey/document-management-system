// Initialize AWS Amplify
document.addEventListener('DOMContentLoaded', function() {
    // Configure Amplify
    const awsConfig = {
        Auth: {
            identityPoolId: 'YOUR_IDENTITY_POOL_ID', // replace with your identity pool ID
            region: 'YOUR_REGION' // replace with your region
        },
        Storage: {
            AWSS3: {
                bucket: 'YOUR_S3_BUCKET_NAME', // replace with your bucket name
                region: 'YOUR_REGION' // replace with your region
            }
        },
        API: {
            endpoints: [
                {
                    name: "documentApi",
                    endpoint: "00pvjqoqt9", // replace with your API Gateway endpoint
                    region: "us-east-1" // replace with your region
                }
            ]
        }
    };
    
    AWS.Amplify.configure(awsConfig);
    
    // Elements
    const dropArea = document.getElementById('drop-area');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const uploadBtn = document.getElementById('uploadBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progressContainer = document.getElementById('upload-progress');
    const resultsList = document.getElementById('resultsList');
    
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
    
    // Handle upload button
    uploadBtn.addEventListener('click', async () => {
        if (selectedFiles.length === 0) return;
        
        uploadBtn.disabled = true;
        progressContainer.style.display = 'block';
        
        for (let i = 0; i < selectedFiles.length; i++) {
            const file = selectedFiles[i];
            const statusElement = document.getElementById(`status-${i}`);
            
            try {
                statusElement.textContent = 'Uploading...';
                statusElement.className = 'file-status text-primary';
                
                // Update progress bar
                const progress = ((i + 0.5) / selectedFiles.length) * 100;
                progressBar.style.width = `${progress}%`;
                
                // Upload file to S3 temp location
                const tempKey = `temp/${Date.now()}-${file.name}`;
                await AWS.Amplify.Storage.put(tempKey, file, {
                    contentType: file.type
                });
                
                statusElement.textContent = 'Classifying...';
                
                // Call API to process with Bedrock
                const response = await AWS.Amplify.API.post('documentApi', '/classify', {
                    body: {
                        key: tempKey,
                        filename: file.name
                    }
                });
                
                statusElement.textContent = 'Classified & Stored';
                statusElement.className = 'file-status text-success';
                
                // Add classification result
                const resultItem = document.createElement('div');
                resultItem.className = 'mt-1 small text-muted';
                resultItem.textContent = `Stored in: ${response.path}`;
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
            selectedFiles = [];
            fileInput.value = '';
        }, 3000);
    });
});