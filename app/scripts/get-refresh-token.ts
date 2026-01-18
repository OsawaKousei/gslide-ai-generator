import { OAuth2Client } from 'google-auth-library';
import http from 'http';
import url from 'url';
import { match } from 'ts-pattern';

// .env.test から認証情報を読み込むために dotenv を使う手もあるが、
// ここでは簡易的に実行時に環境変数を渡すか、ハードコードしてもらう想定。
// 実用上は .env.test を読み込むスクリプト経由で実行されることを期待。
const CLIENT_ID = process.env.TEST_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.TEST_GOOGLE_CLIENT_SECRET;
const PORT = Number(process.env.PORT) || 3000;
const REDIRECT_URI = `http://localhost:${PORT}/oauth2callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    '❌ Please set TEST_GOOGLE_CLIENT_ID and TEST_GOOGLE_CLIENT_SECRET in .env.test or environment variables.',
  );
  process.exit(1);
}

const client = new OAuth2Client(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const SCOPES = [
  'https://www.googleapis.com/auth/drive.file',
  'email',
  'profile',
];

const startServer = () => {
  return new Promise<void>((resolve, reject) => {
    const server = http.createServer(async (req, res) => {
      if (req.url?.startsWith('/oauth2callback')) {
        const qs = url.parse(req.url, true).query;
        const code = qs.code as string;

        res.end(
          'Authentication successful! You can close this window. Check your terminal for the Refresh Token.',
        );
        server.close();

        if (code) {
          try {
            const { tokens } = await client.getToken(code);
            console.log('\n✅ Refresh Token Acquired!\n');
            console.log(`TEST_GOOGLE_REFRESH_TOKEN=${tokens.refresh_token}\n`);
            console.log('👉 Please paste this into your .env.test file.');
            resolve();
          } catch (e) {
            console.error('Error retrieving access token', e);
            reject(e);
          }
        }
      }
    });

    server.listen(PORT, () => {
      const authorizeUrl = client.generateAuthUrl({
        access_type: 'offline', // 重要: リフレッシュトークンを取得するために必須
        scope: SCOPES,
        prompt: 'consent', // 重要: 毎回同意画面を出して確実にリフレッシュトークンをもらう
      });

      console.log('Authorize this app by visiting this url:\n');
      console.log(authorizeUrl);
      console.log('\nWaiting for callback...');
    });
  });
};

startServer().catch(console.error);
