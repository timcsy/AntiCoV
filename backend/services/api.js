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
	async pass(ctx, status) {
		
	},
	async card(ctx, rfid) {
		return {
			studentId: 'F740xxxxx',
			name: '王小明',
			status: "exists"
		}
	},
	async register(ctx, rfid, studentId, name) {
		return {
			"success": false
		}
	},
	async setTemperature(temperature) {
		return {
			"success": false
		}
	}
}