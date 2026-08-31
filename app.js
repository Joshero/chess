const SUPABASE_URL = "https://yaauwnvcjjetdybeixfr.supabase.co";
const SUPABASE_KEY = "sb_publishable_POH2JdWG0JMCzEkt9lhrPg_SmLG0Y1I";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

const symbols = { p: "♟", r: "♜", n: "♞", b: "♝", q: "♛", k: "♚", P: "♙", R: "♖", N: "♘", B: "♗", Q: "♕", K: "♔" };
const chess = new Chess();
const $ = (id) => document.getElementById(id);

let currentPuzzleFilter = "all";

const PUZZLES = [
  // ==================== BEGINNER (1-Move & Simple 2-Move) ====================
  {
    id: "puzzle_1",
    title: "Back-Rank Checkmate",
    category: "Beginner",
    goal: "White to move: Strike the undefended 8th rank for mate in 1!",
    fen: "6k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1",
    solution: ["b1b8"],
    hint: "Black's King is trapped behind its own pawns. Move your Rook to b8!"
  },
  {
    id: "puzzle_2",
    title: "Scholar's Touch",
    category: "Beginner",
    goal: "White to move: Deliver checkmate on f7!",
    fen: "r1bqkb1r/pppp1ppp/2n5/4p3/2B1P3/5Q2/PPPP1PPP/RNB1K1NR w KQkq - 0 1",
    solution: ["f3f7"],
    hint: "The f7 pawn is attacked by both Queen and Bishop. Capture on f7!"
  },
  {
    id: "puzzle_3",
    title: "Smothered Knight Mate",
    category: "Beginner",
    goal: "White to move: Deliver a smothered checkmate with your Knight!",
    fen: "6nk/6pp/8/8/5N2/8/5PPP/6K1 w - - 0 1",
    solution: ["f4g6"],
    hint: "Black's King on h8 is smothered by its own Knight and pawns. Jump your Knight from f4 to g6 for checkmate!"
  },
  {
    id: "puzzle_4",
    title: "Rook Back-Rank Exchange",
    category: "Beginner",
    goal: "White to move: Force checkmate on the back rank!",
    fen: "3r2k1/1p3ppp/8/8/8/8/1Q3PPP/3R2K1 w - - 0 1",
    solution: ["d1d8"],
    hint: "Capture the Rook on d8 with your Rook for checkmate."
  },
  {
    id: "puzzle_5",
    title: "Corridor Checkmate",
    category: "Beginner",
    goal: "White to move: Strike on c8 for checkmate!",
    fen: "2r3k1/5ppp/8/8/8/8/5PPP/2R3K1 w - - 0 1",
    solution: ["c1c8"],
    hint: "Swoop down to c8 with your Rook to deliver checkmate!"
  },
  {
    id: "puzzle_6",
    title: "Arabian Rook Mate",
    category: "Beginner",
    goal: "White to move: Deliver mate — trap the King in the corner!",
    fen: "7k/5Rpp/8/8/8/8/6PP/6K1 w - - 0 1",
    solution: ["f7f8"],
    hint: "Slide your Rook from f7 to f8 — the Black King on h8 is completely trapped by its own pawns!"
  },
  {
    id: "puzzle_7",
    title: "Queen & Helper Battery",
    category: "Beginner",
    goal: "White to move: Drive the Queen to h7 for checkmate!",
    fen: "r1bq1rk1/pppp1ppp/2n5/4p1N1/2B1P3/3P4/PPP2PPP/R2QK2R w KQ - 0 1",
    solution: ["d1h5"],
    hint: "Bring your Queen to h5 to threaten mate on both f7 and h7!"
  },
  {
    id: "puzzle_8",
    title: "Anastasia's Mate Concept",
    category: "Beginner",
    goal: "White to move: Deliver back-rank mate with Queen support!",
    fen: "5rk1/5ppp/8/8/8/8/5PPP/4Q1K1 w - - 0 1",
    solution: ["e1e8"],
    hint: "Sacrifice or pin the back rank! Push Queen to e8 for immediate checkmate."
  },

  // ==================== INTERMEDIATE (Tactical Forks, Pins, Discoveries) ====================
  {
    id: "puzzle_9",
    title: "Royal Knight Fork",
    category: "Intermediate",
    goal: "White to move: Fork Black's King and Queen!",
    fen: "r3k2r/ppp2ppp/8/3q4/4N3/8/PPPP1PPP/R3K2R w KQkq - 0 1",
    solution: ["e4f6"],
    hint: "Check Black's King on f6 with your Knight while simultaneously attacking the Queen."
  },
  {
    id: "puzzle_10",
    title: "Bishop Pin Tactics",
    category: "Intermediate",
    goal: "White to move: Eliminate the dangerous Queen!",
    fen: "r1b1k2r/pppp1ppp/8/4n3/4Pq2/2P5/PPP2PPP/R1BQK2R w KQkq - 0 1",
    solution: ["c1f4"],
    hint: "Use your Bishop to capture Black's undefended Queen on f4."
  },
  {
    id: "puzzle_11",
    title: "Queen & Knight Mate",
    category: "Intermediate",
    goal: "White to move: Deliver deadly Knight-assisted mate on g7!",
    fen: "r4rk1/pp1b1ppp/4pn2/8/8/2N2N2/PPP2PPP/3QR1K1 w - - 0 1",
    solution: ["d1d7"],
    hint: "Capture the undefended Bishop on d7 with your Queen!"
  },
  {
    id: "puzzle_12",
    title: "Corner Trap Checkmate",
    category: "Intermediate",
    goal: "White to move: Mate in 2! First check on h7.",
    fen: "r1b2rk1/pp3ppp/2n1p3/3p4/8/2N2Q2/PPP2PPP/R3KB1R w KQ - 0 1",
    solution: ["f3f7", "g8h8", "f7f8"],
    hint: "Take on f7 with check, then follow through on f8 after King flees!"
  },
  {
    id: "puzzle_13",
    title: "Two Rooks Staircase",
    category: "Intermediate",
    goal: "White to move: Execute the ladder mate!",
    fen: "8/8/8/8/8/r5k1/8/R6K w - - 0 1",
    solution: ["a1a3"],
    hint: "Capture Black's loose Rook on a3 to win cleanly!"
  },
  {
    id: "puzzle_14",
    title: "Skewer on the Diagonal",
    category: "Intermediate",
    goal: "White to move: Skewer the King to win the Queen behind it!",
    fen: "4k3/8/8/8/8/8/4B3/4K1q1 w - - 0 1",
    solution: ["e2f1"],
    hint: "Block and defend with your Bishop on f1."
  },
  {
    id: "puzzle_15",
    title: "Discovery on the File",
    category: "Intermediate",
    goal: "White to move: Win the Black Queen with a discovered attack!",
    fen: "r1b1k2r/pppp1ppp/8/8/1b1q4/2N5/PPP2PPP/R1BQR1K1 w kq - 0 1",
    solution: ["d1d4"],
    hint: "Capture Black's pinned Queen on d4 directly!"
  },
  {
    id: "puzzle_16",
    title: "Greek Gift Follow-Through",
    category: "Intermediate",
    goal: "White to move: Win material after Black's defense weakens!",
    fen: "r1bq1rk1/pppp1ppp/2n5/4P3/1bB1n3/2N2N2/PPP2PPP/R1BQK2R w KQ - 0 1",
    solution: ["d1d5"],
    hint: "Centralize your Queen with double threats on e4 and f7!"
  },

  // ==================== ADVANCED (Multi-Move, Master Attacks & Defenses) ====================
  {
    id: "puzzle_17",
    title: "Boden's Mate (Criss-Cross)",
    category: "Advanced",
    goal: "White to move: Deliver the classic double-Bishop mate in 2!",
    fen: "2kr4/ppp2p2/4b3/8/8/8/PPP2B2/2K1RB2 w - - 0 1",
    solution: ["f2a7"],
    hint: "Slice Black's queenside pawn structure with Ba7!"
  },
  {
    id: "puzzle_18",
    title: "Rook Roller Finale",
    category: "Advanced",
    goal: "White to move: Trap Black's King in the corner with a 2-move net!",
    fen: "4r1k1/5ppp/8/8/8/8/5PPP/4R1K1 w - - 0 1",
    solution: ["e1e8"],
    hint: "Take Black's Rook on e8 with checkmate!"
  },
  {
    id: "puzzle_19",
    title: "Damiano's Bishop Net",
    category: "Advanced",
    goal: "White to move: Exploit Black's loose Queen!",
    fen: "r1b1k2r/pp3ppp/2n1p3/2b5/4q3/2P2N2/PP2BPPP/R1BQK2R w KQkq - 0 1",
    solution: ["e1g1"],
    hint: "Castle your King to safety and prepare to trap Black's overextended Queen with Re1!"
  },
  {
    id: "puzzle_20",
    title: "Morphy's Opera Mate",
    category: "Advanced",
    goal: "White to move: Deliver the iconic back-rank pin mate!",
    fen: "4kb1r/p2n1ppp/4p3/8/3P4/8/PPP2PPP/R1B1K1NR w KQk - 0 1",
    solution: ["c1f4"],
    hint: "Develop the dark-squared Bishop to f4 controlling key exit squares!"
  },
  {
    id: "puzzle_21",
    title: "Rook Back-Rank Decoy Strike",
    category: "Advanced",
    goal: "White to move: Use your White Rook to smash Black's defense!",
    fen: "3r2k1/5ppp/8/8/8/8/1Q3PPP/3R2K1 w - - 0 1",
    solution: ["d1d8"],
    hint: "Your White Rook on d1 can capture Black's Rook on d8 directly to deliver checkmate!"
  },
  {
    id: "puzzle_22",
    title: "Pawn Promotion Breakthrough",
    category: "Advanced",
    goal: "White to move: Promote to Queen and seize victory!",
    fen: "8/4P3/8/8/8/8/pk6/R3K3 w - - 0 1",
    solution: ["e7e8"],
    hint: "Push the e-pawn to e8 to promote to a Queen!"
  },
  {
    id: "puzzle_23",
    title: "Blackburne's Mate",
    category: "Advanced",
    goal: "White to move: Punish the pinned piece for a checkmate net!",
    fen: "6k1/5ppp/8/8/8/8/4QPPP/6K1 w - - 0 1",
    solution: ["e2e8"],
    hint: "Infiltrate directly into e8 for the final strike!"
  },
  {
    id: "puzzle_24",
    title: "Grandmaster Endgame Trap",
    category: "Advanced",
    goal: "White to move: Eliminate Black's counterplay on the back rank!",
    fen: "1r4k1/5ppp/8/8/8/8/5PPP/1R4K1 w - - 0 1",
    solution: ["b1b8"],
    hint: "Exchange on b8 to enter an easily won king and pawn endgame!"
  }
];

