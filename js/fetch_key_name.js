function fetchKeyAndName() {
    // Retrieve the key entered by the user
    var inputKey = document.getElementById('context-input').value.trim();
    var inputName = document.getElementById('context-input-name').value.trim();

    // Validate input
    if (!inputKey || !inputName) {
        alert('Please enter both your name and the key.');
        return;
    }

    const validKeyFormat = /^[cm][A-Z0-9]{8}$/;
    if (!validKeyFormat.test(inputKey)) {
        alert('Invalid key format. Key must start with "c" or "m" followed by 8 alphanumeric characters.');
        return;
    }

    // const type = inputKey.charAt(0);
    // sessionStorage.setItem('quizType', type === 'm' ? 'MCQ' : 'Crossword');

    const isMCQ = inputKey.charAt(0) === 'm';
    const checkEndpoint = isMCQ ? '/check-mcq-name' : '/check-name';

    // Check if the name already exists in the database
    fetch(`${checkEndpoint}/${inputName}/${inputKey}`)
        .then(response => {
            console.log('Response status:', response.status);
            console.log('Response:', response);
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log('Data:', data);
            if (data.found) {
                console.log('Name found:', data.name);
                console.log('Key:', inputKey);
                console.log('Name:', inputName);
                console.log('is done:', data.is_done);
                if (data.is_done) {
                    completedModal();
                    return;
                }
                showNameFoundModal(inputName, inputKey, data.is_done);
                return;
            } else {
                console.log(data);
                console.log(inputName, inputKey)
                saveUserName(inputName, inputKey);
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });

    // Function to save the user name and key
    function saveUserName(name, key) {
        const isMCQ = key.charAt(0) === 'm';
        const endpoint = isMCQ ? '/save-mcq-name' : '/save-name';

        fetch(endpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: name, key: key })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            sessionStorage.setItem('studentName', data.name);
            
            console.log('Stored Name:', sessionStorage.getItem('studentName'));
            console.log('User name saved:', data);

            detectQuizTypeAndRedirect(key, name);

            // After saving the name, check if the key exists in the database
            // checkKeyExists(inputKey);
        })
        .catch(error => {
            console.error('Error saving user name:', error);
            alert('Error saving user name. Please try again. ' + error.message);
        });
    }

    // Detect quiz type based on prefix and redirect
    function detectQuizTypeAndRedirect(key, name) {
        const type = key.charAt(0).toLowerCase();
      
        if (type === 'c') {
          fetch(`/check-key/${key}`)
            .then(res => res.json())
            .then(data => {
              if (data.found) {
                // Data found, proceed to display
                console.log('Crossword data found:', data.crosswordData);
                console.log('Questions:', data.questions);
                console.log('Answers:', data.answers);
                console.log('Passage:', data.passage);

                // Store the passage, questions, and answers in sessionStorage
                sessionStorage.setItem('crosswordPassage', data.passage);
                sessionStorage.setItem('crosswordQuestions', data.questions);
                sessionStorage.setItem('crosswordAnswers', data.answers);
                sessionStorage.setItem('crosswordGrid', data.crosswordData);
                sessionStorage.setItem('crosswordKey', key);
                sessionStorage.setItem('studentName', name);
                sessionStorage.setItem("startTime", Date.now());

                // Verify storage
                console.log('Stored Passage:', sessionStorage.getItem('crosswordPassage'));
                console.log('Stored Questions:', sessionStorage.getItem('crosswordQuestions'));
                console.log('Stored Answers:', sessionStorage.getItem('crosswordAnswers'));
                console.log('Stored Grid:', sessionStorage.getItem('crosswordGrid'));

                // Redirect to get_crosswords.html
                window.location.href = 'get_crosswords.html';
              } else {
                alert('Invalid crossword key.');
              }
            });
        } else if (type === 'm') {
          fetch(`/check-mcq/${key}`)
            .then(res => res.json())
            .then(data => {
              if (data.found) {
                // Data found, proceed to display
                console.log('Questions:', data.questions);
                console.log('Options:', data.options);
                console.log('Answer:', data.correct_answers);
                console.log('Passage:', data.passage);

                sessionStorage.setItem('mcqQuestions', data.questions);
                sessionStorage.setItem('mcqOptions', data.options);
                sessionStorage.setItem('mcqCorrectAnswers', data.correct_answers);
                sessionStorage.setItem('mcqPassage', data.passage);
                sessionStorage.setItem('name', name);
                sessionStorage.setItem('key', key);

                console.log('Stored Passage:', sessionStorage.getItem('mcqPassage'));
                console.log('Stored Questions:', sessionStorage.getItem('mcqQuestions'));
                console.log('Stored Options:', sessionStorage.getItem('mcqOptions'));
                console.log('Stored Answers:', sessionStorage.getItem('mcqCorrectAnswers'));

                window.location.href = 'get_mcq.html';
              } else {
                alert('Invalid MCQ key.');
              }
            });
        } else {
          alert('Invalid key format. Key must start with "c" or "m".');
        }
      }

    function showNameFoundModal(name, key, is_done) {
        var modal = document.getElementById('nameFoundModal');
        var proceedBtn = document.getElementById('proceedBtn');
        var cancelBtn = document.getElementById('cancelBtn');

        if (is_done) {
            alert('You have already completed the quiz.');
            return;
        }

        modal.style.display = 'block';

        proceedBtn.onclick = function() {
            detectQuizTypeAndRedirect(key, name);
        };

        cancelBtn.onclick = function() {
            modal.style.display = 'none';
        };

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }

    function completedModal() {
        var modal = document.getElementById('alreadyFinished');
        var okayBtn = document.getElementById('okayBtn');

        modal.style.display = 'block';


        okayBtn.onclick = function() {
            modal.style.display = 'none';
        };

        window.onclick = function(event) {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        };
    }
}
