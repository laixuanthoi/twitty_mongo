import TelegramBot from "node-telegram-bot-api";

const token = "1844525211:AAH5lzam-fffd6pLh8Li6rH8uXpS8Gh5lKU";
import { Promise } from "bluebird";

Promise.config({
  cancellation: true,
});

const bot = new TelegramBot(token, { polling: true });

export { bot };
