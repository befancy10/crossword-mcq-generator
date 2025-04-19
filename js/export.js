// Function to export crossword data
function exportCrosswordData() {
  console.log("Exporting crossword data");
  
  // Get necessary elements
  const keyTextArea = document.getElementById('key');
  const valTextArea = document.getElementById('val');
  const passageDiv = document.querySelector('.passage');
  
  if (!keyTextArea || !valTextArea || !passageDiv) {
      console.error("Required elements not found for export");
      return;
  }
  
  // Get the passage text
  const passageText = passageDiv.textContent.replace('Passage:', '').trim();
  
  // Get questions and answers
  const answers = keyTextArea.value.trim().split('\n');
  const questions = valTextArea.value.trim().split('\n');
  
  // Get the grid data if available
  const gridData = localStorage.getItem('crosswordGrid') || "";
  
  // Generate a unique key for this crossword
  const crosswordKey = generateUniqueKey();
  
  // Create a data object to store
  const crosswordData = {
      passage: passageText,
      questions: questions,
      answers: answers,
      grid: gridData,
      timestamp: new Date().toISOString()
  };
  
  // Store the data in localStorage with the unique key
  localStorage.setItem(`crossword_${crosswordKey}`, JSON.stringify(crosswordData));
  
  // Show the key in a modal
  showMessageModal("Your crossword puzzle has been saved with the key:", crosswordKey);
}

// Function to generate a unique key
function generateUniqueKey() {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 8; i++) {
      result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}

// Function to show message in modal
function showMessageModal(message, key) {
  const messageModal = document.getElementById('messageModal');
  const messageModalBody = document.getElementById('messageModalBody');
  
  // Set the message
  messageModalBody.innerHTML = `
      <p>${message} <strong>${key}</strong></p>
      <p>Use this key to access your content later.</p>
  `;
  
  // Update the copy button to copy the key
  const copyButton = document.getElementById('copyButton');
  copyButton.setAttribute('data-key', key);
  
  // Show the modal
  messageModal.style.display = 'block';
  
  // Add event listener for the close button
  const closeButton = messageModal.querySelector('.close');
  closeButton.addEventListener('click', () => {
      messageModal.style.display = 'none';
  });
  
  // Close modal when clicking outside
  window.addEventListener('click', (event) => {
      if (event.target === messageModal) {
          messageModal.style.display = 'none';
      }
  });
}

// Function to copy the key to clipboard
function copyKeyToClipboard() {
  const copyButton = document.getElementById('copyButton');
  const key = copyButton.getAttribute('data-key');
  
  if (key) {
      navigator.clipboard.writeText(key).then(() => {
          // Show success message
          const messageModalBody = document.getElementById('messageModalBody');
          messageModalBody.innerHTML += '<p class="success-message">Key copied to clipboard!</p>';
          
          // Remove the message after 2 seconds
          setTimeout(() => {
              const successMessage = messageModalBody.querySelector('.success-message');
              if (successMessage) {
                  successMessage.remove();
              }
          }, 2000);
      }).catch(err => {
          console.error('Failed to copy key: ', err);
          alert('Failed to copy key to clipboard');
      });
  }
}