import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import App from '../../src/frontend/src/App';

test('renderiza Home y link "Comenzar" navega a /questions', async () => {
    render(
    <MemoryRouter initialEntries={['/']}>
        <App />
    </MemoryRouter>
    );

    expect(
        screen.getByRole('heading', { name: /bienvenido a/i })
    ).toBeInTheDocument();

    const link = screen.getByRole('link', { name: /comenzar/i });
    expect(link).toHaveAttribute('href', '/questions');
});