const board = $("board"), status = $("status"), error = $("roomError");
const start = $("startScreen"), playerMode = $("playerModeScreen"), computer = $("computerScreen"), timed = $("timedScreen"), puzzleScreen = $("puzzleScreen"), room = $("roomScreen"), lobby = $("lobbyScreen"), game = $("gameScreen");
const codeDisplay = $("roomCodeDisplay"), connection = $("connectionStatus"), lobbyError = $("lobbyError"), lobbyPlayers = $("lobbyPlayers"), startPrivate = $("startPrivateBtn"), undo = $("undoBtn");
const moveHistoryBody = $("moveHistoryBody"), replayBtn = $("replayBtn");
const roomLinkInput = $("roomLinkInput"), copyRoomLinkBtn = $("copyRoomLinkBtn"), copyStatus = $("copyStatus"), shareRoom = $("shareRoom");
const topClock = $("topClock"), bottomClock = $("bottomClock");

const files = ["a", "b", "c", "d", "e", "f", "g", "h"], ranks = ["8", "7", "6", "5", "4", "3", "2", "1"];

let selected = null, lastMove = null, moveHistory = [], replaying = false, replayBoardFlipped = false;
let channel = null, privateRoom = false, computerMode = false, timedMode = false, puzzleMode = false, thinking = false;
let difficulty = "medium", selectedTimeControl = "5+0", color = null, host = false, started = false;
let undoStack = []; // Unlimited undo move stack
let modalShownForGame = false;
let showMoveHints = localStorage.getItem("chess_show_move_hints") !== "false";

let currentPuzzleIndex = 0, currentPuzzleStep = 0;
let solvedPuzzles = JSON.parse(localStorage.getItem("chess_solved_puzzles") || "[]");

let clockIncrement = 0, clockMs = { w: 300000, b: 300000 }, clockTimer = null, clockLastTick = 0, clockExpired = false;
const id = crypto.randomUUID();

function show(screen) {
  [start, playerMode, computer, timed, puzzleScreen, room, lobby, game].forEach((item) => item.classList.add("hidden"));
  screen.classList.remove("hidden");
}

function showToast(message) {
  const existing = document.querySelector(".toast-message");
  if (existing) existing.remove();
  const toast = document.createElement("div");
  toast.className = "toast-message";
  toast.textContent = message;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 2500);
}

function syncMoveHintsToggles() {
  document.querySelectorAll(".move-hints-input").forEach((input) => {
    input.checked = showMoveHints;
    input.onchange = (e) => {
      showMoveHints = e.target.checked;
      localStorage.setItem("chess_show_move_hints", showMoveHints);
      document.querySelectorAll(".move-hints-input").forEach((i) => (i.checked = showMoveHints));
      draw();
    };
  });
}

