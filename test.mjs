import {test} from 'node:test';
import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {mkdtemp,readFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
test('Formularul validează și salvează cererile fără să expună datele',async()=>{
 const root=dirname(fileURLToPath(import.meta.url));const dir=await mkdtemp(join(tmpdir(),'halo-test-'));
 const child=spawn(process.execPath,['server.mjs'],{cwd:root,env:{...process.env,PORT:'0',LEADS_DIR:dir},stdio:['ignore','pipe','pipe']});
 let url;
 try{
  url=await new Promise((resolve,reject)=>{child.stdout.on('data',d=>{const m=String(d).match(/http:\/\/127.0.0.1:\d+/);if(m)resolve(m[0])});child.on('error',reject);child.on('exit',code=>reject(Error(`exit ${code}`)));setTimeout(()=>reject(Error('Startup timeout')),5000).unref()});
  const send=(data,origin=url)=>fetch(url+'/api/requests',{method:'POST',headers:{'Content-Type':'application/json','Origin':origin},body:JSON.stringify(data)});
  const data={selection:'pharmacy',name:'Client Test',company:'Companie Test',phone:'0700000000',email:'test@example.invalid',city:'Oraș Test',details:'Proiect fictiv de test',consent:true,website:''};
  const cfg=await fetch(url+'/api/config').then(r=>r.json());assert.equal(cfg.contact.company,'ASG THUNDERBOLT SRL');assert.equal(cfg.internal,undefined);assert.equal(cfg.products.length,0);
  assert.equal((await send({...data,consent:false})).status,422);
  assert.equal((await send({...data,email:'invalid'})).status,422);
  assert.equal((await send({...data,phone:'-------'})).status,422);
  assert.equal((await send({...data,selection:'fake-product'})).status,422);
  assert.equal((await send({...data,details:'x'.repeat(3001)})).status,422);
  assert.equal((await send(data,'https://external.invalid')).status,403);
  assert.equal((await send({...data,website:'bot.invalid'})).status,400);
  const result=await send(data);assert.equal(result.status,201);const saved=await result.json();
  const record=JSON.parse(await readFile(join(dir,`${saved.id}.json`),'utf8'));assert.equal(record.company,data.company);assert.equal(record.selection,'pharmacy');assert.equal(record.consent,true);assert.equal(record.privacyVersion,'draft-2026-10-14');
  assert.equal((await fetch(url+`/private-data/${saved.id}.json`)).status,404);assert.equal((await fetch(url+'/site-config.json')).status,404);assert.equal((await fetch(url+'/api/requests')).status,404);
  assert.equal((await fetch(url)).status,200);assert.equal((await fetch(url+'/styles.css')).status,200);assert.equal((await fetch(url+'/app.js')).status,200);
  const sale=await send({...data,selection:'sale'});assert.equal(sale.status,201);const saleSaved=await sale.json();
  const saleRecord=JSON.parse(await readFile(join(dir,`${saleSaved.id}.json`),'utf8'));assert.equal(saleRecord.selection,'sale');
  for(let i=0;i<3;i++)assert.equal((await send(data)).status,201);
  assert.equal((await send(data)).status,429);assert.equal((await readdir(dir)).length,5);
 }finally{child.kill();await new Promise(r=>child.once('exit',r));await rm(dir,{recursive:true,force:true});}
});
