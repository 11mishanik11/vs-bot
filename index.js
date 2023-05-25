import {Telegraf} from 'telegraf'
import * as dotenv from 'dotenv'
import {check} from './modules/check.js'
dotenv.config()

export const bot = new Telegraf(process.env.SECRET_CODE)

check(bot)
setInterval(() => {
    check(bot)
}, 60000);

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));





