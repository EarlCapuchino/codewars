import axios, { AxiosError } from 'axios';
import type {
  AiGuessResponse,
  ApiResponse,
  CategoryInfo,
  CreateAiGamePayload,
  CreateGamePayload,
  GameResponse,
  GameState,
  GuessPayload,
  LeaderboardEntry,
} from '@/types/game';

const client = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api/v1',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

function extractData<T>(response: { data: ApiResponse<T> }): T {
  if (!response.data.success) {
    throw new Error(response.data.error?.message || 'Request failed');
  }
  return response.data.data;
}

function handleError(err: unknown): never {
  if (err instanceof AxiosError) {
    const msg =
      err.response?.data?.error?.message ||
      err.message ||
      'Network error';
    throw new Error(msg);
  }
  throw err;
}

export async function createGame(payload: CreateGamePayload): Promise<GameState> {
  try {
    const res = await client.post<ApiResponse<GameState>>('/game', payload);
    return extractData(res);
  } catch (err) {
    return handleError(err);
  }
}

export async function makeGuess(gameId: string, payload: GuessPayload): Promise<GameResponse> {
  try {
    const res = await client.post<ApiResponse<GameResponse>>(`/game/${gameId}/guess`, payload);
    return extractData(res);
  } catch (err) {
    return handleError(err);
  }
}

export async function getGameState(gameId: string): Promise<GameState> {
  try {
    const res = await client.get<ApiResponse<GameState>>(`/game/${gameId}`);
    return extractData(res);
  } catch (err) {
    return handleError(err);
  }
}

export async function getLeaderboard(): Promise<LeaderboardEntry[]> {
  try {
    const res = await client.get<ApiResponse<LeaderboardEntry[]>>('/leaderboard');
    return extractData(res);
  } catch (err) {
    return handleError(err);
  }
}

export async function resetLeaderboard(): Promise<void> {
  try {
    await client.delete('/leaderboard');
  } catch (err) {
    return handleError(err);
  }
}

export async function getCategories(): Promise<CategoryInfo[]> {
  try {
    const res = await client.get<ApiResponse<CategoryInfo[]>>('/categories');
    return extractData(res);
  } catch (err) {
    return handleError(err);
  }
}

export async function createAiGame(payload: CreateAiGamePayload): Promise<GameState> {
  try {
    const res = await client.post<ApiResponse<GameState>>('/game/ai', payload);
    return extractData(res);
  } catch (err) {
    return handleError(err);
  }
}

export async function requestAiGuess(gameId: string): Promise<AiGuessResponse> {
  try {
    const res = await client.post<ApiResponse<AiGuessResponse>>(`/game/${gameId}/ai-guess`);
    return extractData(res);
  } catch (err) {
    return handleError(err);
  }
}
