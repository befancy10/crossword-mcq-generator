window.onload = function () {
    const key = sessionStorage.getItem("leaderboardKey");
    if (key) {
        const input = document.getElementById("keyInput");
        if (input) {
            input.value = key;
        }
    }

    // Hapus setelah digunakan
    sessionStorage.removeItem("leaderboardKey");
};

// Function to fetch leaderboard data based on input key
function fetchLeaderboard() {
    const key = document.getElementById('keyInput').value.trim();
    if (!key) {
        alert('Please enter a key.');
        return;
    }

    const isMCQ = key.charAt(0) === 'm';
    const leaderboardEndpoint = isMCQ ? `/leaderboard-mcq/${key}` : `/leaderboard/${key}`;
    const modalTitle = isMCQ ? `MCQ Leaderboard` : `Crossword Leaderboard`;

    fetch(leaderboardEndpoint)
        .then(response => {
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            return response.json();
        })
        .then(data => {
            const leaderboardDiv = document.getElementById('leaderboard');
            leaderboardDiv.innerHTML = ''; 
            const generatedKeyDiv = document.getElementById('generatedKey');
            generatedKeyDiv.innerHTML = `<strong>${modalTitle}<br>Key: ${key}<br></strong>`;

            if (!data.found) {
                leaderboardDiv.innerHTML = 'No data found for the entered key.';
                return;
            }

            const table = document.createElement('table');
            table.style.marginTop = '2%';

            const thead = table.createTHead();
            const headerRow = thead.insertRow();
            
            if (isMCQ) {
                ['Rank', 'Name', 'Score', 'Time Taken (s)', 'Status'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });
                data.leaderboard.sort((a, b) =>
                    a.score !== b.score ? b.score - a.score : a.time_taken - b.time_taken
                );
            } else {
                ['Rank', 'Name', 'Time Taken (s)', 'Status'].forEach(text => {
                    const th = document.createElement('th');
                    th.textContent = text;
                    headerRow.appendChild(th);
                });            
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
            }
                

            const tbody = table.createTBody();

            let rank = 1;
            data.leaderboard.forEach(entry => {
                const row = tbody.insertRow();
                const timeTaken = entry.time_taken.toFixed(3);
                const rankDisplay = entry.time_taken === 0 ? '-' : rank;

                if (isMCQ) {
                    const status = entry.is_done ? 'Selesai' : 'Belum Selesai';
                    [rankDisplay, entry.name, entry.score, timeTaken, status].forEach(val => {
                        const cell = row.insertCell();
                        cell.textContent = val;
                    });
                } else {
                    const status = entry.is_done ? 'Selesai' : 'Belum Selesai';
                    [rankDisplay, entry.name, timeTaken, status].forEach(val => {
                        const cell = row.insertCell();
                        cell.textContent = val;
                    });
                }

                if (entry.time_taken !== 0) {
                    rank++;
                }
            });
  
            leaderboardDiv.appendChild(table);

            // Show the modal
            const modal = document.getElementById('leaderboardModal');
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
        })
        .catch(error => {
            console.error('Error fetching leaderboard data:', error);
            alert('Error fetching leaderboard data. Please try again.');
        });
  }
  