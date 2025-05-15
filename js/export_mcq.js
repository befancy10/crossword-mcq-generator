function test(){
    console.log(`Server is running on http://localhost:${3000}`);
}

async function exportMCQData() {
  const mcqList = JSON.parse(localStorage.getItem('mcqList'));
  const passage = localStorage.getItem('passage');
  // const key = 'm' + generateRandomKey(); // Generate a random unique key with prefix 'm' for mcq type
  const key = await generateRandomKeyWithPrefix('m');

  if (!mcqList || mcqList.length === 0) {
    displayMessage("No MCQ data found to export.");
    return;
  }

  // Pisahkan pertanyaan, pilihan, dan jawaban benar
  const questions = mcqList.map(item => item.question);
  const correct_answers = mcqList.map(item => item.correctAnswer);
  const options = mcqList.map(item => item.options); // Array of arrays

  console.log("Processed questions:", questions);
  console.log("Processed options:", options);
  console.log("Processed answer:", correct_answers);
  console.log("Processed passage:", passage);
  console.log("Generated key:", key);

  const dataToExport = {
    questions: questions,
    options: options,
    correct_answers: correct_answers,
    passage: passage,
    generatedKey: key
  };

  try {
    const response = await fetch('/export_mcq_data', {
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
      console.error('Failed to export MCQ:', response.statusText);
    }
  } catch (error) {
    displayMessage("An error occurred while exporting the MCQ data.");
    console.error('Error:', error);
  }
}
