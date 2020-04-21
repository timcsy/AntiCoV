const People = require('../models/Data/People')
const Record = require('../models/Data/Record')
const Flow = require('../models/Data/Flow')
const send = require('../routes/ws/index').send
const moment = require('moment')

let peopleId = null // global rfid (who is using)
let lastTime = Date.now()

module.exports = {
	async getTemperature(ctx) {
		const time = moment(new Date()).format('YYYY-MM-DD')
		let records = await Record.find({time: {$gte: time}}).exec()
		let one = 0, two = 0, three = 0, four = 0, five = 0, six = 0, seven = 0
		records.map(r => {
			t = r.temperature
			if (t < 34) one++
			else if (t < 35) two++
			else if (t < 36) three++
			else if (t < 37) four++
			else if (t < 38) five++
			else if (t < 39) six++
			else if (t >=39) seven++
		})
		return {
			one, two, three, four, five, six, seven
		}
	},
	async table(ctx) {
		let date1 = moment(Date.now())
		let date2 = moment(date1).subtract(1, 'days')
		let date3 = moment(date2).subtract(1, 'days')
		let date4 = moment(date3).subtract(1, 'days')
		data1 = stat(date2.format('YYYY-MM-DD'), date1.format('YYYY-MM-DD'))
		data2 = stat(date3.format('YYYY-MM-DD'), date2.format('YYYY-MM-DD'))
		data3 = stat(date4.format('YYYY-MM-DD'), date3.format('YYYY-MM-DD'))
		return [ //回傳 昨天 前天 大前天的 均溫 總人數 發燒數 違規數
			data1,
			data2,
			data3,
			{
				date1: date2.format('MM/DD'),
				date2: date3.format('MM/DD'),
				date3: date4.format('MM/DD')
			}
		]
	},
	async statistics(ctx) {
		return stat(moment(new Date()).format('YYYY-MM-DD'), Date.now())
	},
	async search(ctx, studentId) {
		let people = await People.findOne({studentId: studentId}).select({owners: 1}).exec()
		if (people) {
			people = await People.findById(people._id).exec()
			let situation = 'NULL'
			const time = moment(new Date).format('YYYY-MM-DD')
			const record = await Record.find({people: people._id, time: {$gte: time}}).exec()
			if (record) {
				if (record.temperature < 37.5) {
					situation = 'OK'
				} else {
					situation = 'not OK'
				}
			}
			return {
				name: people.name,
				studentId: people.studentId,
				rfid: people.rfid,
				situation: situation
			}
		}
		ctx.status = 404
		// for demo
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
			let people = await People.findById(peopleId).exec()
			console.log('Fever: ', temperature, people.studentId, people.name)
			send({
				"alarm": "fever",
				"temperatue": temperature,
				"rfid": people.rfid,
				"studentId": people.studentId,
				"name": people.name,
				"time": Date.now()
			})
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
		if (record.number) {
			if (record.status == 'enter') enter += record.number
			else if (record.status == 'exit') exit += record.number
		}
	}
	console.log('enter =', enter, ', exit =', exit)
	let record = []
	if (lastTime) record = await Record.find({time: {$gte: lastTime}}).exec()
	let measure = record.length
	if (enter == exit && measure < enter) {
		lastTime = Date.now()
		console.log('Warning:', 'enter =', enter, ', exit =', exit, ', measure =', measure)
		send({
			"alarm": "bad",
			"time": Date.now()
		})
	}
}

async function stat(start, end) {
	let enter = 0
	let exit = 0
	let fever = 0
	let total = 0
	let total_temp = 0
	let flow = await Flow.find({time: {$gte: start, $lte: end}}).exec()
	for (let record of flow) {
		if (record.number) {
			if (record.status == 'enter') enter += record.number
			else if (record.status == 'exit') exit += record.number
		}
	}
	let records = await Record.find({time: {$gte: start, $lte: end}}).exec()
	for (let record of records) {
		const t = record.temperature
		if (t > 37.5) fever++
		total++
		if (!isNaN(record.temperature)) total_temp += record.temperature
	}
	return {
		avg_temp: total_temp / total,
		total,
		fever,
		bad: (enter + exit) / 2 - total
	}
}