import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import NoteEditorPage from '../pages/NoteEditorPage';
import { renderWithRouter } from '../test-utils';

const mockCreateNote = jest.fn();
const mockUpdateNote = jest.fn();
const mockFetchNote = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    token: 'test-token',
    isAuthenticated: true,
    loading: false,
  }),
}));

jest.mock('../services/notesApi', () => ({
  createNote: (...args) => mockCreateNote(...args),
  updateNote: (...args) => mockUpdateNote(...args),
  fetchNote: (...args) => mockFetchNote(...args),
}));

jest.mock('../components/RichTextEditor', () => ({
  RichTextEditor: ({ value, onChange, disabled }) => (
    <textarea
      aria-label="Content"
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value)}
    />
  ),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
  useParams: () => ({}),
}));

describe('NoteEditorPage', () => {
  beforeEach(() => {
    mockCreateNote.mockReset();
    mockUpdateNote.mockReset();
    mockFetchNote.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the create-note editor', () => {
    renderWithRouter(<NoteEditorPage />, { route: '/notes/new' });

    expect(screen.getByRole('heading', { name: /write something new/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/note title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/content/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /^save$/i })).toBeInTheDocument();
  });

  it('shows validation when title is empty', async () => {
    const user = userEvent.setup();
    renderWithRouter(<NoteEditorPage />, { route: '/notes/new' });

    await user.type(screen.getByPlaceholderText(/note title/i), '   ');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/title is required/i)).toBeInTheDocument();
    expect(mockCreateNote).not.toHaveBeenCalled();
  });

  it('creates a note and navigates home', async () => {
    const user = userEvent.setup();
    mockCreateNote.mockResolvedValueOnce({
      data: { note: { id: 9, title: 'Draft', content: '<p>Hi</p>' } },
    });

    renderWithRouter(<NoteEditorPage />, { route: '/notes/new' });

    await user.type(screen.getByPlaceholderText(/note title/i), 'Draft');
    await user.clear(screen.getByLabelText(/content/i));
    await user.type(screen.getByLabelText(/content/i), '<p>Hi</p>');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    await waitFor(() => {
      expect(mockCreateNote).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });

  it('shows an API error when save fails', async () => {
    const user = userEvent.setup();
    mockCreateNote.mockRejectedValueOnce(new Error('Unable to save note.'));

    renderWithRouter(<NoteEditorPage />, { route: '/notes/new' });

    await user.type(screen.getByPlaceholderText(/note title/i), 'Draft');
    await user.click(screen.getByRole('button', { name: /^save$/i }));

    expect(await screen.findByText(/unable to save note/i)).toBeInTheDocument();
  });
});
