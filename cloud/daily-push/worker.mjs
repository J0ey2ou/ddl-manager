// No developer credentials or plaintext push content are persisted.
const enc=new TextEncoder(),dec=new TextDecoder();
export async function digest(s){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',enc.encode(s)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
const b64=b=>btoa(String.fromCharCode(...b));
const bytes=s=>Uint8Array.from(atob(s),x=>x.charCodeAt(0));
async function key(env){return crypto.subtle.importKey('raw',bytes(env.ENCRYPTION_KEY),{name:'AES-GCM'},false,['encrypt','decrypt']);}
export async function seal(env,value,aad){const iv=crypto.getRandomValues(new Uint8Array(12));const cipher=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:enc.encode(aad)},await key(env),enc.encode(JSON.stringify(value)));return b64(iv)+'.'+b64(new Uint8Array(cipher));}
export async function unseal(env,value,aad){const[iv,cipher]=value.split('.');return JSON.parse(dec.decode(await crypto.subtle.decrypt({name:'AES-GCM',iv:bytes(iv),additionalData:enc.encode(aad)},await key(env),bytes(cipher))));}
const reply=(v,status=200)=>Response.json(v,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});
const publicRow=r=>({id:r.id,day:r.day,hash:r.hash,status:r.status,due:r.due,provider_message_id:r.provider_id||''});
export async function handler(request,env){
  if(new URL(request.url).protocol!=='https:')return reply({error:'HTTPS required'},400);
  if(request.method!=='POST')return reply({error:'POST required'},405);
  const bearer=request.headers.get('Authorization')||'';
  if(!/^Bearer [A-Za-z0-9_-]{43,128}$/.test(bearer))return reply({error:'Unauthorized'},401);
  const tenant=await env.DB.prepare('SELECT id FROM tenants WHERE token_hash=? AND disabled=0').bind(await digest(bearer.slice(7))).first();
  if(!tenant)return reply({error:'Unauthorized'},401);
  const now=Math.floor(Date.now()/1000),hour=Math.floor(now/3600);
  const rate=await env.DB.prepare('INSERT INTO request_limits VALUES(?,?,1) ON CONFLICT(tenant,hour) DO UPDATE SET count=count+1 RETURNING count').bind(tenant.id,hour).first();
  if(rate.count>60)return reply({error:'Rate limit exceeded'},429);
  const reader=request.body?.getReader();if(!reader)return reply({error:'Missing body'},400);
  let chunks=[],length=0;while(true){const{value,done}=await reader.read();if(done)break;length+=value.length;if(length>40000){await reader.cancel();return reply({error:'Body too large'},413);}chunks.push(value);}
  const all=new Uint8Array(length);let offset=0;for(const c of chunks){all.set(c,offset);offset+=c.length;}
  let body;try{body=JSON.parse(dec.decode(all));}catch{return reply({error:'Invalid JSON'},400);}
  if(!body||typeof body!=='object'||!/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(body.day||''))return reply({error:'Invalid day'},400);
  let row=await env.DB.prepare('SELECT * FROM messages WHERE tenant=? AND day=?').bind(tenant.id,body.day).first();
  if(body.action==='status')return row?reply(publicRow(row)):reply({error:'Not found'},404);
  if(body.action==='cancel'){
    if(!row)return reply({error:'Not found'},404);
    await env.DB.prepare("UPDATE messages SET status='cancelled',encrypted=NULL,updated=? WHERE tenant=? AND day=? AND status='queued'").bind(now,tenant.id,body.day).run();
    row=await env.DB.prepare('SELECT * FROM messages WHERE tenant=? AND day=?').bind(tenant.id,body.day).first();return reply(publicRow(row));
  }
  if(body.action!=='submit'||!/^SCT[A-Za-z0-9]{10,200}$/.test(body.sendkey||'')||typeof body.title!=='string'||body.title.length>100||typeof body.body!=='string'||enc.encode(body.body).length>30000||!body.body||!Number.isInteger(body.due)||body.due<now+60||body.due>now+7*86400||!Number.isInteger(body.expires)||body.expires<body.due||body.expires>body.due+86400||!/^\w{32}$/.test(body.id||''))return reply({error:'Invalid snapshot'},400);
  const hash=await digest(body.body);if(hash!==body.hash)return reply({error:'Hash mismatch'},400);
  if(row)return row.hash===hash&&row.id===body.id&&row.due===body.due?reply(publicRow(row)):reply({error:'A different daily snapshot already exists'},409);
  const encrypted=await seal(env,{sendkey:body.sendkey,title:body.title,body:body.body},tenant.id+'|'+body.day+'|'+body.id);
  await env.DB.prepare("INSERT OR IGNORE INTO messages VALUES(?,?,?,?,?,?,'queued',?,?,NULL)").bind(tenant.id,body.day,body.id,hash,body.due,body.expires,encrypted,now).run();
  row=await env.DB.prepare('SELECT * FROM messages WHERE tenant=? AND day=?').bind(tenant.id,body.day).first();
  return row.hash===hash&&row.id===body.id?reply(publicRow(row)):reply({error:'Concurrent conflict'},409);
}
export async function dispatch(env,fetcher=fetch,now=Math.floor(Date.now()/1000)){
  // Stuck sends are unknown, never automatically reattempted. Retain identity
  // tombstones after erasing content so old clients cannot resubmit the same day.
  await env.DB.prepare("UPDATE messages SET status='unknown',encrypted=NULL,updated=? WHERE status='sending' AND updated<?").bind(now,now-180).run();
  await env.DB.prepare("UPDATE messages SET status='skipped',encrypted=NULL,updated=? WHERE status='queued' AND expires<?").bind(now,now).run();
  const {results}=await env.DB.prepare("SELECT * FROM messages WHERE status='queued' AND due<=? ORDER BY due LIMIT 5").bind(now).all();
  for(const row of results){
    const claimed=await env.DB.prepare("UPDATE messages SET status='sending',updated=? WHERE tenant=? AND day=? AND status='queued'").bind(now,row.tenant,row.day).run();if(!claimed.meta.changes)continue;
    let status='unknown',provider='';
    try{
      const value=await unseal(env,row.encrypted,row.tenant+'|'+row.day+'|'+row.id);
      const response=await fetcher('https://sctapi.ftqq.com/'+value.sendkey+'.send',{method:'POST',redirect:'error',signal:AbortSignal.timeout(20000),headers:{'Content-Type':'application/x-www-form-urlencoded'},body:new URLSearchParams({title:value.title,desp:value.body})});
      if(response.status===200){const raw=await response.text();if(raw.length>65536)throw Error('Oversize');const result=JSON.parse(raw);status=result.code===0?'accepted':'failed';provider=String(result.data?.pushid||'').slice(0,200);}
    }catch{/* Never log provider errors or URLs containing SendKey. */}
    await env.DB.prepare('UPDATE messages SET status=?,provider_id=?,encrypted=NULL,updated=? WHERE tenant=? AND day=?').bind(status,provider,now,row.tenant,row.day).run();
  }
  await env.DB.prepare('DELETE FROM request_limits WHERE hour<?').bind(Math.floor(now/3600)-24).run();
}
export default {async fetch(request,env){try{return await handler(request,env);}catch{return reply({error:'Service unavailable; query status before resubmitting'},503);}},async scheduled(event,env,ctx){ctx.waitUntil(dispatch(env));}};
