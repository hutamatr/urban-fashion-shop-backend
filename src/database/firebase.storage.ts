import {
  deleteObject,
  getDownloadURL,
  ref,
  uploadBytes,
} from 'firebase/storage';
global.XMLHttpRequest = require('xhr2');

import { storage } from './firebase.config';

export async function imageUpload(file: Express.Multer.File, url: string) {
  const storageRef = ref(storage, url);

  const timeStamp = Date.now();
  const name = file?.originalname.split('.')[0];
  const type = file?.originalname.split('.')[1];
  const fileName = `${name}-${timeStamp}.${type}`;

  const imageRef = ref(storageRef, fileName);
  const snapShot = await uploadBytes(imageRef, file?.buffer);
  const downloadURL = await getDownloadURL(snapShot.ref);

  return { downloadURL };
}

export async function deleteImageFromStorage(imageURL: string, url: string) {
  // eslint-disable-next-line no-useless-escape
  const match = RegExp(/\/([^\/?#]+)(?:[?#]|$)/).exec(imageURL);

  // Extract the matched result and then decode the URL-encoded filename
  const encodedFilename = match ? match[1] : null;
  const decodedFilename = encodedFilename
    ? decodeURIComponent(encodedFilename)
    : null;

  // Remove "products/products/" from the filename
  const finalFilename = decodedFilename?.replace(/^products\//, '');

  const storageRef = ref(storage, url);
  const imageRef = ref(storageRef, finalFilename);
  await deleteObject(imageRef);
}
