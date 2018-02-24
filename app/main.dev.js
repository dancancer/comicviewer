/* eslint global-require: 0, flowtype-errors/show-errors: 0 */

/**
 * This module executes inside of electron's main process. You can start
 * electron renderer process from here and communicate with the other processes
 * through IPC.
 *
 * When running `npm run build` or `npm run build-main`, this file is compiled to
 * `./app/main.prod.js` using webpack. This gives us some performance wins.
 *
 * @flow
 */
import { app, BrowserWindow, remote } from 'electron';
// import dirTree from 'directory-tree';
// import Zip from 'node-7z';
import MenuBuilder from './menu';
// import db from './utils/datastore';
// import { getZipContentList, extractFile } from './utils/zipFile';
// import { createThumbnail } from './utils/imgUtil';
import { rebuildLibraryByPath } from './service/bookService'

rebuildLibraryByPath('C:/Users/danca/Pictures/DMZJ')

// const APP = process.type === 'renderer' ? remote.app : app;
// const STORE_PATH = APP.getPath('userData');
// const myTask = new Zip();
// const tree = dirTree('C:/Users/danca/Pictures/DMZJ');

// db('posts').push(tree);
// db.save();
// const handleZipFun = async (fileName) => {
//   const contentFiles = await getZipContentList(fileName);
//   const coverFile = contentFiles.find((file) => (file.name.indexOf('jpg') >= 0 || file.name.indexOf('png') >= 0));
//   let coverFilePath = null;
//   if (coverFile) {
//     coverFilePath = await extractFile(fileName, coverFile.name);
//     coverFilePath = createThumbnail(coverFilePath);
//   }
//   console.log(coverFilePath);
// };
// handleZipFun('C:\\Users\\danca\\Pictures\\DMZJ\\[1482][海猫鸣泣之时EP1]\\[2813][9话].zip');
// getZipContentList('C:\\Users\\danca\\Pictures\\DMZJ\\[1482][海猫鸣泣之时EP1]\\[2813][9话].zip').then((data) => {console.log(data)});

// myTask.list('C:\\Users\\danca\\Pictures\\DMZJ\\[1482][海猫鸣泣之时EP1]\\[2813][9话].zip')
//   .progress((data) => { console.log(data); return data; })
//   .catch((e) => { console.log(e); });

// myTask.extractFull('C:\\Users\\danca\\Pictures\\DMZJ\\[1482][海猫鸣泣之时EP1]\\[2813][9话].zip', `${STORE_PATH}/out/`, {
//   wildcards: ['001.jpg'], // extract all text and Markdown files
//   r: true // in each subfolder too
// }).then((files) => {
//   console.log(files);
//   return files;
// }).catch((e) => { console.log(e); });

// const saveFiles = (d, parentId) => {
//   const { path, name, children } = d;
//   const dRec = { path, name, parentId };
//   const files = children.filter((file) => {
//     const { type, extension } = file;
//     return (type === 'file' &&
//       (extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.png'));
//   });
//   try {
//     if (files && files.length > 0) {
//       dRec.cover = files[0].path;
//     }
//     db.get('books').insert(dRec).write();
//     const { id } = dRec;
//     children.filter((item) => (item.type === 'directory'))
//       .forEach((folder) => {
//         saveFiles(folder, id);
//       });
//   } catch (e) {
//     console.log(e);
//     console.log(files);
//   }
// };
// saveFiles(tree);

let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
  const sourceMapSupport = require('source-map-support');
  sourceMapSupport.install();
}

if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
  require('electron-debug')();
  const path = require('path');
  const p = path.join(__dirname, '..', 'app', 'node_modules');
  require('module').globalPaths.push(p);
}

const installExtensions = async () => {
  const installer = require('electron-devtools-installer');
  const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
  const extensions = [
    'REACT_DEVELOPER_TOOLS',
    'REDUX_DEVTOOLS'
  ];

  return Promise
    .all(extensions.map(name => installer.default(installer[name], forceDownload)))
    .catch(console.log);
};


/**
 * Add event listeners...
 */

app.on('window-all-closed', () => {
  // Respect the OSX convention of having the application in memory even
  // after all windows have been closed
  if (process.platform !== 'darwin') {
    app.quit();
  }
});


app.on('ready', async () => {
  if (process.env.NODE_ENV === 'development' || process.env.DEBUG_PROD === 'true') {
    await installExtensions();
  }

  mainWindow = new BrowserWindow({
    show: false,
    width: 1024,
    height: 728
  });

  mainWindow.loadURL(`file://${__dirname}/app.html`);

  // @TODO: Use 'ready-to-show' event
  //        https://github.com/electron/electron/blob/master/docs/api/browser-window.md#using-ready-to-show-event
  mainWindow.webContents.on('did-finish-load', () => {
    if (!mainWindow) {
      throw new Error('"mainWindow" is not defined');
    }
    mainWindow.show();
    mainWindow.focus();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const menuBuilder = new MenuBuilder(mainWindow);
  menuBuilder.buildMenu();
});
