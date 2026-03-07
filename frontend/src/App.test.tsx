import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import App from './App';

describe('App', () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    fetchMock.mockReset();
    vi.stubGlobal('fetch', fetchMock);
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('shows validation error when rack has non-letter characters', async () => {
    render(<App />);

    fireEvent.change(screen.getByLabelText(/Player Rack/i), {
      target: { value: 'AB1' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Find Best Word/i }));

    expect(await screen.findByText('Rack must contain letters A-Z only')).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('renders result when API succeeds', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: vi.fn().mockResolvedValue({
        word: 'ABOUT',
        score: 7,
        usedLetters: {
          A: 1,
          B: 1,
          O: 1,
          U: 1,
          T: 1,
        },
      }),
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/Player Rack/i), {
      target: { value: 'about' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Find Best Word/i }));

    expect(await screen.findByText('Best Word Found')).toBeInTheDocument();
    expect(screen.getByText('ABOUT')).toBeInTheDocument();
    expect(screen.getByText('Score: 7')).toBeInTheDocument();

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith(
        '/api/find-best',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        })
      );
    });
  });

  it('shows 404 no-word message from API layer', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: vi.fn().mockResolvedValue({ message: 'No valid words found' }),
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/Player Rack/i), {
      target: { value: 'QZ' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Find Best Word/i }));

    expect(await screen.findByText('No valid words found')).toBeInTheDocument();
  });

  it('shows user-friendly fallback message for 500 errors', async () => {
    fetchMock.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: vi.fn().mockResolvedValue({}),
    });

    render(<App />);

    fireEvent.change(screen.getByLabelText(/Player Rack/i), {
      target: { value: 'ABOUT' },
    });
    fireEvent.click(screen.getByRole('button', { name: /Find Best Word/i }));

    expect(
      await screen.findByText('Server error while searching for words. Please retry shortly.')
    ).toBeInTheDocument();
  });
});
