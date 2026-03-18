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
      const errorText = await response.text();
      throw new Error(`Telegram API error: ${response.status} ${errorText}`);
    }
  }
}