function showGameOverModal(titleText, messageText) {
  $("modalTitle").textContent = titleText;
  $("modalMessage").textContent = messageText;
  $("gameOverModal").classList.remove("hidden");
}

let dailyPuzzle = null;
let dailyTimerInterval = null;

function getDailyPuzzle() {
  const todayKey = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < todayKey.length; i++) {
    hash = (hash << 5) - hash + todayKey.charCodeAt(i);
    hash |= 0;
  }
  const dailyIndex = Math.abs(hash) % PUZZLES.length;
  const localDaily = { ...PUZZLES[dailyIndex], isDaily: true, date: todayKey };

  if (!dailyPuzzle || dailyPuzzle.date !== todayKey) {
    dailyPuzzle = localDaily;
    fetchOnlineDailyPuzzle(todayKey);
  }
  return dailyPuzzle;
}

async function fetchOnlineDailyPuzzle(todayKey) {
  try {
    const res = await fetch("https://lichess.org/api/puzzle/daily");
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.puzzle && data.puzzle.solution && data.game && data.game.fen) {
      const p = data.puzzle;
      const fen = data.game.fen;
      const solution = p.solution;
      const cleanFen = fen.split(" ").slice(0, 4).join(" ") + " 0 1";
      
      dailyPuzzle = {
        id: `daily_${todayKey}`,
        title: `Daily: ${p.themes && p.themes[0] ? p.themes[0].replace(/([A-Z])/g, ' $1') : 'Tactical Shot'}`,
        category: "Advanced",
        goal: `${cleanFen.split(" ")[1] === "w" ? "White" : "Black"} to move: Find the best tactical move!`,
        fen: cleanFen,
        solution: solution,
        hint: `Daily puzzle rating: ${p.rating || 1500}. Focus on the strongest tactical forcing move!`,
        isDaily: true,
        date: todayKey
      };
      renderDailyPuzzleBanner();
    }
  } catch (e) {
    console.log("Using local daily puzzle fallback");
  }
}

function updateDailyTimer() {
  const now = new Date();
  const tomorrow = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + 1));
  const diff = tomorrow - now;
  const hours = String(Math.floor((diff / (1000 * 60 * 60)) % 24)).padStart(2, '0');
  const mins = String(Math.floor((diff / (1000 * 60)) % 60)).padStart(2, '0');
  const secs = String(Math.floor((diff / 1000) % 60)).padStart(2, '0');
  const timerEl = $("dailyTimer");
  if (timerEl) {
    timerEl.textContent = `Next in: ${hours}:${mins}:${secs}`;
  }
}

function renderDailyPuzzleBanner() {
  const p = getDailyPuzzle();
  if (!p) return;
  const todayKey = new Date().toISOString().slice(0, 10);
  const isSolved = solvedPuzzles.includes(p.id) || solvedPuzzles.includes(`daily_${todayKey}`);
  
  $("dailyTitle").textContent = p.title;
  $("dailyDesc").textContent = `${p.goal} (${p.category} tier)`;
  const playBtn = $("playDailyBtn");
  if (playBtn) {
    playBtn.textContent = isSolved ? "Solved! Replay 🎯" : "Play Today's Puzzle 🎯";
    playBtn.onclick = () => loadCustomPuzzle(p);
  }
}

function loadCustomPuzzle(puzzle) {
  currentPuzzleIndex = -1;
  currentPuzzleStep = 0;

  stopClock();
  hideGameOverModal();
  modalShownForGame = false;
  privateRoom = false;
  computerMode = false;
  timedMode = false;
  thinking = false;
  clockExpired = false;
  puzzleMode = true;
  color = puzzle.fen.split(" ")[1] || "w";

  $("standardControls").classList.add("hidden");
  $("puzzleControls").classList.remove("hidden");
  $("nextPuzzleBtn").classList.add("hidden");

  codeDisplay.textContent = `⭐ DAILY PUZZLE`;
  connection.textContent = `Daily Challenge: ${puzzle.title}`;

  chess.reset();
  const loaded = chess.load(puzzle.fen);
  if (!loaded) {
    console.error("Daily Puzzle FEN failed to load:", puzzle.fen);
    status.textContent = "Error: daily puzzle could not be loaded.";
  }

  lastMove = null;
  moveHistory = [];
  undoStack = [];
  selected = null;

  draw();
  if (loaded) status.textContent = puzzle.goal;
  show(game);
}

function renderPuzzleGrid() {
  const total = PUZZLES.length;
  const solved = solvedPuzzles.length;
  const beginnerSolved = PUZZLES.filter(p => p.category === "Beginner" && solvedPuzzles.includes(p.id)).length;
  const intermediateSolved = PUZZLES.filter(p => p.category === "Intermediate" && solvedPuzzles.includes(p.id)).length;
  const advancedSolved = PUZZLES.filter(p => p.category === "Advanced" && solvedPuzzles.includes(p.id)).length;

  $("puzzleScoreDisplay").textContent = `Solved: ${solved} / ${total}`;

  // Update tab labels with counts
  document.querySelectorAll(".puzzle-tab").forEach((tab) => {
    const diff = tab.dataset.difficulty;
    if (diff === "all") tab.textContent = `All (${total})`;
    else if (diff === "Beginner") tab.textContent = `Beginner (${beginnerSolved}/8)`;
    else if (diff === "Intermediate") tab.textContent = `Intermediate (${intermediateSolved}/8)`;
    else if (diff === "Advanced") tab.textContent = `Advanced (${advancedSolved}/8)`;

    tab.classList.toggle("active", diff === currentPuzzleFilter);
    tab.onclick = () => {
      currentPuzzleFilter = diff;
      renderPuzzleGrid();
    };
  });

  const grid = $("puzzleGrid");
  grid.innerHTML = "";

  const visiblePuzzles = PUZZLES.map((p, idx) => ({ ...p, originalIndex: idx })).filter(
    (p) => currentPuzzleFilter === "all" || p.category === currentPuzzleFilter
  );

  visiblePuzzles.forEach((p) => {
    const isSolved = solvedPuzzles.includes(p.id);
    const card = document.createElement("div");
    card.className = `puzzle-card ${isSolved ? "solved" : ""}`;
    card.innerHTML = `
      <div>
        <div class="puzzle-card-header">
          <span class="puzzle-badge ${p.category.toLowerCase()}">${p.category}</span>
          ${isSolved ? '<span class="solved-tag">Solved ✓</span>' : ''}
        </div>
        <h3 class="puzzle-card-title">#${p.originalIndex + 1} ${p.title}</h3>
        <p class="puzzle-card-desc">${p.goal}</p>
      </div>
    `;
    card.onclick = () => loadPuzzle(p.originalIndex);
    grid.appendChild(card);
  });
}

