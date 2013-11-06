var fs = require('fs');
var system = require('system');
var page = require('webpage').create();

var severaUrl = 'https://secure.severa.com/psa/login/';

try {
	var home = system.env.HOME;
	var credentialsContent = fs.read(home + '/.severa.json');
	var credentials = JSON.parse(credentialsContent);
} catch (e) {
	console.log(e);
	console.log("Please create ~/.severa.json with your credentials.");
	console.log("Example:");
	console.log('{ "username": "bob", "password": "password" }');
	phantom.exit();
}

function shot(pageName) {
	page.render('tmp/' + pageName + '.png');
}

function after(time, f) {
	return setTimeout(f, time);
}

page.viewportSize = { width: 800, height: 600 };

page.onConsoleMessage = function(msg) {
	console.log("[page] ", msg);
}

page.open(severaUrl, function(result) {
	console.log("Login");

	var result = page.evaluate(function(credentials) {
		function $(x) { return document.querySelector(x); }
		var username = $('#TxtUserName');
		var password = $('#TxtPassword');
		var submit = $('#BtnLogin');

		username.value = credentials.username;
		password.value = credentials.password;
		submit.click();
	}, credentials);

	shot('login');
	after(1000, onWelcomePage);

	function onWelcomePage() {
		console.log("Welcome");

		page.evaluate(function() {
			var mainFrameDocument = window.frames.main.document;
			function $(x) { return mainFrameDocument.querySelector(x); }
			var kirjauksetImg = $('img[src="../skins/default/menu/tyopoyta.gif"]');
			var kirjauksetLink = kirjauksetImg.parentNode;
		
			function fireEvent(el, event) {
				var ev = document.createEvent('Events');
				ev.initEvent(event, true, false);
				el.dispatchEvent(ev);
			}

			fireEvent(kirjauksetLink, 'click');
		});

		shot('site');
		after(1000, onKirjauksetPage);
	}

	function onKirjauksetPage() {
		console.log("Kirjaukset");

		shot('kirjaukset');
		phantom.exit();
	}
});
