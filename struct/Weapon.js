let weaponData;

class Weapon {
	constructor(data){
		this._raw = data;
	}
	
	get icon(){
		if (!weaponData) throw new Error('Missing weaponData');
		
		return weaponData[this.id].icon;
	}
	
	get id(){
		return this._raw.itemId;
	}
	
	get refine(){
		return Object.values(this._raw.weapon.affixMap ?? {_: 0})[0] + 1;
	}
	
	static setWeaponData(data){
		weaponData = data;
	}
}

module.exports = Weapon