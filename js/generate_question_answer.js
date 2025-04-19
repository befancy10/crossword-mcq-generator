async function generateQuestions() {
    const context = document.getElementById('contextInput').value;
    const generateButton = document.getElementById('generateButton');
    
    if (!context.trim()) {
        alert('Please enter a passage.');
        return;
    }

    generateButton.innerText = 'Loading...';

    try {
        const response = await fetch('http://127.0.0.1:5000/generate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ context })
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();

        // Store questions and answers in variables
        const questions = data.question_answer.map(q => q.question);
        const answers = data.question_answer.map(q => q.answer);

        // Example: Redirect to a new page and pass the questions and answers as JSON in localStorage
        localStorage.setItem('question_answer', JSON.stringify(questions));
        localStorage.setItem('answers', JSON.stringify(answers));
        localStorage.setItem('passage', context);
        window.location.href = 'display_question_answer.html';

    } catch (error) {
        console.error('Error:', error);
        alert('Error generating questions. Please try again.');
    } finally {
        generateButton.innerText = 'Generate';
    }
}
