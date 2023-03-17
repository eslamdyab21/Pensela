const { app, BrowserWindow, ipcMain, globalShortcut, screen } = require("electron");
const os = require("os");
const path = require("path");
const fs = require("fs");
const screenshot = require("screenshot-desktop");

// Key bindings
const mouse_mode_key_biding = 'Command+S'
const draw_mode_key_biding = 'Command+A'
const undo_mode_key_biding = 'Command+D'
const format_mode_key_biding = 'Command+F'
const strok_up_mode_key_biding = 'Command+UP'
const strok_down_mode_key_biding = 'Command+DOWN'
const close_mode_key_biding = 'Alt+P'


function createWindow() {
	const board = new BrowserWindow({
		x: Math.min(...screen.getAllDisplays().map((j) => j.workArea.x)),
		y: Math.min(...screen.getAllDisplays().map((j) => j.workArea.y)),
		width:
			Math.max(
				...screen
					.getAllDisplays()
					.map((j) => j.workArea.x + j.workArea.width)
			) - Math.min(...screen.getAllDisplays().map((j) => j.workArea.x)),
		height:
			Math.max(
				...screen
					.getAllDisplays()
					.map((j) => j.workArea.y + j.workArea.height)
			) - Math.min(...screen.getAllDisplays().map((j) => j.workArea.y)),
		enableLargerThanScreen: true,
		webPreferences: {
			nodeIntegration: true,
			devTools: true,
			contextIsolation: false,
		},
		transparent: true,
		frame: false,
		icon: path.join(__dirname, "/assets/Icon-512x512.png"),
	});
	board.setAlwaysOnTop(true, "screen");
	board.loadFile("board.html");
	board.setResizable(true);

	setTimeout(() => {
		board.setSize(
			Math.max(
				...screen
					.getAllDisplays()
					.map((j) => j.workArea.x + j.workArea.width)
			) - Math.min(...screen.getAllDisplays().map((j) => j.workArea.x)),
			Math.max(
				...screen
					.getAllDisplays()
					.map((j) => j.workArea.y + j.workArea.height)
			) - Math.min(...screen.getAllDisplays().map((j) => j.workArea.y))
		);
		board.setPosition(
			Math.min(...screen.getAllDisplays().map((j) => j.workArea.x)),
			Math.min(...screen.getAllDisplays().map((j) => j.workArea.y))
		);
	}, 10);

	const controller = new BrowserWindow({
		width: Math.floor(
			screen.getPrimaryDisplay().size.width * (1350 / 1920)
		),
		height: Math.floor(
			(((screen.getPrimaryDisplay().size.width * 1350) / 1920) * 1) / 11
		),
		webPreferences: {
			nodeIntegration: true,
			devTools: true,
			contextIsolation: false,
		},
		transparent: true,
		frame: false,
		skipTaskbar: true,
		parent: board,
		icon: "./assets/logo.png",
	});
	controller.setPosition(205, 40);
	controller.setAlwaysOnTop(true, "screen");
	controller.loadFile("controller.html");
	controller.setResizable(false);

	function openPicker(x, y) {
		const picker = new BrowserWindow({
			width: Math.floor(screen.getPrimaryDisplay().size.width / 6),
			height: Math.floor(
				((screen.getPrimaryDisplay().size.width / 6) * 19) / 16
			),
			webPreferences: {
				nodeIntegration: true,
				devTools: true,
				contextIsolation: false,
			},
			transparent: true,
			frame: false,
			skipTaskbar: true,
			parent: board,
			icon: "./assets/logo.png",
		});
		picker.setPosition(x, y);
		picker.setAlwaysOnTop(true, "screen");
		picker.loadFile("picker.html");
		picker.setResizable(false);
	}

	function openBackgroundDialog(x, y) {
		const dialog = new BrowserWindow({
			width: Math.floor(screen.getPrimaryDisplay().size.width / 6),
			height: Math.floor(
				((screen.getPrimaryDisplay().size.width / 6) * 11) / 8
			),
			webPreferences: {
				nodeIntegration: true,
				devTools: true,
				contextIsolation: false,
			},
			transparent: true,
			frame: false,
			skipTaskbar: true,
			parent: board,
			icon: "./assets/logo.png",
		});
		dialog.setPosition(x, y);
		dialog.setAlwaysOnTop(true, "screen");
		dialog.loadFile("background.html");
		dialog.setResizable(false);
	}

	controller.on("closed", () => {
		if (process.platform !== "darwin") {
			app.quit();
		}
	});

	board.on("closed", () => {
		if (process.platform !== "darwin") {
			app.quit();
		}
	});

    // close shortcut
    globalShortcut.register(close_mode_key_biding, () =>{
        console.log('close')
		app.quit()
    })

	ipcMain.on("resetBoard", () => {
		board.webContents.send("resetBoard");
	});
	ipcMain.on("eraserMode", () => {
		board.webContents.send("eraserMode");
	});

    // Here is normal mouse - assign shortcut 
	ipcMain.on("setMode", (e, arg) => {
		board.webContents.send("setMode", arg);
        console.log('mouse')
	});

    // mouse mode shrtcut
    globalShortcut.register(mouse_mode_key_biding, () =>{
        // board.webContents.send("setMode", arg);
        board.webContents.send("resetBoard");
        console.log('mouse')
    })

	ipcMain.on("textMode", () => {
		board.webContents.send("textMode");
	});

	ipcMain.on("colSelect", (e, arg) => {
		board.webContents.send("colSelectFill", arg);
		board.webContents.send("colSelectStroke", arg);
	});
	ipcMain.on("colSelectFill", (e, arg) => {
		board.webContents.send("colSelectFill", arg);
	});
	ipcMain.on("customColor", (e, arg) =>
		openPicker(
			controller.getPosition()[0] +
				arg -
				Math.floor(screen.getPrimaryDisplay().size.width / 12),
			controller.getPosition()[1] + controller.getSize()[1] + 10
		)
	);
	ipcMain.on("colSubmit", (e, arg) => {
		controller.webContents.send("colSubmit", arg);
	});

	ipcMain.on("drawPolygon", () => {
		board.webContents.send("drawPolygon");
	});
	ipcMain.on("drawLine", () => {
		board.webContents.send("drawLine");
	});
	ipcMain.on("drawSquare", () => {
		board.webContents.send("drawSquare");
	});
	ipcMain.on("drawCircle", () => {
		board.webContents.send("drawCircle");
	});
	ipcMain.on("drawTriangle", () => {
		board.webContents.send("drawTriangle");
	});

	ipcMain.on("drawTick", () => {
		board.webContents.send("drawTick");
	});
	ipcMain.on("drawCross", () => {
		board.webContents.send("drawCross");
	});
	ipcMain.on("drawStar", () => {
		board.webContents.send("drawStar");
	});
    // Here is the listner for pressing on free hand -- put keybord shortcut here
	ipcMain.on("drawFreehand", () => {
		board.webContents.send("drawFreehand");
        console.log('drawing')
	});

    // drawing shortcut
    globalShortcut.register(draw_mode_key_biding, () =>{
        board.webContents.send("drawFreehand");
        console.log('drawing')
    })

	ipcMain.on("dragMode", () => {
		board.webContents.send("setMode", "drag");
		board.webContents.send("dragMode");
	});

	ipcMain.on("hideBoard", () => {
		board.hide();
		controller.setAlwaysOnTop(true, "screen");
	});
	ipcMain.on("showBoard", () => {
		board.show();
		controller.hide();
		controller.show();
	});

	ipcMain.on("minimizeWin", () => {
		board.show();
		controller.hide();
		controller.show();
		board.minimize();
	});
	ipcMain.on("closeWin", () => {
		board.close();
	});

	ipcMain.on("bgSelect", (e, arg) =>
		openBackgroundDialog(
			controller.getPosition()[0] +
				arg -
				Math.floor(screen.getPrimaryDisplay().size.width / 12),
			controller.getPosition()[1] + controller.getSize()[1] + 10
		)
	);
	ipcMain.on("bgUpdate", (e, arg) =>
		controller.webContents.send("bgUpdate", arg)
	);
	ipcMain.on("bgSubmit", (e, arg) => {
		board.webContents.send("bgSelect", arg);
		board.focus();
	});

    // Here is clearing the board - add shourtcut
	ipcMain.on("clearBoard", () => board.webContents.send("clearBoard"));

    // clearing shortcut
    globalShortcut.register(format_mode_key_biding, () =>{
        board.webContents.send("clearBoard");
        console.log('clearing')
    })

	ipcMain.on("laserCursor", () => {
		board.webContents.send("setMode", "laser");
		board.webContents.send("laserCursor");
	});

    // Here is undo
	ipcMain.on("undo", () => board.webContents.send("undo"));
	ipcMain.on("redo", () => board.webContents.send("redo"));

    // undo shortcut
    globalShortcut.register(undo_mode_key_biding, () =>{
        board.webContents.send("undo");
        console.log('undo')
    })

	ipcMain.on("screenshot", () => {
		let d = new Date();
		let screenshotPath = path.join(app.getPath("pictures"), "Pensela");
		if (!fs.existsSync(screenshotPath)) {
			fs.mkdirSync(screenshotPath, { recursive: true });
		}
		screenshot.listDisplays().then((displays) => {
			for (i in displays) {
				screenshot({
					screen: displays[i].id,
					filename:
						path.join(screenshotPath, "Screenshot ") +
						("0" + d.getDate()).slice(-2) +
						"-" +
						("0" + (d.getMonth() + 1)).slice(-2) +
						"-" +
						d.getFullYear() +
						" " +
						d.getHours() +
						"-" +
						d.getMinutes() +
						"-" +
						d.getSeconds() +
						"-" +
						"Display" +
						i +
						".png",
				});
			}
		});
		board.webContents.send("screenshot");
	});

    // Here is stroke
	ipcMain.on("strokeIncrease", () =>
		board.webContents.send("strokeIncrease")
	);
	ipcMain.on("strokeDecrease", () =>
		board.webContents.send("strokeDecrease")
	);

    // Strok shortcut
    globalShortcut.register(strok_up_mode_key_biding, () =>{
        board.webContents.send("strokeIncrease");
        console.log('strokeIncrease')
    })
    globalShortcut.register(strok_down_mode_key_biding, () =>{
        board.webContents.send("strokeDecrease");
        console.log('strokeDecrease')
    })

	ipcMain.on("arrowSingle", () => board.webContents.send("arrowSingle"));
	ipcMain.on("arrowDouble", () => board.webContents.send("arrowDouble"));

	ipcMain.on("highlighter", () => board.webContents.send("highlighter"));

	if (os.platform() == "win32") {
		setTimeout(() => {
			board.minimize();
			board.restore();
			board.hide();
			board.show();
			controller.hide();
			controller.show();
		}, 1000);
	}
}

app.commandLine.appendSwitch("enable-transparent-visuals");
app.disableHardwareAcceleration();

app.whenReady().then(() => {
    // createWindow()
	os.platform() == "linux" ? setTimeout(createWindow, 100) : createWindow();
});

// app.on("activate", () => {
// 	if (BrowserWindow.getAllWindows().length === 0) {
// 		createWindow();
// 	}
// });
