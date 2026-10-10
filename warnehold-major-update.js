/* Warnehold Major Update — AI companion uses the existing authenticated AI endpoint; it never changes game state. */
(()=>{'use strict';
if(window.__WH_MAJOR_UPDATE_V1__)return;window.__WH_MAJOR_UPDATE_V1__=true;
const modes=[
 {id:'guide',label:'راهنما'},
 {id:'npc',label:'شخصیت هوشمند'},
 {id:'quest',label:'ایده مأموریت'},
 {id:'world',label:'رویداد جهان'},
 {id:'battle',label:'تحلیل فایت'},
 {id:'social',label:'اجتماعی'}
];
let activeMode='guide',busy=false;
const el=(tag,attrs={},text='')=>{const n=document.createElement(tag);Object.entries(attrs).forEach(([k,v])=>{if(k==='class')n.className=v;else if(k.startsWith('data-')||k==='type'||k==='title'||k==='aria-label'||k==='role')n.setAttribute(k,v);else n[k]=v});if(text)n.textContent=text;return n};
function build(){
 if(document.getElementById('wh-major-ai-launch'))return;
 const launch=el('button',{id:'wh-major-ai-launch',type:'button','aria-label':'باز کردن دستیار هوشمند وارنهولد',title:'دستیار هوشمند'},'✦');
 const panel=el('section',{id:'wh-major-ai-panel','aria-label':'دستیار هوشمند وارنهولد'});
 const head=el('div',{class:'wh-major-ai-head'});
 head.append(el('div',{class:'wh-major-ai-orb'},'✦'));
 const titleBox=el('div');
 titleBox.append(el('div',{class:'wh-major-ai-title'},'وارنهولد AI'),el('div',{class:'wh-major-ai-sub'},'همراه هوشمند دنیای بازی'));
 const close=el('button',{id:'wh-major-ai-close',type:'button','aria-label':'بستن'},'×');
 head.append(titleBox,close);
 const modeRow=el('div',{class:'wh-major-ai-modes','role':'group','aria-label':'حالت هوش مصنوعی'});
 modes.forEach(m=>{const b=el('button',{type:'button','data-mode':m.id},m.label);if(m.id===activeMode)b.classList.add('active');b.addEventListener('click',()=>setMode(m.id));modeRow.append(b)});
 const output=el('div',{id:'wh-major-ai-output','aria-live':'polite','aria-atomic':'false'});
 const compose=el('form',{class:'wh-major-ai-compose'});
 const input=el('textarea',{id:'wh-major-ai-input',rows:2,placeholder:'چی می‌خوای بدونی؟', 'aria-label':'پیام به هوش مصنوعی'});
 const send=el('button',{id:'wh-major-ai-send',type:'submit'},'پرسیدن');
 compose.append(input,send);
 const foot=el('div',{class:'wh-major-ai-foot'},'هوش مصنوعی پیشنهاد و داستان می‌سازد؛ سکه، آیتم و نتیجه فایت را خودش تغییر نمی‌دهد.');
 panel.append(head,modeRow,output,compose,foot);
 document.body.append(launch,panel);
 launch.addEventListener('click',()=>{panel.classList.toggle('open');if(panel.classList.contains('open'))setTimeout(()=>input.focus(),60)});
 close.addEventListener('click',()=>panel.classList.remove('open'));
 compose.addEventListener('submit',async ev=>{
  ev.preventDefault();if(busy)return;
  const message=input.value.trim();if(!message){output.textContent='اول سوالت رو بنویس.';return}
  if(message.length>1800){output.textContent='پیامت خیلی طولانیه؛ کوتاه‌ترش کن (حداکثر ۱۸۰۰ نویسه).';return}
  const ai=window.warneholdAI;
  if(!ai||typeof ai.ask!=='function'){output.textContent='هوش مصنوعی هنوز آماده نشده. یک‌بار صفحه رو تازه کن.';return}
  busy=true;send.disabled=true;send.textContent='...';output.textContent='دارم فکر می‌کنم…';
  try{
   const context={source:'floating_companion',activeScreen:document.querySelector('.screen.active')?.id||'',requestedAt:new Date().toISOString()};
   const result=await ai.ask(message,activeMode,context);
   output.textContent=(result&&result.answer)||'پاسخی دریافت نشد.';
   input.value='';
  }catch(err){output.textContent=(err&&err.message)||'ارتباط با هوش مصنوعی برقرار نشد. دوباره تلاش کن.'}
  finally{busy=false;send.disabled=false;send.textContent='پرسیدن'}
 });
 document.addEventListener('keydown',ev=>{if(ev.key==='Escape')panel.classList.remove('open')});
}
function setMode(id){if(!modes.some(m=>m.id===id))return;activeMode=id;document.querySelectorAll('#wh-major-ai-panel [data-mode]').forEach(b=>b.classList.toggle('active',b.dataset.mode===id));const out=document.getElementById('wh-major-ai-output');if(out)out.textContent='حالت «'+modes.find(m=>m.id===id).label+'» انتخاب شد. سوالت رو بپرس.'}
function updateVisibility(){
 const launch=document.getElementById('wh-major-ai-launch'),panel=document.getElementById('wh-major-ai-panel');if(!launch||!panel)return;
 const game=document.getElementById('game-wrap'),auth=document.getElementById('screen-auth');
 const gameVisible=!!game&&getComputedStyle(game).display!=='none';
 const authVisible=!!auth&&auth.classList.contains('active');
 const visible=gameVisible&&!authVisible;
 launch.style.display=visible?'flex':'none';
 if(!visible)panel.classList.remove('open');
}
function observe(){
 const root=document.getElementById('app')||document.body;
 const observer=new MutationObserver(records=>{
  let screenChanged=false;
  for(const r of records){
   if(r.type==='attributes'&&r.attributeName==='class'&&r.target.classList?.contains('screen')&&r.target.classList.contains('active')&&!(r.oldValue||'').includes('active'))screenChanged=true;
  }
  if(screenChanged){
   const screen=document.querySelector('.screen.active');
   if(screen&&!screen.classList.contains('wh-major-enter')){
    screen.classList.add('wh-major-enter');
    screen.addEventListener('animationend',()=>screen.classList.remove('wh-major-enter'),{once:true});
   }
   updateVisibility();
  }
 });
 observer.observe(root,{subtree:true,attributes:true,attributeOldValue:true,attributeFilter:['class']});
 const visibilityObserver=new MutationObserver(updateVisibility);
 const game=document.getElementById('game-wrap'),auth=document.getElementById('screen-auth');
 if(game)visibilityObserver.observe(game,{attributes:true,attributeFilter:['style']});
 if(auth)visibilityObserver.observe(auth,{attributes:true,attributeFilter:['class']});
 updateVisibility();
}
function init(){build();observe();setTimeout(updateVisibility,800);setTimeout(updateVisibility,2200)}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init,{once:true});else init();
})();
