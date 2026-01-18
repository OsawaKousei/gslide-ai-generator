import { describe, it, expect, beforeAll } from 'vitest';
import { copyPresentation } from './drive-api';
import { batchUpdatePresentation, createPresentation } from './slide-api';
import { env } from '../../../env';

// 実際にAPIを叩くため、タイムアウトを長く設定
const TIMEOUT = 30000;

// アクセストークンは環境変数から取得、またはリフレッシュトークンから生成
// 実行例: TEST_GOOGLE_ACCESS_TOKEN="ya29..." npm test integration
let accessToken = process.env.TEST_GOOGLE_ACCESS_TOKEN;

const CLIENT_ID = process.env.TEST_GOOGLE_CLIENT_ID;
const CLIENT_SECRET = process.env.TEST_GOOGLE_CLIENT_SECRET;
const REFRESH_TOKEN = process.env.TEST_GOOGLE_REFRESH_TOKEN;

// テスト用のテンプレートID (公開されているもの、または自分のDriveにあるスライドID)
// ここではGoogleが公開しているテンプレート例、または動作確認用の適当なIDを使用する必要があります。
// ユーザーが自分の環境で動作確認できるよう、デフォルトは空文字にし、エラーメッセージで誘導します。
const TEMPLATE_ID = process.env.TEST_TEMPLATE_ID;

// トークンがない場合はテストスイートごとスキップ
const shouldRun =
  !!accessToken || (!!CLIENT_ID && !!CLIENT_SECRET && !!REFRESH_TOKEN);
const describeOrSkip = shouldRun ? describe : describe.skip;

describeOrSkip('Google API Integration (Real API Check)', () => {
  let createdPresentationId: string;

  beforeAll(async () => {
    // アクセストークンがなく、リフレッシュに必要な情報がある場合は取得する
    if (!accessToken && CLIENT_ID && CLIENT_SECRET && REFRESH_TOKEN) {
      console.log('🔄 Refreshing Access Token for test...');
      try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: CLIENT_ID,
            client_secret: CLIENT_SECRET,
            refresh_token: REFRESH_TOKEN,
            grant_type: 'refresh_token',
          }),
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(`Token Refresh Failed: ${res.status} - ${text}`);
        }

        const data = await res.json();
        accessToken = data.access_token;
        console.log('✅ Access Token Refreshed');
      } catch (e) {
        console.error(e);
        // テストを意図的に失敗させる
        throw e;
      }
    }

    if (!accessToken) {
      console.warn(
        '⚠️ Skipping integration tests because valid token could not be obtained.',
      );
      return;
    }
  });

  it(
    'should copy a presentation template',
    async () => {
      if (!TEMPLATE_ID) {
        throw new Error(
          'TEST_TEMPLATE_ID env var is required. Run "npm run template:create" to generate one.',
        );
      }

      const title = `Automated Test Presentation ${new Date().toISOString()}`;
      const result = await copyPresentation(TEMPLATE_ID, title, accessToken!);

      if (result.isErr()) {
        console.error('Copy Failed:', result.error);
      }

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        createdPresentationId = result.value.id;
        console.log(`✅ Created Presentation ID: ${createdPresentationId}`);
        expect(result.value.name).toBe(title);
      }
    },
    TIMEOUT,
  );

  it(
    'should batch update the created presentation',
    async () => {
      expect(createdPresentationId).toBeDefined();

      // タイトル置換のリクエスト例 (実際のobjectIdがわからないと難しいが、
      // replaceAllTextならID不要で全体置換が可能なのでテストに最適)
      const requests = [
        {
          replaceAllText: {
            containsText: { text: '{{title}}' },
            replaceText: 'Integrated Test Title',
          },
        },
      ];

      const result = await batchUpdatePresentation(
        createdPresentationId,
        requests,
        accessToken!,
      );

      if (result.isErr()) {
        console.error('Update Failed:', result.error);
      }

      expect(result.isOk()).toBe(true);
      console.log(`✅ Updated Presentation successfully`);
    },
    TIMEOUT,
  );

  // 注意: 作成されたファイルはごみとしてDriveに残るため、
  // 本来は削除処理(drive.files.delete)を入れるのが望ましいが、権限範囲外の可能性がある。
});
