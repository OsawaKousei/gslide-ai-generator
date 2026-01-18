import { test, expect } from '@playwright/test';

test.describe('Chat & Generator Flow', () => {
  test.beforeEach(async ({ page }) => {
    // 1. Mock Google Identity Services (GIS)
    await page.addInitScript(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).google = {
        accounts: {
          oauth2: {
            initTokenClient: ({
              callback,
            }: {
              callback: (resp: unknown) => void;
            }) => {
              return {
                requestAccessToken: () => {
                  callback({
                    access_token: 'fake-access-token',
                    expires_in: 3600,
                    scope:
                      'email profile https://www.googleapis.com/auth/drive.file',
                    token_type: 'Bearer',
                  });
                },
              };
            },
          },
        },
      };
    });

    // 2. Mock User Info API
    await page.route(
      'https://www.googleapis.com/oauth2/v1/userinfo*',
      async (route) => {
        await route.fulfill({
          json: {
            id: '12345',
            email: 'test@example.com',
            verified_email: true,
            name: 'Test User',
            given_name: 'Test',
            family_name: 'User',
            picture: 'https://via.placeholder.com/150',
          },
        });
      },
    );

    // 3. Mock Drive API (Copy)
    await page.route(
      'https://www.googleapis.com/drive/v3/files/*/copy*',
      async (route) => {
        await route.fulfill({
          json: {
            id: 'new-presentation-id',
            name: 'Generated Presentation',
          },
        });
      },
    );

    // 4. Mock Slides API (Get Presentation)
    await page.route(
      'https://slides.googleapis.com/v1/presentations/new-presentation-id',
      async (route) => {
        if (route.request().method() === 'GET') {
          await route.fulfill({
            json: {
              presentationId: 'new-presentation-id',
              slides: [{ objectId: 'page_1' }], // 1 slide initial
            },
          });
        } else {
          await route.continue();
        }
      },
    );

    // 5. Mock Slides API (BatchUpdate)
    await page.route(
      'https://slides.googleapis.com/v1/presentations/*/batchUpdate',
      async (route) => {
        await route.fulfill({
          json: {
            replies: [], // Simplified response
          },
        });
      },
    );
  });

  test('should login and generate slides via chat', async ({ page }) => {
    // --- Step 0: Open App ---
    await page.goto('/');

    // Check Config Widget Initial State
    const loginButton = page.getByRole('button', {
      name: /Login with Google/i,
    });
    await expect(loginButton).toBeVisible();

    // --- Step 1: Login ---
    await loginButton.click();

    // Verify Login Success (User info displayed)
    await expect(page.getByText('Test User')).toBeVisible();
    await expect(page.getByText('test@example.com')).toBeVisible();

    // --- Step 2: Set API Key ---
    await page.getByRole('button', { name: 'Settings' }).click();
    const apiKeyInput = page.getByPlaceholder('Enter your API Key');
    await expect(apiKeyInput).toBeVisible();
    await apiKeyInput.fill('fake-gemini-api-key');
    await page.getByRole('button', { name: 'Save Configuration' }).click();
    await expect(apiKeyInput).not.toBeVisible();

    // --- Step 3: Chat Interaction ---
    await page.route('**/models/*:generateContent*', async (route) => {
      await route.fulfill({
        json: {
          candidates: [
            {
              content: {
                parts: [
                  {
                    functionCall: {
                      name: 'update_manifest',
                      args: {
                        title: 'Generated Slide',
                        slides: [
                          {
                            templateId: 'layout_title',
                            content: { title: 'Hello', body: ['World'] },
                          },
                        ],
                      },
                    },
                  },
                ],
              },
            },
          ],
        },
      });
    });

    const chatInput = page.getByRole('textbox'); // Chat input
    await chatInput.fill('Please create a slide about Hello World');

    // Click send
    await page.locator('button[type="submit"]').click();

    // --- Step 4: Verify Result ---
    // 1. Chat bubble check
    // Depending on timing, a text bubble might not appear if functionCall only is returned?
    // Our mock returned functionCall ONLY. In real Gemini, it often returns text + functionCall.
    // But store logic handles it.

    // 2. Preview iframe appears
    // The iframe has 'src' constructed from presentationId
    const iframe = page.locator('iframe[title="Google Slides Preview"]');
    await expect(iframe).toBeVisible({ timeout: 10000 });
    await expect(iframe).toHaveAttribute('src', /new-presentation-id/);
  });
});
