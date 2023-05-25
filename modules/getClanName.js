import getClansList from './getClansList.js'

export default async function getClanName(iconClanLink) {

  let clans = await getClansList()

  for (let clan of clans) {
    let thisIcon = clan.find('.px-1.py-1.text-start').find('img').attr('src')
    if(iconClanLink === thisIcon) {
      return clan.find('.px-1.py-1.text-start .app-link').text()
    }
  }
}