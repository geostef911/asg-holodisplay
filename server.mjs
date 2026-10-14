import http from 'node:http';
import {readFile, mkdir, writeFile} from 'node:fs/promises';
import {join, dirname, extname} from 'node:path';
import {fileURLToPath} from 'node:url';
import {randomUUID} from 'node:crypto';
const root=dirname(fileURLToPath(import.meta.url));
const config=JSON.parse(await readFile(join(root,'site-config.json'),'utf8'));
const dataDir=process.env.LEADS_DIR||join(root,'private-data');
const allowedSelections=new Set(['general','pharmacy','retail',...config.packages.map(p=>p.id),...config.products.map(p=>p.id)]);
const limits=new Map();
const json=(res,status,obj)=>{res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'});res.end(JSON.stringify(obj));};
const publicConfig={brand:config.brand,brandNote:config.brandNote,contact:config.contact,products:config.products,packages:config.packages,privacy:config.privacy};
const approvedMedia=new Set(config.products.filter(p=>p.mediaRightsConfirmed&&/^\/assets\/[\w/-]+\.(png|jpg|jpeg|webp|svg|mp4|webm)$/i.test(p.media||'')).map(p=>p.media));
const server=http.createServer(async(req,res)=>{
  res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','strict-origin-when-cross-origin');
  res.setHeader('Content-Security-Policy',"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; media-src 'self'; connect-src 'self'; base-uri 'none'; frame-ancestors 'none'; form-action 'self'");
  try {
    if(req.url==='/api/config'&&req.method==='GET')return json(res,200,publicConfig);
    if(req.url==='/api/requests'&&req.method==='POST'){
      const origin=req.headers.origin;
      if(!origin || origin!==`http://${req.headers.host}`)return json(res,403,{error:'Origine nepermisă.'});
      const type=req.headers['content-type']||'';
      if(!type.startsWith('application/json'))return json(res,415,{error:'Format neacceptat.'});
      let body='';for await(const chunk of req){body+=chunk;if(Buffer.byteLength(body)>16000)return json(res,413,{error:'Solicitarea este prea lungă.'});}
      let input;try{input=JSON.parse(body);}catch{return json(res,400,{error:'Solicitare invalidă.'});}
      if(!input||typeof input!=='object'||Array.isArray(input))return json(res,400,{error:'Solicitare invalidă.'});
      if(input.website)return json(res,400,{error:'Solicitare invalidă.'});
      const values={};
      const fieldLimits={selection:100,name:120,company:160,phone:40,email:254,city:120,details:3000};
      for(const [key,max] of Object.entries(fieldLimits)){
        if(typeof input[key]!=='string'||input[key].trim().length>max)return json(res,422,{error:'Verifică datele introduse.'});
        values[key]=input[key].trim();
      }
      if(Object.values(values).some(v=>!v)||!allowedSelections.has(values.selection)||!/^\S+@\S+\.\S+$/.test(values.email)||!/^\+?[\d\s().-]{7,40}$/.test(values.phone)||values.phone.replace(/\D/g,'').length<7||input.consent!==true)return json(res,422,{error:'Completează toate câmpurile și acordul pentru prelucrare.'});
      const key=req.socket.remoteAddress,now=Date.now();
      for(const [ip,times] of limits){if(times.every(t=>now-t>600000))limits.delete(ip);}
      const recent=(limits.get(key)||[]).filter(t=>now-t<600000);
      if(recent.length>=5)return json(res,429,{error:'Ai trimis mai multe solicitări. Încearcă din nou în câteva minute.'});
      const id=randomUUID();const record={id,...values,consent:true,privacyVersion:config.privacy.version,receivedAt:new Date().toISOString(),environment:'local-preview'};
      await mkdir(dataDir,{recursive:true});await writeFile(join(dataDir,`${id}.json`),JSON.stringify(record,null,2),{flag:'wx'});
      limits.set(key,[...recent,now]);return json(res,201,{id,receivedAt:record.receivedAt});
    }
    if(req.method!=='GET'&&req.method!=='HEAD')return json(res,405,{error:'Metodă nepermisă.'});
    const path=new URL(req.url,'http://localhost').pathname;
    if(approvedMedia.has(path)){
      const bytes=await readFile(join(root,'public',path.slice(1)));
      const mime={'.png':'image/png','.jpg':'image/jpeg','.jpeg':'image/jpeg','.webp':'image/webp','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm'}[extname(path).toLowerCase()];
      res.writeHead(200,{'Content-Type':mime});return res.end(req.method==='HEAD'?undefined:bytes);
    }
    const files={'/':'index.html','/index.html':'index.html','/styles.css':'styles.css','/app.js':'app.js'};
    if(!files[path])return json(res,404,{error:'Pagina nu există.'});
    const bytes=await readFile(join(root,'public',files[path]));
    res.writeHead(200,{'Content-Type':({'.html':'text/html','.css':'text/css','.js':'text/javascript'})[extname(files[path])]+'; charset=utf-8'});res.end(req.method==='HEAD'?undefined:bytes);
  }catch{json(res,500,{error:'Solicitarea nu a putut fi salvată. Încearcă din nou.'});}
});
server.listen(Number(process.env.PORT||4173),'127.0.0.1',()=>console.log(`Local: http://127.0.0.1:${server.address().port}`));
