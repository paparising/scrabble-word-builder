export interface WordResult {
  word: string;
  score: number;
  usedLetters: Record<string, number>;
}

interface FindBestWordPayload {
  rack: string;
  word?: string;
}

interface ApiErrorPayload {
  error?: string;
  message?: string;
}

export class ApiError extends Error {
  public readonly status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

const DEFAULT_ERROR_MESSAGE = 'Failed to find word. Please try again.';

const getStatusMessage = (status: number): string => {
  if (status === 400) {
    return 'Input is invalid. Check rack and board word values.';
  }

  if (status === 404) {
    return 'No valid words found for this rack.';
  }

  if (status >= 500) {
    return 'Server error while searching for words. Please retry shortly.';
  }

  return DEFAULT_ERROR_MESSAGE;
};

const getErrorMessage = (status: number, payload: ApiErrorPayload | null): string => {
  const messageFromApi = payload?.error ?? payload?.message;
  return messageFromApi || getStatusMessage(status);
};

export const findBestWordRequest = async (payload: FindBestWordPayload): Promise<WordResult> => {
  const response = await fetch('/api/find-best', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });

  let data: unknown = null;

  try {
    data = await response.json();
  } catch {
    data = null;
  }

  if (!response.ok) {
    const errorPayload = (data as ApiErrorPayload | null) ?? null;
    throw new ApiError(response.status, getErrorMessage(response.status, errorPayload));
  }

  const wordResult = data as WordResult;

  if (!wordResult || !wordResult.word || typeof wordResult.score !== 'number' || !wordResult.usedLetters) {
    throw new ApiError(500, DEFAULT_ERROR_MESSAGE);
  }

  return wordResult;
};
