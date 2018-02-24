import dirTree from 'directory-tree';
import db from '../utils/datastore';
import { createThumbnail } from '../utils/imgUtil'
import { getZipContentList, extractFile } from '../utils/zipFile'

export const rebuildLibraryByPath = (path) => {
  const tree = dirTree(path);
  saveFiles(tree);
};

// TODO
export const removeLibrary = (path) => {
  console.log(path)
}

const saveFiles = (d, parentPath) => {
  const { path, name, children } = d;
  const dRec = { path, name, parentPath };
  const imgFiles = children.filter((file) => {
    const { type, extension } = file;
    return (type === 'file' &&
      (extension.toLowerCase() === '.jpg' || extension.toLowerCase() === '.png'));
  });
  const zipFiles = children.filter((file) => {
    const { type, extension } = file;
    return (type === 'file' &&
      (
        extension.toLowerCase() === '.zip' ||
        extension.toLowerCase() === '.rar' ||
        extension.toLowerCase() === '.7z'
      )
    );
  });
  try {
    // 处理本级的图像文件
    if (imgFiles && imgFiles.length > 0) {
      const coverFile = createThumbnail(imgFiles[0].path);
      dRec.cover = coverFile;
      dRec.total = imgFiles.length;
      dRec.progress = 0;
      dRec.type = 'folder';
      db.get('books').insert(dRec).write();
    }

    // 处理本级的压缩文件
    if (zipFiles && zipFiles.length > 0) {
      zipFiles.forEach(file => {
        handleZipFile(file)
      })
    }

    children.filter((item) => (item.type === 'directory'))
      .forEach((folder) => {
        saveFiles(folder, d.path);
      });
  } catch (e) {
    console.log(e);
    console.log(imgFiles);
  }
};

const handleZipFile = async (zipFile, parentPath) => {
  const { path, name } = zipFile;
  const contentFiles = await getZipContentList(path);
  const coverFile = contentFiles.find((file) => (
    file.name.toLowerCase().indexOf('jpg') >= 0 ||
    file.name.toLowerCase().indexOf('png') >= 0));
  const imgFiles = contentFiles.filter((file) => (
    file.name.toLowerCase().indexOf('jpg') >= 0 ||
    file.name.toLowerCase().indexOf('png') >= 0));

  let coverFilePath = null;
  if (coverFile) {
    coverFilePath = await extractFile(path, coverFile.name);
    coverFilePath = createThumbnail(coverFilePath);
    const dRec = { path, name, parentPath };
    dRec.cover = coverFilePath;
    dRec.total = imgFiles.length;
    dRec.progress = 0;
    dRec.type = 'zipFile';
    db.get('books').insert(dRec).write();
  }
};
