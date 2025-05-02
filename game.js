document.addEventListener('DOMContentLoaded', () => {
    //DOM elements
    const status = document.getElementById('status');
    const cells = document.querySelectorAll('.cell');
    const resetBtn = document.getElementById('resetBtn');
    const soundToggle = document.getElementById('soundToggle');
    const musicToggle = document.getElementById('musicToggle');
    const playerScoreEl = document.getElementById('playerScore');
    const computerScoreEl = document.getElementById('computerScore');
    const tieScoreEl = document.getElementById('tieScore');

    //Audio Elements
    const backgroundMusic = document.getElementById('backgroundMusic');
    const clickSound = document.getElementById('clickSound');
    const winSound = document.getElementById('winSound');
    const loseSound = document.getElementById('loseSound');
    const drawSound = document.getElementById('drawSound');

    //Game states
    let board = Array(9).fill(null);
    let currentPlayer = 'X';
    let gameActive = true;
    let scores = { player: 0, computer: 0, ties: 0 };
    let soundEnabled = true;
    let musicEnabled = true;

    //winning patterns
    const winPatterns = [
        [0, 1, 2], [3, 4, 5], [6, 7, 8], // rows
        [0, 3, 6], [1, 4, 7], [2, 5, 8], // columns
        [0, 4, 8], [2, 4, 6]             // diagonals
    ];

    function initGame() {
        board = Array(9).fill(null);
        let currentPlayer = 'X';
        let gameActive = true;
        status.textContent = 'Your turn (X)';

        cells.forEach(cell => {
            cell.textContent = '';
            cell.className = 'cell';
        });

        if (musicEnabled) {
            backgroundMusic.currentTime = 0;
            backgroundMusic.play().catch(e => console.log('Autoplay prevented:', e));
        }
    }

    //play sound if enabled
    function playSound(sound) {
        if (soundEnabled) {
            sound.currentTime = 0;
            sound.play().catch(e => console.log("Sound error: ", e));
        }
    }

    //Handle cell click
    function handleCellClick(e) {
        const index = e.target.getAttribute('data-index');

        if (board[index] || !gameActive) return

        playSound(currentPlayer);
        makeMove(index, currentPlayer);

        if (checkWin(currentPlayer)) {
            endGame(currentPlayer === 'X' ? 'player' : 'computer');
            return;
        }

        if (checkDraw()) {
            endGame('tie');
            return;
        }

        currentPlayer = 'O';
        status.textContent = "Computer's turn";

        setTimeout(computerMove, 800);
    }

    function makeMove(index, player) {
        board[index] = player;
        const cell = document.querySelector(`[data-index="${index}"]`);
        cell.textContent = player;
        cell.classList.add(player.toLowerCase());
    };

    function computerMove() {
        if (!gameActive) return;

        //try to win
        let move = findWinningMove('O');

        //block player's winning move
        if (move === null) {
            move = findWinningMove('X');
        }

        //choose center if available
        if (move === null && board[4] === null) {
            move = 4;
        }

        //choose random available corners
        if (move === null) {
            const corners = [0, 2, 6, 8].filter(i => board[i] === null);
            if (corners.length > 0) {
                move = corners[Math.floor(Math.random() * corners.length)];
            }
        }

        //choose random available edges
        if (move === null) {
            const edges = [1, 3, 5, 7].filter(i => board[i] === null);
            if (edges.length > 0) {
                move = edges[Math.floor(Math.random() * edges.length)];
            }
        }

        //make the move
        if (move !== null) {
            playSound(clickSound);
            makeMove(move, 'O');

            //check for win or draw
            if (checkWin('O')) {
                endGame('computer');
                return;
            }

            if (checkDraw()) {
                endGame('tie');
                return;
            }

            //Switch back to player's turn
            currentPlayer = 'X';
            status.textContent = 'Your turn (X)';
        }
    }

    function findWinningMove(player) {
        for (const pattern of winPatterns) {
            const [a, b, c] = pattern;

            if (board[a] === player && board[b] === player && board[c] === null) return c;
            if (board[a] === player && board[c] === player && board[b] === null) return b;
            if (board[b] === player && board[c] === player && board[a] === null) return a;
        }
        return null
    }

    function checkWin(player) {
        return winPatterns.some(pattern => {
            return pattern.every(index => {
                return board[index] === player;
            })
        })
    }

    function checkDraw() {
        return board.every(cell => cell !== null);
    }

    function endGame(winner) {
        gameActive = false;

        if (winner !== 'tie') {
            highlightWinningCells();
        }

        //update status and score
        switch (winner) {
            case 'player':
                status.textContent = 'You win! 🎉';
                scores.player++;
                playerScoreEl.textContent = scores.player;
                playSound(winSound);
                break;

            case 'computer':
                status.textContent = 'Computer wins! 🤖';
                scores.computer++;
                computerScoreEl.textContent = scores.computer;
                playSound(loseSound);
                break;

            case 'tie':
                status.textContent = 'Game ended in a draw! 🤝';
                scores.ties++;
                tieScoreEl.textContent = scores.ties;
                playSound(drawSound);
                break;
        }
    }

    function highlightWinningCells() {
        const winningPattern = winPatterns.find(pattern => {
            const [a, b, c] = pattern;
            return board[a] && board[a] === board[b] && board[a] === board[c];
        });

        if (winningPattern) {
            winningPattern.forEach(index => {
                document.querySelectorAll(`[data-index="${index}"]`).classList.add('win');
            });
        }
    }

    function toggleSound() {
        soundEnabled = !soundEnabled;
        soundToggle.classList.toggle('active', soundEnabled);
        soundToggle.innerHTML = soundEnabled ? `<i class="fas fa-volume-up"></i>` :
            `<i class="fas fa-volume-mute"></i>`;
    }

    function toggleMusic() {
        musicEnabled = !musicEnabled;
        musicToggle.classList.toggle('active', musicEnabled);
        musicToggle.innerHTML = musicEnabled ? `<i class="fas fa-music"></i>` :
            `<i class="fas fa-music-slash"></i>`;

        if (musicEnabled) {
            backgroundMusic.play().catch(e => console.log("music play prevented: ", e));
        } else {
            backgroundMusic.pause();
        }
    }

    //event listeners
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    resetBtn.addEventListener('click', initGame);
    soundToggle.addEventListener('click', toggleSound);
    musicToggle.addEventListener('click', toggleMusic);

    toggleSound();
    toggleMusic();

    //start the game
    initGame();
});