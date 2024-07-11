const Character = require('./Character.js');

class Account {
	constructor(data, uid){
		this._raw = data;
		this.uid = uid;
	}
	
	get characters(){
		const characters = Object.values(this._raw).map(d => new Character(d));
		
		return characters;
	}
	
	static fromUid(data, uid){
		const avatars = {};
		for (const avatar of data.avatarInfoList){
			avatars[avatar.avatarId] = [{ avatar_id: avatar.avatarId, avatar_data: avatar }];
		}
		
		return new Account(avatars, uid);
	}
	
	static fromUsername(data, uid){
		return new Account(data, uid);
	}
}

module.exports = Account