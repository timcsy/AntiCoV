module.exports = {
	async getTemperature(ctx) {
		return {
			"30to31": 2,
			"31to32": 3,
			"32to33": 5
		}
	},
	async table(ctx) {
		return {
			"date1":{
				total: 30,
				fever: 1,
				bad: 2
			},
			"date2":{
				total: 30,
				fever: 1,
				bad: 2
			},
			"date3":{
				total: 30,
				fever: 1,
				bad: 2
			}  //回傳 昨天 前天 大前天的 總人數 發燒數 違規數
		}
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