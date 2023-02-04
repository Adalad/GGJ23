var commandNames = [];
var commandInstances = [];
var currentProcess;
var terminalProcess;

function setupCommands()
{
	terminalProcess = new Terminal();
	currentProcess = terminalProcess;
	commandNames.push('cd');
	commandInstances.push(new CdCmd());
	commandNames.push('clear');
	commandInstances.push(new ClearCmd());
	//commandNames.push('cp');
	commandNames.push('date');
	commandInstances.push(new DateCmd());
	commandNames.push('decrypt');
	commandInstances.push(new DecryptCmd());
	commandNames.push('echo');
	commandInstances.push(new EchoCmd());
	commandNames.push('ls');
	commandInstances.push(new LsCmd());
	commandNames.push('man');
	commandInstances.push(new ManCmd());
	//commandNames.push('mkdir');
	//commandNames.push('mv');
	commandNames.push('pwd');
	commandInstances.push(new PwdCmd());
	//commandNames.push('rm');
	//commandNames.push('rmdir');
	commandNames.push('unlock');
	commandInstances.push(new UnlockCmd());
	commandNames.push('view');
	commandInstances.push(new ViewCmd());
}
class Terminal {
	constructor() {}
	execute(args) {
	}
}
class CdCmd {
	constructor() {}
	manual() {
		printText('Set current directory. cd [ARGUMENT]<br />.. Go up<br />- Go previous');
	}
	execute(args) {
		if (args) {
			if (args == '..') { // Go up
				if (currentDirectory.length > 1)
				{
					previousDirectory = currentDirectory;
					currentDirectory.pop();
				}
			} else if (args == '-'){ // Go previous
				let tempDir = currentDirectory;
				currentDirectory = previousDirectory;
				previousDirectory = tempDir;
			} else {
				let currentDir = currentDirectory[currentDirectory.length-1][1]; // From current
				if (args.charAt(0) == '/') { // From root
					currentDir = currentDirectory[0][1];
					currentDirectory = [['',0]];
					args = args.substring(1);
				}
				let dirs = args.split('/');
				let dirsPath = [];
				for (let i=0; i<dirs.length; i++)
				{
					let dirFound = false;
					for (let j=0; j<inodes[currentDir].data.length; j++) {
						if (((inodes[inodes[currentDir].data[j][0]].control && 2) != 0) && (dirs[i] == inodes[currentDir].data[j][1])) { // Folder with name
							currentDir = inodes[currentDir].data[j][0];
							dirsPath.push([dirs[i],currentDir]);
							dirFound = true;
							break;
						}
					}
					if (!dirFound) {
						printText('Invalid path.');
						return;
					}
				}
				previousDirectory = currentDirectory;
				for (let i=0; i<dirsPath.length; i++) {
					currentDirectory.push(dirsPath[i]);
				}
			}
			refreshDirectory();
		} else {
			printText('Invalid path');
		}
	}
}
class ClearCmd {
	constructor() {}
	manual() {
		printText('Clears the terminal log.');
	}
	execute(args) {
		$('#terminalLog, .info').empty();
	}
}
/*class CpCmd {
	constructor() {}
	manual() {
		printText('Copy file from current directory to destination.');
	}
	execute(args) {
		// TODO
	}
}*/
class DateCmd {
	constructor() {}
	manual() {
		printText('Get current date.');
	}
	execute(args) {
		let date = new Date();
		date.setFullYear(1989);
		printText(date.toString());
	}
}
class DecryptCmd {
	constructor() {}
	manual() {
		printText('Decrypt a file. decrypt [KEY] [PATH]');
	}
	execute(args) {
		// TODO
		if (args) {
			args = args.split(' ');
			if (args.length == 2) {
				if (existsPath(args[1])) {
					let pathName = args[1].substring(0, args[1].lastIndexOf('/'));
					let fileName = args[1].substring(args[1].lastIndexOf('/') + 1);
					createFile(pathName+'/decrypted_'+fileName,decrypt(args[0],getDataFromPath(args[1])));
					printText('Decrypt result in: '+pathName+'/decrypted_'+fileName);
				} else {
					printText('File not found.');
				}
			} else {
				printText('Invalid arguments.');
			}
		} else {
			printText('Invalid arguments.');
		}
	}
}
class EchoCmd {
	constructor() {}
	manual() {
		printText('Print text. echo [ARGUMENT]');
	}
	execute(args) {
		printText(args);
	}
}
class LsCmd {
	constructor() {}
	manual() {
		printText('List working directory contents.');
	}
	execute(args) {
		let dir = currentDirectory[currentDirectory.length-1][1];
		let tree = '';
		let dirs = [];
		let files = [];
		for (let i=0; i<inodes[dir].data.length; i++)
		{
			if (inodes[inodes[dir].data[i][0]].control != 0) {
				dirs.push(inodes[dir].data[i][1]);
			} else {
				files.push(inodes[dir].data[i][1]);
			}
		}
		dirs.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		files.sort(function (a, b) {
			return a.toLowerCase().localeCompare(b.toLowerCase());
		});
		for (let i=0; i<dirs.length; i++) // Dirs
		{
			if (dirs[i].charAt(0) == '.') {
				continue;
			}
			tree += dirs[i]+'<br />';
		}
		for (let i=0; i<files.length; i++) // Files
		{
			if (files[i].charAt(0) == '.') {
				continue;
			}
			tree += files[i]+'<br />';
		}
		printText(tree);
		printText('Files: '+files.length+' Directories: '+dirs.length);
	}
}
class ManCmd {
	constructor() {}
	manual() {
		printText('Show available commands. man [ARGUMENT]<br />[none] Show all commands<br />[Command name] Show manual for a specific command');
	}
	execute(args) {
		if (args) { // man [command] show command options
			let manCmd = commandNames.indexOf(args); // Check current command
			if (manCmd === -1) { // Invalid command
				printText('No such command.');
			} else { 
				commandInstances[manCmd].manual(); // Valid command
			}
		} else {
			commandInstances[commandNames.indexOf('man')].manual();
			let manual = 'Available commands:<br />';
			for (let i = 0; i < commandNames.length; i++) {
				manual = manual+'- '+commandNames[i]+'<br />';
			}
			printText(manual);
		}
	}
}
/*class MkDirCmd {
	constructor() {}
	manual() {
		printText('Create directory.');
	}
	execute(args) {
		if (args) {
			if (createDirectory(args))
			{
				printText('Directory created: '+args);
			} else {
				printText('Invalid path');
			}
		} else {
			printText('Invalid path');
		}
	}
}*/
/*class MvCmd {
	constructor() {}
	manual() {
		printText('Move file from current directory to destination.');
	}
	execute(args) {
		// TODO mv file destination -> move   mv file file -> rename
	}
}*/
class PwdCmd {
	constructor() {}
	manual() {
		printText('Show working directory.');
	}
	execute(args) {
		let tree = '/';
		for (let i=1; i<currentDirectory.length; i++)
		{
			tree += currentDirectory[i][0]+'/';
		}
		printText(tree);
	}
}
/*class RmCmd {
	constructor() {}
	manual() {
		printText('Delete file.');
	}
	execute(args) {
		// TODO rm file -> delete file
	}
}*/
/*class RmDirCmd {
	constructor() {}
	manual() {
		printText('Delete directory.');
	}
	execute(args) {
		// TODO rmdir path -> delete directory
	}
}*/
class UnlockCmd {
	constructor() {}
	manual() {
		printText('Unlock content. unlock [key]');
	}
	execute(args) {
		if (args) {
			if (args == 'Ï£W') {
				// FP1
				printText('Unlocked file: /etc/doc_settings1.txt');
				createFile('/etc/doc_settings1.txt','53Y');
			} else if (args == 'Matty') {
				// FU1
				printText('Unlocked file: /goodbye_note.txt');
				createFile('/goodbye_note.txt','»Þ¤');
			} else if (args == '528') {
				// FM4
				printText('Unlocked file: /usr/shared/travel_destination.txt');
				createFile('/usr/shared/travel_destination.txt',"█████████████████████████████████&nbsp████████████████████████████████████████&nbsp███████████████████████████████████&nbsp█████████████████████████████████████████&nbsp█████████████████████&nbsp████████████████████");
				// FP3
				printText('Unlocked file: /etc/doc_settings3.txt');
				createFile('/etc/doc_settings3.txt','@gf');
			} else if (args == 'ƒø×') {
				// FP4
				printText('Unlocked file: /etc/doc_settings4.txt');
				createFile('/etc/doc_settings4.txt','OQf');
			} else if (args == '53Y%78@gfOQf') {
				// FP5
				printText('Unlocked file: /usr/shared/travel_documents.txt');
				createFile('/usr/shared/travel_documents.txt',"When travelling to other countries, remember to carry your passport. A health insurace in also recommended to avoid surprises. Also remember to carry a valid credit card to pay for your expenses.");
				// FP6
				printText('Unlocked file: /usr/Mathew/final_note.txt');
				createFile('/usr/Mathew/final_note.txt',crypt('slava',"You finally made it, you must run now and hide to protect yourself. Let me explain myself. All these years I've been someone else, my real name isn't Mathew, it's Vasiliy.<br/>I did what I was tought, since a little kid. I should be a protector of the light, the communist ideals, so I enlisted and became a KGB agent. For many years I kept living another life, listening for orders and waiting for the moment, in the darkness.<br/>But, while doing so, I realized that what I really was is the night. There are good people in other parts of the world, living their lifes, they are not devils, we are. My ancestors were starved to death or deported by the ones I served. I've been blind for so long... I've already killed many people before; but, when I got the message last night, I couldn't do it.<br/>If you're reading this, it means that I failed, I couldn't stop it. USSR dissolution is only a decoy. Don't seek help in the autorities or the press, they are among us... everywhere. War is here, there's nothing we can do. Hope you'll be able to get somewhere safe.<br/>Vasiliy Volkov"));
			}
		} else {
			printText('You must specify a key.');
		}
	}
}
class ViewCmd {
	constructor() {}
	manual() {
		printText('View text file contents.');
	}
	execute(args) {
		if (args) {
			let data = getDataFromPath(args);
			if (data) {
				printText(data);
			} else {
				printText('File not found.');
			}
		} else {
			printText('You must specify a file.');
		}
	}
}