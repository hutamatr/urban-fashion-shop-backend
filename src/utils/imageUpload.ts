import { getDownloadURL, ref, uploadBytes } from 'firebase/storage';
global.XMLHttpRequest = require('xhr2');

import { storage } from '../database/firebaseConfig';

export async function imageUpload(file: Express.Multer.File, url: string) {
  const storageRef = ref(storage, url);

  const timeStamp = Date.now();
  const name = file?.originalname.split('.')[0];
  const type = file?.originalname.split('.')[1];
  const fileName = `${name}-${timeStamp}.${type}`;

  const imageRef = ref(storageRef, `products/${fileName}`);
  const snapShot = await uploadBytes(imageRef, file?.buffer);
  const downloadURL = await getDownloadURL(snapShot.ref);

  return { downloadURL };
}
