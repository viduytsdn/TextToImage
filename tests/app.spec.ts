import { expect, test } from '@playwright/test';

test.describe('Text to Image Studio critical flows', () => {
  test('prompt submission and gallery rendering', async ({ page }) => {
    await page.goto('/');

    const promptField = page.getByLabel('Describe the image you want to generate');
    await promptField.fill('cosmic nano banana lantern festival');
    await page.getByRole('button', { name: /generate gallery/i }).click();

    const status = page.getByRole('status');
    await expect(status).toContainText('Generated 3 visuals');

    const cards = page.getByRole('list', { name: /generated gallery/i }).getByRole('link');
    await expect(cards).toHaveCount(3);
    await expect(cards.first()).toBeVisible();
  });

  test('nano banana toggle updates announcement', async ({ page }) => {
    await page.goto('/');

    const switchControl = page.getByRole('switch', { name: /nano banana enhancer/i });
    await expect(switchControl).not.toBeChecked();
    await switchControl.click();

    await expect(page.getByText(/enhancement active/i)).toBeVisible();
  });
});
