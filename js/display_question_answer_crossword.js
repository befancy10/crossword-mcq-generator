// Function to load and display the passage, questions, and answers in get_crosswords.html
function loadCrosswordData() {
    // Retrieve the passage, questions, and answers from sessionStorage
    const passage = sessionStorage.getItem('crosswordPassage');
    let questions = sessionStorage.getItem('crosswordQuestions');
    let answers = sessionStorage.getItem('crosswordAnswers');
    let grid = sessionStorage.getItem('crosswordGrid');
    let studentName = sessionStorage.getItem('studentName');
    let key = sessionStorage.getItem('crosswordKey');

    // Log retrieved data
    console.log('Retrieved Passage:', passage);
    console.log('Retrieved Questions (raw):', questions);
    console.log('Retrieved Answers (raw):', answers);
    console.log('Retrieved Grid:', grid);
    console.log('Retrieved Student Name:', studentName);
    console.log('Retrieved Key:', key);

    // Parse the JSON strings
    try {
        questions = JSON.parse(questions);
        answers = JSON.parse(answers);
    } catch (e) {
        console.error('Error parsing questions or answers:', e);
        questions = [];
        answers = [];
    }

    console.log('Parsed Questions:', questions);
    console.log('Parsed Answers:', answers);

    const nameDiv = document.getElementById('nameStudent');
    nameDiv.innerHTML = `<strong>Student Name:</strong> ${studentName}`;
    const keyDiv = document.getElementById('keyGenerated');
    keyDiv.innerHTML = `<strong>Generated Key:</strong> ${key}`;

    const passageResultDiv = document.getElementById('passageResult');
    const resultDiv = document.getElementById('result');

    if (passage) {
        // Display the passage
        const passageDiv = document.createElement('div');
        passageDiv.classList.add('passage');
        passageDiv.innerHTML = `<strong>Passage:</strong> <br> ${passage}`;
        passageResultDiv.appendChild(passageDiv);
    } else {
        // Handle case where passage is not found
        passageResultDiv.innerHTML = 'No passage data available.';
    }

    console.log('Questions type:', typeof questions, ' | Is Array:', Array.isArray(questions));
    console.log('Answers type:', typeof answers, ' | Is Array:', Array.isArray(answers));
    console.log('Questions length:', questions.length, ' | Answers length:', answers.length);

    if (Array.isArray(questions) && Array.isArray(answers) && questions.length === answers.length) {
        // Display the questions and answers header
        const headerDiv = document.createElement('div');
        headerDiv.classList.add('header');
        headerDiv.innerHTML = `<span class="question-title">Question</span><span class="answer-title">Answer</span><br>`;
        resultDiv.appendChild(headerDiv);

        const keyTextArea = document.getElementById('key');
        const valTextArea = document.getElementById('val');

        // Display each question and censored answer
        questions.forEach((question, index) => {
            const qaDiv = document.createElement('div');
            qaDiv.classList.add('question-answer');

            // Replace spaces with hyphens in the answer
            const modifiedAnswer = answers[index].replace(/\s+/g, '');
            const censoredAnswer = '*'.repeat(modifiedAnswer.length);

            qaDiv.innerHTML = `
                <span class="question">${question}</span>
                <span class="answer" id="answer-${index}">${censoredAnswer}</span>
            `;
            resultDiv.appendChild(qaDiv);

            keyTextArea.value += `${modifiedAnswer}\n`;
            valTextArea.value += `${question}\n`;
        });

        // Add a single button to toggle all answers
        const toggleButton = document.createElement('button');
        toggleButton.textContent = 'Show Answers';
        toggleButton.classList.add('toggle-button'); // Add class to the button
        toggleButton.addEventListener('click', () => {
            const answerElements = document.querySelectorAll('.answer');
            const areAnswersCensored = answerElements[0].textContent.includes('*');

            answerElements.forEach((answerElement, index) => {
                answerElement.textContent = areAnswersCensored ? answers[index].replace(/\s+/g, '') : '*'.repeat(answers[index].replace(/ /g, '-').length);
            });

            toggleButton.textContent = areAnswersCensored ? 'Hide Answers' : 'Show Answers';
        });

        resultDiv.appendChild(toggleButton);
    } else {
        // Handle case where questions or answers are not found or mismatched
        console.log('Questions or Answers is not an array or their lengths do not match');
        resultDiv.innerHTML = 'No questions or answers available, or there is a mismatch in their lengths.';
    }
}

// Call loadCrosswordData when get_crosswords.html is loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadCrosswordData);
} else {
    loadCrosswordData();
    showButton();
}
