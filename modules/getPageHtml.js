import getLocalDom from '../helpes/getLocalDom.js'

export async function getPageHtml() {
    let $ = await getLocalDom('https://vsmuta.com/info/locs')
    
    let locations = []

    // Собираем массив локаций
    $('.col-12.col-md-6.text-center.mt-2').each(function () {
        locations.push($(this))
    })

    // Собираем замки в массив
    let castles = []
    $('.row.site-block-info.mx-0 .col-12.px-0').each(function () {
        castles.push($(this))
    })

    // Собираем данные в объект
    return {
        one: (function() {
            let items = []

            for(let i=0; i <= 1; i++) {
                items.push({
                    name: locations[i].find('.mt-2').text(),
                    nextTime: locations[i].find('.mt-2').next().text(),
                    status: locations[i].find('.mt-3').last().text().trim()
                })
            }
            return items
        })(),

        two: (function() {
            let items = []

            for(let i=2; i <= 8; i++) {
                items.push({
                    name: locations[i].find('.mt-2').text(),

                    // Парсим статистику материалов в локации
                    statistic: (function() {
                        let statArray = []
                        locations[i].find('.col-6.col-lg-12.text-start').each(function() {
                            const name = $(this).find('.d-inline.d-lg-none.ps-0.ps-xl-5').text()
                            const value = $(this).find('.float-end.pe-0.pe-xl-5').text()

                            statArray.push({ name, value })
                        })
                        return statArray
                    })(),
                    status: (function() {
                        if(locations[i].find('.mt-3').find('.text-danger.mt-3').text().includes('атаки осталось')) {
                            return {
                                nextTime: locations[i].find('.mt-3').find('div').first().text(),
                                timeleft: locations[i].find('.mt-3').find('.text-danger.mt-3').text()
                            }
                        } else if(locations[i].find('.mt-3').text().includes('занята монстрами')) {
                            return 'mobs'
                        } else return null
                    })()
                })
            }
            return items
        })(),

        castles: (function () {
            let items = []

            for (let i = 0; i < castles.length; i++ ) {
                items.push({
                    name: castles[i].find('.d-inline.d-md-none.d-xl-inline').text().trim(),
                    thisClan: castles[i].find('> img').attr('src'),
                    attackInfo: (function () {
                        if(castles[i].find('.float-end > span').text()) {
                            return {
                                time: castles[i].find('.float-end > span').text().trim(),
                                attackClan: castles[i].find('.float-end > img').attr('src'),
                            }
                        } else return null
                    })()
                })
            }
            return items
        })(),
    }
}

