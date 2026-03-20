import { TelegramGateway } from '@application/ports/TelegramGateway';
import { logger } from '@shared/utils/logger';

const TAG = 'TelegramApi';

export class TelegramApiClient implements TelegramGateway {
  async sendMessage(params: { botToken: string; chatId: string; text: string }): Promise<void> {
    logger.debug(TAG, `POST sendMessage → chatId=${params.chatId}`);
    const response = await fetch(`https://api.telegram.org/bot${params.botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: params.chatId,
        text: params.text,
      }),
    });

    if (!response.ok) {
      const raw = await response.text();
      let details = raw;

      try {
        const parsed = JSON.parse(raw) as { description?: string };
        if (parsed.description) {
          details = parsed.description;
        }
      } catch {
        // Keep original response text when body is not valid JSON.
      }

      const errMsg = `No se pudo conectar con Telegram (${response.status}): ${details}`;
      logger.error(TAG, errMsg);
      throw new Error(errMsg);
    }

    logger.info(TAG, `sendMessage OK (status ${response.status})`);
  }
}
