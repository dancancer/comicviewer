import Zip from 'node-7z';
import { app, remote } from 'electron';

const APP = process.type === 'renderer' ? remote.app : app;
const STORE_PATH = APP.getPath('userData');

const myTask = new Zip();

export const getZipContentList = (fileName) => new Promise(resolve => {
  console.log(fileName);
  myTask.list(fileName)
    .progress((data) => { resolve(data); return data; })
    .catch((e) => { console.log(e); });
});

export const extractFile = (zipFile, fileName) => new Promise(resolve => {
  console.log(zipFile, fileName);
  myTask.extractFull(zipFile, `${STORE_PATH}/tmp/`, {
    wildcards: [fileName], // extract all text and Markdown files
    r: true // in each subfolder too
  }).then((data) => {
    resolve(`${STORE_PATH}/tmp/${fileName}`);
    return data;
  }).catch((e) => { console.log(e); });
});

// myTask.extractFull('C:\\Users\\danca\\Pictures\\DMZJ\\[1482][海猫鸣泣之时EP1]\\[2813][9话].zip', `${STORE_PATH}/out/`, {
//   wildcards: ['001.jpg'], // extract all text and Markdown files
//   r: true // in each subfolder too
// }).then((data) => {
//   console.log(data);
//   return data;
// }).catch((e) => { console.log(e); });
