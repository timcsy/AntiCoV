# AntiCoV - 後端溝通儲存

安裝
---
```
npm install
```

設定
---
先在根目錄創建一個叫做 config 的資料夾
在資料夾下新增一個檔案叫做 mongoose.js 如下：
```
module.exports = {
	hostname: '主機名稱(預設值為localhost)',
	port: '端口(預設值為27017)'
	username: '使用者名稱',
	password: '密碼',
	database: 'auth'
}
```
就可以完成資料庫設定了！

在這個資料夾再創一個檔案叫做 rbac.js 範例如下：
```
module.exports = {
	roles: [
		{
			value: 'guest',
			permissions: [
				'local:username'
			],
			action: 'allow'
		},
		{
			value: 'member',
			permissions: [
				'user:list',
				'users:get',
				'users:delete',
				'users:addOwner',
				'users:removeOwner',
				'identities:list',
				'identities:get',
				'identities:unlink',
				'identities:delete',
				'groups:list',
				'groups:get',
				'groups:post',
				'groups:put',
				'groups:delete',
				'groups:listUsers',
				'groups:addUser',
				'groups:removeUser',
				'groups:removeUser'
			],
			action: 'allow',
			inherits: [
				'guest'
			]
		},
		{
			value: 'admin',
			permissions: [
				'*:*'
			],
			inherits: [
				'member'
			]
		}
	]
}
```
再執行server/setup.js，就可以完成權限角色設定了！

在這個資料夾再創一個檔案叫做 server.js 範例如下：
```
module.exports = {
	SESSION_KEYS: ['super-secret-key']
}
```
就可以完成Session設定了！

在這個資料夾再創一個檔案叫做 jwt.js 範例如下：
```
module.exports = {
	secret: 'your_jwt_secret',
	expires: '1d'
}
```
就可以完成JWT設定了！

在這個資料夾再創一個檔案叫做 facebook.js 範例如下：
```
module.exports = {
	FACEBOOK_APP_ID: 'FACEBOOK_APP_ID',
	FACEBOOK_APP_SECRET: 'FACEBOOK_APP_SECRET',
	AUTH_callbackURL: '你的網址/auth/facebook/callback',
	CONNECT_callbackURL: '你的網址/connect/facebook/callback'
}
```
就可以完成Facebook API設定了！

執行
---
運行後端server：
```
npm run server
```
產生前端程式碼與運行後端server：
```
npm run start
```
or
```
npm start
```

使用說明
---
### 使用者、群組、角色架構

#### 概覽
* Identity：身分，認證(authentication)的基本單位，同一位使用者(User)可以擁有多個Identity
	* 需自訂local、facebook儲存形式等(routes/identity.js)
* User：使用者，權限的基本單位之一，擁有角色(Roles)，可屬於群組(Groups)
* Group：群組，權限的基本單位之一，擁有使用者(Users)、角色(Roles)
	* 目前沒有owner/admin機制，可自行添加

#### Link/Unlink
這是連結/分離Identity的意思，有幾點須 **特別注意！！**：

* 合併User造成的問題
	* 預設是後者會放棄一切ownership、roles、permissions、groups
	* 如果要保留roles、permissions會是一場大災難
	* 而且通常要Link是因為想要加入社群帳號
	* 不過 **一定要提醒或引導使用者：要已有完整資料的那個帳號先登入再做連結！！**
	* 如果有特別需求要去server/models/User的userSchema.statics.link做修改！
* 分離User造成的問題
	* 預設是後者會放棄一切ownership、roles、permissions、groups成為新的User(role=member)
	* 通常是因為帳號不常用或帳號失效才會分離User
	* 如果有特別需求要去server/models/Identity的identitySchema.methods.unlink做修改！

### Access Control架構

採用 Hierarchical Role Based Access Control，內涵glob機制

設定見[設定](#設定)的rbac.js

權限的格式為 resource:method，一定要有一個冒號，支援glob notation

首先要先加入
```
const RBAC = require('根目錄位置/server/lib/rbac')
```
用session或JWT保護路由(as middleware)，guest預設值是false(guest模式不會留下session紀錄、link)：
```
RBAC.auth(guest=false)
```
針對resource的保護(as middleware)：
```
RBAC.middleware(permission)
```
針對data的保護(需提供data的principal list(通常是owners)，return Boolean)：
```
RBAC.check(userId, permission, principals)
```

#### 運作原理
1. 有針對data => 先檢查當前的user是不是data的owners(User或Group)之一
2. 檢查User/Group是否擁有權限，若沒有則開始找roles跟繼承的roles
注意：檢查是以有沒有有效的權限來看，allow/deny不影響這個原則

#### allow/deny
allow(預設)是指列出來的權限是有效的，其他都無效
deny是指列出來的權限是無效的，其他都有效

#### glob 使用方法
參考 https://github.com/isaacs/minimatch


範例
---
以Data這個model作為Demo說明