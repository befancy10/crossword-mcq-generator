document.getElementById('gen_mcq').addEventListener('click', async function () {
    const mcqDiv = document.getElementById('mcqDiv');
    mcqDiv.innerHTML = ''; // clear existing content
  
    const questions = JSON.parse(localStorage.getItem('question_answer'));
    const answers = JSON.parse(localStorage.getItem('answers'));
  
    if (!questions || !answers) {
      alert('No questions or answers available.');
      return;
    }

    // Ambil index dari checkbox yang dicentang
    const checkboxes = document.querySelectorAll('.mcq-checkbox');
    const selectedIndexes = [];

    checkboxes.forEach((checkbox) => {
      if (checkbox.checked) {
        selectedIndexes.push(parseInt(checkbox.dataset.index));
      }
    });
  
    if (selectedIndexes.length === 0) {
      // alert('Please select at least one question.');
      showNoQuestionModal();
      return;
    }    
  
    const mcqList = [];
  
    for (let displayIndex = 0; displayIndex < selectedIndexes.length; displayIndex++) {
      const i = selectedIndexes[displayIndex];
      const question = questions[i];
      const correctAnswer = answers[i];
    
      // ✅ Tunggu hasil distractor dari server
      const distractors = await generateSense2VecDistractors(correctAnswer);
      console.log(`Distractors for "${correctAnswer}":`, distractors);

      const options = [correctAnswer, ...distractors];
      shuffleArray(options);
    
      mcqList.push({
        question: question,
        options: options,
        correctAnswer: correctAnswer
      });
    
      const questionDiv = document.createElement('div');
      questionDiv.classList.add('mcq-question');
      questionDiv.innerHTML = `
        <p><strong>Q${displayIndex + 1}:</strong> ${question}</p>
        <ul>
          ${options.map((opt, idx) => {
            const isCorrect = opt === correctAnswer;
            return `<li class="${isCorrect ? 'correct' : ''}">(${String.fromCharCode(65 + idx)}) ${opt}</li>`;
          }).join('')}          
        </ul>
      `;
    
      mcqDiv.appendChild(questionDiv);
    }

    // selectedIndexes.forEach((i, displayIndex) => {
    //   const question = questions[i];
    //   const correctAnswer = answers[i];
    //   const distractors = generateDummyDistractors(correctAnswer);
    //   const options = [correctAnswer, ...distractors];
    //   shuffleArray(options);
  
    //   mcqList.push({
    //     question: question,
    //     options: options,
    //     correctAnswer: correctAnswer
    //   });
  
    //   const questionDiv = document.createElement('div');
    //   questionDiv.classList.add('mcq-question');
    //   questionDiv.innerHTML = `
    //     <p><strong>Q${displayIndex + 1}:</strong> ${question}</p>
    //     <ul>
    //       ${options.map((opt, idx) => {
    //         const isCorrect = opt === correctAnswer;
    //         return `<li class="${isCorrect ? 'correct' : ''}">(${String.fromCharCode(65 + idx)}) ${opt}</li>`;
    //       }).join('')}          
    //     </ul>
    //   `;
  
    //   mcqDiv.appendChild(questionDiv);
    // });

    // menyimpan mcqList ke localStorage setelah generate dan dapat digunakan di exportMCQData()
    localStorage.setItem('mcqList', JSON.stringify(mcqList));

    document.getElementById("result").style.display = "none";
    document.getElementById("gen_mcq").style.display = "none";
    document.getElementById('export_mcq').style.display = 'inline-block';
  });

  function showNoQuestionModal() {
    const modal = document.getElementById("noQuestionModal");
    modal.style.display = "block";
  
    // Optional: klik di luar modal untuk tutup
    window.onclick = function(event) {
      if (event.target == modal) {
        modal.style.display = "none";
      }
    };
  }

  function closeNoQuestionModal() {
    document.getElementById("noQuestionModal").style.display = "none";
    // document.getElementById("gen_mcq").style.display = "inline-block";
  }    

  async function generateSense2VecDistractors(correctAnswer) {
    try {
        const response = await fetch('http://127.0.0.1:5000/generate-distractors', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ answer: correctAnswer })
        });

        if (!response.ok) {
            throw new Error('Failed to generate distractors');
        }

        const data = await response.json();
        return data.distractors;
    } catch (error) {
        console.error('Error generating distractors:', error);
        return [];
    }
}
  
  // Generate 3 dummy distractors (placeholder)
  function generateDummyDistractors(correctAnswer) {
    const dummyDistractors = [
      correctAnswer + 'XXX',
      correctAnswer + 'YYY',
      correctAnswer + 'ZZZ'
    ];
    return dummyDistractors;
  }
  
  // Shuffle array (Fisher-Yates Shuffle)
  function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }
  