var logged = false;
var root = false;
var secretInput = false;
var currentUser = 'guest@remote';
var currentDir = '~';

function changeUser(userName)
{
	currentUser = userName+'@remote:';
	$('#userTag').text(currentUser)
}
function refreshDirectory()
{
	currentDir = getCurrentDirectoryPath();
	$('#currentDir').text(currentDir);
}
function printCommand(command)
{
	$('#terminalLog').append('<p class="command"><span class="userTag">'+currentUser+'</span><span class="directory">'+currentDir+'</span>$ '+command+'</p>');
}
function printText(text)
{
	$('#terminalLog').append('<p class="log">'+text+'</p>');
}
function notLogged(currentCommand)
{
	printCommand(currentCommand); // Add command to log
	if (currentCommand === "su root")
	{
		printText('Enter password:');
		$('#userTag').text('');
		$('#currentDir').text('');
		secretInput = true;
		logged = true;
		return;
	} else {
		printText('Access denied');
		return;
	}
}
function enterPassword(password)
{
	secretInput = false;
	if (password === "Odessa")
	{
		changeUser('root');
		refreshDirectory();
		root = true;
	}
	else
	{
		logged = false;
		printText('Login incorrect');
	}
}
function processInput(inputValue)
{
	if (!logged) {
		notLogged(inputValue);
		return;
	}
	if (!root)
	{
		enterPassword(inputValue);
		return;
	}
	printCommand(inputValue); // Add command to log
	let cmdName = inputValue.substring(0, inputValue.indexOf(' '));
	let cmdArgs = inputValue.substring(inputValue.indexOf(' ') + 1);
	if (inputValue.indexOf(' ') == -1) {
		cmdName = inputValue;
		cmdArgs = undefined;
	}
	currentCommand = commandNames.indexOf(cmdName); // Check current command
	if (currentCommand === -1) { // Invalid command
		printText(inputValue+': command not found. Use "man" for help.');
	} else { 
		commandInstances[currentCommand].execute(cmdArgs); // Valid command, further processing
	}
}
function setupTerminal() {
	setupCommands();
	setupFileSystem();
	changeUser('guest');
	refreshDirectory();
}
/* VIEW */
$(document).ready(function() {
	function focus() {
		$('#userInput').focus();
	}
	$(window).focus(function() {
		focus();
		$('#userInput').val($('#userInput').val());
	});
	$(document).click(function(e) {
		focus();
		$('#userInput').val($('#userInput').val());
	});
	$('#userInput').on('input',function(e){
		if (secretInput) return;
		$('.clone').text($(this).val());
	});
	$('.blink').each(function() {
		let elem = $(this);
		setInterval(function() {
		if (elem.css('visibility') == 'hidden') {
			elem.css('visibility', 'visible');
		} else {
			elem.css('visibility', 'hidden');
		}
		}, 500);
	});
	$('#userInput').keypress(function(e) {
		if(e.keyCode===13){ // Enter command
			e.preventDefault();
			let inputValue = $(this).val(); // Get input
			$(this).val(''); // Clear input
			$('.clone').text(''); // Clear clone
			processInput(inputValue);
			$(document).scrollTop($(document).height());
		}
	});

	setupTerminal();
	$('.terminal').show();
	focus();
});