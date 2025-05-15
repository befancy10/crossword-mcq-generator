async function exportCrosswordData() {
  var storedCrosswordData = localStorage.getItem("crosswordData");
  const questions = JSON.parse(localStorage.getItem('question_answer'));
  const answers = JSON.parse(localStorage.getItem('answers'));
  const passage = localStorage.getItem('passage');
  // const key = 'c' + generateRandomKey(); // Generate a random unique key with prefix 'c' for crossword type
  const key = await generateRandomKeyWithPrefix('c');

  var crosswords;
  if (storedCrosswordData) {
    crosswords = JSON.parse(storedCrosswordData);
  } else {
    console.log("No crossword data found in localStorage.");
    crosswords = {};
  }

  crosswords.ownerMap.forEach(function (row, rowIndex) {
    var rowArray = [];
    var lastIndex = 0;
    row.forEach(function (cell, cellIndex) {
      if (cell !== null) {
        rowArray[cellIndex] = cell;
      }
      lastIndex = cellIndex;
    });
    rowArray[lastIndex + 1] = null;
    rowArray.pop();
    crosswords.ownerMap[rowIndex] = rowArray;
  });

  console.log("Processed crossword data:", crosswords);
  console.log("Processed questions:", questions);
  console.log("Processed answers:", answers);
  console.log("Processed passage:", passage);
  console.log("Generated key:", key);

  var dataToExport = {
    crosswordData: crosswords,
    questions: questions,
    answers: answers,
    passage: passage,
    generatedKey: key
  };

  console.log(dataToExport);

  try {
    const response = await fetch('/display_question_answer', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(dataToExport)
    });

    if (response.ok) {
      const result = await response.json();
      console.log(result);
      displayMessage(`${key}`);
    } else {
      console.error('Failed to submit the form:', response.statusText);
    }
  } catch (error) {
    displayMessage("An error occurred while submitting the form");
    console.error('Error:', error);
  }
}
