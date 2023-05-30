import { getPageHtml } from './getPageHtml.js'
import getClanName from './getClanName.js'

const lastData = {
  location: 'Локации',
  castes: [],
}
const smileyCastles = [
  {name: 'Замок Страха', smiley: '😱'},
  {name: 'Замок с Привидениями', smiley: '👻'},
  {name: 'Замок Стали', smiley: '🛡'},
  {name: 'Замок Белого Камня', smiley: '💎'},
]
const times = ['02', '07', '15']

/*
* Проверка последнего отправленного сообщения
* Если с отправки крайнего сообщения прошло меньше 'n' времени
* Ничего не отправляем, иначе отправляем и перезаписываем данные
* */

export async function check(bot) {
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

  // Проверка замков
  for (let castle of data.castles) {
    /*
    * Получение последних данных о замке записаных в кеш
    * Если данных нет, создаем объект, пушим в кеш и получаем от туда
    * */
    let thisCastleLastData = {} // Последние данные о текущем замке

    if (lastData.castes.length === data.castles.length) {
      console.log('Данные в кеше есть, беру их от сюда')
      thisCastleLastData = lastData.castes.find(item => item.name === castle.name)
    } else {
      console.log('Данные в кеше отсутствуют, собираю массив')
      let thisCastle = {
        name: castle.name,
        smiley: smileyCastles.find(item => item.name === castle.name),
        timeMessageAttack: null,
        thisClan: {
          name: castle.thisClan,
          timeAfterAttack: (function () {
            if (castle.attackInfo.attack === 'noAttack') {
              return castle.attackInfo.time
            }
          })(),
        },
        nameAttackClan: (function () {
          if (castle.attackInfo.attack === 'attack') {
            return castle.attackInfo.attackClan
          }
        })(),
      }
      lastData.castes.push(thisCastle)
      thisCastleLastData = thisCastle
    }

    if(castle.attackInfo.attack === 'preAttack' && (castle.attackInfo.time.indexOf('04') !== -1)) {
      bot.telegram.sendMessage(process.env.CHAT_ID,
        `${thisCastleLastData.smiley.smiley}<b>${castle.name}</b>${thisCastleLastData.smiley.smiley}\n`+
        `Текущий клан: ${await getClanName(castle.thisClan)}\n\n`+
        `Атакующий клан: ${await getClanName(castle.attackInfo.attackClan)}\n`+
        `⚔️До атаки <b>${castle.attackInfo.time}</b>`,
      {parse_mode: 'HTML'}
      )
    } else if(castle.attackInfo.attack === 'attack') {
      function sendMessage() {
        thisCastleLastData.timeMessageAttack = new Date()
        console.log('Штурм начался')
        bot.telegram.sendMessage(process.env.CHAT_ID,
          `${thisCastleLastData.smiley.smiley}<b>${castle.name}</b>${thisCastleLastData.smiley.smiley}\n`+
          `Штурм начался!`,
          {parse_mode: 'HTML'}
        )
      }

      if (thisCastleLastData.timeMessageAttack) {
        if (new Date() - thisCastleLastData.timeMessageAttack > 900000) {
          sendMessage()
        } else console.log('Штурм все еще идет, о крайнее сообщение о штурме было меньше 15 минут назад')
      } else sendMessage()
    } else if (castle.attackInfo.attack === 'noAttack') {
      if (true) {
        bot.telegram.sendMessage(process.env.CHAT_ID,
          `${thisCastleLastData.smiley.smiley}<b>${castle.name}</b>${thisCastleLastData.smiley.smiley}\n`+
          `Атака закончилась в пользу: <b>${await getClanName(castle.thisClan)}</b>`,
        {parse_mode: 'HTML'}
        )
      }
    }
  }
}