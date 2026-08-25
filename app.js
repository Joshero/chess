const SUPABASE_URL = "https://yaauwnvcjjetdybeixfr.supabase.co";
const SUPABASE_KEY = "sb_publishable_POH2JdWG0JMCzEkt9lhrPg_SmLG0Y1I";
const supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
const symbols = { p:"♟",r:"♜",n:"♞",b:"♝",q:"♛",k:"♚",P:"♙",R:"♖",N:"♘",B:"♗",Q:"♕",K:"♔" };
const chess = new Chess();
const $ = (id) => document.getElementById(id);
const board = $("board"), status = $("status"), error = $("roomError");
const start = $("startScreen"), playerMode = $("playerModeScreen"), computer = $("computerScreen"), timed = $("timedScreen"), room = $("roomScreen"), lobby = $("lobbyScreen"), game = $("gameScreen");
const codeDisplay = $("roomCodeDisplay"), connection = $("connectionStatus"), lobbyError = $("lobbyError"), lobbyPlayers = $("lobbyPlayers"), startPrivate = $("startPrivateBtn"), undo = $("undoBtn");
const moveHistoryBody = $("moveHistoryBody"), replayBtn = $("replayBtn");
const roomLinkInput = $("roomLinkInput"), copyRoomLinkBtn = $("copyRoomLinkBtn"), copyStatus = $("copyStatus"), shareRoom = $("shareRoom");
const clocks = $("clocks"), whiteClock = $("whiteClock"), blackClock = $("blackClock");
const files = ["a","b","c","d","e","f","g","h"], ranks = ["8","7","6","5","4","3","2","1"];
let selected = null, lastMove = null, moveHistory = [], replaying = false, replayBoardFlipped = false, channel = null, privateRoom = false, computerMode = false, timedMode = false, thinking = false, difficulty = "medium", timeControl = "5+0", color = null, host = false, started = false, undoState = null, clockIncrement = 0, clockMs = { w: 300000, b: 300000 }, clockTimer = null, clockLastTick = 0, clockExpired = false;
const id = crypto.randomUUID();

