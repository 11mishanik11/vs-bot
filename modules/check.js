import { getPageHtml } from "./getPageHtml.js";
import getClanName from './getClanName.js'

const times = ['02', '07', '15']

export async function check(bot) {
    let data = await getPageHtml()


    // Проверка отбивов
    for (let loc in data.one) {
        let thisLoc = data.one[loc]
    
        if(thisLoc.status.includes('атаки осталось')) {
            const timeLeft = thisLoc.status.slice(25, 27)
    
            if(times.includes(timeLeft)) {
                bot.telegram.sendMessage(-1001913180942,
                `<b>${thisLoc.name}</b>\n`+
                `До атаки осталось где-то ${timeLeft} мин`, {
                    parse_mode: 'HTML'
                })
            }
        } else if(thisLoc.status.includes('Прием заявок')) {
            bot.telegram.sendMessage(-1001913180942,
            `<b>${thisLoc.name}</b>\n`+
            `Сбор заявок на атаку - <b>ЖМЯКАЕМ</b>`, {
                parse_mode: 'HTML'
            })
        }
    }

    // Проверка локаций с монстрами
    for (let loc in data.two) {
        let thisLoc = data.two[loc]
        if(thisLoc.status == 'mobs') {
            bot.telegram.sendMessage(-1001913180942,
                `<b>${thisLoc.name}</b>\n`+
                `Локация занята монстрами`, {
                parse_mode: 'HTML'
            })
        } else if(thisLoc.status) {
            const timeLeft = thisLoc.status.timeleft.slice(25, 27)
    
            if(times.includes(timeLeft) || timeLeft == '14') {
                bot.telegram.sendMessage(-1001913180942,
                `<b>${thisLoc.name}</b>\n`+
                `До атаки осталось где-то ${timeLeft} мин`, {
                    parse_mode: 'HTML'
                })
            }
        }
    }

    // Проверка замков
    for (let castle of data.castles) {
        if(castle.attackInfo && (castle.attackInfo.time.indexOf('04') !== -1)) {
            bot.telegram.sendMessage(process.env.CHAT_ID,
                `<b>${castle.name}</b>\n`+
                `Текущий клан: ${await getClanName(castle.thisClan)}\n\n`+
                `Атакующий клан: ${await getClanName(castle.attackInfo.attackClan)}\n`+
                `⚔️До атаки <b>${castle.attackInfo.time}</b>`, {
                    parse_mode: 'HTML'
                }
            )
        }
    }
}