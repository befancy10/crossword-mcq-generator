function showMCQModal() {
    console.log("Generating MCQ");

    const keyTextArea = document.getElementById('key');
    const valTextArea = document.getElementById('val');

    const answers = keyTextArea.value.trim().split('\n');
    const questions = valTextArea.value.trim().split('\n');

    if (questions.length === 0 || answers.length === 0) {
        alert('No questions or answers available');
        return;
    }

    const mcqData = {
        questions: questions,
        correctAnswers: answers,
        distractors: []
    };

    mcqData.questions.forEach((question, index) => {
        const correctAnswer = mcqData.correctAnswers[index];
        const distractors = generateDistractors(correctAnswer, mcqData.correctAnswers);
        mcqData.distractors.push(distractors);
    });

    localStorage.setItem('mcqData', JSON.stringify(mcqData));

    const modal = document.getElementById('mcqPreviewModal');
    const mcqPreviewContent = document.getElementById('mcqPreviewContent');

    mcqPreviewContent.innerHTML = '';

    mcqData.questions.forEach((question, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('mcq-question');
        questionDiv.innerHTML = `<p><strong>Q${qIndex + 1}:</strong> ${question}</p>`;

        const options = [mcqData.correctAnswers[qIndex], ...mcqData.distractors[qIndex]];
        const shuffledOptions = options.sort(() => 0.5 - Math.random());

        shuffledOptions.forEach((opt, oIndex) => {
            questionDiv.innerHTML += `
                <label><input type="radio" name="q${qIndex}" value="${opt}">${opt}</label><br>
            `;
        });

        mcqPreviewContent.appendChild(questionDiv);
    });

    modal.style.display = 'block';

    document.getElementById('confirmMCQ').addEventListener('click', () => {
        document.getElementById('exportMCQ').style.display = 'inline-block';
        modal.style.display = 'none';
    });

    document.getElementById('closeMcqPreview').addEventListener('click', () => {
        modal.style.display = 'none';
    });
}

// Function to generate distractors for a question
function generateDistractors(correctAnswer, allAnswers) {
    // Pool of possible distractors is all other answers
    const otherAnswers = allAnswers.filter(answer => answer !== correctAnswer);
    
    // Take up to 3 distractors that are most similar to the correct answer
    // For this example, we'll just take 3 random ones, but in a real app you might want 
    // to use a more sophisticated approach to select plausible distractors
    const distractors = [];
    
    // If there are fewer than 3 other answers, we'll generate some algorithmic variations
    if (otherAnswers.length >= 3) {
        // Shuffle the other answers
        const shuffled = [...otherAnswers].sort(() => 0.5 - Math.random());
        distractors.push(...shuffled.slice(0, 3));
    } else {
        // Add all available other answers
        distractors.push(...otherAnswers);
        
        // Generate additional distractors by modifying the correct answer
        while (distractors.length < 3) {
            const modification = modifyString(correctAnswer);
            if (!distractors.includes(modification) && modification !== correctAnswer) {
                distractors.push(modification);
            }
        }
    }
    
    return distractors;
}

// Helper function to modify a string to create plausible distractors
function modifyString(str) {
    const modifications = [
        // Swap two adjacent characters
        (s) => {
            if (s.length < 2) return s;
            const pos = Math.floor(Math.random() * (s.length - 1));
            return s.substring(0, pos) + s[pos + 1] + s[pos] + s.substring(pos + 2);
        },
        // Replace a character
        (s) => {
            if (s.length < 1) return s;
            const pos = Math.floor(Math.random() * s.length);
            const alphabet = 'abcdefghijklmnopqrstuvwxyz';
            const newChar = alphabet[Math.floor(Math.random() * alphabet.length)];
            return s.substring(0, pos) + newChar + s.substring(pos + 1);
        },
        // Add a character
        (s) => {
            const pos = Math.floor(Math.random() * (s.length + 1));
            const alphabet = 'abcdefghijklmnopqrstuvwxyz';
            const newChar = alphabet[Math.floor(Math.random() * alphabet.length)];
            return s.substring(0, pos) + newChar + s.substring(pos);
        },
        // Remove a character
        (s) => {
            if (s.length < 2) return s;
            const pos = Math.floor(Math.random() * s.length);
            return s.substring(0, pos) + s.substring(pos + 1);
        }
    ];
    
    // Choose a random modification
    const modification = modifications[Math.floor(Math.random() * modifications.length)];
    return modification(str);
}

