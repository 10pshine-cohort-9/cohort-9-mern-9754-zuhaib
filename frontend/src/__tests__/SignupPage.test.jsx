import { screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import SignupPage from '../pages/SignupPage';
import { renderWithRouter } from '../test-utils';

const mockRegister = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    register: mockRegister,
    isAuthenticated: false,
    loading: false,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('SignupPage', () => {
  beforeEach(() => {
    mockRegister.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the signup form', () => {
    renderWithRouter(<SignupPage />);

    expect(screen.getByRole('heading', { name: /create account/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/your name/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/at least 8 characters/i)).toBeInTheDocument();
  });

  it('shows a validation/error message when signup fails', async () => {
    const user = userEvent.setup();
    mockRegister.mockRejectedValueOnce(new Error('An account with this email already exists.'));

    renderWithRouter(<SignupPage />);

    await user.type(screen.getByPlaceholderText(/your name/i), 'Ada');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'ada@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    expect(
      await screen.findByText(/an account with this email already exists/i)
    ).toBeInTheDocument();
  });

  it('navigates home after successful signup', async () => {
    const user = userEvent.setup();
    mockRegister.mockResolvedValueOnce({ id: 1, name: 'Ada' });

    renderWithRouter(<SignupPage />);

    await user.type(screen.getByPlaceholderText(/your name/i), 'Ada');
    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'ada@example.com');
    await user.type(screen.getByPlaceholderText(/at least 8 characters/i), 'password123');
    await user.click(screen.getByRole('button', { name: /create account/i }));

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });
});
