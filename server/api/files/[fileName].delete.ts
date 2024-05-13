// /server/api/files/[fileName].ts
import fsDriver from 'unstorage/drivers/fs';
import { createStorage } from 'unstorage';
import { defineEventHandler } from 'h3';
import slugify from 'slugify';
import fs from 'fs';

const storage = createStorage({
  driver: fsDriver({
    base: './content',
  }),
});

export default defineEventHandler(async (event) => {
  const fileName = event.context.params.fileName;
  console.log(fileName);
  try {
    const content_files = await fs.promises.readdir('./content');

    let oldFullName = '';

    const targetFile = content_files.find((file) => {
      oldFullName = file;
      const parts = file.split('.');
      const fileSlug = parts[1];
      return fileSlug === fileName;
    });

    if (!targetFile) {
      reject({ success: false, message: 'File not found.' });
      return;
    }

    await storage.removeItem(oldFullName, { removeMeta: true });
    return { success: true, message: 'File deleted successfully.' };
  } catch (error) {
    return {
      success: false,
      message: 'Failed to delete file.',
      error: error.message,
    };
  }
});
