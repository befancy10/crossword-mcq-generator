function fetchKeyAndName() {
    // Retrieve the key entered by the user
    var inputKey = document.getElementById('context-input').value.trim();
    var inputName = document.getElementById('context-input-name').value.trim();

    // Validate input
    if (!inputKey || !inputName) {
        alert('Please enter both your name and the key.');
        return;
    }


    // Check if the name already exists in the database
    fetch(`/check-name/${inputName}/${inputKey}`)
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
            showNameFoundModal(inputName, inputKey);
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
        fetch('/save-name', {
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

            // After saving the name, check if the key exists in the database
            checkKeyExists(inputKey);
        })
        .catch(error => {
            console.error('Error saving user name:', error);
            alert('Error saving user name. Please try again. ' + error.message);
        });
    }

    // Function to check if the key exists in the database
    function checkKeyExists(key) {
        fetch(`/check-key/${key}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Network response was not ok');
                }
                return response.json();
            })
            .then(data => {
                // Check if data was found for the key
                if (data.found) {
                    // Data found, proceed to display
                    console.log('Crossword data found:', data.crosswordData);
                    console.log('Questions:', data.questions);
                    console.log('Answers:', data.answers);
                    console.log('Passage:', data.passage);

                    // Store the passage, questions, and answers in sessionStorage
                    sessionStorage.setItem('crosswordPassage', data.passage);
                    sessionStorage.setItem('crosswordQuestions', data.questions); // Store as string
                    sessionStorage.setItem('crosswordAnswers', data.answers); // Store as string
                    sessionStorage.setItem('crosswordGrid', data.crosswordData);
                    sessionStorage.setItem('crosswordKey', key);
                    sessionStorage.setItem('studentName', inputName);
                    sessionStorage.setItem("startTime", Date.now());

                    // Verify storage
                    console.log('Stored Passage:', sessionStorage.getItem('crosswordPassage'));
                    console.log('Stored Questions:', sessionStorage.getItem('crosswordQuestions'));
                    console.log('Stored Answers:', sessionStorage.getItem('crosswordAnswers'));
                    console.log('Stored Grid:', sessionStorage.getItem('crosswordGrid'));

                    // Redirect to get_crosswords.html
                    window.location.href = 'get_crosswords.html';
                } else {
                    // Key not found
                    console.log('Crossword data not found for key:', key);
                    alert('Crossword data not found for the entered key.');
                }
            })
            .catch(error => {
                console.error('Error fetching data:', error);
                alert('Error fetching crossword data. Please try again.');
            });
    }

    function getName(name) {
        fetch(`/get-name/${name}`)
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
                checkKeyExists(inputKey);
                return;
            }
        })
        .catch(error => {
            console.error('Fetch error:', error);
        });
    }

    function showNameFoundModal(name, key, is_done) {
        var modal = document.getElementById('nameFoundModal');
        var proceedBtn = document.getElementById('proceedBtn');
        var cancelBtn = document.getElementById('cancelBtn');

        if (is_done) {
            alert('You have already completed the crossword.');
            return;
        }

        modal.style.display = 'block';

        proceedBtn.onclick = function() {
            getName(name, key);
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
