const electron = require('electron');
const url = require('url');
const path = require('path');
const pwd = require('path');
const fs = require('fs');
const {ipcRenderer} = electron;
const rimraf = require('rimraf');



const {app, BrowserWindow, Menu, ipcMain} = electron;
const {download} = require('electron-dl');
const appName = app.getName();

let mainWindow;
let addWindow;
let isDown = 0;
let newWinPos = [0,0];
let coor_diff = [0,0];
let toggleDrag = 0;
let mainWinPos = [0,0];
let smallSize = [0,0];
let isSmallOpen = 0;

app.on('ready', function(){
	mainWindow = new BrowserWindow({width: 400, height: 225, frame: false});
	mainWindow.setAlwaysOnTop(true);
	mainWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'mainWindow.html'),
		protocol: 'file:',
		slashes: true
	}));
	//console.log(electron);
	pwd.join(__dirname);
	mainWinPos = 	mainWindow.getPosition();
	// Add developer tools option if in dev
	if(process.env.NODE_ENV !== 'production'){
		mainMenuTemplate = [{
			label: 'Developer Tools',
			submenu:[
			{
				role: 'reload'
			},
			{
				label: 'Toggle DevTools',
				accelerator:process.platform == 'darwin' ? 'Command+I' : 'Ctrl+I',
				click(item, focusedWindow){
				focusedWindow.toggleDevTools();
				}
			}
			]
		}];
	}
	const mainMenu = Menu.buildFromTemplate(mainMenuTemplate);
  // Insert menu
	Menu.setApplicationMenu(mainMenu);
	

	mainWindow.on('closed', function(){
		const getAppPath = path.join(app.getPath('appData'), appName);
		//console.log(getAppPath);
		rimraf.sync(getAppPath);
		console.log("Cleared app Data");
		app.quit();
	});

	mainWindow.on('move', function(e) {
		mainWinPos = 	mainWindow.getPosition();
		if(isSmallOpen == 1) {
			smallSize = addWindow.getSize();
			addWindow.setPosition(mainWinPos[0] - smallSize[0],mainWinPos[1]);
		}
	});	

});  

// catch MsDown
ipcMain.on('msDown', function(e){
	let get = electron.screen.getCursorScreenPoint();
	isDown = 1;
	//console.log('123');
	let pos = mainWindow.getPosition();
	coor_diff[0] = get.x - pos[0];
	coor_diff[1] = get.y - pos[1];
	console.log("msDown: x=" + coor_diff[0] + ", y=" + coor_diff[1]);
	//console.log(mousePos);
	//console.log(coor_diff[0] + "," + coor_diff[1]);
	
});

// catch keypress
ipcMain.on('keydown1', function(e, val){
	//console.log(val);
	if(val == 20) {
		toggleDrag += 1;
		toggleDrag = toggleDrag%2;
		console.log('keydown1: toggleDrag=' + toggleDrag);
	}
});

// catch MsUp
ipcMain.on('msUp', function(e){
	isDown = 0;
	console.log('msUp: isDown=' + isDown);
});

ipcMain.on('msMove', function(e){
	mainWinPos = 	mainWindow.getPosition();
	if(isDown == 1 && toggleDrag == 0) {
		let get = electron.screen.getCursorScreenPoint();
		newWinPos[0] = get.x - coor_diff[0];
		newWinPos[1] = get.y - coor_diff[1];
		mainWindow.setPosition(newWinPos[0], newWinPos[1]);
		if(isSmallOpen == 1) {
			smallSize = addWindow.getSize();
			console.log("msMove: x=" + newWinPos[0] + ", y=" + newWinPos[1]);
			addWindow.setPosition(mainWinPos[0] - smallSize[0],mainWinPos[1]);
		}
	}
});

ipcMain.on('openWindow', function(e, path1){
	if(isSmallOpen == 0) {
		if(path1.substr(path1.length - 14) == "startPage.html") {
			console.log("openWindow: startPage.html");
			createAddWindow("https://youtube.com/");	
		}
		else {
			console.log("openWindow: " + path1);
			createAddWindow(path1);
		}
		isSmallOpen = 1;
	}
	else {
		console.log("openWindow: close\n");
		addWindow.close();
		isSmallOpen = 0;
	}
});

