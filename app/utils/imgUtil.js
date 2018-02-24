import { app, remote, nativeImage } from 'electron';
import fs from 'fs-extra';

const APP = process.type === 'renderer' ? remote.app : app;
const STORE_PATH = APP.getPath('userData');

export const createThumbnail = (file, id) => {
  const newId = id || (new Date()).getTime();
  const imgdata = nativeImage.createFromPath(file);
  try {
    fs.writeFileSync(
      `${STORE_PATH}/thmbnail/${newId}.jpg`,
      imgdata.resize({ width: 120 }).toJpeg(90)
    );
    return `${STORE_PATH}/thmbnail/${newId}.jpg`;
  } catch (e) {
    console.error(e);
    return false;
  }
};

export const getNativeImage = () => {};
