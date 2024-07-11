const fs = require('fs');
const axios = require('axios');
const cp = require('child_process');

const { createCanvas, loadImage } = require('canvas');
const { enka, elements, special } = require('./settings.json');
const { Account, Character } = require('./struct');

const isUidAccount = /(18|[15-9])\d{8}/.test(enka);

const elementColors = {
	anemo: '#A7F5CD',
	geo: '#F3D965',
	electro: '#DEBAFF',
	dendro: '#B1EB29',
	hydro: '#08E4FF',
	pyro: '#F16003',
	cryo: '#CFFFFF'
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
	
	Character.setAvatarData(avatarData.data.data.items);
	
	const specialIds = special.map(c => Character.getIdFromName(c));
	
	const w = 500 * data.length;
	const h = Math.max(...data.map(a => a.characters.filter(c => c.level >= 70).filter(c => elements.includes(c.element) || specialIds.includes(c.id)).length)) * 50 + 65;
	
	console.log('Generating image');
	const canvas = createCanvas(w, h);
	const ctx = canvas.getContext('2d');
	
	ctx.fillStyle = '#FFFFFF';
	ctx.fillRect(0, 0, w, h);
	
	let i = 0;
	let x = 10;
	for (const acc of data){
		console.log('[Account ' + ++i + ' of ' + data.length + ']');
		
		//uid
		ctx.textAlign = 'center';
		ctx.textBaseline = 'middle';
		ctx.fillStyle = '#000000';
		ctx.font = '50px sansserif';
		ctx.fillText(acc.uid, x + 240, 30);
		
		let y = 60;
		let j = 0;
		
		const characters = acc.characters
			.filter(c => c.level >= 70)
			.filter(c => elements.includes(c.element) || specialIds.includes(c.id))
			.sort((a, b) => {
				if (a.level !== b.level) return a.level - b.level; //i dont have an account to test this so might be backwards
				if (a.element !== b.element) return a.element.localeCompare(b.element);
				return a.name.localeCompare(b.name);
			});
		for (const c of characters){
			ctx.fillStyle = elementColors[c.element];
			ctx.fillRect(x, y, 480, 45);
			
			//icon
			const response = await axios({ url: 'https://api.ambr.top/assets/UI/' + c.icon + '.png', responseType: 'arraybuffer' });
			const buffer = Buffer.from(response.data, 'binary');
			const img = await loadImage(buffer);
			ctx.drawImage(img, x + 5, y, 45, 45);
			
			//level
			ctx.textAlign = 'left';
			ctx.fillStyle = '#000000';
			ctx.font = '30px sans';
			ctx.fillText('Lv ' + c.level, x + 60, y + 22);
			
			//name
			ctx.textAlign = 'center';
			ctx.fillText(c.name, x + 325, y + 22);
			
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