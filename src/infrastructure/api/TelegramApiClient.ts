import { TelegramGateway } from '@application/ports/TelegramGateway';

export class TelegramApiClient implements TelegramGateway {
  async sendMessage(params: { botToken: string; chatId: string; text: string }): Promise<void> {
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

      throw new Error(`No se pudo conectar con Telegram (${response.status}): ${details}`);
    }
  }
}
