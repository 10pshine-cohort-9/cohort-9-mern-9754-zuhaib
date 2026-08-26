import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import HomePage from '../pages/HomePage';
import { renderWithRouter } from '../test-utils';

const mockFetchNotes = jest.fn();
const mockDeleteNote = jest.fn();
const mockLogout = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'test-token',
    user: { id: 1, name: 'Ada', email: 'ada@example.com' },
    logout: mockLogout,
    isAuthenticated: true,
    loading: false,
  }),
}));

jest.mock('../services/notesApi', () => ({
  fetchNotes: (...args) => mockFetchNotes(...args),
  deleteNote: (...args) => mockDeleteNote(...args),
}));

describe('HomePage dashboard', () => {
  beforeEach(() => {
    mockFetchNotes.mockReset();
    mockDeleteNote.mockReset();
    mockLogout.mockReset();
  });

  it('renders the dashboard heading', async () => {
    mockFetchNotes.mockResolvedValueOnce({ data: { notes: [] } });

    renderWithRouter(<HomePage />);

    expect(screen.getByRole('heading', { name: /your thoughts, one place/i })).toBeInTheDocument();
    await waitFor(() => expect(mockFetchNotes).toHaveBeenCalled());
  });

  it('shows an empty notes state', async () => {
    mockFetchNotes.mockResolvedValueOnce({ data: { notes: [] } });

    renderWithRouter(<HomePage />);

    expect(await screen.findByRole('heading', { name: /no notes yet/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /create your first note/i })).toBeInTheDocument();
  });

  it('shows notes returned by the API', async () => {
    mockFetchNotes.mockResolvedValueOnce({
      data: {
        notes: [
          {
            id: 1,
            title: 'Metal playlist',
            content: '<p>Listen later</p>',
            updatedAt: '2026-01-01T00:00:00.000Z',
          },
        ],
      },
    });

    renderWithRouter(<HomePage />);

    expect(await screen.findByRole('heading', { name: /metal playlist/i })).toBeInTheDocument();
    expect(screen.getByText(/listen later/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /edit/i })).toHaveAttribute('href', '/notes/1');
  });

  it('shows an error when notes fail to load', async () => {
    mockFetchNotes.mockRejectedValueOnce(new Error('Unable to load notes.'));

    renderWithRouter(<HomePage />);

    expect(await screen.findByText(/unable to load notes/i)).toBeInTheDocument();
  });

  it('logs out from the header', async () => {
    mockFetchNotes.mockResolvedValueOnce({ data: { notes: [] } });
    const user = userEvent.setup();

    renderWithRouter(<HomePage />);
    await screen.findByRole('heading', { name: /no notes yet/i });

    await user.click(screen.getByRole('button', { name: /log out/i }));
    expect(mockLogout).toHaveBeenCalled();
  });
});
