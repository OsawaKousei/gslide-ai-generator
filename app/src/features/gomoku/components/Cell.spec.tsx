import { test, expect } from '@playwright/experimental-ct-react';
import { Cell } from './Cell';
import { PLAYER } from '../types';

test('should render empty cell', async ({ mount }) => {
  const component = await mount(
    <div style={{ width: '40px', height: '40px' }}>
      <Cell
        x={0}
        y={0}
        value={null}
        isLastMove={false}
        onClick={() => undefined}
      />
    </div>,
  );
  await expect(component.locator('div[role="button"]')).toBeVisible();
  // Stone should be hidden
  await expect(component.locator('.rounded-full')).toHaveClass(/hidden/);
});

test('should render black stone', async ({ mount }) => {
  const component = await mount(
    <div style={{ width: '40px', height: '40px' }}>
      <Cell
        x={0}
        y={0}
        value={PLAYER.BLACK}
        isLastMove={false}
        onClick={() => undefined}
      />
    </div>,
  );
  await expect(component.locator('.bg-slate-900')).toBeVisible();
});

test('should render white stone', async ({ mount }) => {
  const component = await mount(
    <div style={{ width: '40px', height: '40px' }}>
      <Cell
        x={0}
        y={0}
        value={PLAYER.WHITE}
        isLastMove={false}
        onClick={() => undefined}
      />
    </div>,
  );
  await expect(component.locator('.bg-slate-100')).toBeVisible();
});

test('should highlight last move', async ({ mount }) => {
  const component = await mount(
    <div style={{ width: '40px', height: '40px' }}>
      <Cell
        x={0}
        y={0}
        value={PLAYER.BLACK}
        isLastMove={true}
        onClick={() => undefined}
      />
    </div>,
  );
  await expect(component.locator('.ring-red-500')).toBeVisible();
});

test('should handle click', async ({ mount }) => {
  let clicked = false;
  const component = await mount(
    <div style={{ width: '40px', height: '40px' }}>
      <Cell
        x={1}
        y={2}
        value={null}
        isLastMove={false}
        onClick={(x: number, y: number) => {
          if (x === 1 && y === 2) clicked = true;
        }}
      />
    </div>,
  );
  await component.locator('div[role="button"]').click();
  expect(clicked).toBe(true);
});
