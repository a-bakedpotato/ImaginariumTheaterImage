let avatarData;

class Character {
	constructor(data){
		this._raw = data;
	}
	
	get element(){
		const build = this._raw[0]; //element doesnt change unless mc
		if (['10000007', '10000009'].includes(this.id)) return null; //mc
		
		const elements = {
			70: 'pyro',
			71: 'electro',
			72: 'hydro',
			73: 'dendro',
			74: 'anemo',
			75: 'cryo',
			76: 'geo'
		}
		
		const fightPropMap = build.avatar_data.fightPropMap;
		for (const fightProp of Object.keys(fightPropMap)){
			if (elements[fightProp] && fightPropMap[fightProp] > 0) return elements[fightProp];
		}
		
		return null;
	}
	
	get icon(){
		if (!avatarData) throw new Error('Missing avatarData');
		
		return avatarData[this.id].icon;
	}
	
	get id(){
		return this._raw[0].avatar_id;
	}
	
	get level(){
		const levels = [];
		
		for (const build of this._raw) levels.push(parseInt(build.avatar_data.propMap['4001'].val));
		return Math.max(levels);
	}
	
	get name(){
		if (!avatarData) throw new Error('Missing avatarData');
		
		return avatarData[this.id].name;
	}
	
	static getIdFromName(name){
		if (!avatarData) throw new Error('Missing avatarData');
		
		for (const chara of Object.values(avatarData)){
			if (chara.name.toLowerCase() !== name.toLowerCase()) continue;
			return chara.id;
		}
		
		return null;
	}
	
	static setAvatarData(data){
		avatarData = data;
	}
}

module.exports = Character;