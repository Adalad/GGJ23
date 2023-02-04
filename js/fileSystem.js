var inodes = [];
var currentDirectory = [];
var previousDirectory;

/*
// encrypting
const encrypted_text = crypt("salt", "Hello"); // -> 426f666665
// decrypting
const decrypted_string = decrypt("salt", "426f666665"); // -> Hello
*/
const crypt = (salt, text) => {
	const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
	const byteHex = (n) => ("0" + Number(n).toString(16)).substr(-2);
	const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
	return text
		.split("")
		.map(textToChars)
		.map(applySaltToChar)
		.map(byteHex)
		.join("");
};
const decrypt = (salt, encoded) => {
	const textToChars = (text) => text.split("").map((c) => c.charCodeAt(0));
	const applySaltToChar = (code) => textToChars(salt).reduce((a, b) => a ^ b, code);
	return encoded
		.match(/.{1,2}/g)
		.map((hex) => parseInt(hex, 16))
		.map(applySaltToChar)
		.map((charCode) => String.fromCharCode(charCode))
		.join("");
};

function createDirectory(path) {
	if (path) {
		let currentDir = currentDirectory[currentDirectory.length-1][1]; // From current
		if (path.charAt(0) == '/') { // From root
			currentDir = currentDirectory[0][1];
			path = path.substring(1);
		}
		let dirs = path.split('/');
		if (!path) {
			dirs.shift();
		}
		for (let i=0; i<dirs.length; i++) {
			let dirFound = false;
			for (let j=0; j<inodes[currentDir].data.length; j++) {
				console.log(inodes[currentDir].data[j]);
				if ((inodes[inodes[currentDir].data[j][0]].control != 0) && (dirs[i] == inodes[currentDir].data[j][1])) { // Folder with name
					currentDir = inodes[currentDir].data[j][0];
					dirFound = true;
					break;
				}
			}
			if (!dirFound) {
				let inode = {
					nodeID: inodes.length,
					control: 1,
					data: []
				};
				inodes.push(inode);
				inodes[currentDir].data.push([inodes.length-1,dirs[i]]);
				currentDir = inodes.length-1;
			}
		}
	}
}
function createFile(path,data) {
	if (path) {
		let currentDir = currentDirectory[currentDirectory.length-1][1]; // From current
		if (path.charAt(0) == '/') { // From root
			currentDir = currentDirectory[0][1];
			path = path.substring(1);
		}
		let dirs = path.split('/');
		if (!path) {
			dirs.shift();
		}
		for (let i=0; i<dirs.length-1; i++) {
			let dirFound = false;
			for (let j=0; j<inodes[currentDir].data.length; j++) {
				if ((inodes[inodes[currentDir].data[j][0]].control != 0) && (dirs[i] == inodes[currentDir].data[j][1])) { // Dir with name
					currentDir = inodes[currentDir].data[j][0];
					dirFound = true;
					break;
				}
			}
			if (!dirFound) {
				let inode = {
					nodeID: inodes.length,
					control: 1, // dir if true
					data: []
				};
				inodes.push(inode);
				inodes[currentDir].data.push([inodes.length-1,dirs[i]]);
				currentDir = inodes.length-1;
			}
		}
		// Create file
		let createFile = true;
		for (let j=0; j<inodes[currentDir].data.length; j++) {
			if ((inodes[inodes[currentDir].data[j][0]].control == 0) && (dirs[dirs.length-1] == inodes[currentDir].data[j][1])) { // File already exists
				return;
			}
		}
		let inode = {
			nodeID : inodes.length,
			control : 0, // dir if true
			data: data
		};
		inodes.push(inode);
		inodes[currentDir].data.push([inodes.length-1,dirs[dirs.length-1]]);
	}
}
function existsPath(path) {
	if (path) {
		let currentDir = currentDirectory[currentDirectory.length-1][1]; // From current
		if (path.charAt(0) == '/') { // From root
			currentDir = currentDirectory[0][1];
			path = path.substring(1);
		}
		let dirs = path.split('/');
		if (!path) {
			dirs.shift();
		}
		for (let i=0; i<dirs.length; i++) {
			let dirFound = false;
			for (let j=0; j<inodes[currentDir].data.length; j++) {
				if (dirs[i] == inodes[currentDir].data[j][1]) { // Name match
					currentDir = inodes[currentDir].data[j][0];
					dirFound = true;
					break;
				}
			}
			if (!dirFound) {
				return false;
			}
		}
		return true;
	}
	return false;
}
function getCurrentDirectoryPath() {
	if(currentDirectory.length <= 1) {
		return '~';
	}
	let path = '';
	for (let i = 1; i < currentDirectory.length; i++) {
		path += '/'+currentDirectory[i][0];
	}
	path += '/';
	return path;
}
function getDataFromPath(path) {
	let currentDir = currentDirectory[currentDirectory.length-1][1]; // From current
	if (path.charAt(0) == '/') { // From root
		currentDir = currentDirectory[0][1];
		path = path.substring(1);
	}
	let dirs = path.split('/');
	for (let i=0; i<dirs.length-1; i++)
	{
		let dirFound = false;
		for (let j=0; j<inodes[currentDir].data.length; j++) {
			if ((inodes[inodes[currentDir].data[j][0]].control != 0) && (dirs[i] == inodes[currentDir].data[j][1])) { // Folder with name
				currentDir = inodes[currentDir].data[j][0];
				dirFound = true;
				break;
			}
		}
		if (!dirFound) {
			return;
		}
	}
	// Path OK, check last bit
	for (let j=0; j<inodes[currentDir].data.length; j++) {
		if (dirs[dirs.length-1] == inodes[currentDir].data[j][1]) { // Last found
			return inodes[inodes[currentDir].data[j][0]].data;
		}
	}
}
function setupFileSystem() {
	// / dir
	let inode = {
		nodeID : 0,
		control : 1, // folder if true
		data: []
	};
	inodes.push(inode);
	currentDirectory.push(['',0]);
	previousDirectory = currentDirectory;
	createFile('/usr/Mathew/ascii_chars.txt',"0 Null 1 Start of Header 2 Start of Text 3 End of Text 4 End of Trans. 5 Enquiry 6 Acknowledegment 7 Bell 8 Backspace 9 Horizontal Tab<br/>10 Line feed 11 Vertical Tab 12 New page 13 Return 14 Shift out 15 Shift in 16 Data link escape 17 Device control 1 18 Device control 2 19 Device control 3<br/>20 Device control 4 21 Negative acknowl. 22 Synchronous idle 23 End of trans. block 24 Cancel 25 End of medium 26 Substitute 27 Escape 28 File separator 29 Group separator<br/>30 Record separator 31 Unit Separator 32 Space 33 ! 34 ” 35 # 36 $ 37 % 38 & 39 ’<br/>40 ( 41 ) 42 * 43 + 44 , 45 - 46 . 47 / 48 0 49 1<br/>50 2 51 3 52 4 53 5 54 6 55 7 56 8 57 9 58 : 59 ;<br/>60 ˂ 61 = 62 ˃ 63 ? 64 @ 65 A 66 B 67 C 68 D 69 E<br/>70 F 71 G 72 H 73 I 74 J 75 K 76 L 77 M 78 N 79 O<br/>80 P 81 Q 82 R 83 S 84 T 85 U 86 V 87 W 88 X 89 Y<br/>90 Z 91 [ 92 \ 93 ] 94 ^ 95 _ 96 ' 97 a 98 b 99 c<br/>100 d 101 e 102 f 103 g 104 h 105 i 106 j 107 k 108 l 109 m<br/>110 n 111 o 112 p 113 q 114 r 115 s 116 t 117 u 118 v 119 w<br/>120 x 121 y 122 z 123 { 124 | 125 } 126 ~ 127 _ 128 Ç 129 ü<br/>130 é 131 â 132 ä 133 à 134 å 135 ç 136 ê 137 ë 138 è 139 ï<br/>140 î 141 ì 142 Ä 143 Å 144 É 145 æ 146 Æ 147 ô 148 ö 149 ò<br/>150 û 151 ù 152 ÿ 153 Ö 154 Ü 155 ø 156 £ 157 Ø 158 × 159 ƒ<br/>160 á 161 í 162 ú 163 ñ 164 ñ 165 Ñ 166 ª 167 º 168 ¿ 169 ®<br/>170 ¬ 171 ½ 172 ¼ 173 ¡ 174 « 175 » 176 ░ 177 ▒ 178 ▓ 179 │<br/>180 ┤ 181 Á 182 Â 183 À 184 ╣ 185 ║ 186 ║ 187 ╗ 188 ╝ 189 ¢<br/>190 ¥ 191 ┐ 192 └ 193 ┴ 194 ┬ 195 ├ 196 ─ 197 ┼ 198 ã 199 Ã<br/>200 ╚ 201 ╔ 202 ╩ 203 ╦ 204 ╠ 205 ═ 206 ╬ 207 ¤ 208 ð 209 Ð<br/>210 Ê 211 Ë 212 ı 213 ı 214 Í 215 Î 216 Ï 217 ┘ 218 ┌ 219 █<br/>220 ▄ 221 ¦ 222 Ì 223 ▀ 224 Ó 225 ß 226 Ô 227 Ò 228 õ 229 Õ<br/>230 µ 231 þ 232 Þ 233 Ú 234 Û 235 Ù 236 ý 237 Ý 238 ¯ 239 ´<br/>240 ­ 241 ± 242 ‗ 243 ¾ 244 ¶ 245 § 246 ÷ 247 ¸ 248 ° 249 ¨<br/>250 · 251 ¹ 252 ³ 253 ² 254 ■ 255 nbsp");
	createFile('/readme.txt',"I'm sorry I couldn't tell you more, at least you got access, you'll understand. Everything you need is within locked dirs and cyphered files. Remember to use the manual if you have any doubts.<br/>Matty");
	createFile('/usr/Mathew/earning_estimations1.txt',"░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░&nbsp░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░");
	createFile('/usr/shared/earning_estimations2.txt',"▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒&nbsp▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒");
	createFile('/earning_estimations3.txt',"▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓&nbsp▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓");
	createFile('/usr/Mathew/finance_report.txt',"Quarterly results gives us a clear view of current investments. Validation of previous expenses is required to deliver 10k units. We should ask for another 20M$ before proceeding.");
	createFile('/temp/future_investments.txt',"µV¦¬kÐß@0÷<br/>╬Ï«ö£┘¥╦Wü");
	createFile('/etc/doc_settings2.txt',crypt('»Þ¤',"%78"));
	createFile('/usr/shared/industry_prospects.txt',"=====ÐÐÐÐÐ╦╦®®®®®®®®=====");
	createFile('/usr/Mathew/exports_proceeding.txt',"START: ø<br/>Ð£ô¤╔×øƒ<br/>Ã£¤ô<br/>øæ<br/>▀×ƒø<br/>¼¤£ô<br/>┼ø×ƒ<br/>Æ¤ô£<br/>¿§<br/>¶ƒø×<br/>‗ô£¤<br/>æ¿<br/>¢øƒ×<br/>ëô¤£<br/>®ƒ×ø<br/>§¶");
}