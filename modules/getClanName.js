import {readFile} from 'node:fs/promises'

export default async function getClanName(iconClanLink) {

  let clans = JSON.parse(await readFile('data/clanList.json', 'utf-8', (err, data) => {
    if(err) {throw err} else return data
  }))

  for (let clan of clans) {
    if(iconClanLink === clan.icon) {
      return await clan.name
    }
  }
}