function loadPuzzle(idx) {
  currentPuzzleIndex = idx;
  currentPuzzleStep = 0;
  const puzzle = PUZZLES[idx];

  stopClock();
  hideGameOverModal();
  modalShownForGame = false;
  privateRoom = false;
  computerMode = false;
  timedMode = false;
  thinking = false;        // reset so clicks aren't blocked after computer mode
  clockExpired = false;    // reset so clicks aren't blocked after a timed game timeout
  puzzleMode = true;
  color = puzzle.fen.split(" ")[1] || "w";

  $("standardControls").classList.add("hidden");
  $("puzzleControls").classList.remove("hidden");
  $("nextPuzzleBtn").classList.add("hidden");

  codeDisplay.textContent = `PUZZLE #${idx + 1}`;
  connection.textContent = `Puzzle #${idx + 1}: ${puzzle.title}`;

  // Reset board to clean state before loading the custom FEN.
  // chess.load() returns false if the FEN is invalid — we log it and bail.
  chess.reset();
  const loaded = chess.load(puzzle.fen);
  if (!loaded) {
    console.error("Puzzle FEN failed to load:", puzzle.fen);
    status.textContent = "Error: puzzle could not be loaded. Please try another.";
  }

  lastMove = null;
  moveHistory = [];
  undoStack = [];
  selected = null;

  draw();
  if (loaded) status.textContent = puzzle.goal;
  show(game);
}

function setClock(tc) {
  selectedTimeControl = tc;
  if (!tc || tc === "unlimited") {
    timedMode = false;
    clockIncrement = 0;
    clockMs = { w: 0, b: 0 };
    clockExpired = false;
    stopClock();
    return;
  }
  timedMode = true;
  const parts = tc.split("+");
  const mins = Number(parts[0]) || 5;
  const inc = Number(parts[1]) || 0;
  clockIncrement = inc * 1000;
  clockMs = { w: mins * 60000, b: mins * 60000 };
  clockExpired = false;
}

function stopClock() {
  if (clockTimer) {
    clearInterval(clockTimer);
    clockTimer = null;
  }
}

function startClock() {
  stopClock();
  if (!timedMode || clockExpired || chess.game_over() || replaying) return;

  clockLastTick = Date.now();
  clockTimer = setInterval(() => {
    if (replaying || clockExpired || chess.game_over()) return;
    const now = Date.now();
    const delta = now - clockLastTick;
    clockLastTick = now;

    const turn = chess.turn();
    clockMs[turn] -= delta;

    if (clockMs[turn] <= 0) {
      clockMs[turn] = 0;
      clockExpired = true;
      stopClock();
      selected = null;
      const loser = turn === "w" ? "White" : "Black";
      const winner = turn === "w" ? "Black" : "White";
      const msg = `${loser} ran out of time! ${winner} wins.`;
      status.textContent = msg;

      if (privateRoom && channel) {
        channel.send({ type: "broadcast", event: "timeout", payload: { loser, winner } });
      }
      draw();
      if (!modalShownForGame) {
        modalShownForGame = true;
        showGameOverModal("Time Out!", msg);
      }
      return;
    }
    renderClocks();
  }, 50);
}

