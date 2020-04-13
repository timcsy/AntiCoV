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