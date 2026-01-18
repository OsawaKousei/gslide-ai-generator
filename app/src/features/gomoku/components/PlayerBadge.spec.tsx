import { test, expect } from '@playwright/experimental-ct-react';
import { PlayerBadge } from './PlayerBadge';
import { PLAYER } from '../types';

test('should render black player badge', async ({ mount }) => {
  const component = await mount(<PlayerBadge player={PLAYER.BLACK} />);
  await expect(component).toContainText('Black');
  await expect(component).toHaveClass(/bg-slate-900/);
});

test('should render white player badge', async ({ mount }) => {
  const component = await mount(<PlayerBadge player={PLAYER.WHITE} />);
  await expect(component).toContainText('White');
  await expect(component).toHaveClass(/bg-white/);
});
