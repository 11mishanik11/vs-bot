import { getPageHtml } from './getPageHtml.js'
import getClanName from './getClanName.js'
import constMessage from "../ConstMessage.js";

const smileyCastles = [
  {name: 'Замок Страха', smiley: '😱'},
  {name: 'Замок с Привидениями', smiley: '👻'},
  {name: 'Замок Стали', smiley: '🛡'},
  {name: 'Замок Белого Камня', smiley: '💎'},
]

const stateData = {
  castles: [],
}
const times = ['02', '07', '15']

let timeMs = (str) => {
  let regex = str.match(/(\d+)\s*ч\s+(\d+)\s*мин/)
  let hourMs = parseInt(regex[1]) * 3600000
  let minMs = parseInt(regex[2]) * 60000
  return hourMs + minMs
}

async function thisCastle (castle) {
  if (stateData.castles.length < 4) {
    let item = {
      name: castle.name,
      smiley: smileyCastles.find(item => item.name === castle.name),
      attackStatus: false,
      thisClan: {
        name: await getClanName(castle.thisClan),
        timeAfterAttack: null,
      },
      attackInfo: {
        name: null,
        startTime: null,
      }
    }
    stateData.castles.push(item)
    return item
  } else return stateData.castles.find(item => item.name === castle.name) // Последние данные о текущем замке из кеша
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

    console.log('************* Логи с проверки *****************')
    for (let castle of data.castles) {
      let castleState = await thisCastle(castle)
      let castleNameSmiley = `${castleState.smiley.smiley}<b>${castle.name}</b>${castleState.smiley.smiley}`

      switch (castle.attackInfo.attack) {
        case "preAttack": // Сообщение о начале атаки
          console.log('Подготовка к атаке: ' + castle.name)

          if (castle.attackInfo.time.indexOf('04') !== -1) {
            castleState.attackInfo.startTime = new Date()
            castleState.attackInfo.name = await getClanName(castle.attackInfo.attackClan)
            await constMessage
              .sendMessage(bot, await constMessage
                .preAttack(castle, castleNameSmiley))

          } else if(castle.attackInfo.time.indexOf('01') !== -1)
            await constMessage
              .sendMessage(bot, await constMessage
                .preAttack(castle, castleNameSmiley))
          break
        case "attack": // Действия при атаке
          if (!castleState.attackStatus) { // Если штурма нет, отправляем сообщение о ее начале
            console.log('Штурма нет, отправляю сообщение о ее начале: ' + castle.name)
            castleState.attackStatus = true // Ставим статус активной атаки
            await constMessage
              .sendMessage(bot, await constMessage
                .startAttack(castle, castleNameSmiley))
          } else console.log('Идет атака: ' + castle.name)
          break
        case "noAttack": // Если нет атаки
          if (castle.attackInfo.time === '00 ч 00 мин') { // Результаты атаки
            console.log('Замок захватили: ' + castle.name)

            castleState.thisClan.name = await getClanName(castle.thisClan)
            castleState.attackStatus = false
            castleState.attackInfo.startTime = null
            await constMessage
              .sendMessage(bot, await constMessage
                .successAttack(castle, castleNameSmiley))
          } else {
            if (castleState.thisClan.timeAfterAttack && castleState.attackInfo.startTime) { // Отбили штурм
              let difference = new Date() - castleState.attackInfo.startTime
              let lastTime = timeMs(castleState.thisClan.timeAfterAttack)
              let lastTimeDif = lastTime + difference
              let newTime = timeMs(castle.attackInfo.time)

              if (lastTimeDif >= (newTime - 60000) || lastTimeDif <= (newTime + 60000)) {
                castleState.attackStatus = false
                castleState.attackInfo.name = null
                castleState.attackInfo.startTime = null
                castleState.thisClan.timeAfterAttack = castle.attackInfo.time
                await constMessage
                  .sendMessage(bot, await constMessage
                    .notSuccessAttack(castle, castleNameSmiley, castleState))
              }
            } else { // Когда нет атаки и ничего не происходит
              castleState.thisClan.timeAfterAttack = castle.attackInfo.time
              console.log('Атаки нет: ' + castle.name)
            }
          }
          break
      }
    }
    console.log('*************************************')
  } catch (e) {
    throw e
  }
}
