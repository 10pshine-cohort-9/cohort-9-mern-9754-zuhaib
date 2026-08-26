import { fireEvent, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../pages/LoginPage';
import { renderWithRouter } from '../test-utils';

const mockLogin = jest.fn();
const mockNavigate = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
    loading: false,
  }),
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => mockNavigate,
}));

describe('LoginPage', () => {
  beforeEach(() => {
    mockLogin.mockReset();
    mockNavigate.mockReset();
  });

  it('renders the login form', () => {
    renderWithRouter(<LoginPage />);

    expect(screen.getByRole('heading', { name: /welcome back/i })).toBeInTheDocument();
    expect(screen.getByPlaceholderText(/you@example.com/i)).toBeInTheDocument();
    expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /sign in/i })).toBeInTheDocument();
  });

  it('shows an error when login fails', async () => {
    const user = userEvent.setup();
    mockLogin.mockRejectedValueOnce(new Error('Invalid email or password.'));

    renderWithRouter(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'a@b.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    await user.click(screen.getByRole('button', { name: /sign in/i }));

    expect(await screen.findByText(/invalid email or password/i)).toBeInTheDocument();
  });

  it('navigates home after a successful login', async () => {
    const user = userEvent.setup();
    mockLogin.mockResolvedValueOnce({ id: 1, name: 'Ada' });

    renderWithRouter(<LoginPage />);

    await user.type(screen.getByPlaceholderText(/you@example.com/i), 'ada@example.com');
    await user.type(screen.getByPlaceholderText('••••••••'), 'password123');
    fireEvent.submit(screen.getByRole('button', { name: /sign in/i }).closest('form'));

    await waitFor(() => {
      expect(mockLogin).toHaveBeenCalledWith({
        email: 'ada@example.com',
        password: 'password123',
      });
      expect(mockNavigate).toHaveBeenCalledWith('/home', { replace: true });
    });
  });
});
