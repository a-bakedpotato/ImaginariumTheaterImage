const fs = require('fs');
const axios = require('axios');
const cp = require('child_process');

const { createCanvas, loadImage } = require('canvas');
const { enka, elements, special } = require('./settings.json');
const { Account, Character, Weapon } = require('./struct');

const isUidAccount = /(18|[15-9])\d{8}/.test(enka);

const elementColors = {
	anemo: '#90EE90',
	geo: '#E7FFAC',
	electro: '#D5AAFF',
	dendro: '#59C060',
	hydro: '#85E3FF',
	pyro: '#FAC898',
	cryo: '#C4FAF8',
	mc: '#D3D3D3'
}

async function getUidAccount(){
	const { data } = await axios.get('https://enka.network/api/uid/' + enka);
	
	return [Account.fromUid(data, enka)];
}

async function getUsernameAccount(){
	const { data } = await axios.get('https://enka.network/api/profile/' + enka + '/hoyos');
	
	const accounts = [];
	for (const id of Object.keys(data)){
		if (data[id].hoyo_type !== 0) continue;
		if (!data[id].uid_public) throw new Error('UID not public');
		
		const buildsReq = await axios.get('https://enka.network/api/profile/' + enka + '/hoyos/' + id + '/builds');
		accounts.push(Account.fromUsername(buildsReq.data, data[id].uid));
	}
	
	return accounts;
}

async function main(){
	console.log('Initializing data');
	const data = isUidAccount ? await getUidAccount() : await getUsernameAccount();
	const avatarData = await axios.get('https://api.ambr.top/v2/en/avatar');
	const weaponData = await axios.get('https://api.ambr.top/v2/en/weapon');
	
	Character.setAvatarData(avatarData.data.data.items);
	Weapon.setWeaponData(weaponData.data.data.items);
	
	const specialIds = special.map(c => Character.getIdFromName(c));
	specialIds.push('10000005', '10000007');
	
	const w = 500 * data.length;
	const h = Math.max(...data.map(a => a.characters.filter(c => c.level >= 70).filter(c => elements.includes(c.element) || specialIds.includes(c.id)).length)) * 50 + 65;
	
	console.log('Generating image');
	const canvas = createCanvas(w, h);
	const ctx = canvas.getContext('2d');
	
	const bg = await loadImage('./img/bg.png');
	ctx.drawImage(bg, 0, 0, w, h);
	const wolfy = await loadImage('./img/wolfy.png');
	const wolfyH = Math.min(h, 250);
	const wolfyW = wolfyH * 6 / 5
	ctx.drawImage(wolfy, w - wolfyW, h - wolfyH, wolfyW, wolfyH);
	//ctx.fillStyle = '#FFFFFF';
	//ctx.fillRect(0, 0, w, h);
	
	const cache = {};
	let i = 0;
	let x = 10;
	for (const acc of data){
		console.log('[Account ' + ++i + ' of ' + data.length + ']');
		
		//uid
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#FFFFFF';
		ctx.font = '50px sansserif';
		ctx.fillText(acc.uid, x + 240, 30);
		
		let j = 0;
		let y = 60;
		const characters = acc.characters
			.filter(c => c.level >= 70)
			.filter(c => elements.includes(c.element) || specialIds.includes(c.id))
			.sort((a, b) => {
				if (a.level !== b.level) return b.level - a.level; //i dont have an account to test this so might be backwards
				if (a.element !== b.element) return a.element.localeCompare(b.element);
				return a.name.localeCompare(b.name);
			});
		for (const c of characters){
			ctx.fillStyle = '#000000';
			ctx.fillRect(x - 2, y - 2, 484, 49);
			ctx.fillStyle = elementColors[c.element];
			ctx.fillRect(x, y, 480, 45);
			
			//icon
			if (!cache[c.id]){
				const avatarIcon = await axios({ url: 'https://api.ambr.top/assets/UI/' + c.icon + '.png', responseType: 'arraybuffer' });
				const avatarBuffer = Buffer.from(avatarIcon.data, 'binary');
				const charImg = await loadImage(avatarBuffer);
				ctx.drawImage(charImg, x + 5, y, 45, 45);
				cache[c.id] = charImg;
			} else ctx.drawImage(cache[c.id], x + 5, y, 45, 45);
			
			//level
			ctx.textAlign = 'left';
			ctx.fillStyle = '#000000';
			ctx.font = '30px sans';
			ctx.fillText('Lv ' + c.level, x + 60, y + 22);
			
			//name
			ctx.textAlign = 'center';
			ctx.fillText(c.name, x + 330, y + 22);
			
			//constellation
			const con = c.constellation;
			ctx.fillStyle = con === 6 ? '#B26F69' : '#333333';
			ctx.fillRect(x + 34, y + 24, 20, 20);
			ctx.fillStyle = con === 6 ? '#E3C956' : '#DDDDDD';
			ctx.fillRect(x + 36, y + 26, 16, 16);
			ctx.fillStyle = con === 6 ? '#B26F69' : '#333333';
			ctx.font = 'bold 12px sans';
			ctx.fillText(con, x + 44, y + 34);
			
			//weapon icon
			if (!cache[c.weapon.id]){
				const weaponIcon = await axios({ url: 'https://api.ambr.top/assets/UI/' + c.weapon.icon + '.png', responseType: 'arraybuffer' });
				const weaponBuffer = Buffer.from(weaponIcon.data, 'binary');
				const weapImg = await loadImage(weaponBuffer);
				ctx.drawImage(weapImg, x + 135, y, 45, 45);
				cache[c.weapon.id] = weapImg;
			} else ctx.drawImage(cache[c.weapon.id], x + 135, y, 45, 45);
			
			//weapon refine
			const ref = c.weapon.refine;
			ctx.fillStyle = ref === 5 ? '#B26F69' : '#333333';
			ctx.fillRect(x + 164, y + 24, 20, 20);
			ctx.fillStyle = ref === 5 ? '#E3C956' : '#DDDDDD';
			ctx.fillRect(x + 166, y + 26, 16, 16);
			ctx.fillStyle = ref === 5 ? '#B26F69' : '#333333';
			ctx.font = 'bold 12px sans';
			ctx.fillText(ref, x + 174, y + 34);
			
			console.log('Character ' + ++j + ' of ' + characters.length + ' - Drew ' + c.name);
			y += 50;
		}
		
		x += 500;
	}
	
	const out = fs.createWriteStream('./output.png');
	const stream = canvas.createPNGStream();
	stream.pipe(out);
	out.on('finish', () => {
		console.log('Image generation complete');
		cp.exec('start "" "' + __dirname + '/output.png"');
	});
	
}

main();