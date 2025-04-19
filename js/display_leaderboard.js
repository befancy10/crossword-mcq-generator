// Function to fetch leaderboard data based on input key
function fetchLeaderboard() {
    const key = document.getElementById('keyInput').value.trim();
  
    if (!key) {
        alert('Please enter a key.');
        return;
    }
  
    fetch(`/leaderboard/${key}`)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const leaderboardDiv = document.getElementById('leaderboard');
            leaderboardDiv.innerHTML = ''; // Clear previous results
  
            if (data.found) {
              const generatedKeyDiv = document.getElementById('generatedKey');
              generatedKeyDiv.innerHTML = `<strong>Leaderboard For Key ${key}</strong>`;
                // Sort leaderboard data by is_done true first, then by time_taken, and alphabetically for zero time_taken
                data.leaderboard.sort((a, b) => {
                    if (a.is_done !== b.is_done) {
                        return b.is_done - a.is_done; // Sort by is_done
                    } else if (a.is_done && b.is_done) {
                        return a.time_taken - b.time_taken; // Sort by time_taken for those who completed
                    } else {
                        return a.name.localeCompare(b.name); // Sort alphabetically for those with zero time_taken
                    }
                });
  
                // Create a table to display leaderboard data
                const table = document.createElement('table');
                const headerRow = document.createElement('tr');
                headerRow.innerHTML = '<th>Rank</th><th>Name</th><th>Status</th><th>Time Taken (s)</th>';
                table.appendChild(headerRow);
  
                let rank = 1;
                data.leaderboard.forEach(entry => {
                    const row = document.createElement('tr');
                    const timeTaken = entry.time_taken.toFixed(3);
                    const rankDisplay = entry.time_taken === 0 ? '-' : rank;
  
                    row.innerHTML = `<td>${rankDisplay}</td><td>${entry.name}</td><td>${entry.is_done ? 'Selesai' : 'Belum Selesai'}</td><td>${timeTaken}</td>`;
                    table.appendChild(row);
  
                    if (entry.time_taken !== 0) {
                        rank++;
                    }
                });
  
                leaderboardDiv.appendChild(table);
  
                // Show the modal
                const modal = document.querySelector('.modal');
                const closeButton = modal.querySelector('.close');
                modal.style.display = 'block';
  
                // Close modal when close button or outside modal area is clicked
                closeButton.onclick = function() {
                    modal.style.display = 'none';
                };
  
                window.onclick = function(event) {
                    if (event.target == modal) {
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
  