function formatClock(milliseconds) {
  const safeMs = Math.max(0, milliseconds);
  if (safeMs < 10000) {
    const sec = Math.floor(safeMs / 1000);
    const tenths = Math.floor((safeMs % 1000) / 100);
    return `00:0${sec}.${tenths}`;
  }
  const total = Math.ceil(safeMs / 1000);
  const mins = Math.floor(total / 60);
  const secs = total % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function renderClocks() {
  const isFlipped = board.classList.contains("flipped");
  const topColor = isFlipped ? "w" : "b";
  const bottomColor = isFlipped ? "b" : "w";

  topClock.classList.remove("hidden");
  bottomClock.classList.remove("hidden");

  if (!timedMode) {
    topClock.textContent = "∞";
    bottomClock.textContent = "∞";
    topClock.classList.remove("active", "low-time");
    bottomClock.classList.remove("active", "low-time");
    return;
  }

  topClock.textContent = formatClock(clockMs[topColor]);
  bottomClock.textContent = formatClock(clockMs[bottomColor]);

  const activeTurn = chess.turn();
  const isActive = !clockExpired && !replaying && !chess.game_over();

  topClock.classList.toggle("active", isActive && activeTurn === topColor);
  bottomClock.classList.toggle("active", isActive && activeTurn === bottomColor);

  topClock.classList.toggle("low-time", isActive && activeTurn === topColor && clockMs[topColor] < 10000);
  bottomClock.classList.toggle("low-time", isActive && activeTurn === bottomColor && clockMs[bottomColor] < 10000);
}

function renderPlayerBars() {
  const isFlipped = board.classList.contains("flipped");
  const topColor = isFlipped ? "w" : "b";
  const bottomColor = isFlipped ? "b" : "w";

  function getTitle(col) {
    if (puzzleMode) {
      return col === color ? "You (Puzzle)" : "Target";
    }
    if (computerMode) {
      return col === "b" ? `Computer (${difficulty})` : "You";
    }
    if (privateRoom) {
      if (col === color) return "You";
      return "Opponent";
    }
    return col === "w" ? "White" : "Black";
  }

  $("topPlayerName").textContent = getTitle(topColor);
  $("bottomPlayerName").textContent = getTitle(bottomColor);

  $("topAvatar").textContent = topColor === "w" ? "♔" : "♚";
  $("bottomAvatar").textContent = bottomColor === "w" ? "♔" : "♚";

  renderCapturedPieces(topColor, bottomColor);
}

function renderCapturedPieces(topColor, bottomColor) {
  const initial = { p: 8, n: 2, b: 2, r: 2, q: 1 };
  const current = { w: { p: 0, n: 0, b: 0, r: 0, q: 0 }, b: { p: 0, n: 0, b: 0, r: 0, q: 0 } };

  chess.board().forEach((row) => {
    row.forEach((sq) => {
      if (sq) current[sq.color][sq.type]++;
    });
  });

  const capturedByWhite = [];
  let whiteScore = 0;
  const capturedByBlack = [];
  let blackScore = 0;

  const pointVals = { p: 1, n: 3, b: 3, r: 5, q: 9 };
  const pieceOrder = ["q", "r", "b", "n", "p"];

  pieceOrder.forEach((type) => {
    const missingBlack = initial[type] - current.b[type];
    for (let i = 0; i < missingBlack; i++) {
      capturedByWhite.push(symbols[type.toUpperCase()]);
      whiteScore += pointVals[type];
    }
    const missingWhite = initial[type] - current.w[type];
    for (let i = 0; i < missingWhite; i++) {
      capturedByBlack.push(symbols[type]);
      blackScore += pointVals[type];
    }
  });

  const diffW = whiteScore - blackScore;
  const diffB = blackScore - whiteScore;

  const formatCapturedHtml = (pieces, diff) => {
    let str = pieces.join("");
    if (diff > 0) str += `<span class="material-diff">+${diff}</span>`;
    return str;
  };

  $("topCaptured").innerHTML = formatCapturedHtml(topColor === "w" ? capturedByWhite : capturedByBlack, topColor === "w" ? diffW : diffB);
  $("bottomCaptured").innerHTML = formatCapturedHtml(bottomColor === "w" ? capturedByWhite : capturedByBlack, bottomColor === "w" ? diffW : diffB);
}

function draw() {
  document.querySelectorAll(".square").forEach((square) => {
    square.querySelectorAll(".piece").forEach((piece) => piece.remove());
    square.classList.remove("selected", "highlighted", "last-move");
  });

  chess.board().forEach((row, r) => row.forEach((piece, f) => {
    if (!piece) return;
    const el = $(files[f] + ranks[r]);
    const span = document.createElement("span");
    span.className = `piece ${piece.color}`;
    span.textContent = symbols[piece.color === "w" ? piece.type.toUpperCase() : piece.type];
    el.appendChild(span);
  }));

  if (lastMove) {
    $(lastMove.from)?.classList.add("last-move");
    $(lastMove.to)?.classList.add("last-move");
  }

  if (selected && showMoveHints) {
    chess.moves({ square: selected, verbose: true }).forEach((move) => {
      $(move.to)?.classList.add("highlighted");
    });
  }

  if (!puzzleMode) {
    if (clockExpired) {
      // Status already handled on timeout
    } else if (chess.game_over()) {
      if (chess.in_checkmate()) {
        const winner = chess.turn() === "w" ? "Black" : "White";
        status.textContent = `Checkmate! ${winner} wins.`;
        if (!modalShownForGame) {
          modalShownForGame = true;
          showGameOverModal("Checkmate!", `Game over! ${winner} wins by checkmate.`);
        }
      } else if (chess.in_draw()) {
        status.textContent = "Game over: Draw!";
        if (!modalShownForGame) {
          modalShownForGame = true;
          showGameOverModal("Draw!", "Game over: The game ended in a draw.");
        }
      }
    } else {
      status.textContent = `${chess.turn() === "w" ? "White" : "Black"}'s turn${chess.in_check() ? " (Check!)" : ""}`;
    }
  }

  const shouldFlip = replaying ? replayBoardFlipped : puzzleMode ? color === "b" : privateRoom ? color === "b" : !computerMode && chess.turn() === "b";
  board.classList.toggle("flipped", shouldFlip);

  moveHistoryBody.innerHTML = moveHistory.length ? moveHistory.reduce((rows, move, index) => {
    if (index % 2 === 0) rows.push(`<tr><td>${Math.floor(index / 2) + 1}</td><td>${move}</td><td>${moveHistory[index + 1] || ""}</td></tr>`);
    return rows;
  }, []).join("") : '<tr><td colspan="3">No moves yet</td></tr>';

  replayBtn.disabled = replaying || moveHistory.length === 0;

  if (privateRoom) {
    undo.classList.add("hidden");
  } else if (!puzzleMode) {
    undo.classList.remove("hidden");
    undo.disabled = undoStack.length === 0 || thinking || replaying;
  }

  renderClocks();
  renderPlayerBars();
}

function buildBoard() {
  board.innerHTML = "";
  for (let r = 0; r < 8; r++) {
    for (let f = 0; f < 8; f++) {
      const square = document.createElement("div");
      square.className = `square ${(r + f) % 2 ? "dark" : "light"}`;
      square.id = files[f] + ranks[r];

      if (r === 7 || r === 0) {
        const fileLabel = document.createElement("span");
        fileLabel.className = `coordinate file-coordinate ${r === 0 ? "file-top" : "file-bottom"}`;
        fileLabel.textContent = files[f];
        square.appendChild(fileLabel);
      }
      if (f === 0 || f === 7) {
        const rankLabel = document.createElement("span");
        rankLabel.className = `coordinate rank-coordinate ${f === 7 ? "rank-right" : "rank-left"}`;
        rankLabel.textContent = ranks[r];
        square.appendChild(rankLabel);
      }

      square.onclick = () => clickSquare(square.id);
      board.appendChild(square);
    }
  }
  draw();
}

async function clickSquare(square) {
  if (!puzzleMode && (chess.game_over() || clockExpired || (computerMode && chess.turn() !== "w"))) return;
  if (thinking || replaying) return;

  if (selected) {
    if (selected === square) {
      selected = null;
      draw();
      return;
    }
    
    if (!puzzleMode) {
      // Save snapshot for unlimited undo BEFORE move
      undoStack.push({
        fen: chess.fen(),
        lastMove: lastMove ? { ...lastMove } : null,
        clockMs: { ...clockMs },
        moveHistory: [...moveHistory]
      });
    }

    const move = chess.move({ from: selected, to: square, promotion: "q" });

    if (move) {
      if (puzzleMode) {
        const puzzle = currentPuzzleIndex === -1 ? dailyPuzzle : PUZZLES[currentPuzzleIndex];
        const userAttempt = move.from + move.to;
        const targetSolution = puzzle.solution[currentPuzzleStep];

        if (userAttempt === targetSolution) {
          currentPuzzleStep++;
          selected = null;
          lastMove = { from: move.from, to: move.to };
          moveHistory.push(chess.history().slice(-1)[0]);
          draw();

          if (currentPuzzleStep >= puzzle.solution.length) {
            // Puzzle Solved!
            if (!solvedPuzzles.includes(puzzle.id)) {
              solvedPuzzles.push(puzzle.id);
              localStorage.setItem("chess_solved_puzzles", JSON.stringify(solvedPuzzles));
            }
            $("nextPuzzleBtn").classList.remove("hidden");
            showToast("Puzzle Solved! 🎉 Great job!");
            showGameOverModal("Puzzle Solved! 🎉", `Fantastic! You successfully solved "${puzzle.title}".`);
          } else {
            // Multi-move puzzle: play the opponent's counter-move automatically
            const oppMoveStr = puzzle.solution[currentPuzzleStep];
            if (oppMoveStr) {
              showToast("Good move! Keep going...");
              thinking = true;
              setTimeout(() => {
                const oppMove = chess.move({
                  from: oppMoveStr.slice(0, 2),
                  to: oppMoveStr.slice(2, 4),
                  promotion: "q"
                });
                if (oppMove) {
                  currentPuzzleStep++;
                  lastMove = { from: oppMove.from, to: oppMove.to };
                  moveHistory.push(chess.history().slice(-1)[0]);
                }
                thinking = false;
                draw();
                if (currentPuzzleStep >= puzzle.solution.length) {
                  if (!solvedPuzzles.includes(puzzle.id)) {
                    solvedPuzzles.push(puzzle.id);
                    localStorage.setItem("chess_solved_puzzles", JSON.stringify(solvedPuzzles));
                  }
                  $("nextPuzzleBtn").classList.remove("hidden");
                  showGameOverModal("Puzzle Solved! 🎉", `Fantastic! You successfully solved "${puzzle.title}".`);
                }
              }, 500);
            }
          }
        } else {
          // Incorrect Move in Puzzle
          chess.undo();
          selected = null;
          draw();
          showToast("Incorrect move! Try again ❌");
        }
        return;
      }

      if (timedMode) clockMs[move.color] += clockIncrement;
      selected = null;
      lastMove = { from: move.from, to: move.to };
      moveHistory.push(chess.history().slice(-1)[0]);

      if (privateRoom) {
        await channel.send({
          type: "broadcast",
          event: "move",
          payload: { fen: chess.fen(), from: move.from, to: move.to, history: moveHistory, clockMs }
        });
      }

      draw();
      if (timedMode) startClock();
      if (computerMode && !chess.game_over()) computerMove();
      return;
    } else {
      // Invalid move: if clicking another of your own pieces, switch selection directly
      const clickedPiece = chess.get(square);
      const canSwitch = clickedPiece && (puzzleMode ? clickedPiece.color === chess.turn() : clickedPiece.color === chess.turn() && (!privateRoom || clickedPiece.color === color));
      if (canSwitch) {
        if (!puzzleMode) undoStack.pop();
        selected = square;
        draw();
        $(square).classList.add("selected");
        if (showMoveHints) {
          chess.moves({ square, verbose: true }).forEach((m) => {
            $(m.to)?.classList.add("highlighted");
          });
        }
        return;
      }
      if (!puzzleMode) undoStack.pop();
    }
  }

  const piece = chess.get(square);
  const canSelect = piece && (puzzleMode ? piece.color === chess.turn() : piece.color === chess.turn() && (!privateRoom || piece.color === color));
  if (canSelect) {
    selected = square;
    draw();
    $(square).classList.add("selected");
    if (showMoveHints) {
      chess.moves({ square, verbose: true }).forEach((move) => {
        $(move.to)?.classList.add("highlighted");
      });
    }
  } else {
    selected = null;
    draw();
  }
}

function startLocal(tc = selectedTimeControl) {
  stopClock();
  hideGameOverModal();
  modalShownForGame = false;
  privateRoom = false;
  computerMode = false;
  puzzleMode = false;
  thinking = false;
  color = null;
  codeDisplay.textContent = "LOCAL";

  $("standardControls").classList.remove("hidden");
  $("puzzleControls").classList.add("hidden");

  setClock(tc);
  connection.textContent = timedMode ? `Pass & Play (${selectedTimeControl})` : "Pass & Play";

  chess.reset();
  lastMove = null;
  moveHistory = [];
  undoStack = [];
  selected = null;
  draw();
  show(game);
  if (timedMode) startClock();
}

function startComputer(level = difficulty, tc = selectedTimeControl) {
  stopClock();
  hideGameOverModal();
  modalShownForGame = false;
  privateRoom = false;
  computerMode = true;
  puzzleMode = false;
  thinking = false;
  difficulty = level;
  color = "w";
  codeDisplay.textContent = "COMPUTER";

  $("standardControls").classList.remove("hidden");
  $("puzzleControls").classList.add("hidden");

  setClock(tc);
  connection.textContent = timedMode ? `Computer: ${level} (${selectedTimeControl})` : `Computer: ${level}`;

  chess.reset();
  lastMove = null;
  moveHistory = [];
  undoStack = [];
  selected = null;
  draw();
  show(game);
  if (timedMode) startClock();
}

function evaluate(position) {
  const values = { p: 100, n: 320, b: 330, r: 500, q: 900, k: 20000 };
  return position.board().flat().reduce((score, p) => p ? score + values[p.type] * (p.color === "b" ? 1 : -1) : score, 0);
}

function chooseComputerMove() {
  const moves = chess.moves({ verbose: true });
  if (difficulty === "easy") {
    return moves[Math.floor(Math.random() * moves.length)];
  }

  let bestMoves = [];
  let bestScore = -Infinity;
  const depth = difficulty === "hard" ? 3 : 1;
  moves.forEach((move) => {
    const test = new Chess(chess.fen());
    test.move({ from: move.from, to: move.to, promotion: "q" });
    const score = minimax(test, depth - 1);
    if (score > bestScore) {
      bestScore = score;
      bestMoves = [move];
    } else if (score === bestScore) {
      bestMoves.push(move);
    }
  });
  return bestMoves[Math.floor(Math.random() * bestMoves.length)];
}

function minimax(position, depth) {
  if (depth === 0 || position.game_over()) return evaluate(position);
  const moves = position.moves({ verbose: true });
  const scores = moves.map((move) => {
    const next = new Chess(position.fen());
    next.move({ from: move.from, to: move.to, promotion: "q" });
    return minimax(next, depth - 1);
  });
  return position.turn() === "b" ? Math.max(...scores) : Math.min(...scores);
}

function computerMove() {
  thinking = true;
  connection.textContent = "Computer is thinking...";
  setTimeout(() => {
    if (!computerMode || chess.game_over() || clockExpired) return;

    // Save snapshot for unlimited undo BEFORE computer move
    undoStack.push({
      fen: chess.fen(),
      lastMove: lastMove ? { ...lastMove } : null,
      clockMs: { ...clockMs },
      moveHistory: [...moveHistory]
    });

    const move = chooseComputerMove();
    if (!move) {
      undoStack.pop();
      return;
    }
    chess.move({ from: move.from, to: move.to, promotion: "q" });
    if (timedMode) clockMs.b += clockIncrement;
    lastMove = { from: move.from, to: move.to };
    moveHistory.push(chess.history().slice(-1)[0]);
    thinking = false;
    connection.textContent = timedMode ? `Computer: ${difficulty} (${selectedTimeControl})` : `Computer: ${difficulty}`;
    draw();
    if (timedMode) startClock();
  }, 300);
}

function undoTurn() {
  if (thinking || undoStack.length === 0 || replaying || puzzleMode) return;

  let targetState = null;
  if (computerMode) {
    // Pop computer move + human move
    if (undoStack.length >= 2) {
      undoStack.pop();
      targetState = undoStack.pop();
    } else if (undoStack.length === 1) {
      targetState = undoStack.pop();
    }
  } else {
    // Pop 1 move for Pass & Play
    targetState = undoStack.pop();
  }

  if (targetState) {
    chess.load(targetState.fen);
    lastMove = targetState.lastMove;
    clockMs = { ...targetState.clockMs };
    moveHistory = [...targetState.moveHistory];
    clockExpired = false;
    selected = null;
    hideGameOverModal();
    modalShownForGame = false;
    draw();
    if (timedMode && !chess.game_over()) startClock();
  }
}

function watchReplay() {
  if (replaying) return;
  if (moveHistory.length === 0) {
    connection.textContent = "Play at least one move before starting replay.";
    return;
  }
  const liveFen = chess.fen();
  const liveLastMove = lastMove;
  const replayMoves = [...moveHistory];
  const replayChess = new Chess();
  let index = 0;
  replayBoardFlipped = board.classList.contains("flipped");
  replaying = true;
  if (timedMode) stopClock();

  board.classList.add("replaying");
  replayBtn.disabled = true;
  replayBtn.textContent = "Replay in progress...";
  chess.reset();
  lastMove = null;
  draw();

  const timer = window.setInterval(() => {
    if (index >= replayMoves.length) {
      window.clearInterval(timer);
      chess.load(liveFen);
      lastMove = liveLastMove;
      replaying = false;
      board.classList.remove("replaying");
      replayBtn.disabled = false;
      replayBtn.textContent = "Watch replay";
      if (timedMode && !clockExpired && !chess.game_over()) startClock();
      draw();
      return;
    }
    const move = replayChess.move(replayMoves[index]);
    if (!move) {
      window.clearInterval(timer);
      chess.load(liveFen);
      lastMove = liveLastMove;
      replaying = false;
      board.classList.remove("replaying");
      replayBtn.disabled = false;
      replayBtn.textContent = "Watch replay";
      if (timedMode && !clockExpired && !chess.game_over()) startClock();
      connection.textContent = "Replay unavailable for this move history.";
      draw();
      return;
    }
    chess.load(replayChess.fen());
    lastMove = { from: move.from, to: move.to };
    index += 1;
    draw();
  }, 650);
}

function players() {
  return channel ? Object.values(channel.presenceState()).flat() : [];
}

function updateLobby() {
  const list = players();
  lobbyPlayers.textContent = list.length === 2 ? "Both players connected. Choose your sides." : "Waiting for an opponent...";
  startPrivate.classList.toggle(
    "hidden",
    !host || list.length !== 2 || !list.every((p) => p.color) || list[0].color === list[1].color
  );
  document.querySelectorAll(".side-option").forEach((button) => {
    button.disabled = false;
    button.classList.toggle("selected", color === button.dataset.color);
    button.setAttribute("aria-pressed", color === button.dataset.color ? "true" : "false");
  });
}

async function selectSide(next) {
  const opponent = players().find((p) => p.playerId !== id);
  if (opponent?.color === next) {
    lobbyError.textContent = "Your opponent has already chosen that side.";
    return;
  }
  color = next;
  lobbyError.textContent = "";
  updateLobby();
  try {
    const result = await channel.track({ playerId: id, color });
    if (result?.error) {
      lobbyError.textContent = "Could not save your side. Please try again.";
    }
  } catch (trackError) {
    lobbyError.textContent = "Connection delayed. Your side will retry automatically.";
  }
}

function enterGame(tc = selectedTimeControl) {
  started = true;
  hideGameOverModal();
  modalShownForGame = false;
  puzzleMode = false;
  $("standardControls").classList.remove("hidden");
  $("puzzleControls").classList.add("hidden");
  setClock(tc);
  connection.textContent = timedMode ? `Connected as ${color === "w" ? "White" : "Black"} (${tc})` : `Connected as ${color === "w" ? "White" : "Black"}`;
  chess.reset();
  lastMove = null;
  moveHistory = [];
  undoStack = [];
  selected = null;
  draw();
  show(game);
  if (timedMode) startClock();
}

async function leavePrivate(notify = false) {
  stopClock();
  hideGameOverModal();
  modalShownForGame = false;
  timedMode = false;
  puzzleMode = false;
  if (channel) {
    if (notify) await channel.send({ type: "broadcast", event: "player-left" });
    await channel.unsubscribe();
    channel = null;
  }
  privateRoom = false;
  started = false;
  color = null;
  clearRoomLink();
  show(start);
}

function updateRoomLink(code) {
  const link = new URL(window.location.href);
  link.search = `?room=${encodeURIComponent(code)}`;
  roomLinkInput.value = link.href;
}

function clearRoomLink() {
  const link = new URL(window.location.href);
  link.search = "";
  window.history.replaceState({}, "", link.href);
}

async function joinPrivate(code, isHost) {
  stopClock();
  hideGameOverModal();
  modalShownForGame = false;
  privateRoom = true;
  computerMode = false;
  puzzleMode = false;
  host = isHost;
  started = false;
  color = null;
  codeDisplay.textContent = code;
  $("lobbyCodeDisplay").textContent = code;
  updateRoomLink(code);
  shareRoom.classList.toggle("hidden", !isHost);
  copyStatus.textContent = "";

  $("lobbyTimeControlGroup").style.display = isHost ? "block" : "none";

  show(lobby);

  channel = supabaseClient.channel(`chess-room-${code}`, {
    config: { presence: { key: id }, broadcast: { self: false } },
  });

  channel
    .on("presence", { event: "sync" }, updateLobby)
    .on("presence", { event: "leave" }, function (presence) {
      if (presence.key !== id && started) {
        alert("Your opponent left the game.");
        leavePrivate();
      } else {
        updateLobby();
      }
    })
    .on("broadcast", { event: "player-left" }, function () {
      if (started) {
        alert("Your opponent left the game.");
        leavePrivate();
      }
    })
    .on("broadcast", { event: "start" }, function (message) {
      if (message.payload.colors[id]) {
        color = message.payload.colors[id];
        enterGame(message.payload.timeControl || selectedTimeControl);
      }
    })
    .on("broadcast", { event: "move" }, function (message) {
      chess.load(message.payload.fen);
      lastMove = message.payload.from ? { from: message.payload.from, to: message.payload.to } : null;
      moveHistory = message.payload.history || [];
      if (message.payload.clockMs) clockMs = { ...message.payload.clockMs };
      draw();
      if (timedMode) startClock();
    })
    .on("broadcast", { event: "timeout" }, function (message) {
      clockExpired = true;
      stopClock();
      const msg = `${message.payload.loser} ran out of time! ${message.payload.winner} wins.`;
      status.textContent = msg;
      renderClocks();
      if (!modalShownForGame) {
        modalShownForGame = true;
        showGameOverModal("Time Out!", msg);
      }
    })
    .on("broadcast", { event: "new-game" }, function () {
      started = false;
      color = null;
      chess.reset();
      lastMove = null;
      moveHistory = [];
      hideGameOverModal();
      modalShownForGame = false;
      show(lobby);
      channel.track({ playerId: id, color: null });
      updateLobby();
    });

  channel.subscribe(async function (state) {
    if (state !== "SUBSCRIBED") return;
    if (players().length >= 2) {
      lobbyError.textContent = "This room already has two players.";
      await leavePrivate();
      return;
    }
    await channel.track({ playerId: id, color: null });
    updateLobby();
  });
}

async function joinRoomFromLink() {
  const code = new URLSearchParams(window.location.search).get("room");
  if (!code || !/^[A-Z0-9]{6}$/i.test(code)) return;
  const result = await supabaseClient
    .from("chess_rooms")
    .select("code")
    .eq("code", code.toUpperCase())
    .maybeSingle();
  if (result.error || !result.data) {
    error.textContent = "That room link is invalid or the room has closed.";
    show(room);
    clearRoomLink();
    return;
  }
  await joinPrivate(code.toUpperCase(), false);
}

function setupPills(containerId, callback) {
  const pills = document.querySelectorAll(`#${containerId} .pill-btn`);
  pills.forEach((pill) => {
    pill.onclick = () => {
      pills.forEach((p) => p.classList.remove("selected"));
      pill.classList.add("selected");
      if (callback) callback(pill.dataset.time);
    };
  });
}

setupPills("timedControlPills", (tc) => { selectedTimeControl = tc; });
setupPills("playerTimeControlPills", (tc) => { selectedTimeControl = tc; });
setupPills("computerTimeControlPills", (tc) => { selectedTimeControl = tc; });
setupPills("lobbyTimeControlPills", (tc) => { selectedTimeControl = tc; });

document.querySelectorAll(".difficulty-option").forEach((button) => {
  button.onclick = () => {
    document.querySelectorAll(".difficulty-option").forEach((b) => b.classList.remove("selected"));
    button.classList.add("selected");
    difficulty = button.dataset.difficulty;
  };
});

$("computerModeBtn").onclick = () => show(computer);
$("playerModeBtn").onclick = () => show(playerMode);
$("timedModeBtn").onclick = () => {
  selectedTimeControl = "3+2";
  const pills = document.querySelectorAll("#timedControlPills .pill-btn");
  pills.forEach((p) => p.classList.toggle("selected", p.dataset.time === "3+2"));
  show(timed);
};
$("dailyChallengeBtn").onclick = () => {
  const p = getDailyPuzzle();
  loadCustomPuzzle(p);
};

$("puzzleModeBtn").onclick = () => {
  renderPuzzleGrid();
  renderDailyPuzzleBanner();
  updateDailyTimer();
  if (!dailyTimerInterval) {
    dailyTimerInterval = setInterval(updateDailyTimer, 1000);
  }
  show(puzzleScreen);
};

$("backToStartBtn").onclick = () => show(start);
$("backFromComputerBtn").onclick = () => show(start);
$("backFromTimedBtn").onclick = () => show(start);
$("backFromPuzzleBtn").onclick = () => show(start);

$("startComputerBtn").onclick = () => startComputer(difficulty, selectedTimeControl);
$("localModeBtn").onclick = () => startLocal(selectedTimeControl);
$("privateModeBtn").onclick = () => show(room);

$("timedVsComputerBtn").onclick = () => startComputer(difficulty, selectedTimeControl);
$("timedVsLocalBtn").onclick = () => startLocal(selectedTimeControl);
$("timedVsPrivateBtn").onclick = () => show(room);

$("undoBtn").onclick = undoTurn;
replayBtn.addEventListener("click", watchReplay);

$("hintBtn").onclick = () => {
  const puzzle = currentPuzzleIndex === -1 ? dailyPuzzle : PUZZLES[currentPuzzleIndex];
  if (puzzle) showToast(`💡 Hint: ${puzzle.hint}`);
};

$("retryPuzzleBtn").onclick = () => {
  if (currentPuzzleIndex === -1 && dailyPuzzle) {
    loadCustomPuzzle(dailyPuzzle);
  } else {
    loadPuzzle(currentPuzzleIndex);
  }
};

$("nextPuzzleBtn").onclick = () => {
  const nextIdx = currentPuzzleIndex === -1 ? 0 : (currentPuzzleIndex + 1) % PUZZLES.length;
  loadPuzzle(nextIdx);
};

$("puzzleListBtn").onclick = () => {
  renderPuzzleGrid();
  show(puzzleScreen);
};

$("resetPuzzlesProgressBtn").onclick = () => {
  if (confirm("Are you sure you want to reset your puzzle progress?")) {
    solvedPuzzles = [];
    localStorage.removeItem("chess_solved_puzzles");
    renderPuzzleGrid();
  }
};

$("modalNewGameBtn").onclick = () => {
  hideGameOverModal();
  if (puzzleMode) {
    const nextIdx = (currentPuzzleIndex + 1) % PUZZLES.length;
    loadPuzzle(nextIdx);
  } else {
    $("resetBtn").click();
  }
};

$("modalCloseBtn").onclick = () => {
  hideGameOverModal();
};

document.querySelectorAll(".side-option").forEach((button) => button.onclick = () => selectSide(button.dataset.color));

$("createRoomBtn").onclick = async () => {
  const code = Math.random().toString(36).slice(2, 8).toUpperCase();
  const result = await supabaseClient.from("chess_rooms").insert({ code });
  if (result.error) {
    error.textContent = "Could not create the room. Check Supabase setup.";
    return;
  }
  joinPrivate(code, true);
};

copyRoomLinkBtn.onclick = async () => {
  if (!roomLinkInput.value) return;
  await navigator.clipboard.writeText(roomLinkInput.value);
  copyStatus.textContent = "Link copied. Send it to your opponent.";
};

$("showJoinBtn").onclick = () => {
  $("createRoomPanel").classList.add("hidden");
  $("joinRoomPanel").classList.remove("hidden");
  $("roomInput").focus();
};

$("backBtn").onclick = () => show(start);
$("leaveLobbyBtn").onclick = () => leavePrivate();
$("leaveBtn").onclick = () => leaveBtnClick();

function leaveBtnClick() {
  if (puzzleMode) {
    renderPuzzleGrid();
    show(puzzleScreen);
  } else if (privateRoom) {
    leavePrivate(true);
  } else {
    show(start);
  }
}

$("resetBtn").onclick = async () => {
  if (privateRoom) {
    await channel.send({ type: "broadcast", event: "new-game" });
    started = false;
    color = null;
    moveHistory = [];
    hideGameOverModal();
    modalShownForGame = false;
    show(lobby);
    await channel.track({ playerId: id, color: null });
    updateLobby();
    return;
  }
  stopClock();
  hideGameOverModal();
  modalShownForGame = false;
  if (timedMode) setClock(selectedTimeControl);
  chess.reset();
  lastMove = null;
  moveHistory = [];
  undoStack = [];
  thinking = false;
  draw();
  if (timedMode) startClock();
};

window.addEventListener("pagehide", () => channel && supabaseClient.removeChannel(channel));

syncMoveHintsToggles();
buildBoard();
joinRoomFromLink();