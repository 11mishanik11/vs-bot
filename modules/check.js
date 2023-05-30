import { getPageHtml } from './getPageHtml.js'
import getClanName from './getClanName.js'

const smileyCastles = [
  {name: 'Замок Страха', smiley: '😱'},
  {name: 'Замок с Привидениями', smiley: '👻'},
  {name: 'Замок Стали', smiley: '🛡'},
  {name: 'Замок Белого Камня', smiley: '💎'},
]
const storeData = {
  castles: [],
}
const times = ['02', '07', '15']

async function thisCastle (castle) {
  if (storeData.castles.length < 4) {
    let item = {
      name: castle.name,
      smiley: smileyCastles.find(item => item.name === castle.name),
      timeMessageAttack: null,
      thisClan: {
        name: await getClanName(castle.thisClan),
        timeAfterAttack: null,
      },
      attackInfo: {
        startTime: null,
      }
    }
    storeData.castles.push(item)
    return item
  } else return storeData.castles.find(item => item.name === castle.name) // Последние данные о текущем замке
}

export async function check(bot) {
  try {
    let data = await getPageHtml()

    // Проверка отбивов
    // for (let loc in data.one) {
    //     let thisLoc = data.one[loc]
    //
    //     if(thisLoc.status.includes('атаки осталось')) {
    //         const timeLeft = thisLoc.status.slice(25, 27)
    //
    //         if(times.includes(timeLeft)) {
    //             bot.telegram.sendMessage(-1001913180942,
    //             `<b>${thisLoc.name}</b>\n`+
    //             `До атаки осталось где-то ${timeLeft} мин`, {
    //                 parse_mode: 'HTML'
    //             })
    //         }
    //     } else if(thisLoc.status.includes('Прием заявок')) {
    //         bot.telegram.sendMessage(-1001913180942,
    //         `<b>${thisLoc.name}</b>\n`+
    //         `Сбор заявок на атаку - <b>ЖМЯКАЕМ</b>`, {
    //             parse_mode: 'HTML'
    //         })
    //     }
    // }

    // Проверка локаций с монстрами
    // for (let loc in data.two) {
    //     let thisLoc = data.two[loc]
    //     if(thisLoc.status == 'mobs') {
    //         bot.telegram.sendMessage(-1001913180942,
    //             `<b>${thisLoc.name}</b>\n`+
    //             `Локация занята монстрами`, {
    //             parse_mode: 'HTML'
    //         })
    //     } else if(thisLoc.status) {
    //         const timeLeft = thisLoc.status.timeLeft.slice(25, 27)
    //
    //         if(times.includes(timeLeft) || timeLeft == '14') {
    //             bot.telegram.sendMessage(-1001913180942,
    //             `<b>${thisLoc.name}</b>\n`+
    //             `До атаки осталось где-то ${timeLeft} мин`, {
    //                 parse_mode: 'HTML'
    //             })
    //         }
    //     }
    // }
    console.log('*************************************')
    for (let castle of data.castles) {
      let castleState = await thisCastle(castle)

      switch (castle.attackInfo.attack) {
        case "preAttack":
          if (castle.attackInfo.time.indexOf('04') !== -1) {
            castleState.attackInfo.startTime = new Date()
            bot.telegram.sendMessage(process.env.CHAT_ID,
              `${castleState.smiley.smiley}<b>${castle.name}</b>\n`+
              `Текущий клан: ${await getClanName(castle.thisClan)}\n\n`+
              `Атакующий клан: ${await getClanName(castle.attackInfo.attackClan)}\n`+
              `⚔️До атаки <b>${castle.attackInfo.time}</b>`,
              {parse_mode: 'HTML'}
            )
          }
          break
        case "attack":
        function sendMessage() {
          console.log('Штурм начался, отправляю сообщение')
          castleState.timeMessageAttack = new Date()
          bot.telegram.sendMessage(process.env.CHAT_ID,
            `<b>${castle.name}</b>\n`+
            `Штурм начался!`,
            {parse_mode: 'HTML'}
          )
        }

        if (castleState.timeMessageAttack) {
          if (new Date() - castleState.timeMessageAttack > 900000) {
            sendMessage()
          } else console.log('Штурм все еще идет, крайнее сообщение о штурме было меньше 15 минут назад')
        } else sendMessage()
          break
        case "noAttack":
          if (castle.attackInfo.time === '00 ч 00 мин') {
            console.log('Штурм через 4 минуты')
            castleState.thisClan.name = await getClanName(castle.thisClan)
            castleState.timeMessageAttack = null
            bot.telegram.sendMessage(process.env.CHAT_ID,
              `<b>${castle.name}</b>\n`+
              `<b>${await getClanName(castle.thisClan)}</b> успешно захватили замок!`,
              {parse_mode: 'HTML'}
            )
          } else if (castleState.thisClan.timeAfterAttack && (castleState.thisClan.timeAfterAttack === castle.attackInfo.time)) {
            console.log('Сообщение о не удачном штурме')
            castleState.thisClan.timeAfterAttack = null
            bot.telegram.sendMessage(process.env.CHAT_ID,
              `<b>${castle.name}</b>\n`+
              `Штурм закончился не удачно, <b>${await getClanName(castle.thisClan)}</b> остаются в замке`,
              {parse_mode: 'HTML'}
            )
          } else {
            castleState.thisClan.timeAfterAttack = castle.attackInfo.time
            console.log('Обновление времени в кеше для: ' + castle.name)
          }
          break
      }

      console.log(castleState)
    }

    // Проверка замков
    /*for (let castle of data.castles) {

      let castleState = await thisCastle(castle)

      if(castle.attackInfo.attack === 'preAttack' && (castle.attackInfo.time.indexOf('04') !== -1)) {
        bot.telegram.sendMessage(process.env.CHAT_ID,
          `${castleState.smiley.smiley}<b>${castle.name}</b>\n`+
          `Текущий клан: ${await getClanName(castle.thisClan)}\n\n`+
          `Атакующий клан: ${await getClanName(castle.attackInfo.attackClan)}\n`+
          `⚔️До атаки <b>${castle.attackInfo.time}</b>`,
          {parse_mode: 'HTML'}
        )
      } else if(castle.attackInfo.attack === 'attack') {

        function sendMessage() {
          console.log('Штурм начался, отправляю сообщение')
          castleState.timeMessageAttack = new Date()
          bot.telegram.sendMessage(process.env.CHAT_ID,
            `<b>${castle.name}</b>\n`+
            `Штурм начался!`,
            {parse_mode: 'HTML'}
          )
        }

        if (castleState.timeMessageAttack) {
          if (new Date() - castleState.timeMessageAttack > 900000) {
            sendMessage()
          } else console.log('Штурм все еще идет, крайнее сообщение о штурме было меньше 15 минут назад')
        } else sendMessage()
      } else if (castle.attackInfo.attack === 'noAttack') {
        if (castle.attackInfo.time === '00 ч 00 мин') {
          castleState.timeMessageAttack = null // Очищаем кеш сообщения о штурме
          bot.telegram.sendMessage(process.env.CHAT_ID,
            `<b>${castle.name}</b>\n`+
            `Атака закончилась в пользу: <b>${await getClanName(castle.thisClan)}</b>`,
            {parse_mode: 'HTML'}
          )
        } else if (castle.attackInfo.time === '') {
        // Уведомление о том, что атака прошла не удачно и клан остается прежним
        }
      }
    }*/
    console.log('*************************************')
  } catch (e) {
    throw e
  }
}
