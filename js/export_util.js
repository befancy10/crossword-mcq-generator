const generatedKeys = new Set();

// function generateRandomKey(length = 8) {
//   const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
//   let result = '';
  
//   do {
//     result = '';
//     for (let i = 0; i < length; i++) {
//       result += characters.charAt(Math.floor(Math.random() * characters.length));
//     }
//   } while (generatedKeys.has(result));
  
//   generatedKeys.add(result);
//   return result;
// }

async function generateRandomKeyWithPrefix(prefix, length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let key;
  let isUnique = false;

  while (!isUnique) {
    let randomPart = '';
    for (let i = 0; i < length; i++) {
      randomPart += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    key = prefix + randomPart;

    const response = await fetch(`/check-key-availability/${key}`);
    const data = await response.json();
    isUnique = data.available;
  }

  return key;
}

function copyKeyToClipboard() {
  const key = document.getElementById('messageModalBody').innerText.trim();

  // Use the Clipboard API
  navigator.clipboard.writeText(key)
}

function displayMessage(message) {
  const modal = document.getElementById('messageModal');
  const modalBody = document.getElementById('messageModalBody');
  const closeButton = document.querySelector('.close');

  modalBody.innerText = message;
  modal.style.display = 'block';

  closeButton.onclick = function() {
    modal.style.display = 'none';
  }

  window.onclick = function(event) {
    if (event.target == modal) {
      modal.style.display = 'none';
    }
  }
}