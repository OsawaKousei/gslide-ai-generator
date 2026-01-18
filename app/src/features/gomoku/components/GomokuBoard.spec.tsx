import { test, expect } from '@playwright/experimental-ct-react';
import { GomokuBoard } from './GomokuBoard';

// 15x15 empty board
const emptyBoard = Array(15).fill(Array(15).fill(null));

test('should render 15x15 board', async ({ mount }) => {
  const component = await mount(
    <div style={{ width: '600px', height: '600px' }}>
      <GomokuBoard
        board={emptyBoard}
        lastMove={null}
        onCellClick={() => undefined}
      />
    </div>,
  );
  await expect(component.locator('div[role="button"]')).toHaveCount(225);
});

test('should handle cell click', async ({ mount }) => {
  let clickedX = -1;
  let clickedY = -1;
  const component = await mount(
    <div style={{ width: '600px', height: '600px' }}>
      <GomokuBoard
        board={emptyBoard}
        lastMove={null}
        onCellClick={(x, y) => {
          clickedX = x;
          clickedY = y;
        }}
      />
    </div>,
  );

  // Click cell at (0, 0)
  await component.locator('div[role="button"]').first().click();
  expect(clickedX).toBe(0);
  expect(clickedY).toBe(0);
});
