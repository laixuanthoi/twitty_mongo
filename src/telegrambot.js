import TelegramBot from "node-telegram-bot-api";

const token = "1844525211:AAH5lzam-fffd6pLh8Li6rH8uXpS8Gh5lKU";
// const token = "1936409627:AAGggXnLmHSQ8p-wgu5CFNNBfa7Sha2WCcw";
const bot = new TelegramBot(token, { polling: true });

export { bot };
