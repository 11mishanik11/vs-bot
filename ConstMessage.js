import getClanName from "./modules/getClanName.js";


class ConstMessage {
	 async preAttack (castle, nameString) {
		return (
			`${nameString}\n`+
			`Текущий клан: ${await getClanName(castle.thisClan)}\n\n`+
			`Атакующий клан: ${await getClanName(castle.attackInfo.attackClan)}\n`+
			`⚔️До атаки <b>${castle.attackInfo.time}</b>`
		)
	}

	async startAttack (castle, nameString) {
		return (
			`${nameString}\n` +
			`Штурм начался!`
		)
	}

	async successAttack (castle, nameString) {
		return (
			`${nameString}\n` +
			`<b>${await getClanName(castle.thisClan)}</b> успешно захватили замок!`
		)
	}

	async notSuccessAttack (castle, nameString, state) {
		return (
			`${nameString}\n`+
      `<b>${await getClanName(castle.thisClan)}</b> отбили атаку ${state.attackInfo.name}`
		)
	}

	async sendMessage (bot, message) {
		await bot.telegram.sendMessage(process.env.CHAT_ID,
			message, {
			parse_mode: 'HTML'
		})
	}
}

export default new ConstMessage()