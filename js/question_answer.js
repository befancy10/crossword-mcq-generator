window.addEventListener('DOMContentLoaded', (event) => {
    const questions = JSON.parse(localStorage.getItem('question_answer'));
    const answers = JSON.parse(localStorage.getItem('answers'));
    const passage = localStorage.getItem('passage');

    console.log('Fetched questions:', questions);
    console.log('Fetched answers:', answers);
    console.log('Fetched passage:', passage);

    if (questions && answers && passage) {
        const filteredPairs = questions.map((question, index) => ({ question, answer: answers[index] }));

        // Populate the dropdown with the number of questions dynamically
        populateQuestionCountDropdown(questions.length);

        // Display questions and answers based on the selected dropdown value
        displayQuestionsAndAnswers(filteredPairs, passage);

        // Add event listener for the dropdown
        const questionCountDropdown = document.getElementById('questionCount');
        questionCountDropdown.addEventListener('change', () => {
            displayQuestionsAndAnswers(filteredPairs, passage);
        });

        // Add event listeners to the generate buttons
        document.getElementById('genCrossword').addEventListener('click', function() {
            // We'll use the gen button's click event instead of directly calling the function
            // This ensures the event is propagated correctly to index.js
            const originalGenButton = document.getElementById('gen');
            if (originalGenButton) {
                originalGenButton.click(); // Simulate clicking the original button
            } else {
                console.error('Original gen button not found');
            }
        });

        document.getElementById('genMCQ').addEventListener('click', function() {
            // Call the new MCQ generation function
            if (typeof generateMCQ === 'function') {
                generateMCQ();
            } else {
                console.error('The generateMCQ function is not available');
            }
        });
    } else {
        console.error('No questions or answers found in localStorage.');
        // Show error modal
        const errorModal = document.getElementById('errorModal');
        const errorMessage = document.getElementById('errorMessage');
        errorMessage.textContent = "No questions or answers found. Please go back and try again.";
        errorModal.style.display = "block";
    }
});

function populateQuestionCountDropdown(maxCount) {
    const questionCountDropdown = document.getElementById('questionCount');
    questionCountDropdown.innerHTML = ''; // Clear previous options

    for (let i = 1; i <= maxCount; i++) {
        const option = document.createElement('option');
        option.value = i;
        option.textContent = i;
        questionCountDropdown.appendChild(option);
    }

    // Set the default selected option to the maximum length
    questionCountDropdown.value = maxCount;
}

function displayQuestionsAndAnswers(filteredPairs, passage) {
    const passageResultDiv = document.getElementById('passageResult');
    const resultDiv = document.getElementById('result');
    const keyTextArea = document.getElementById('key');
    const valTextArea = document.getElementById('val');

    // Clear previous content
    passageResultDiv.innerHTML = '';
    resultDiv.innerHTML = '';
    keyTextArea.value = '';
    valTextArea.value = '';

    // Display the passage
    const passageDiv = document.createElement('div');
    passageDiv.classList.add('passage');
    passageDiv.innerHTML = `<strong>Passage:</strong> <br> ${passage}`;
    passageResultDiv.appendChild(passageDiv);

    // Display the questions and answers header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header');
    headerDiv.innerHTML = `<span class="question-title">Question</span><span class="answer-title">Answer</span><br>`;
    resultDiv.appendChild(headerDiv);

    const questionCountDropdown = document.getElementById('questionCount');
    const selectedCount = parseInt(questionCountDropdown.value);

    // Display each question and answer based on selected count
    filteredPairs.slice(0, selectedCount).forEach((pair, index) => {
        const qaDiv = document.createElement('div');
        qaDiv.classList.add('question-answer');

        // Replace spaces with hyphens in the answer
        const modifiedAnswer = pair.answer.replace(/\s+/g, '');
        const censoredAnswer = '*'.repeat(modifiedAnswer.length);

        qaDiv.innerHTML = `
            <span class="question">${pair.question}</span>
            <span class="answer" id="answer-${index}">${censoredAnswer}</span>
        `;
        resultDiv.appendChild(qaDiv);

        // Append question and modified answer to text areas
        keyTextArea.value += `${modifiedAnswer}\n`;
        valTextArea.value += `${pair.question}\n`;

        console.log('Appending to text areas:', pair.question, modifiedAnswer);
    });

    // Add a single button to toggle all answers
    const toggleButton = document.createElement('button');
    toggleButton.textContent = 'Show Answers';
    toggleButton.classList.add('toggle-button'); // Add class to the button
    toggleButton.addEventListener('click', () => {
        const answerElements = document.querySelectorAll('.answer');
        const areAnswersCensored = answerElements[0].textContent.includes('*');

        answerElements.forEach((answerElement, index) => {
            answerElement.textContent = areAnswersCensored ? filteredPairs[index].answer.replace(/\s+/g, '') : '*'.repeat(filteredPairs[index].answer.replace(/\s+/g, '').length);
        });

        toggleButton.textContent = areAnswersCensored ? 'Hide Answers' : 'Show Answers';
    });

    resultDiv.appendChild(toggleButton);
}

function goBack() {
    window.history.back();
}