function show(screen) { [start, playerMode, computer, timed, room, lobby, game].forEach((item) => item.classList.add("hidden")); screen.classList.remove("hidden"); }
function draw() {
  document.querySelectorAll(".square").forEach((square) => { square.querySelectorAll(".piece").forEach((piece) => piece.remove()); square.classList.remove("selected","highlighted","last-move"); });
  chess.board().forEach((row, r) => row.forEach((piece, f) => { if (!piece) return; const el = $(files[f] + ranks[r]); const span = document.createElement("span"); span.className = `piece ${piece.color}`; span.textContent = symbols[piece.color === "w" ? piece.type.toUpperCase() : piece.type]; el.appendChild(span); }));
  if (lastMove) { $(lastMove.from)?.classList.add("last-move"); $(lastMove.to)?.classList.add("last-move"); }
  status.textContent = chess.game_over() ? (chess.in_checkmate() ? "Checkmate! Game over." : "Game over: Draw!") : `${chess.turn() === "w" ? "White" : "Black"}'s turn${chess.in_check() ? " (Check!)" : ""}`;
  const shouldFlip = replaying ? replayBoardFlipped : privateRoom ? color === "b" : !computerMode && chess.turn() === "b";
  board.classList.toggle("flipped", shouldFlip);
  moveHistoryBody.innerHTML = moveHistory.length ? moveHistory.reduce((rows, move, index) => {
    if (index % 2 === 0) rows.push(`<tr><td>${Math.floor(index / 2) + 1}</td><td>${move}</td><td>${moveHistory[index + 1] || ""}</td></tr>`);
    return rows;
  }, []).join("") : '<tr><td colspan="3">No moves yet</td></tr>';
  replayBtn.disabled = replaying || moveHistory.length === 0;
  renderClocks();
}
function formatClock(milliseconds) { const total = Math.max(0, Math.ceil(milliseconds / 1000)); return `${String(Math.floor(total / 60)).padStart(2, "0")}:${String(total % 60).padStart(2, "0")}`; }
function renderClocks() { whiteClock.textContent = formatClock(clockMs.w); blackClock.textContent = formatClock(clockMs.b); whiteClock.classList.toggle("active", timedMode && chess.turn() === "w" && !clockExpired && !replaying); blackClock.classList.toggle("active", timedMode && chess.turn() === "b" && !clockExpired && !replaying); }
function stopClock() { if (clockTimer) { clearInterval(clockTimer); clockTimer = null; } }
function startClock() { stopClock(); clockLastTick = Date.now(); clockTimer = setInterval(() => { if (replaying || clockExpired || chess.game_over()) return; const now = Date.now(); clockMs[chess.turn()] -= now - clockLastTick; clockLastTick = now; if (clockMs[chess.turn()] <= 0) { clockMs[chess.turn()] = 0; clockExpired = true; stopClock(); status.textContent = `${chess.turn() === "w" ? "White" : "Black"} ran out of time. Game over.`; } renderClocks(); }, 100); }
function setClock(timeControl) { const parts = timeControl.split("+"); clockIncrement = Number(parts[1]) * 1000; clockMs = { w: Number(parts[0]) * 60000, b: Number(parts[0]) * 60000 }; clockExpired = false; }
function buildBoard() { board.innerHTML = ""; for (let r=0;r<8;r++) for (let f=0;f<8;f++) { const square = document.createElement("div"); square.className = `square ${(r+f)%2 ? "dark" : "light"}`; square.id = files[f]+ranks[r]; if (r === 7 || r === 0) { const fileLabel = document.createElement("span"); fileLabel.className = `coordinate file-coordinate ${r === 0 ? "file-top" : "file-bottom"}`; fileLabel.textContent = files[f]; square.appendChild(fileLabel); } if (f === 0 || f === 7) { const rankLabel = document.createElement("span"); rankLabel.className = `coordinate rank-coordinate ${f === 7 ? "rank-right" : "rank-left"}`; rankLabel.textContent = ranks[r]; square.appendChild(rankLabel); } square.onclick = () => clickSquare(square.id); board.appendChild(square); } draw(); }
async function clickSquare(square) {
  if (chess.game_over() || thinking || replaying || clockExpired || (computerMode && chess.turn() !== "w")) return;
  if (selected) {
    if (selected === square) { selected = null; draw(); return; }
    const previous = computerMode ? { fen: chess.fen(), lastMove } : null;
    const move = chess.move({ from: selected, to: square, promotion: "q" });
    if (move) { if (timedMode) clockMs[move.color] += clockIncrement; selected = null; lastMove = { from: move.from, to: move.to }; moveHistory.push(chess.history().slice(-1)[0]); if (computerMode) undoState = previous; if (privateRoom) await channel.send({ type:"broadcast", event:"move", payload:{ fen:chess.fen(), from:move.from, to:move.to, history:moveHistory } }); draw(); if (timedMode) startClock(); if (computerMode && !chess.game_over()) computerMove(); return; }
  }
  const piece = chess.get(square);
  if (piece && piece.color === chess.turn() && (!privateRoom || piece.color === color)) { selected = square; draw(); $(square).classList.add("selected"); chess.moves({ square, verbose:true }).forEach((move) => $(move.to).classList.add("highlighted")); } else { selected = null; draw(); }
}
function startLocal() { stopClock(); timedMode=false; clocks.classList.add("hidden"); privateRoom=false; computerMode=false; thinking=false; color=null; undo.classList.add("hidden"); codeDisplay.textContent="LOCAL"; connection.textContent="Pass & Play"; chess.reset(); lastMove=null; moveHistory=[]; selected=null; draw(); show(game); }
function startTimed(selectedTimeControl) { stopClock(); timedMode=true; timeControl=selectedTimeControl; clocks.classList.remove("hidden"); privateRoom=false; computerMode=false; thinking=false; color=null; undo.classList.add("hidden"); codeDisplay.textContent="TIMED"; connection.textContent=`Time control: ${timeControl}`; setClock(timeControl); chess.reset(); lastMove=null; moveHistory=[]; selected=null; draw(); show(game); startClock(); }
function startComputer(level) { stopClock(); timedMode=false; clocks.classList.add("hidden"); privateRoom=false; computerMode=true; thinking=false; difficulty=level; color="w"; undo.classList.remove("hidden"); codeDisplay.textContent="COMPUTER"; connection.textContent=`Computer: ${level}`; chess.reset(); lastMove=null; moveHistory=[]; undoState=null; selected=null; draw(); show(game); }
function evaluate(position) { const values={p:100,n:320,b:330,r:500,q:900,k:20000}; return position.board().flat().reduce((score,p) => p ? score + values[p.type]*(p.color === "b" ? 1 : -1) : score, 0); }
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
function computerMove() { thinking=true; connection.textContent="Computer is thinking..."; setTimeout(() => { if (!computerMode || chess.game_over()) return; const move=chooseComputerMove(); chess.move({from:move.from,to:move.to,promotion:"q"}); lastMove={from:move.from,to:move.to}; moveHistory.push(chess.history().slice(-1)[0]); thinking=false; connection.textContent=`Computer: ${difficulty}`; draw(); }, 300); }
function undoComputerTurn() { if (!undoState || thinking) return; chess.load(undoState.fen); lastMove=undoState.lastMove; moveHistory=moveHistory.slice(0, -2); undoState=null; selected=null; draw(); }
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
function players() { return Object.values(channel.presenceState()).flat(); }
function updateLobby() { const list=players(); lobbyPlayers.textContent=list.length===2?"Both players connected. Choose your sides.":"Waiting for an opponent..."; startPrivate.classList.toggle("hidden",!host || list.length!==2 || !list.every((p)=>p.color) || list[0].color===list[1].color); document.querySelectorAll(".side-option").forEach((button)=>{ button.disabled=false; button.classList.toggle("selected",color===button.dataset.color); button.setAttribute("aria-pressed",color===button.dataset.color?"true":"false"); }); }
async function selectSide(next) { const opponent=players().find((p)=>p.playerId!==id); if(opponent?.color===next){lobbyError.textContent="Your opponent has already chosen that side.";return;} color=next; lobbyError.textContent=""; updateLobby(); try { const result=await channel.track({playerId:id,color}); if(result?.error){lobbyError.textContent="Could not save your side. Please try again.";} } catch (trackError) { lobbyError.textContent="Connection delayed. Your side will retry automatically."; } }
function enterGame() { started=true; connection.textContent=`Connected as ${color === "w" ? "White" : "Black"}`; chess.reset(); lastMove=null; moveHistory=[]; selected=null; draw(); show(game); }
async function leavePrivate(notify=false) { stopClock(); timedMode=false; clocks.classList.add("hidden"); if(channel){if(notify) await channel.send({type:"broadcast",event:"player-left"}); await channel.unsubscribe();channel=null;} privateRoom=false;started=false;color=null;clearRoomLink();show(start); }
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
  timedMode = false;
  clocks.classList.add("hidden");
  privateRoom = true;
  computerMode = false;
  host = isHost;
  started = false;
  color = null;
  codeDisplay.textContent = code;
  $("lobbyCodeDisplay").textContent = code;
  updateRoomLink(code);
  shareRoom.classList.toggle("hidden", !isHost);
  copyStatus.textContent = "";
  $("undoBtn").classList.add("hidden");
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
        enterGame();
      }
    })
    .on("broadcast", { event: "move" }, function (message) {
      chess.load(message.payload.fen);
      lastMove = message.payload.from
        ? { from: message.payload.from, to: message.payload.to }
        : null;
      moveHistory = message.payload.history || [];
      draw();
    })
    .on("broadcast", { event: "new-game" }, function () {
      started = false;
      color = null;
      chess.reset();
      lastMove = null;
      moveHistory = [];
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

$("computerModeBtn").onclick=()=>show(computer); $("playerModeBtn").onclick=()=>show(playerMode); $("timedModeBtn").onclick=()=>show(timed); $("backToStartBtn").onclick=()=>show(start); $("backFromComputerBtn").onclick=()=>show(start); $("backFromTimedBtn").onclick=()=>show(start); $("localModeBtn").onclick=startLocal; $("privateModeBtn").onclick=()=>show(room); $("undoBtn").onclick=undoComputerTurn;
document.querySelectorAll("[data-time]").forEach((button)=>button.onclick=()=>startTimed(button.dataset.time));
replayBtn.addEventListener("click", watchReplay);
document.querySelectorAll(".difficulty-option").forEach((button)=>button.onclick=()=>startComputer(button.dataset.difficulty));
document.querySelectorAll(".side-option").forEach((button)=>button.onclick=()=>selectSide(button.dataset.color));
$("createRoomBtn").onclick=async()=>{const code=Math.random().toString(36).slice(2,8).toUpperCase();const result=await supabaseClient.from("chess_rooms").insert({code});if(result.error){error.textContent="Could not create the room. Check Supabase setup.";return;}joinPrivate(code,true);};
copyRoomLinkBtn.onclick = async () => { if (!roomLinkInput.value) return; await navigator.clipboard.writeText(roomLinkInput.value); copyStatus.textContent = "Link copied. Send it to your opponent."; };
$("showJoinBtn").onclick=()=>{$("createRoomPanel").classList.add("hidden");$("joinRoomPanel").classList.remove("hidden");$("roomInput").focus();}; $("backBtn").onclick=()=>show(start); $("leaveLobbyBtn").onclick=()=>leavePrivate(); $("leaveBtn").onclick=()=>leavePrivate(true); $("startPrivateBtn").onclick=async()=>{const list=players();const colors=Object.fromEntries(list.map((p)=>[p.playerId,p.color]));await channel.send({type:"broadcast",event:"start",payload:{colors}});enterGame();};
$("joinRoomPanel").onsubmit=async(e)=>{e.preventDefault();const code=$("roomInput").value.trim().toUpperCase();const result=await supabaseClient.from("chess_rooms").select("code").eq("code",code).maybeSingle();if(result.error||!result.data){error.textContent="That room does not exist.";return;}joinPrivate(code,false);}; $("resetBtn").onclick=async()=>{if(privateRoom){await channel.send({type:"broadcast",event:"new-game"});started=false;color=null;moveHistory=[];show(lobby);await channel.track({playerId:id,color:null});updateLobby();return;}stopClock();if(timedMode)setClock(timeControl);chess.reset();lastMove=null;moveHistory=[];undoState=null;thinking=false;draw();if(timedMode)startClock();}; window.addEventListener("pagehide",()=>channel&&supabaseClient.removeChannel(channel)); buildBoard(); joinRoomFromLink();