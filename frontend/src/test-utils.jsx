import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

/**
 * Renders UI inside a MemoryRouter for page tests.
 * @param {import('react').ReactElement} ui
 * @param {{ route?: string }} [options]
 * @returns {ReturnType<typeof render>}
 */
export function renderWithRouter(ui, { route = '/' } = {}) {
  return render(<MemoryRouter initialEntries={[route]}>{ui}</MemoryRouter>);
}
