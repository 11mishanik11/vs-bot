import {Telegraf} from 'telegraf'
import * as dotenv from 'dotenv'
import {check} from './modules/check.js'
import getClansList from './modules/getClansList.js'
dotenv.config()

export const bot = new Telegraf(process.env.SECRET_CODE)



try {
    // Обновление списка кланов раз в 30 минут
    getClansList()
    // setInterval(() => getClansList(), 1800000)

    // Проверка
    check(bot)
    // setInterval(() => check(bot), 60000);
} catch (err) {
    console.error(err);
}

bot.launch()

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))





