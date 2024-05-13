// /server/api/files/[fileName].ts
import fsDriver from 'unstorage/drivers/fs';
import { createStorage } from 'unstorage';
import { IncomingForm } from 'formidable';
import { defineEventHandler } from 'h3';
import slugify from 'slugify';
import path from 'path';
import fs from 'fs';

const storage = createStorage({
  driver: fsDriver({
    base: './content',
  }),
});

const formatBadgesForYAML = (badges) => {
  let badgesYAML = 'badges:\n';
  badges.forEach((badge) => {
    badgesYAML += `  - label: ${badge.label}\n    color: ${badge.color}\n`;
  });
  return badgesYAML;
};

export default defineEventHandler(async (event) => {
  const oldSlug = event.context.params.fileName;

  return new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(event.req, async (err, fields, files) => {
      if (err) {
        reject({ success: false, message: 'Error parsing the form.' });
        return;
      }

      const badges = JSON.parse(fields.badges || '[]');
      const title = Array.isArray(fields.title)
        ? fields.title[0]
        : fields.title;

      const content_files = await fs.promises.readdir('./content');
      const slug = slugify(title, { lower: true, strict: true });

      let oldFullName = '';
      const targetFile = content_files.find((file) => {
        oldFullName = file;
        const parts = file.split('.');
        const fileSlug = parts[1];
        return fileSlug === oldSlug;
      });

      if (!targetFile) {
        reject({ success: false, message: 'File not found.' });
        return;
      }

      const originalExtension = path.extname(targetFile);
      const newFileName = `${
        targetFile.split('.')[0]
      }.${slug}${originalExtension}`;
      const badgesData = formatBadgesForYAML(badges);
      const frontMatter = `---
title: '${title.replace(/'/g, "\\'")}'
${badgesData}
---

`;

      if (files.file && files.file[0].filepath) {
        const originalData = await fs.promises.readFile(
          files.file[0].filepath,
          'utf8'
        );
        const newData = frontMatter + originalData;
        await storage.setItem(newFileName, newData);
        await storage.removeItem(oldFullName, { removeMeta: true });
        resolve({
          success: true,
          message: 'File updated successfully.',
          newFileName: newFileName,
        });
      } else {
        reject({ success: false, message: 'No file uploaded.' });
      }
    });
  });
});