ipcMain.on('element-clicked', function(e, path) {
	console.log("element-clicked: " + path);
	if(path.substr(26).length == 11) {
		mainWindow.webContents.send('element-clicked', path + "?autoplay=1");
		path = "https://www.youtube.com/watch?v=" + path.substr(26);
		console.log("IPC: element-clicked: " + path);
		downloadPage(path, 0);
	}
	else {
		mainWindow.webContents.send('element-clicked', path);
	}
});

ipcMain.on('chan-clicked', function(e, path) {
	console.log("chan-clicked: " + path);
	downloadPage(path, 1);
});

ipcMain.on('search', function(e, name) {
	console.log("IPC: search: " + name);
	downloadPage("https://www.youtube.com/results?search_query="+name, 0);
});

function createSmallWindow1_html(v_id_str, thumbnail, vlength_str, simpletext_str, chanurl_str, channel_str, viewtext_str, pubtimetext_str, isPlaylist)
{

	//console.log("create: myfile.html");
	var data1 = "";
	data1 += "\n<div class=\"style-scope ytd-compact-autoplay-renderer\"><ytd-compact-video-renderer class=\"style-scope ytd-compact-autoplay-renderer use-ellipsis\">\n\n<div id=\"dismissable\" class=\"style-scope ytd-compact-video-renderer\">\n\n<ytd-thumbnail use-hovered-property=\"\" width=\"126\" class=\"style-scope ytd-compact-video-renderer\">\n\n<!--vid link--><a id=\"thumbnail\" class=\"yt-simple-endpoint inline-block style-scope ytd-thumbnail\" aria-hidden=\"true\" tabindex=\"-1\" rel=\"nofollow\" href=\"https://youtube.com/embed/" + v_id_str + "\" onclick=\"return clicklink(this)\">\n";
	data1 += "\n<yt-img-shadow class=\"style-scope ytd-thumbnail no-transition\" style=\"background-color: transparent;\" loaded=\"\"><img id=\"img\" class=\"style-scope yt-img-shadow\" alt=\"\" width=\"168\" src=\"" + thumbnail + "\"></yt-img-shadow>\n";
	//if(isPlaylist == 0) {
		data1 += "\n<div id=\"overlays\" class=\"style-scope ytd-thumbnail\"><ytd-thumbnail-overlay-time-status-renderer class=\"style-scope ytd-thumbnail\" overlay-style=\"DEFAULT\"><span class=\"style-scope ytd-thumbnail-overlay-time-status-renderer\">\n<!--length-->" + vlength_str + "\n</span></ytd-thumbnail-overlay-time-status-renderer></div>\n<div id=\"mouseover-overlay\" class=\"style-scope ytd-thumbnail\"></div>\n<div id=\"hover-overlays\" class=\"style-scope ytd-thumbnail\"></div>\n</a>\n</ytd-thumbnail>";
	//}
	data1 += "\n<a class=\"yt-simple-endpoint style-scope ytd-compact-video-renderer\" rel=\"nofollow\">\n<h3 class=\"style-scope ytd-compact-video-renderer\">\n<ytd-badge-supported-renderer class=\"style-scope ytd-compact-video-renderer\" disable-upgrade=\"\" hidden=\"\">\n</ytd-badge-supported-renderer>\n<span id=\"video-title\" class=\"style-scope ytd-compact-video-renderer\" href=\"https://youtube.com/embed/" + v_id_str + "\" onclick=\"return clicklink(this)\">\n" + simpletext_str +"\n</span>\n</h3>\n<ytd-video-meta-block class=\"compact style-scope ytd-compact-video-renderer\" no-endpoints=\"\">";
	data1 += "\n<div id=\"metadata\" class=\"style-scope ytd-video-meta-block\">\n<div id=\"byline-container\" class=\"style-scope ytd-video-meta-block\" onclick=\"clickchan(event, \'https://youtube.com/" + chanurl_str + "/videos\')\">\n<div id=\"byline-inner-container\" class=\"style-scope ytd-video-meta-block\" style=\"cursor: pointer;\">\n";
	data1 += "\n<yt-formatted-string id=\"byline\" ellipsis-truncate=\"\" class=\"style-scope ytd-video-meta-block\">" + channel_str + "</yt-formatted-string>\n";
	data1 += "\n</div>\n<div id=\"separator\" class=\"style-scope ytd-video-meta-block\">•</div>\n</div>\n<div id=\"metadata-line\" class=\"style-scope ytd-video-meta-block\">\n<span class=\"style-scope ytd-video-meta-block\">" + viewtext_str + "</span> <template is=\"dom-repeat\" strip-whitespace=\"\" class=\"style-scope ytd-video-meta-block\"></template>\n\n</div>\n";
	data1 += "\n<div id=\"metadata-line\" class=\"style-scope ytd-video-meta-block\">\n<span class=\"style-scope ytd-grid-video-renderer\">" + pubtimetext_str + "</span>  <template is=\"dom-repeat\" strip-whitespace=\"\" class=\"style-scope ytd-video-meta-block\"></template>\n\n</div>\n";

	var rest = "";
	//extra = 0;
	//console.log("FileRead: rest");
	data1 += fs.readFileSync('rest').toString();
	return data1;
}

