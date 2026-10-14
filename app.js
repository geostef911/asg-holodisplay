const $=s=>document.querySelector(s);
const config=await fetch('/api/config').then(r=>{if(!r.ok)throw Error('Config');return r.json()}).catch(()=>null);
if(!config){$('#form-error').textContent='Configurația nu poate fi încărcată. Reîncarcă pagina.';$('.submit').disabled=true;}
const el=(tag,text,cls)=>{const n=document.createElement(tag);if(text)n.textContent=text;if(cls)n.className=cls;return n;};
if(config){
  document.querySelectorAll('[data-brand]').forEach(n=>n.textContent=config.brand);
  document.title=`${config.brand} — Publicitate într-o nouă dimensiune`;
  $('.logo small').textContent=config.contact.company?`O IDEE ${config.contact.company}`:'PUBLICITATE HOLOGRAFICĂ 3D';
  const contact=$('#contact-details');contact.replaceChildren();
  if(config.contact.company)contact.append(el('strong',config.contact.company));
  for(const [key,prefix] of [['email','Email'],['phone','Telefon'],['address','Adresă']]){
    if(config.contact[key])contact.append(el('span',`${prefix}: ${config.contact[key]}`));
  }
  if(!config.contact.email&&!config.contact.phone)contact.append(el('p','Telefonul și emailul vor fi completate înainte de publicare.'));
  for(const [i,p] of config.packages.entries()){
    const card=el('article',null,'package'+(i===0?' featured':''));
    card.append(el('p',`OPȚIUNEA 0${i+1}`,'eyebrow'),el('h3',p.title),el('p',p.description),el('div',p.priceLabel,'price'),el('p',p.priceNote||'','price-note'));
    const list=el('ul');p.items.forEach(t=>list.append(el('li',t)));card.append(list);
    const btn=el('button',p.cta||'Cere ofertă ↗','button outline');btn.dataset.select=p.id;card.append(btn);$('#packages').append(card);
    const option=el('option',p.title);option.value=p.id;$('#selection').append(option);
  }
  for(const p of config.products){
    const card=el('article');
    // Only approved, local media is supported. Do not introduce third-party trackers.
    if(p.media&&/^\/assets\/[\w./-]+$/.test(p.media)&&p.mediaRightsConfirmed){const media=el(p.mediaType==='video'?'video':'img');media.src=p.media;media.className='product-media';if(media.tagName==='VIDEO')media.controls=true;else media.alt=p.name;card.append(media);}
    card.append(el('h3',p.name),el('p',p.description));
    if(p.specifications){const list=el('ul');p.specifications.forEach(s=>list.append(el('li',s)));card.append(list);}
    const btn=el('button','Cere ofertă ↗','button outline');btn.dataset.select=p.id;card.append(btn);$('#product-catalog').append(card);
    const option=el('option',p.name);option.value=p.id;$('#selection').append(option);
  }
  if(config.products.length)$('.catalog-note').textContent='Modelele și disponibilitatea se confirmă în oferta personalizată.';
  const privacy=$('#privacy-content');
  privacy.append(el('p',`Operator propus pentru site: ${config.privacy.operator||'de completat'}. Datele juridice complete și canalul de contact pentru protecția datelor trebuie confirmate înainte de publicare.`));
  privacy.append(el('p','Aceasta este o informare de lucru pentru o previzualizare locală. Folosește exclusiv date fictive. Formularul colectează tipul proiectului, numele, compania, telefonul, emailul, orașul și descrierea pentru înregistrarea solicitării. Nu include date sensibile.'));
  privacy.append(el('p','Cererea, acordul și data înregistrării sunt salvate în fișiere pe calculatorul pe care rulează previzualizarea. Nu sunt transmise unei echipe comerciale sau unor servicii de email. Persoanele cu acces la aceste fișiere le pot consulta.'));
  privacy.append(el('p',`Pentru lansare: ${config.privacy.legalBasis||'temeiul prelucrării trebuie stabilit și validat'}; termen de păstrare: ${config.privacy.retention||'de stabilit'}; contact pentru drepturi: ${config.privacy.email||'de completat'}. În previzualizare, acordul bifat se înregistrează numai pentru acest test. Datele de test pot fi șterse de proprietarul calculatorului.`));
}
$('#year').textContent=new Date().getFullYear();
$('#menu-button').addEventListener('click',()=>{const open=$('#navigation').classList.toggle('open');$('#menu-button').setAttribute('aria-expanded',open)});
$('#navigation').addEventListener('click',e=>{if(e.target.closest('a')){$('#navigation').classList.remove('open');$('#menu-button').setAttribute('aria-expanded','false')}});
document.addEventListener('click',e=>{const b=e.target.closest('[data-select]');if(b){$('#selection').value=b.dataset.select;$('#confirmation').hidden=true;$('#quote-form').hidden=false;$('#oferta').scrollIntoView({behavior:matchMedia('(prefers-reduced-motion: reduce)').matches?'auto':'smooth'});$('#selection').focus({preventScroll:true});}if(e.target.closest('[data-privacy]'))$('#privacy-dialog').showModal();});
$('.dialog-close').onclick=$('.dialog-done').onclick=()=>$('#privacy-dialog').close();
$('#privacy-dialog').addEventListener('click',e=>{if(e.target===$('#privacy-dialog')){const r=e.target.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.target.close()}});
$('#quote-form').addEventListener('submit',async e=>{
  e.preventDefault();const form=e.target;if(!form.reportValidity())return;
  const data=Object.fromEntries(new FormData(form));data.consent=form.elements.consent.checked;
  const submit=$('.submit');submit.disabled=true;submit.textContent='Se înregistrează…';$('#form-error').textContent='';
  try{const response=await fetch('/api/requests',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify(data)});const result=await response.json();if(!response.ok)throw Error(result.error||'Solicitarea nu a putut fi salvată.');$('#request-reference').textContent=result.id;form.hidden=true;$('#confirmation').hidden=false;$('#confirmation').focus();form.reset();}
  catch(err){$('#form-error').textContent=err.message||'Conexiune întreruptă. Încearcă din nou.';}
  finally{submit.disabled=false;submit.textContent='Trimite solicitarea ↗';}
});
$('#new-request').onclick=()=>{$('#confirmation').hidden=true;$('#quote-form').hidden=false;$('#selection').focus()};
const canvas=$('#hologram'),ctx=canvas.getContext('2d');let scene=0,paused=matchMedia('(prefers-reduced-motion: reduce)').matches,rotation=0,last=0;
const labels=['Formă abstractă','Concept pentru farmacie','Concept pentru retail'];
const updatePause=()=>{$('#pause').textContent=paused?'▶':'Ⅱ';$('#pause').setAttribute('aria-pressed',paused);$('#pause').setAttribute('aria-label',paused?'Pornește animația':'Oprește animația')};updatePause();
$('#pause').onclick=()=>{paused=!paused;updatePause()};
document.querySelectorAll('[data-scene]').forEach(b=>b.onclick=()=>{scene=Number(b.dataset.scene);document.querySelectorAll('[data-scene]').forEach(n=>{const active=n===b;n.classList.toggle('active',active);n.setAttribute('aria-pressed',active)});$('#scene-label').textContent=labels[scene];$('.stage-top>span:last-child').textContent=`0${scene+1} / 03`;draw()});
const observer=new ResizeObserver(()=>{const dpr=Math.min(devicePixelRatio||1,2);canvas.width=canvas.clientWidth*dpr;canvas.height=canvas.clientHeight*dpr;ctx.setTransform(dpr,0,0,dpr,0,0);draw()});observer.observe(canvas);
function draw(){const w=canvas.clientWidth,h=canvas.clientHeight;ctx.clearRect(0,0,w,h);const glow=ctx.createRadialGradient(w/2,h*.48,0,w/2,h*.48,w*.55);glow.addColorStop(0,'#6df0b01d');glow.addColorStop(1,'#17251b00');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 ctx.strokeStyle='#66867419';ctx.lineWidth=1;for(let k=0;k<7;k++){ctx.beginPath();ctx.ellipse(w/2,h*.55,45+k*27,25+k*16,0,0,Math.PI*2);ctx.stroke();}ctx.beginPath();ctx.moveTo(25,h*.55);ctx.lineTo(w-25,h*.55);ctx.moveTo(w/2,20);ctx.lineTo(w/2,h-20);ctx.stroke();
 const size=Math.min(w*.30,h*.34),points=[];
 if(scene===0){for(let i=0;i<66;i++){let u=i/66*Math.PI*2;for(let j=0;j<26;j++){let v=j/26*Math.PI*2;points.push([(1+.38*Math.cos(v))*Math.cos(u),(1+.38*Math.cos(v))*Math.sin(u),.38*Math.sin(v),i]);}}}
 else if(scene===1){for(let x=-1;x<=1;x+=.085)for(let y=-1;y<=1;y+=.085)if(Math.abs(x)<.36||Math.abs(y)<.36){points.push([x,y,.20,20]);points.push([x,y,-.20,20]);}}
 else{for(let i=0;i<55;i++)for(let j=0;j<32;j++){let u=i/55*Math.PI*2,v=j/31*Math.PI;points.push([Math.sin(v)*Math.cos(u),Math.cos(v),Math.sin(v)*Math.sin(u),i]);}}
 const a=rotation+.35,tilt=.34;const transformed=points.map(([x,y,z,i])=>{let xx=x*Math.cos(a)+z*Math.sin(a),zz=-x*Math.sin(a)+z*Math.cos(a),yy=y*Math.cos(tilt)-zz*Math.sin(tilt);zz=y*Math.sin(tilt)+zz*Math.cos(tilt);return[xx,yy,zz,i]}).sort((a,b)=>a[2]-b[2]);
 for(const [x,y,z,i] of transformed){const perspective=3.8/(3.8-z);const alpha=.25+(z+1.4)/2.8*.7;ctx.fillStyle=scene===1?`rgba(187,255,170,${alpha})`:`hsla(${137+i*.7},85%,${65+z*10}%,${alpha})`;ctx.beginPath();ctx.arc(w/2+x*size*perspective,h*.48+y*size*perspective,1.0+Math.max(0,z)*.7,0,Math.PI*2);ctx.fill();}
 ctx.strokeStyle='#aad79c33';ctx.beginPath();ctx.ellipse(w/2,h*.92,size*.85,8,0,0,Math.PI*2);ctx.stroke();ctx.fillStyle='#12251c';ctx.beginPath();ctx.ellipse(w/2,h*.94,size*.4,5,0,0,Math.PI*2);ctx.fill();}
function tick(time){if(!paused&&!document.hidden){rotation+=Math.min(time-last,40)*.00022;draw()}last=time;requestAnimationFrame(tick)}requestAnimationFrame(tick);
