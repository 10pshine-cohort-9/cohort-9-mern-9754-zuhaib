import { screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProfilePage from '../pages/ProfilePage';
import { renderWithRouter } from '../test-utils';

const mockLogout = jest.fn();

jest.mock('../hooks/useAuth', () => ({
  useAuth: () => ({
    user: { id: 1, name: 'Ada Lovelace', email: 'ada@example.com' },
    logout: mockLogout,
    isAuthenticated: true,
    loading: false,
  }),
}));

describe('ProfilePage', () => {
  beforeEach(() => {
    mockLogout.mockReset();
  });

  it('shows the user name and email without password fields', () => {
    renderWithRouter(<ProfilePage />);

    expect(screen.getByRole('heading', { name: /profile/i })).toBeInTheDocument();
    expect(screen.getAllByText('Ada Lovelace').length).toBeGreaterThan(0);
    expect(screen.getByText('ada@example.com')).toBeInTheDocument();
    expect(screen.queryByLabelText(/password/i)).not.toBeInTheDocument();
  });

  it('logs out when the logout button is clicked', async () => {
    const user = userEvent.setup();
    renderWithRouter(<ProfilePage />);

    const logoutButtons = screen.getAllByRole('button', { name: /log out/i });
    await user.click(logoutButtons[logoutButtons.length - 1]);
    expect(mockLogout).toHaveBeenCalled();
  });
});