// Function to show the MCQ preview
function showMCQPreview(mcqData) {
    const mcqPreviewModal = document.getElementById('mcqPreviewModal');
    const mcqPreviewContent = document.getElementById('mcqPreviewContent');
    
    // Clear previous content
    mcqPreviewContent.innerHTML = '';
    
    // Add a title
    const titleDiv = document.createElement('div');
    titleDiv.innerHTML = '<h2>Multiple Choice Quiz</h2>';
    mcqPreviewContent.appendChild(titleDiv);
    
    // Create the quiz content
    mcqData.questions.forEach((question, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('mcq-question');
        
        // Add the question text
        questionDiv.innerHTML = `<p><strong>Question ${qIndex + 1}:</strong> ${question}</p>`;
        
        // Create an array with the correct answer and distractors
        const options = [mcqData.correctAnswers[qIndex], ...mcqData.distractors[qIndex]];
        
        // Shuffle the options
        const shuffledOptions = options.sort(() => 0.5 - Math.random());
        
        // Create the options list
        const optionsList = document.createElement('ol');
        optionsList.type = 'A';  // Use letters for options
        optionsList.classList.add('mcq-options');
        
        shuffledOptions.forEach((option, oIndex) => {
            const optionItem = document.createElement('li');
            optionItem.textContent = option;
            
            // Highlight the correct answer (for preview purposes)
            if (option === mcqData.correctAnswers[qIndex]) {
                optionItem.classList.add('correct-answer');
            }
            
            optionsList.appendChild(optionItem);
        });
        
        questionDiv.appendChild(optionsList);
        mcqPreviewContent.appendChild(questionDiv);
    });
    
    // Show the modal
    mcqPreviewModal.style.display = 'block';
    
    // Add event listeners for the modal
    const closeMcqPreview = document.getElementById('closeMcqPreview');
    closeMcqPreview.addEventListener('click', () => {
        mcqPreviewModal.style.display = 'none';
    });
    
    // Add event listener for the confirm button
    const confirmMCQ = document.getElementById('confirmMCQ');
    confirmMCQ.addEventListener('click', () => {
        document.getElementById('exportMCQ').style.display = 'inline-block';
        mcqPreviewModal.style.display = 'none';
    });
    
    // Close modal when clicking outside
    window.addEventListener('click', (event) => {
        if (event.target === mcqPreviewModal) {
            mcqPreviewModal.style.display = 'none';
        }
    });
}

// Function to export the MCQ data
function exportMCQData() {
    // Get the MCQ data from localStorage
    const mcqData = JSON.parse(localStorage.getItem('mcqData'));
    
    if (!mcqData) {
        alert('No MCQ data available');
        return;
    }
    
    // Create a new object with the correct format for export
    const exportData = {
        questions: mcqData.questions,
        options: mcqData.questions.map((_, index) => {
            const allOptions = [mcqData.correctAnswers[index], ...mcqData.distractors[index]];
            return allOptions.sort(() => 0.5 - Math.random()); // Shuffle options
        }),
        correctAnswers: mcqData.questions.map((_, index) => {
            const correctAnswer = mcqData.correctAnswers[index];
            const options = [correctAnswer, ...mcqData.distractors[index]].sort(() => 0.5 - Math.random());
            // Return the index of the correct answer in the shuffled options
            return options.indexOf(correctAnswer);
        }),
        timestamp: new Date().toISOString()
    };
    
    // Generate a unique key for this MCQ
    const mcqKey = generateUniqueKey();
    
    // Store the data with the key
    localStorage.setItem(`mcq_${mcqKey}`, JSON.stringify(exportData));
    
    // Show the key in the message modal
    const messageModal = document.getElementById('messageModal');
    const messageModalBody = document.getElementById('messageModalBody');
    messageModalBody.innerHTML = `
        <p>Your Multiple Choice Quiz has been generated with the key: <strong>${mcqKey}</strong></p>
        <p>Use this key to access your quiz later.</p>
    `;
    
    // Update the copy button to copy the MCQ key
    const copyButton = document.getElementById('copyButton');
    copyButton.setAttribute('data-key', mcqKey);
    
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

// Function to generate a unique key
function generateUniqueKey() {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < 8; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
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