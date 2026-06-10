const dictionaries = {
      programming: [
        'algorithm', 'binary search', 'segment tree', 'priority queue', 'recursion', 'dynamic programming',
        'variable', 'compiler', 'function', 'pointer', 'database', 'network', 'frontend', 'backend',
        'container', 'hash table', 'graph theory', 'iteration', 'debugging', 'asynchronous', 'interface',
        'middleware', 'transaction', 'repository', 'deployment', 'authentication'
      ],
      cet4: [
        'achieve', 'benefit', 'challenge', 'develop', 'efficient', 'frequent', 'graduate', 'hesitate',
        'improve', 'journey', 'knowledge', 'language', 'memory', 'necessary', 'opinion', 'practice',
        'quality', 'research', 'strategy', 'technology', 'university', 'valuable', 'wonderful', 'youth'
      ],
      campus: [
        'library', 'classroom', 'dormitory', 'cafeteria', 'laboratory', 'scholarship', 'competition',
        'association', 'volunteer', 'presentation', 'examination', 'basketball', 'graduation', 'homework',
        'lecture hall', 'computer room', 'student card', 'campus map', 'midterm', 'final week'
      ],
      games: [
        'checkpoint', 'inventory', 'boss fight', 'side quest', 'achievement', 'multiplayer', 'character',
        'animation', 'soundtrack', 'strategy', 'combo', 'cooldown', 'dialogue', 'ranking', 'tournament',
        'controller', 'keyboard', 'adventure', 'story mode', 'open world', 'pixel art', 'level design'
      ]
    };

    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');
    const $ = (id) => document.getElementById(id);

    let state = null;
    let timerHandle = null;

    function escapeHTML(text) {
      return String(text)
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#039;');
    }

    function normalizeAnswer(text) {
      return String(text).toUpperCase().replace(/[^A-Z0-9]/g, '');
    }

    function normalizeWord(text) {
      return String(text).trim().replace(/\s+/g, ' ');
    }

    function parseCustomWords(raw) {
      return raw
        .split(/[\n,，;；]+/)
        .map(normalizeWord)
        .filter(Boolean)
        .filter((word, index, arr) => arr.findIndex(x => x.toLowerCase() === word.toLowerCase()) === index);
    }

    function shuffle(array) {
      const a = [...array];
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    }

    function randomRoomCode() {
      const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
      let code = '';
      for (let i = 0; i < 4; i++) code += chars[Math.floor(Math.random() * chars.length)];
      return code;
    }

    function makeId(prefix) {
      return prefix + '_' + Math.random().toString(36).slice(2, 9);
    }

    function showScreen(name) {
      ['homeScreen', 'lobbyScreen', 'gameScreen', 'resultScreen'].forEach(id => $(id).classList.remove('active'));
      $(name).classList.add('active');
    }

    function showAlert(id, message) {
      const el = $(id);
      if (!message) {
        el.classList.remove('show');
        el.textContent = '';
        return;
      }
      el.textContent = message;
      el.classList.add('show');
    }

    function getSelectedWords() {
      const theme = $('themeSelect').value;
      let words = [];
      if (theme === 'custom') {
        words = parseCustomWords($('customWordsInput').value);
        if (words.length < 10) {
          throw new Error('自定义词库至少需要 10 个词或短语。');
        }
      } else {
        words = dictionaries[theme] || dictionaries.programming;
      }
      return shuffle(words).slice(0, 10);
    }

    function createInitialState() {
      const nickname = normalizeWord($('nicknameInput').value) || 'Player';
      const pickedWords = getSelectedWords();
      const botCount = Number($('botCountSelect').value || 0);
      const players = [{ id: makeId('player'), name: nickname, score: 0, bot: false }];
      const botNames = ['Lexi Bot', 'Cipher Bot', 'Nova Bot'];
      for (let i = 0; i < botCount; i++) {
        players.push({ id: makeId('bot'), name: botNames[i] || ('Bot ' + (i + 1)), score: 0, bot: true });
      }
      return {
        roomCode: randomRoomCode(),
        status: 'lobby',
        theme: $('themeSelect').value,
        roundSeconds: Number($('roundTimeSelect').value || 0),
        timeLeft: Number($('roundTimeSelect').value || 0),
        autoBot: $('autoBotCheck').checked,
        players,
        activePlayerId: players[0].id,
        words: pickedWords.map((answer, index) => ({
          id: index,
          answer,
          guessed: false,
          guessedBy: null,
          revealedAtGuess: null
        })),
        revealedLetters: [],
        selectedWordId: 0,
        logs: []
      };
    }

    function addLog(message, type = 'info') {
      if (!state) return;
      const time = new Date().toLocaleTimeString('zh-CN', { hour12: false });
      state.logs.unshift({ message, type, time });
      state.logs = state.logs.slice(0, 80);
    }

    function currentScoreValue() {
      if (!state) return 26;
      return Math.max(1, 26 - state.revealedLetters.length);
    }

    function getPlayer(id) {
      return state.players.find(p => p.id === id);
    }

    function getActivePlayer() {
      return getPlayer(state.activePlayerId) || state.players[0];
    }

    function maskWord(answer) {
      const revealed = new Set(state.revealedLetters);
      return String(answer).toUpperCase().split('').map(ch => {
        if (/[A-Z]/.test(ch)) return revealed.has(ch) ? ch : '*';
        if (/[0-9]/.test(ch)) return ch;
        return ch;
      }).join('');
    }

    function revealRatio(answer) {
      const letters = String(answer).toUpperCase().split('').filter(ch => /[A-Z]/.test(ch));
      if (!letters.length) return 1;
      const revealed = new Set(state.revealedLetters);
      const cnt = letters.filter(ch => revealed.has(ch)).length;
      return cnt / letters.length;
    }

    function renderLobby() {
      $('roomCode').textContent = state.roomCode;
      $('lobbyPlayers').innerHTML = state.players.map(p => `
        <div class="player-item">
          <div class="player-main">
            <div class="avatar">${escapeHTML(p.name.slice(0, 1).toUpperCase())}</div>
            <div>
              <div class="player-name">${escapeHTML(p.name)}</div>
              <div class="small-muted">${p.bot ? '机器人玩家' : '本地玩家'}</div>
            </div>
          </div>
          <span class="tag ${p.bot ? 'warn' : 'good'}">${p.bot ? 'BOT' : 'HUMAN'}</span>
        </div>
      `).join('');
    }

    function renderGame() {
      $('statRoom').textContent = state.roomCode;
      $('statScore').textContent = currentScoreValue();
      $('statLetters').textContent = state.revealedLetters.length;
      $('statTimer').textContent = formatTime(state.timeLeft);
      $('revealedLettersText').textContent = state.revealedLetters.length ? state.revealedLetters.join(' ') : '暂无';

      $('activePlayerSelect').innerHTML = state.players
        .filter(p => !p.bot)
        .map(p => `<option value="${p.id}" ${p.id === state.activePlayerId ? 'selected' : ''}>${escapeHTML(p.name)}</option>`)
        .join('');

      $('wordGrid').innerHTML = state.words.map(w => {
        const selected = w.id === state.selectedWordId ? 'selected' : '';
        const guessed = w.guessed ? 'guessed' : '';
        const display = w.guessed ? String(w.answer).toUpperCase() : maskWord(w.answer);
        const guessedBy = w.guessedBy ? getPlayer(w.guessedBy)?.name || '未知玩家' : '未猜中';
        return `
          <div class="word-card ${selected} ${guessed}" data-word-id="${w.id}">
            <div class="word-index">#${w.id + 1}</div>
            <div class="masked-word">${escapeHTML(display)}</div>
            <div class="word-meta">
              <span>${w.guessed ? '答对者：' + escapeHTML(guessedBy) : '点击选择抢答'}</span>
              <span class="tag ${w.guessed ? 'good' : ''}">${w.guessed ? 'LOCKED' : Math.round(revealRatio(w.answer) * 100) + '%'}</span>
            </div>
          </div>
        `;
      }).join('');

      document.querySelectorAll('.word-card').forEach(card => {
        card.addEventListener('click', () => {
          state.selectedWordId = Number(card.dataset.wordId);
          $('guessWordSelect').value = String(state.selectedWordId);
          renderGame();
          $('guessInput').focus();
        });
      });

      $('lettersPanel').innerHTML = alphabet.map(letter => {
        const revealed = state.revealedLetters.includes(letter);
        return `<button class="letter-btn ${revealed ? 'revealed' : ''}" data-letter="${letter}" ${revealed ? 'disabled' : ''}>${letter}</button>`;
      }).join('');

      document.querySelectorAll('.letter-btn').forEach(btn => {
        btn.addEventListener('click', () => revealLetter(btn.dataset.letter));
      });

      $('guessWordSelect').innerHTML = state.words.map(w => {
        const guessed = w.guessed ? '已猜中' : '可抢答';
        return `<option value="${w.id}" ${w.id === state.selectedWordId ? 'selected' : ''}>#${w.id + 1} · ${guessed}</option>`;
      }).join('');

      renderRanking('rankingList', state.players);
      renderLogs();
    }

    function renderRanking(targetId, players) {
      const sorted = [...players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
      $(targetId).innerHTML = sorted.map((p, index) => `
        <div class="rank-item">
          <div class="rank-main">
            <div class="avatar">${index + 1}</div>
            <div>
              <div class="rank-name">${escapeHTML(p.name)}</div>
              <div class="small-muted">${p.bot ? '机器人玩家' : '本地玩家'}</div>
            </div>
          </div>
          <div class="rank-score">${p.score}</div>
        </div>
      `).join('');
    }

    function renderLogs() {
      $('logList').innerHTML = state.logs.length ? state.logs.map(log => `
        <div class="log-item"><span class="small-muted">${escapeHTML(log.time)}</span> · ${escapeHTML(log.message)}</div>
      `).join('') : '<div class="log-item">暂无操作。开一个字母或提交抢答后会记录在这里。</div>';
    }

    function revealLetter(letter) {
      showAlert('gameAlert', '');
      if (!state || state.status !== 'playing') return;
      if (state.revealedLetters.includes(letter)) return;
      const player = getActivePlayer();
      state.revealedLetters.push(letter);

      let matches = 0;
      state.words.forEach(w => {
        if (!w.guessed) {
          matches += String(w.answer).toUpperCase().split('').filter(ch => ch === letter).length;
        }
      });
      addLog(`${player.name} 打开了字母 ${letter}${matches ? `，命中 ${matches} 个位置` : '，没有命中任何位置'}`);
      renderGame();
      maybeBotGuess();
      checkGameEnd();
    }

    function submitGuess() {
      showAlert('gameAlert', '');
      if (!state || state.status !== 'playing') return;
      const wordId = Number($('guessWordSelect').value);
      const answer = $('guessInput').value.trim();
      const word = state.words.find(w => w.id === wordId);
      const player = getActivePlayer();
      if (!word) return;
      if (word.guessed) {
        showAlert('gameAlert', '这个单词已经被猜中，不能重复得分。');
        return;
      }
      if (!answer) {
        showAlert('gameAlert', '请输入答案后再提交。');
        return;
      }
      if (normalizeAnswer(answer) === normalizeAnswer(word.answer)) {
        const gain = currentScoreValue();
        word.guessed = true;
        word.guessedBy = player.id;
        word.revealedAtGuess = state.revealedLetters.length;
        player.score += gain;
        addLog(`${player.name} 猜中 #${word.id + 1}「${word.answer.toUpperCase()}」，获得 ${gain} 分`, 'good');
        $('guessInput').value = '';
        chooseNextUnguessedWord();
        renderGame();
        maybeBotGuess();
        checkGameEnd();
      } else {
        player.score -= 1;
        addLog(`${player.name} 抢答 #${word.id + 1} 失败，扣 1 分`, 'bad');
        showAlert('gameAlert', '答案不正确，已扣 1 分。');
        renderGame();
      }
    }

    function chooseNextUnguessedWord() {
      const next = state.words.find(w => !w.guessed);
      if (next) state.selectedWordId = next.id;
      $('guessWordSelect').value = String(state.selectedWordId);
    }

    function maybeBotGuess() {
      if (!state || !state.autoBot || state.status !== 'playing') return;
      const bots = state.players.filter(p => p.bot);
      const candidates = state.words.filter(w => !w.guessed && revealRatio(w.answer) >= 0.32);
      if (!bots.length || !candidates.length) return;

      const attempts = Math.random() < 0.48 ? 1 : 0;
      for (let i = 0; i < attempts; i++) {
        const bot = bots[Math.floor(Math.random() * bots.length)];
        const word = candidates[Math.floor(Math.random() * candidates.length)];
        if (!word || word.guessed) continue;
        const ratio = revealRatio(word.answer);
        const probability = Math.min(0.82, 0.12 + ratio * 0.72);
        if (Math.random() < probability) {
          const gain = currentScoreValue();
          word.guessed = true;
          word.guessedBy = bot.id;
          word.revealedAtGuess = state.revealedLetters.length;
          bot.score += gain;
          addLog(`${bot.name} 抢答成功 #${word.id + 1}「${word.answer.toUpperCase()}」，获得 ${gain} 分`, 'good');
        } else {
          bot.score -= 1;
          addLog(`${bot.name} 尝试抢答 #${word.id + 1} 失败，扣 1 分`, 'bad');
        }
      }
      renderGame();
    }

    function checkGameEnd() {
      if (!state || state.status !== 'playing') return;
      if (state.words.every(w => w.guessed)) finishGame('全部单词已猜出。');
    }

    function formatTime(seconds) {
      if (!seconds) return '∞';
      const m = Math.floor(seconds / 60).toString().padStart(2, '0');
      const s = Math.floor(seconds % 60).toString().padStart(2, '0');
      return `${m}:${s}`;
    }

    function startTimer() {
      stopTimer();
      if (!state.roundSeconds) {
        $('statTimer').textContent = '∞';
        return;
      }
      timerHandle = setInterval(() => {
        if (!state || state.status !== 'playing') return;
        state.timeLeft -= 1;
        $('statTimer').textContent = formatTime(state.timeLeft);
        if (state.timeLeft <= 0) finishGame('时间结束。');
      }, 1000);
    }

    function stopTimer() {
      if (timerHandle) clearInterval(timerHandle);
      timerHandle = null;
    }

    function startGame() {
      state.status = 'playing';
      state.timeLeft = state.roundSeconds;
      addLog('游戏开始。越早猜中，得分越高。');
      showScreen('gameScreen');
      renderGame();
      startTimer();
    }

    function finishGame(reason = '游戏结束。') {
      if (!state) return;
      state.status = 'finished';
      stopTimer();
      addLog(reason);
      renderResult();
      showScreen('resultScreen');
    }

    function renderResult() {
      const sorted = [...state.players].sort((a, b) => b.score - a.score || a.name.localeCompare(b.name));
      $('winnerName').textContent = sorted[0]?.name || '-';
      renderRanking('finalRanking', state.players);
      $('answersList').innerHTML = state.words.map(w => {
        const guessedBy = w.guessedBy ? getPlayer(w.guessedBy)?.name || '未知玩家' : '无人猜中';
        return `
          <div class="answer-item">
            <div>
              <div class="small-muted">#${w.id + 1}</div>
              <div class="answer-word">${escapeHTML(String(w.answer).toUpperCase())}</div>
            </div>
            <span class="tag ${w.guessed ? 'good' : 'bad'}">${escapeHTML(guessedBy)}</span>
          </div>
        `;
      }).join('');
    }

    function bootLobby() {
      try {
        showAlert('homeAlert', '');
        state = createInitialState();
        renderLobby();
        showScreen('lobbyScreen');
      } catch (err) {
        showAlert('homeAlert', err.message || '创建失败，请检查输入。');
      }
    }

    function addLocalPlayer() {
      showAlert('lobbyAlert', '');
      const name = normalizeWord($('addPlayerInput').value);
      if (!name) {
        showAlert('lobbyAlert', '请输入玩家昵称。');
        return;
      }
      if (state.players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showAlert('lobbyAlert', '该昵称已经存在。');
        return;
      }
      state.players.push({ id: makeId('player'), name, score: 0, bot: false });
      $('addPlayerInput').value = '';
      renderLobby();
    }

    function resetToHome() {
      stopTimer();
      state = null;
      showScreen('homeScreen');
      showAlert('homeAlert', '');
      showAlert('lobbyAlert', '');
      showAlert('gameAlert', '');
    }



    function openRules() {
      const modal = $('rulesModal');
      if (modal) modal.classList.remove('hidden');
    }

    function closeRules() {
      const modal = $('rulesModal');
      if (modal) modal.classList.add('hidden');
    }

    $('themeSelect').addEventListener('change', () => {
      $('customWordsPanel').classList.toggle('hidden', $('themeSelect').value !== 'custom');
    });

    $('rulesTopBtn')?.addEventListener('click', openRules);
    $('rulesBtn')?.addEventListener('click', openRules);
    $('closeRulesBtn')?.addEventListener('click', closeRules);
    $('rulesModal')?.addEventListener('click', (e) => {
      if (e.target.id === 'rulesModal') closeRules();
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeRules();
    });

    $('createRoomBtn').addEventListener('click', bootLobby);
    $('quickStartBtn').addEventListener('click', () => {
      bootLobby();
      if (state) startGame();
    });
    $('copyRoomBtn').addEventListener('click', async () => {
      if (!state) return;
      try {
        await navigator.clipboard.writeText(state.roomCode);
        $('copyRoomBtn').textContent = '已复制';
        setTimeout(() => $('copyRoomBtn').textContent = '复制房间号', 1000);
      } catch (_) {
        alert('房间号：' + state.roomCode);
      }
    });
    $('backHomeBtn').addEventListener('click', resetToHome);
    $('addPlayerBtn').addEventListener('click', addLocalPlayer);
    $('addPlayerInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') addLocalPlayer();
    });
    $('startGameBtn').addEventListener('click', startGame);
    $('activePlayerSelect').addEventListener('change', (e) => {
      state.activePlayerId = e.target.value;
      renderGame();
    });
    $('guessWordSelect').addEventListener('change', (e) => {
      state.selectedWordId = Number(e.target.value);
      renderGame();
    });
    $('submitGuessBtn').addEventListener('click', submitGuess);
    $('guessInput').addEventListener('keydown', (e) => {
      if (e.key === 'Enter') submitGuess();
    });
    $('finishGameBtn').addEventListener('click', () => finishGame('玩家手动结束本局。'));
    $('restartBtn').addEventListener('click', () => {
      const oldPlayers = state.players.map(p => ({ ...p, score: 0 }));
      try {
        const newState = createInitialState();
        newState.players = oldPlayers;
        newState.activePlayerId = oldPlayers.find(p => !p.bot)?.id || oldPlayers[0].id;
        state = newState;
        startGame();
      } catch (err) {
        resetToHome();
        showAlert('homeAlert', err.message || '重新开始失败，请检查词库。');
      }
    });
    $('resultHomeBtn').addEventListener('click', resetToHome);
