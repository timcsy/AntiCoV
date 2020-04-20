const People = require('../models/Data/People')
const Record = require('../models/Data/Record')
const Flow = require('../models/Data/Flow')

let peopleId = null // global rfid (who is using)
let lastTime = null

module.exports = {
	async getTemperature(ctx) {
		return {
			one: 1, // < 34
			two: 2, // 34 - 35
			three: 3, // 35 - 36
			four: 4, // 36 - 37
			five: 5, // 37 - 38
			six: 6, // 38 - 39
			seven: 7 // >= 39
		}
	},
	async table(ctx) {
		return [
			{
				total: 30,
				fever: 1,
				bad: 2
			},
			{
				total: 30,
				fever: 1,
				bad: 2
			},
			{
				total: 30,
				fever: 1,
				bad: 2
			}, //回傳 昨天 前天 大前天的 總人數 發燒數 違規數
			{
				date1: "4/10",
				date2: "4/9",
				date3: "4/8"
			}
		]
	},
	async statistics(ctx) {
		return {
			avg_temp: 32,
			total: 44,
			fever: 4,
			bad: 3
		}
	},
	async search(ctx, studentId) {
		return {
			name: '王小明',
			situation: 'OK/not OK/NULL',//今天的溫度量測狀態 通過,發燒,今天沒來
			studentId: 'F740xxxxx',
			rfid: 'xxxxx'
		}
	},
	async pass(ctx, status, number) {
		let flow = await Flow.create(ctx.state.user)
		flow.status = status
		flow.number = number
		await flow.save()

		flow = await Flow.findById(flow._id).exec()
		await monit()
		return flow.view()
	},
	async card(ctx, rfid) {
		let people = await People.findOne({rfid: rfid}).select({owners: 1}).exec()
		if (people) {
			peopleId = people._id
			return {...people.view(), status: 'exists'}
		} else {
			let people = await People.create(ctx.state.user)
			people.rfid = rfid
			await people.save()
			peopleId = people._id
			return {
				studentId: null,
				name: null,
				status: "new"
			}
		}
	},
	async register(ctx, rfid, studentId, name) {
		let people = await People.findOne({rfid: rfid}).select({owners: 1}).exec()
		if (!people) {
			people = await People.create(ctx.state.user)
		}
		people.rfid = rfid
		people.studentId = studentId
		people.name = name
		await people.save()

		people = await People.findById(people._id).exec()
		return people.view()
	},
	async setTemperature(ctx, temperature) {
		let record = await Record.create(ctx.state.user)
		record.temperature = temperature
		if (!peopleId) {
			return {
				"success": false,
				"message": 'RFID Doen not exist'
			}
		}
		record.people = peopleId
		await record.save()

		record = await Record.findById(record._id).exec()

		if (temperature > 37.5) {
			console.log('Fever: ', temperature)
		}

		await monit()
		return {
			"success": true
		}
	}
}

async function monit() {
	let enter = 0
	let exit = 0
	let flow =  []
	if (lastTime) flow = await Flow.find({time: {$gte: lastTime}}).exec()
	for (let record of flow) {
		if (record.status === 'enter') enter++
		else if (record.status === 'exit') exit++
	}
	let record = []
	if (lastTime) record = await Record.find({time: {$gte: lastTime}}).exec()
	let measure = record.length
	lastTime = Date.now()
	if (enter == exit && measure != enter) {
		console.log('Warning:', 'enter =', enter, ', exit =', exit, ', measure =', measure)
	}
}