function downloadPage(link, isChannel) {
	download(mainWindow, link, {directory: __dirname, filename: "download.html"})
		.then(dl => { console.log("Download: " + dl.getSavePath()); initAddWindow(isChannel);})
		.catch(console.error);
}

function createAddWindow(path1) {
	var pathnew = "";
		pathnew = "https://youtube.com/watch?v=" + path1.substr(path1.lastIndexOf("/") + 1);
	console.log("createAddWindow: " + pathnew);
	downloadPage(pathnew, 0);
	addWindow = new BrowserWindow({
		width: 538,
			height:500,
			x: mainWinPos[0] - 538,
			y: mainWinPos[1],
			frame: false,
	});
	addWindow.setAlwaysOnTop(true);
	console.log("LoadURL: spinner.html");
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'spinner.html'),
		protocol: 'file:',
		slashes:true
	  }));
	
}

function initAddWindow(isChannel){
		
	/*************************************************** */
	

	var extra = 0;
	var data2 = "";
	var vidcon = "";
	var suc = "";

	console.log("FileRead: predecessor");
	var pre = fs.readFileSync('predecessor').toString();
	
	extra = 0;
	var fileRead = function(){
		var data = "";
		console.log("FileRead: download.html");
		data += fs.readFileSync('download.html').toString();
		if(data == "") {
			setTimeout(fileRead,500);
			return;
		}
		//console.log(data);
		/* Getting Video details */
		let beg = 0;
		let ctr = 0;
		let isPlaylist = 0;
		beg = data.toString().indexOf("gridVideoRenderer");
		//console.log(beg);
		if(beg == -1) {
			beg = data.toString().indexOf("videoRenderer");
			if(beg == -1) {
				beg = data.toString().indexOf("compactVideoRenderer");
				if(beg == -1) {
					beg = data.toString().indexOf("playlistRenderer");
					isPlaylist = 1;
				}
			}
		}
		//console.log(beg);
		let i_i = 0;
		while(beg != -1) {
			ctr += beg;
			let v_id = 10 + data.toString().substr(ctr).indexOf("videoId");
			let p_id = 0;
			let p_idn = 0;
			let p_id_str = "videoseries?list=";
			if(isPlaylist == 1) {
				p_id = 13 + data.toString().substr(ctr).indexOf("playlistId");
				p_idn = ctr + p_id;
				p_id_str += data.toString().substr(p_idn, 34);
			}
			
			let simpletext = 13 + data.toString().substr(ctr).indexOf("simpleText");
			//let simpletext_ignore = data.toString().substr(ctr + simpletext).indexOf("\\");
			let simpletext_end = data.toString().substr(ctr + simpletext).indexOf("\"");
			
			let pubtimetext = 0;
			let pubtimetext_end = 0;
			let viewtext = 0;
			let viewtext_end = 0;
			let vlength_bef = 0;
			let vlength = 0;
			let vlength_end = 0;

			if(isPlaylist == 0) {
				pubtimetext = 34 + data.toString().substr(ctr).indexOf("publishedTimeText");
				pubtimetext_end = data.toString().substr(ctr + pubtimetext).indexOf("\"");
				
				viewtext = 30 + data.toString().substr(ctr).indexOf("viewCountText");
				viewtext_end = data.toString().substr(ctr + viewtext).indexOf("\"");

				vlength_bef = data.toString().substr(ctr).indexOf("thumbnailOverlayTimeStatusRenderer");
				vlength = 13 + vlength_bef + data.toString().substr(ctr + vlength_bef).indexOf("simpleText");
				vlength_end = data.toString().substr(ctr + vlength).indexOf("\"");
			}

			let channel = 35 + data.toString().substr(ctr).indexOf("shortBylineText");
			let channel_end = data.toString().substr(ctr + channel).indexOf("\"");

			let chanurl = 7 + channel + data.toString().substr(ctr + channel).indexOf("url");
			let chanurl_end = data.toString().substr(ctr + chanurl).indexOf("\"");

			// let chanurl1 = 20 + channel + data.toString().substr(ctr + channel).indexOf("canonicalBaseUrl");
			// let chanurl_end1 = data.toString().substr(ctr + chanurl).indexOf("\"");

			//if(data.toString().substr(chanurl_end, chanurl_end + 1) == '}')
			//let verified = chanurl_end + 3;

			let v_idn = ctr + v_id;
			let simpletext_n = ctr + simpletext;
			let pubtimetext_n = 0;
			let viewtext_n = 0;
			let vlength_n = 0;
			if(isPlaylist == 0) {			
				pubtimetext_n = ctr + pubtimetext;
				viewtext_n = ctr + viewtext;
				vlength_n = ctr + vlength;
			}
			let channel_n = ctr + channel;
			let chanurl_n = ctr + chanurl;
			// let verified = 0;

			// if(data.toString().substr(chanurl1 + ctr + chanurl_end1, 4) == "\"}}}")
			// 	verified = 1;
			let v_id_str = "";
			if(isPlaylist == 0) {
				v_id_str = data.toString().substr(v_idn, 11);
			}
			else {
				v_id_str = p_id_str;
			}
			let simpletext_str = data.toString().substr(simpletext_n, simpletext_end);
			
			let pubtimetext_str = "";
			let viewtext_str = "";
			let vlength_str = "";
			if(isPlaylist == 0){
				pubtimetext_str = data.toString().substr(pubtimetext_n, pubtimetext_end);
				viewtext_str = data.toString().substr(viewtext_n, viewtext_end);
				vlength_str = data.toString().substr(vlength_n, vlength_end);
			}

			let channel_str = "";
			let chanurl_str = "";
			if(isChannel == 0) {
				channel_str = data.toString().substr(channel_n, channel_end);
				chanurl_str = data.toString().substr(chanurl_n, chanurl_end);
			}
			
			let thumbnail = "https://img.youtube.com/vi/" + data.toString().substr(v_idn, 11) + "/mqdefault.jpg";

			ctr += v_id;
			
			//console.log(v_id_str + "\n\t" + thumbnail + "\n\t" + vlength_str + "\n\t" + simpletext_str + "\n\t" + chanurl_str + "\n\t" + channel_str + "\n\t" + viewtext_str + "\n\t" + pubtimetext + "\n\t");
			vidcon += createSmallWindow1_html(v_id_str, thumbnail, vlength_str, simpletext_str, chanurl_str, channel_str, viewtext_str, pubtimetext_str, isPlaylist);

			isPlaylist = 0;

			beg = data.toString().substr(ctr).indexOf("gridVideoRenderer"); 
			if(beg == -1) {
				beg = data.toString().substr(ctr).indexOf("videoRenderer");
				if(beg == -1) {
					beg = data.toString().substr(ctr).indexOf("compactVideoRenderer");
					if(beg == -1) {
						beg = data.toString().substr(ctr).indexOf("playlistRenderer");
						isPlaylist = 1;
					}
				}
			}
		}
		return vidcon;
	}
	fileRead();
	/*************************************************** */
	
	console.log("FileRead: successor");
	suc = fs.readFileSync('successor').toString();

	data2 = pre + vidcon + suc;
	
	console.log("FileWrite: myfile.html");
	try { fs.writeFileSync('myfile.html', data2, 'utf-8'); }
	catch(e) { alert('Failed to save the file !'); }

	//console.log(vidcon);


	console.log("LoadURL: myfile.html");
	addWindow.loadURL(url.format({
		pathname: path.join(__dirname, 'myfile.html'),
		protocol: 'file:',
		slashes:true
	  }));
	


	 // Handle garbage collection
  	addWindow.on('close', function() {
		console.log("close: addWindow");
		isSmallOpen = 0;  
		addWindow = null;
  	});
}
