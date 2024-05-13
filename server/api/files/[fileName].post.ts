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
  return new Promise((resolve, reject) => {
    const form = new IncomingForm();

    form.parse(event.req, async (err, fields, files) => {
      if (err) {
        reject({ success: false, message: 'Error parsing the form.' });
        return;
      }

      const file = files.file;
      const title = Array.isArray(fields.title)
        ? fields.title[0]
        : fields.title;
      const originalExtension = path.extname(file[0].originalFilename);
      const slug = slugify(title, { lower: true, strict: true });

      try {
        const badges = JSON.parse(fields.badges);
        const content_files = await fs.promises.readdir('./content');
        const newFileNumber = content_files.length + 1;
        const newFileName = `${newFileNumber}.${slug}${originalExtension}`;
        const badgesData = formatBadgesForYAML(badges);

        const originalData = await fs.promises.readFile(
          file[0].filepath,
          'utf8'
        );

        const frontMatter = `---
title: '${title.replace(/'/g, "\\'")}'
${badgesData}
---

`;
        const newData = frontMatter + originalData;

        if (file && file[0].filepath) {
          await storage.setItem(newFileName, newData);
          resolve({
            success: true,
            message: 'Plik został zapisany pod nową numerowaną nazwą.',
            newFileName: newFileName,
          });
        } else {
          reject({ success: false, message: 'No file uploaded.' });
        }
      } catch (error) {
        reject({
          success: false,
          message: 'Failed to read the directory.',
          error: error.message,
        });
      }
    });
  });
});
