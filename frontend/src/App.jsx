import { BrowserRouter, Route, Routes } from 'react-router-dom';

/**
 * Temporary landing view until auth pages are added in the next PR.
 */
function PlaceholderPage() {
  return (
    <main style={{ padding: '2rem', fontFamily: 'sans-serif' }}>
      <h1>Notes App</h1>
      <p>Frontend scaffold is ready. Auth UI arrives in the next PR.</p>
    </main>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="*" element={<PlaceholderPage />} />
      </Routes>
    </BrowserRouter>
  );
}
