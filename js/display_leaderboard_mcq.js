function fetchMCQLeaderboard() {
    const key = document.getElementById('keyInput').value.trim();
  
    if (!key) {
      alert('Please enter a key.');
      return;
    }
  
    fetch(`/leaderboard-mcq/${key}`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok ' + response.statusText);
        }
        return response.json();
      })
      .then(data => {
        const leaderboardDiv = document.getElementById('leaderboard');
        leaderboardDiv.innerHTML = ''; // Clear previous
  
        if (data.found) {
          const generatedKeyDiv = document.getElementById('generatedKey');
          generatedKeyDiv.innerHTML = `<strong>Leaderboard For Key ${key}</strong>`;
  
          // Sort by score (desc), then time (asc)
          data.leaderboard.sort((a, b) => {
            if (a.score !== b.score) {
              return b.score - a.score;
            } else {
              return a.time_taken - b.time_taken;
            }
          });
  
          const table = document.createElement('table');
          const headerRow = document.createElement('tr');
          headerRow.innerHTML = '<th>Rank</th><th>Name</th><th>Score</th><th>Time Taken (s)</th>';
          table.appendChild(headerRow);
  
          let rank = 1;
          data.leaderboard.forEach(entry => {
            const row = document.createElement('tr');
            const timeTaken = entry.time_taken.toFixed(3);
            const rankDisplay = entry.time_taken === 0 ? '-' : rank;
  
            row.innerHTML = `
              <td>${rankDisplay}</td>
              <td>${entry.name}</td>
              <td>${entry.score}</td>
              <td>${timeTaken}</td>
            `;
            table.appendChild(row);
  
            if (entry.time_taken !== 0) {
              rank++;
            }
          });
  
          leaderboardDiv.appendChild(table);
  
          // Show modal
          const modal = document.getElementById('mcqLeaderboardModal');
          const closeButton = modal.querySelector('.close');
          modal.style.display = 'block';
  
          closeButton.onclick = () => modal.style.display = 'none';
          window.onclick = (event) => {
            if (event.target === modal) {
              modal.style.display = 'none';
            }
          };
        } else {
          leaderboardDiv.innerHTML = 'No data found for the entered key.';
        }
      })
      .catch(error => {
        console.error('Error fetching leaderboard data:', error);
        alert('Error fetching leaderboard data. Please try again.');
      });
  }
  