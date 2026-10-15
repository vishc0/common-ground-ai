import {spawnSync} from 'node:child_process';
const endpoint=`https://api.cloudflare.com/client/v4/accounts/${process.env.CLOUDFLARE_ACCOUNT_ID}/challenges/widgets`;
const headers={Authorization:`Bearer ${process.env.CLOUDFLARE_API_TOKEN}`,'Content-Type':'application/json'};
async function call(url,options={}){const response=await fetch(url,{...options,headers});const data=await response.json();if(!response.ok||!data.success){console.error('Turnstile API rejected the request:',JSON.stringify(data.errors?.map(e=>({code:e.code,message:e.message}))));process.exit(1)}return data.result}
const existing=await call(endpoint);
let widget=existing.find(w=>w.name==='Common Ground MVP');
if(widget)widget=await call(endpoint+'/'+widget.sitekey);
else widget=await call(endpoint,{method:'POST',body:JSON.stringify({name:'Common Ground MVP',domains:['common-ground-mvp.shivarama-aiagency.workers.dev'],mode:'managed'})});
for(const [name,value] of Object.entries({TURNSTILE_SITE_KEY:widget.sitekey,TURNSTILE_SECRET_KEY:widget.secret})){if(!value)throw new Error('Missing widget credential');console.log(`::add-mask::${value}`);const result=spawnSync('npx',['wrangler','secret','put',name],{input:value,encoding:'utf8'});if(result.status!==0){console.error('Failed to install '+name);process.exit(1)}}
console.log('Turnstile configured for the MVP hostname.');
