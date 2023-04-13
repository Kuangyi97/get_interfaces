import * as vscode from 'vscode';
import * as fs from "fs";
import * as path from "path";

const window = vscode.window;
let currentPath: fs.PathLike;

export function activate(context: vscode.ExtensionContext) {
	function dealDir(fullPath: string) {
		fs.readdir(fullPath, (err, dirOrfiles) => {
			if (!err) {
				dirOrfiles.forEach(v => {
					dealFileOrDir(fullPath, v)
				})
			}
		})
	}
	function dealFile(fullPath: string) {
		fs.readFile(fullPath, (err, data) => {
			let reg = /(\/\w+)+/g
			let interfaceLists = Array.from(String(data).matchAll(reg)).map(v => v[0])
			let interfacesStr = interfaceLists.join('\r\n');

			if (!err) {
				fs.appendFile(path.resolve(String(currentPath), 'output.txt'), interfacesStr, (err) => {
					if (err) throw err;
				})
			}
		})
	}
	function dealFileOrDir(prefix: string, fileOrDir: string) {
		let fullPath = path.resolve(prefix, fileOrDir)
		if (path.extname(fileOrDir) === '') { // 文件夹
			dealDir(fullPath);
		} else { // 文件
			dealFile(fullPath);
		}
	}
	let disposable = vscode.commands.registerCommand('get_interfaces', () => {
		// 1.拿到当前编辑框所在路径
		currentPath = path.dirname(String(window.activeTextEditor?.document.uri.fsPath));
		// 2.获得当前编辑框路径下的所有文件或者文件夹并弹出让用户选择要导出哪一个
		fs.readdir(currentPath, (err, dirOrfiles) => {
			if (!err) {
				window.showQuickPick(dirOrfiles).then(choose => {
					const choose_str = String(choose)
					dealFileOrDir(String(currentPath), choose_str);
				})
			}
		})
	});

	context.subscriptions.push(disposable);
}

export function deactivate() { }
