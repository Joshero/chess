import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
import { Chess } from "npm:chess.js@1.0.0";

const LICHESS_DAILY_API = "https://lichess.org/api/puzzle/daily";
const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

type LichessDaily = {
  game?: {
    fen?: string;
    pgn?: string;
  };
  puzzle?: {
    id?: string;
    rating?: number;
    solution?: string[];
    themes?: string[];
  };
};

function getInitialFen(data: LichessDaily) {
  if (data.game?.fen) return data.game.fen;
  if (!data.game?.pgn) return null;

  const chess = new Chess();
  chess.loadPgn(data.game.pgn, { strict: false });
  return chess.fen();
}

function buildPlayerPosition(initialFen: string, solution: string[]) {
  const chess = new Chess(initialFen);
  let playerFen = initialFen;
  let playerSolution = solution;

  if (solution.length > 1) {
    const setupMove = solution[0];
    const move = chess.move({
      from: setupMove.slice(0, 2),
      to: setupMove.slice(2, 4),
      promotion: setupMove[4] || "q",
    });

    if (move) {
      playerFen = chess.fen();
      playerSolution = solution.slice(1);
    }
  }

  const cleanFen = `${playerFen.split(" ").slice(0, 4).join(" ")} 0 1`;
  return { cleanFen, playerSolution };
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return Response.json(
      { error: "Method not allowed" },
      { status: 405, headers: corsHeaders },
    );
  }

  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    return Response.json(
      { error: "Missing Supabase service configuration" },
      { status: 500, headers: corsHeaders },
    );
  }

  const todayKey = new Date().toISOString().slice(0, 10);
  const supabase = createClient(supabaseUrl, serviceRoleKey);

  const existing = await supabase
    .from("daily_puzzles")
    .select(
      "date,puzzle_id,source_puzzle_id,title,category,goal,fen,solution,hint,rating,themes,source",
    )
    .eq("date", todayKey)
    .maybeSingle();

  if (existing.data) {
    return Response.json(
      { puzzle: existing.data, saved: false },
      { headers: corsHeaders },
    );
  }

  const lichessRes = await fetch(LICHESS_DAILY_API, {
    headers: { Accept: "application/json" },
  });

  if (!lichessRes.ok) {
    return Response.json(
      { error: "Could not fetch Lichess daily puzzle" },
      { status: 502, headers: corsHeaders },
    );
  }

  const data = (await lichessRes.json()) as LichessDaily;
  const initialFen = getInitialFen(data);
  const solution = data.puzzle?.solution || [];

  if (!initialFen || !solution.length) {
    return Response.json(
      { error: "Lichess daily puzzle payload was incomplete" },
      { status: 502, headers: corsHeaders },
    );
  }

  const { cleanFen, playerSolution } = buildPlayerPosition(
    initialFen,
    solution,
  );
  const firstTheme = data.puzzle?.themes?.[0];
  const row = {
    date: todayKey,
    puzzle_id: `lichess_daily_${todayKey}_${data.puzzle?.id || "api"}`,
    source_puzzle_id: data.puzzle?.id || null,
    title: `Daily: ${
      firstTheme ? firstTheme.replace(/([A-Z])/g, " $1") : "Tactical Shot"
    }`,
    category: "Advanced",
    goal: `${
      cleanFen.split(" ")[1] === "w" ? "White" : "Black"
    } to move: Find the best tactical move!`,
    fen: cleanFen,
    solution: playerSolution,
    hint: `Daily puzzle rating: ${
      data.puzzle?.rating || 1500
    }. Focus on the strongest tactical forcing move!`,
    rating: data.puzzle?.rating || null,
    themes: data.puzzle?.themes || [],
    source: "lichess-api",
    raw_payload: data,
  };

  const { data: saved, error } = await supabase
    .from("daily_puzzles")
    .insert(row)
    .select(
      "date,puzzle_id,source_puzzle_id,title,category,goal,fen,solution,hint,rating,themes,source",
    )
    .single();

  if (error) {
    return Response.json(
      { error: error.message },
      { status: 500, headers: corsHeaders },
    );
  }

  return Response.json(
    { puzzle: saved, saved: true },
    { headers: corsHeaders },
  );
});
