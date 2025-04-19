window.addEventListener('DOMContentLoaded', (event) => {
    const questions = JSON.parse(localStorage.getItem('question_answer'));
    const answers = JSON.parse(localStorage.getItem('answers'));
    const passage = localStorage.getItem('passage');

    console.log('Fetched questions:', questions);
    console.log('Fetched answers:', answers);
    console.log('Fetched passage:', passage);

    if (questions && answers && passage) {
        displayQuestionsAndAnswers(questions, answers, passage); // Call a function to display questions and answers
    } else {
        console.error('No questions or answers found in localStorage.');
    }
});

function displayQuestionsAndAnswers(questions, answers, passage) {
    const passageresultDiv = document.getElementById('passageResult');

    // Display the passage
    const passageDiv = document.createElement('div');
    passageDiv.classList.add('passage');
    passageDiv.innerHTML = `<strong>Passage:</strong> <br> ${passage}`;
    passageresultDiv.appendChild(passageDiv);

    const crosswordsDiv = document.createElement('ctnr');

    
    const resultDiv = document.getElementById('result');

    // Display the questions and answers header
    const headerDiv = document.createElement('div');
    headerDiv.classList.add('header');
    headerDiv.innerHTML = `<span class="question-title">Question</span><span class="answer-title">Answer</span><br>`;
    resultDiv.appendChild(headerDiv);

    // Get text areas
    const keyTextArea = document.getElementById('key');
    const valTextArea = document.getElementById('val');

    console.log('Text areas:', keyTextArea, valTextArea);

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

        // Append question and modified answer to text areas
        keyTextArea.value += `${modifiedAnswer}\n`;
        valTextArea.value += `${question}\n`;

        console.log('Appending to text areas:', question, modifiedAnswer);
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
}