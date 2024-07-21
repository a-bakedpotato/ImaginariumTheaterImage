const Weapon = require('./Weapon.js');

let avatarData;

class Character {
	constructor(data){
		this._raw = data;
	}
	
	get constellation(){
		const build = this._raw[0];
		return build.avatar_data.talentIdList?.length ?? 0;
	}
	
	get element(){
		const build = this._raw[0]; //element doesnt change unless mc
		if (['10000005', '10000007'].includes(this.id)) return 'mc'; //mc
		
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
		
		if (this.element === 'mc') return avatarData[this.id + '-anemo'].icon;
		return avatarData[this.id].icon;
	}
	
	get id(){
		return this._raw[0].avatar_id.toString();
	}
	
	get level(){
		const levels = [];
		
		for (const build of this._raw) levels.push(parseInt(build.avatar_data.propMap['4001'].val));
		return Math.max(...levels);
	}
	
	get name(){
		if (this.element === 'mc') return 'Traveler';
		if (!avatarData) throw new Error('Missing avatarData');
		
		return avatarData[this.id].name;
	}
	
	get weapon(){
		const build = this._raw.sort((a, b) => b.avatar_data.equipList.find(e => e.weapon).flat.rankLevel - a.avatar_data.equipList.find(e => e.weapon).flat.rankLevel)[0]; //builds are not in same order as enka website and this is a quick fix, if anyone wants to do this better feel free to make a pr, rn im just making it highest rarity weapon
		
		//const build = this._raw[0];
		if (this.name === 'Lynette') console.log(build.avatar_data.equipList.find(e => e.weapon));
		return new Weapon(build.avatar_data.equipList.find(e => e.weapon));
	}
	
	static getIdFromName(name){
		if (!avatarData) throw new Error('Missing avatarData');
		
		for (const chara of Object.values(avatarData)){
			if (chara.name.toLowerCase() !== name.toLowerCase()) continue;
			return chara.id.toString();
		}
		
		return null;
	}
	
	static setAvatarData(data){
		avatarData = data;
	}
}

module.exports = Character;