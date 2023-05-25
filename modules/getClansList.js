import getLocalDom from '../helpes/getLocalDom.js'

export default async function getClansList() {
  let $ = await getLocalDom('https://vsmuta.com/info/clans')

  let clans = []

  $('.table.table-bordered.table-exptable .tr-clan').each(function () {
    clans.push($(this))
  })

  return clans
}