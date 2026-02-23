import apiClient, { unwrapResponse } from './index';
import type { AuthResponse, LoginRequest, RefreshRequest } from '../../types';
import type { RegisterRequest } from '../../types';
import { TEST_ACCOUNTS } from '../constants';

interface MockAccount {
  userId: string;
  username: string;
  password: string;
  displayName: string;
  role: AuthResponse['role'];
  email: string;
}

const STORAGE_KEY = 'dtex-mock-auth-users';

function wait(ms = 400) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function makeToken(prefix: string, username: string) {
  return `${prefix}.${btoa(`${username}.${Date.now()}`)}.${Math.random().toString(36).slice(2, 10)}`;
}

function makeAuthResponse(account: MockAccount): AuthResponse {
  return {
    accessToken: makeToken('mock-access', account.username),
    refreshToken: makeToken('mock-refresh', account.username),
    expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
    userId: account.userId,
    username: account.username,
    displayName: account.displayName,
    role: account.role,
  };
}

function loadMockUsers(): MockAccount[] {
  const builtIn = TEST_ACCOUNTS.map((account, idx) => ({
    userId: `mock-${idx + 1}`,
    username: account.username,
    password: account.password,
    displayName: account.displayName,
    role: account.role,
    email: `${account.username}@dtex.mock`,
  }));

  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return builtIn;

  try {
    const customUsers = JSON.parse(raw) as MockAccount[];
    return [...builtIn, ...customUsers];
  } catch {
    return builtIn;
  }
}

function saveCustomMockUsers(users: MockAccount[]) {
  const builtInUsernames = new Set(TEST_ACCOUNTS.map((account) => account.username));
  const customUsers = users.filter((user) => !builtInUsernames.has(user.username));
  localStorage.setItem(STORAGE_KEY, JSON.stringify(customUsers));
}

async function mockLogin(data: LoginRequest): Promise<AuthResponse> {
  await wait();
  const user = loadMockUsers().find(
    (candidate) =>
      candidate.username.toLowerCase() === data.username.toLowerCase() &&
      candidate.password === data.password
  );

  if (!user) {
    const err = new Error('Invalid username or password.');
    (err as { code?: string }).code = 'AUTH_FAILED';
    throw err;
  }

  return makeAuthResponse(user);
}

async function mockRegister(data: RegisterRequest): Promise<AuthResponse> {
  await wait();
  const users = loadMockUsers();

  if (users.some((user) => user.username.toLowerCase() === data.username.toLowerCase())) {
    const err = new Error('Username already exists.');
    (err as { code?: string }).code = 'USERNAME_TAKEN';
    throw err;
  }

  if (users.some((user) => user.email.toLowerCase() === data.email.toLowerCase())) {
    const err = new Error('Email already registered.');
    (err as { code?: string }).code = 'EMAIL_TAKEN';
    throw err;
  }

  const newUser: MockAccount = {
    userId: crypto.randomUUID(),
    username: data.username,
    password: data.password,
    displayName: data.displayName,
    role: data.role,
    email: data.email,
  };

  users.push(newUser);
  saveCustomMockUsers(users);
  return makeAuthResponse(newUser);
}

async function mockRefresh(data: RefreshRequest): Promise<AuthResponse> {
  await wait(250);
  if (!data.refreshToken) {
    const err = new Error('Invalid refresh token.');
    (err as { code?: string }).code = 'INVALID_REFRESH_TOKEN';
    throw err;
  }

  const storedAuth = localStorage.getItem('dtex-auth');
  if (!storedAuth) {
    const err = new Error('No active session.');
    (err as { code?: string }).code = 'INVALID_REFRESH_TOKEN';
    throw err;
  }

  try {
    const parsed = JSON.parse(storedAuth) as {
      state?: { user?: AuthResponse['role'] extends never ? never : { userId: string; username: string; displayName: string; role: AuthResponse['role'] } };
    };
    const user = parsed?.state?.user;
    if (!user) throw new Error('No active user');
    return {
      accessToken: makeToken('mock-access', user.username),
      refreshToken: makeToken('mock-refresh', user.username),
      expiresAt: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
      userId: user.userId,
      username: user.username,
      displayName: user.displayName,
      role: user.role,
    };
  } catch {
    const err = new Error('Invalid refresh token.');
    (err as { code?: string }).code = 'INVALID_REFRESH_TOKEN';
    throw err;
  }
}

function shouldUseMock() {
  return import.meta.env.VITE_USE_MOCK_AUTH === 'true' || import.meta.env.VITE_API_MODE === 'mock';
}

function isNetworkError(error: unknown) {
  const candidate = error as { code?: string; message?: string; response?: unknown };
  return !candidate?.response || candidate?.code === 'ERR_NETWORK' || candidate?.message === 'Network Error';
}

export const authApi = {
  async login(data: LoginRequest): Promise<AuthResponse> {
    if (shouldUseMock()) return mockLogin(data);

    try {
      return await unwrapResponse<AuthResponse>(
        apiClient.post('/api/auth/login', data)
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockLogin(data);
      }
      throw error;
    }
  },

  async register(data: RegisterRequest): Promise<AuthResponse> {
    if (shouldUseMock()) return mockRegister(data);

    try {
      return await unwrapResponse<AuthResponse>(
        apiClient.post('/api/auth/register', data)
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockRegister(data);
      }
      throw error;
    }
  },

  async refresh(data: RefreshRequest): Promise<AuthResponse> {
    if (shouldUseMock()) return mockRefresh(data);

    try {
      return await unwrapResponse<AuthResponse>(
        apiClient.post('/api/auth/refresh', data)
      );
    } catch (error) {
      if (isNetworkError(error)) {
        return mockRefresh(data);
      }
      throw error;
    }
  },
};
