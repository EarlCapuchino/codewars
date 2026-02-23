export type Difficulty = 'easy' | 'average' | 'hard';
export type Category = string;
export type GameStatus = 'IN_PROGRESS' | 'WON' | 'LOST';

export interface CategoryInfo {
  id: string;
  label: string;
}

export interface Player {
  id: string;
  name: string;
  remainingAttempts: number;
  eliminated: boolean;
}

export interface GameState {
  id: string;
  maskedWord: string;
  status: GameStatus;
  difficulty: Difficulty;
  category: Category;
  guessedLetters: string[];
  failedWordGuesses: string[];
  players: Player[];
  currentPlayer: Player | null;
  currentPlayerIndex: number;
  winner?: Player;
  word?: string;
  isAiGame?: boolean;
}

export interface GuessResult {
  guess: string;
  correct: boolean;
  alreadyGuessed: boolean;
}

export interface GameResponse extends GameState {
  guessResult?: GuessResult;
}

export interface CreateGamePayload {
  playerCount: number;
  difficulty: Difficulty;
  category: Category;
  players?: string[];
}

export interface GuessPayload {
  guess: string;
  playerId?: string;
}

export interface LeaderboardEntry {
  playerName: string;
  wins: number;
  losses: number;
  totalScore: number;
  gamesPlayed: number;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  error?: {
    code: string;
    message: string;
    details?: Array<{ field: string; message: string }>;
  };
}

export interface CreateAiGamePayload {
  word: string;
  category?: Category;
}

export interface AiMove {
  guess: string;
  strategy: string;
  candidatesRemaining: number;
  confidence: number;
}

export interface AiGuessResponse extends GameResponse {
  aiMove: AiMove;
  word: string;
  isAiGame: boolean;
}

export type AppView = 'setup' | 'game' | 'leaderboard' | 'ai-setup' | 'ai-game';
