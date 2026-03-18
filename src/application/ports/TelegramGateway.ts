export interface TelegramGateway {
  sendMessage(params: {
    botToken: string;
    chatId: string;
    text: string;
  }): Promise<void>;
}
