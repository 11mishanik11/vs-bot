import getLocalDom from '../helpes/getLocalDom.js'
import {writeFile} from 'node:fs/promises'

export default async function getClansList() {
  let $ = await getLocalDom('https://vsmuta.com/info/clans')

  let clans = []
  let clansParse = []

  $('.table.table-bordered.table-exptable .tr-clan').each(function () {
    clans.push($(this))
  })

  for (let clan of clans) {
    clansParse.push({
      name: clan.find('.px-1.py-1.text-start .app-link').text(),
      icon: clan.find('.px-1.py-1.text-start').find('img').attr('src'),
    })
  }

  writeFile('data/clanList.json', JSON.stringify(clansParse))
}