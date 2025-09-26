import { beforeEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import App from '../App';

const submitPrompt = async (value: string) => {
  const prompt = await screen.findByLabelText(/describe the image/i);
  fireEvent.change(prompt, { target: { value: '' } });
  await waitFor(() => expect(prompt).toHaveValue(''));
  fireEvent.change(prompt, { target: { value } });
  await waitFor(() => expect(prompt).toHaveValue(value));
  await userEvent.click(screen.getByRole('button', { name: /generate gallery/i }));
  await screen.findByText(/generated 3 visuals/i);
};

describe('App critical workflows', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('submits a prompt and renders gallery results', async () => {
    render(<App />);
    await submitPrompt('a futuristic city in the clouds');

    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/generated 3 visuals/i);

    const cards = await screen.findAllByRole('link', { name: /variation|primary inspiration/i });
    expect(cards).toHaveLength(3);
    expect(cards[0]).toHaveAccessibleName(/primary inspiration/i);
  });

  it('toggles nano banana enhancer', async () => {
    render(<App />);

    const toggle = screen.getByRole('switch', { name: /nano banana enhancer/i });
    expect(toggle).not.toBeChecked();

    await userEvent.click(toggle);
    expect(toggle).toBeChecked();

    const description = screen.getByText(/enhancement active/i);
    expect(description).toBeInTheDocument();
  });

  it('stores prompt history for quick reuse', async () => {
    render(<App />);

    await submitPrompt('an astronaut tasting a nano banana smoothie');
    await submitPrompt('neon jungle with friendly fauna');

    const list = await screen.findByRole('list', { name: /recent prompts/i });
    const items = within(list).getAllByRole('button');
    expect(items[0]).toHaveTextContent('neon jungle with friendly fauna');

    await userEvent.click(items[1]);
    const status = await screen.findByRole('status');
    expect(status).toHaveTextContent(/generated 3 visuals/i);
  });

  it('allows keyboard users to focus gallery immediately after generation', async () => {
    render(<App />);
    const user = userEvent.setup();

    await submitPrompt('sunset over a nano banana grove');

    const galleryLinks = await screen.findAllByRole('link');
    expect(document.activeElement).toBe(galleryLinks[0]);

    await user.keyboard('{Tab}');
    expect(document.activeElement).toBe(galleryLinks[1]);
  });
});
