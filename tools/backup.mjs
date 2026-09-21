import fs from 'node:fs';
import path from 'node:path';
import {root} from './build.mjs';
const destination=path.join(root,'backups','website-'+new Date().toISOString().replace(/[:.]/g,'-'));
fs.mkdirSync(destination,{recursive:true});
for(const name of ['public','content','tools','tests','server.mjs','package.json','.env.example','LEESMIJ.md','RESTPUNTEN.md']){const source=path.join(root,name);if(fs.existsSync(source))fs.cpSync(source,path.join(destination,name),{recursive:true});}
console.log('Websitebackup gemaakt in '+destination+'. Geheime instellingen in .env zijn bewust niet gekopieerd.');
