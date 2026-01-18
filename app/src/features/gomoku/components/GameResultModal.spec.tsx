import { test, expect } from '@playwright/experimental-ct-react';
import { GameResultModal } from './GameResultModal';
import { PLAYER } from '../types';

test('should render winner modal', async ({ mount, page }) => {
  await mount(
    <GameResultModal
      winner={PLAYER.BLACK}
      open={true}
      onRestart={() => undefined}
    />,
  );
  // Dialog is rendered in a portal, so we look for it in the page
  await expect(page.getByText('Game Over')).toBeVisible();
  await expect(page.getByText('Winner: Black')).toBeVisible();
});

test('should handle restart', async ({ mount, page }) => {
  let restarted = false;
  await mount(
    <GameResultModal
      winner={PLAYER.WHITE}
      open={true}
      onRestart={() => {
        restarted = true;
      }}
    />,
  );
  await page.getByRole('button', { name: 'Play Again' }).click();
  expect(restarted).toBe(true);
});
