/* eslint-disable no-console */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable max-depth */
// Node.js built-in fetch is available in newer versions (18+)
// No import needed for fetch

const CLIENT_ID = process.env.TEST_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.TEST_GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.TEST_GOOGLE_REFRESH_TOKEN;
let accessToken = process.env.TEST_GOOGLE_ACCESS_TOKEN;

const main = async () => {
  console.log('🚀 Starting Template Creation Script...');

  // 1. Authenticate / Refresh Token
  if (!accessToken) {
    if (!CLIENT_ID || !CLIENT_SECRET || !REFRESH_TOKEN) {
      console.error('❌ Error: Missing credentials.');
      console.error('Please set TEST_GOOGLE_ACCESS_TOKEN');
      console.error(
        'OR set TEST_GOOGLE_CLIENT_ID, TEST_GOOGLE_CLIENT_SECRET, and TEST_GOOGLE_REFRESH_TOKEN',
      );
      console.error('in your .env.test file.');
      process.exit(1);
    }

    console.log('🔄 Refreshing Access Token...');
    try {
      const res = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: CLIENT_ID,
          client_secret: CLIENT_SECRET,
          refresh_token: REFRESH_TOKEN,
          grant_type: 'refresh_token',
        } as any).toString(),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Token Refresh Failed: ${res.status} - ${text}`);
      }

      const data = (await res.json()) as any;
      accessToken = data.access_token;
      console.log('✅ Access Token Refreshed');
    } catch (e) {
      console.error('❌ Authentication failed:', e);
      process.exit(1);
    }
  }

  // 2. Create Presentation
  console.log('📄 Creating new Google Slide Presentation...');
  try {
    const title = 'GSlide AI Generator - Master Template';
    const res = await fetch('https://slides.googleapis.com/v1/presentations', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ title }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`API Error: ${res.status} - ${text}`);
    }

    const json = (await res.json()) as any;
    const presentationId = json.presentationId;
    const presentationUrl = `https://docs.google.com/presentation/d/${presentationId}/edit`;

    console.log('\n✨ TEMPLATE CREATED SUCCESSFULLY! ✨\n');
    console.log(
      '-------------------------------------------------------------',
    );
    console.log(`🆔 Presentation ID: \x1b[36m${presentationId}\x1b[0m`);
    console.log(`🔗 URL: \x1b[36m${presentationUrl}\x1b[0m`);
    console.log(
      '-------------------------------------------------------------\n',
    );
    console.log('👉 Next Steps:');
    console.log(
      '1. Open the URL above and edit your template (add layouts, placeholders, etc).',
    );
    console.log(`2. Update your .env.test file:`);
    console.log(`   TEST_TEMPLATE_ID=${presentationId}`);
    console.log('3. Run integration tests: npm run test:integration');
  } catch (e) {
    console.error('❌ Failed to create presentation:', e);
    process.exit(1);
  }
};

main();
