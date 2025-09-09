/* ================================
   UTILITIES
==================================*/
'use strict';

const $  = (s, p=document)=>p.querySelector(s);
const $$ = (s, p=document)=>[...p.querySelectorAll(s)];
const pad = (n)=>String(n).padStart(2,'0');
const prefersReducedMotion = () => (typeof window.matchMedia === 'function') && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function showToast(msg='Copied!'){
  const t = $('#toast'); if(!t) { try{ alert(msg); }catch(_){} return; }
  t.setAttribute('role','status'); t.setAttribute('aria-live','polite');
  t.textContent = msg;
  t.style.opacity = '1'; t.style.transform='translateY(0)';
  setTimeout(()=>{ t.style.opacity = '0'; t.style.transform='translateY(8px)'; }, 1600);
}

function popConfetti(){
  if (prefersReducedMotion()) return;
  const c = $('#confetti'); if(!c) return;
  const ctx = c.getContext('2d');
  const { innerWidth:w, innerHeight:h } = window;
  c.width=w; c.height=h; c.style.display='block';

  const dots = Array.from({length:160}, ()=>({
    x:Math.random()*w,
    y:-20-Math.random()*h,
    r:2+Math.random()*3,
    v:2+Math.random()*4
  }));

  const id = setInterval(()=>{
    ctx.clearRect(0,0,w,h);
    dots.forEach(d=>{
      d.y += d.v;
      ctx.beginPath();
      ctx.arc(d.x,d.y,d.r,0,Math.PI*2);
      ctx.fillStyle = `hsl(${Math.random()*360},90%,65%)`;
      ctx.fill();
    });
  },16);

  setTimeout(()=>{
    clearInterval(id);
    c.style.display='none';
    ctx.clearRect(0,0,w,h);
  },1400);
}

/* ================================
   Phone helpers (shared)
==================================*/
function formatNaPhone(value){
  const d = (value||'').replace(/\D/g,'').slice(0,10);
  if (d.length === 0) return '';
  if (d.length <= 3) return `(${d}`;
  if (d.length <= 6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
  return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
}
function digitsLen(value){ return (value||'').replace(/\D/g,'').length; }
function bindPhoneFormatting(input, onValidityChange){
  if (!input) return;
  const update = ()=>{
    const before = input.selectionStart ?? input.value.length;
    input.value = formatNaPhone(input.value);
    const valid = digitsLen(input.value) >= 10;
    input.setAttribute('aria-invalid', valid ? 'false' : 'true');
    if (typeof onValidityChange === 'function') onValidityChange(valid);
    try{ input.setSelectionRange(before,before); }catch(_){}
  };
  input.addEventListener('input', update);
  input.addEventListener('blur', update);
  update();
}

/* Apply data-bg to specials cards (remove inline styles) */
$$('.deal-card').forEach(card=>{
  const bg = card.getAttribute('data-bg');
  if (bg) card.style.setProperty('--bg', `url('${bg}')`);
});

/* ================================
   FEATURED VEHICLES (Pager V1)
   Auto-disabled if .fv-viewport exists (Slider V2 present)
==================================*/
(function(){
  const track = $('#fvTrack');
  const hasSliderV2 = !!document.querySelector('.fv-viewport');
  if(!track || hasSliderV2) return;

  const vehiclesData = [
    { badge:'used', year:2019, make:'Alfa Romeo', model:'Giulia TI Sport', trim:'AWD • 2.0L', img:'https://via.placeholder.com/800x500?text=2019+Giulia+Ti+Sport', price:'$59 /wk', sale:'$28,995', link:'#featured-vehicles' },
    { badge:'used', year:2018, make:'Alfa Romeo', model:'Stelvio TI',       trim:'AWD • 2.0L', img:'https://via.placeholder.com/800x500?text=2018+Stelvio+Ti',       price:'$62 /wk', sale:'$31,995', link:'#featured-vehicles' },
    { badge:'used', year:2017, make:'Alfa Romeo', model:'Giulia',            trim:'2.0L • Leather', img:'https://via.placeholder.com/800x500?text=2017+Giulia',     price:'$55 /wk', sale:'$24,995', link:'#featured-vehicles' },
    { badge:'used', year:2015, make:'Chevrolet',  model:'Cruze 1LT',         trim:'1.4L • Auto', img:'https://via.placeholder.com/800x500?text=2015+Chevrolet+Cruze', price:'$42 /wk', sale:'$6,495',  link:'#featured-vehicles' },
    { badge:'used', year:2014, make:'Ford',       model:'Explorer XLT AWD',  trim:'3.5L • 7-Seat', img:'https://via.placeholder.com/800x500?text=2014+Ford+Explorer', price:'$59 /wk', sale:'$8,995',  link:'#featured-vehicles' },
    { badge:'used', year:2010, make:'Audi',       model:'Q5 3.2L Premium',   trim:'Quattro', img:'https://via.placeholder.com/800x500?text=2010+Audi+Q5',             price:'$59 /wk', sale:'$8,995',  link:'#featured-vehicles' }
  ];

  const perPage = 3;
  let page = 0;
  const prevBtn = document.querySelector('.fv-prev');
  const nextBtn = document.querySelector('.fv-next');

  function render(){
    track.innerHTML = '';
    const start = page * perPage;
    const slice = vehiclesData.slice(start, start + perPage);
    slice.forEach(v=>{
      const li = document.createElement('li');
      li.className='fv-card';
      li.innerHTML = `
        <div class="fv-media">
          <img src="${v.img}" alt="${v.year} ${v.make} ${v.model}">
          <span class="fv-badge">${v.badge||''}</span>
          <a class="fv-link" href="${v.link}">View Details</a>
        </div>
        <div class="fv-body">
          <h3 class="fv-title">${v.year} ${(v.make||'').toUpperCase()} ${(v.model||'').toUpperCase()}</h3>
          ${v.trim ? `<p class="fv-trim">${v.trim}</p>` : ''}
          <div class="fv-row">
            <div class="fv-left">${v.price||''}<small>PAYMENT EST.</small></div>
            <div class="fv-right"><span class="fv-sale">${v.sale||''}</span></div>
          </div>
        </div>`;
      track.appendChild(li);
    });
    if (prevBtn) prevBtn.disabled = (page===0);
    if (nextBtn) nextBtn.disabled = ((page+1) * perPage >= vehiclesData.length);
  }

  prevBtn?.addEventListener('click', ()=>{ if(page>0){ page--; render(); } });
  nextBtn?.addEventListener('click', ()=>{ if((page+1)*perPage < vehiclesData.length){ page++; render(); } });
  render();
})();

/* ================================
   Specials: disclaimers & countdown
==================================*/
$$('.js-disclaimer').forEach(btn=>{
  btn.addEventListener('click', (e)=>{
    e.preventDefault();
    const card = btn.closest('.deal-card');
    const d = card?.querySelector('.disclaimer');
    if(!d) return;
    const open = !d.classList.contains('hidden');
    if (open){
      d.classList.add('hidden');
      btn.setAttribute('aria-expanded','false');
    } else {
      d.classList.remove('hidden');
      btn.setAttribute('aria-expanded','true');
      d.setAttribute('tabindex','-1');
      d.focus?.();
    }
  });
});

$$('#alfa-specials .deal-deadline').forEach(el=>{
  const iso = el.getAttribute('data-deadline');
  if(!iso) return;
  const end = new Date(`${iso}T23:59:59`);
  (function tick(){
    const now = new Date();
    const ms = end - now;
    if (ms <= 0){
      el.textContent = 'OFFER ENDED';
      el.style.color='#ffd1d1';
      return;
    }
    const d = Math.floor(ms/86400000);
    const h = Math.floor((ms%86400000)/3600000);
    const m = Math.floor((ms%3600000)/60000);
    el.textContent = `ENDS IN ${d}d ${pad(h)}h ${pad(m)}m`;
    setTimeout(tick, 30000);
  })();
});

/* ================================
   Winter CALL-OUT: Ensure present + place (SAFE)
==================================*/
(function () {
  let rafId = null;
  function schedule(fn){
    if (rafId) cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(()=>{ rafId = null; fn(); });
  }
  function wireRevealOnce(Winter){
    if (Winter.dataset.revealWired) return;
    Winter.dataset.revealWired = '1';
    const io = new IntersectionObserver(([entry])=>{
      if (entry.isIntersecting){
        Winter.classList.add('is-in');
        io.disconnect();
      }
    }, { threshold:.3 });
    io.observe(Winter);
  }
  function showWinter() {
    const grid = document.querySelector('.specials-section .deal-grid');
    if (!grid) return false;
    let Winter = document.getElementById('Winter-card');
    if (!Winter) return false;

    // Insert/move near front
    const targetIndex = Math.min(1, grid.children.length);
    if (Winter.parentElement !== grid) {
      grid.insertBefore(Winter, grid.children[targetIndex] || null);
    }
    if (!Winter.dataset.init) {
      Winter.dataset.init = '1';
      Winter.removeAttribute('hidden');
      Winter.classList.remove('hidden');
      ['display','opacity','visibility','transform','height'].forEach(p=>Winter.style.removeProperty(p));
      document.getElementById('openWinterModalBtn')?.addEventListener('click', (e) => {
        e.preventDefault();
        try { window.openModal?.(); } catch (_) {}
        if (!window.openModal) {
          const orig = document.querySelector('[id="openWinterModalBtn"]:not(#openWinterModalBtn)');
          orig?.click();
        }
      });
    }
    wireRevealOnce(Winter);
    return true;
  }
  const ok = showWinter();
  const specials = document.querySelector('.specials-section');
  if (specials) {
    const mo = new MutationObserver(() => schedule(showWinter));
    mo.observe(specials, { childList: true, subtree: true });
  }
  if (!ok) {
    let tries = 0;
    const iv = setInterval(() => {
      tries++;
      if (showWinter() || tries > 20) clearInterval(iv);
    }, 150);
  }
})();

/* ================================
   Winter TUNNEL (Modal, Steps, Calendar, Code)
==================================*/
(function(){
  const openBtn = $('#openWinterModalBtn');
  const modal = $('#WinterModal');
  const closeBtn = $('#closeWinterModal');
  const closeAfterReveal = $('#closeAfterReveal');
  if (!modal) return;

  const stepDotsAll = [$('#s1'), $('#s2'), $('#s3'), $('#s4')].filter(Boolean);
  const panelsAll = [$('#panel1'), $('#panel2'), $('#panel3'), $('#panel4')].filter(Boolean);
  let step = 1;

  function setStep(n){
    step = n;
    panelsAll.forEach((p,i)=>p.classList.toggle('active', i===n-1));
    stepDotsAll.forEach((d,i)=>d.classList.toggle('active', i===n-1));
  }
  function openModal(){
    modal.setAttribute('aria-hidden','false');
    setStep(1);
    setTimeout(()=>$('#fullName')?.focus(), 50);
    document.body.style.overflow='hidden';
  }
  function closeModal(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow='';
  }
  window.openModal = openModal;

  openBtn?.addEventListener('click', openModal);
  closeBtn?.addEventListener('click', closeModal);
  closeAfterReveal?.addEventListener('click', closeModal);
  modal.addEventListener('click', e=>{ if(e.target===modal) closeModal(); });
  window.addEventListener('keydown', e=>{ if(e.key==='Escape' && modal.getAttribute('aria-hidden')==='false') closeModal(); });

  // Step 1: Name
  const fullName = $('#fullName');
  const toStep2 = $('#toStep2');
  function enableTo2(){ if(toStep2) toStep2.disabled = !(fullName?.value.trim().length >= 2); }
  fullName?.addEventListener('input', enableTo2);
  fullName?.addEventListener('keydown', e=>{ if(e.key==='Enter' && !toStep2?.disabled){ e.preventDefault(); toStep2.click(); }});
  toStep2?.addEventListener('click', ()=>{ setStep(2); setTimeout(()=>$('#phone')?.focus(), 50); });

  // Step 2: Phone (with formatter)
  const phone = $('#phone');
  const backTo1 = $('#backTo1');
  const toStep3 = $('#toStep3');
  function onWinterPhoneValidity(valid){ if(toStep3) toStep3.disabled = !valid; }
  bindPhoneFormatting(phone, onWinterPhoneValidity);
  backTo1?.addEventListener('click', ()=>{ setStep(1); setTimeout(()=>fullName?.focus(), 50); });
  toStep3?.addEventListener('click', ()=> setStep(3));

  // Step 3 / 4 calendar stripped for brevity in this snippet — already in your file:
  // (kept intact from your previous script)
  // ... [calendar render + slot selection + startGenerate + copy code] ...
  // I’m keeping your original block exactly:
  const calTitle = $('#calTitle');
  const calGrid = $('#calGrid');
  const slotList = $('#slotList');
  const prevMonth = $('#prevMonth');
  const nextMonth = $('#nextMonth');
  const backTo2 = $('#backTo2');
  const toStep4 = $('#toStep4');

  let cal = new Date(); cal.setDate(1);
  let selDate = null, selTime = null;

  function renderCalendar(){
    if(!calGrid || !calTitle) return;
    calGrid.innerHTML = '';
    const month = cal.getMonth();
    const year = cal.getFullYear();
    calTitle.textContent = `${cal.toLocaleString('default',{month:'long'})} ${year}`;

    const firstDay = new Date(year, month, 1);
    const startWeekDay = (firstDay.getDay()+7)%7;
    const daysInMonth = new Date(year, month+1, 0).getDate();
    const prevDays = startWeekDay;
    const totalCells = Math.ceil((prevDays + daysInMonth) / 7) * 7;

    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{
      const el = document.createElement('div'); el.className='dow'; el.textContent=d; calGrid.appendChild(el);
    });

    for (let i=0;i<totalCells;i++){
      const dayNum = i - prevDays + 1;
      const cell = document.createElement('button'); cell.type='button'; cell.className='day';
      if (dayNum<=0 || dayNum>daysInMonth){
        cell.textContent = new Date(year, month, dayNum).getDate();
        cell.classList.add('other'); cell.disabled = true;
      } else {
        cell.textContent = dayNum;
        const d = new Date(year, month, dayNum);
        if (d.getDay()===0){ cell.classList.add('disabled'); cell.disabled = true; }
        const today = new Date(); today.setHours(0,0,0,0);
        const dd = new Date(d); dd.setHours(0,0,0,0);
        if (dd<today){ cell.classList.add('disabled'); cell.disabled = true; }
        if (selDate && dd.getTime()===selDate.getTime()) cell.classList.add('selected');

        cell.addEventListener('click', ()=>{
          selDate = dd; selTime = null;
          $$('.day', calGrid).forEach(b=>b.classList.remove('selected'));
          cell.classList.add('selected'); renderSlots();
        });
      }
      calGrid.appendChild(cell);
    }
  }
  function renderSlots(){
    if(!slotList){ return; }
    slotList.innerHTML = '';
    if (!selDate){
      const d = document.createElement('div'); d.className='slot-empty'; d.textContent='Select a date to see available times.'; slotList.appendChild(d); return;
    }
    const dow = selDate.getDay();
    let start = 9, end = 18; if (dow===1){ start=12; end=21;} if (dow===0){
      const d = document.createElement('div'); d.className='slot-empty'; d.textContent='Closed on Sundays.'; slotList.appendChild(d); return;
    }
    const now = new Date();
    const isToday = (new Date().toDateString() === selDate.toDateString());
    const slots = [];
    for (let h=start; h<=end; h++){
      for (let m of [0,30]){
        if (h===end && m>0) continue;
        const t = new Date(selDate); t.setHours(h, m, 0, 0);
        if (isToday && t < now) continue;
        const label = `${((h+11)%12+1)}:${pad(m)} ${h<12?'AM':'PM'}`;
        slots.push({t,label});
      }
    }
    if (!slots.length){
      const d = document.createElement('div'); d.className='slot-empty'; d.textContent='No remaining times today. Choose another date.'; slotList.appendChild(d); return;
    }
    slots.forEach(({t,label})=>{
      const b = document.createElement('button'); b.type='button'; b.className='slot'; b.textContent = label;
      b.addEventListener('click', ()=>{ selTime = t; $$('.slot', slotList).forEach(x=>x.classList.remove('selected')); b.classList.add('selected'); $('#toStep5')?.removeAttribute('disabled'); });
      slotList.appendChild(b);
    });
  }
  prevMonth?.addEventListener('click', ()=>{ cal.setMonth(cal.getMonth()-1); renderCalendar(); });
  nextMonth?.addEventListener('click', ()=>{ cal.setMonth(cal.getMonth()+1); renderCalendar(); });
  backTo2?.addEventListener('click', ()=>{ setStep(2); setTimeout(()=>$('#phone')?.focus(), 50); });
  toStep4?.addEventListener('click', ()=>{ setStep(4); startGenerate(); });
  renderCalendar();
  (function(){
  const calTitle = document.getElementById('calTitle');
  const calGrid = document.getElementById('calGrid');
  const slotList = document.getElementById('slotList');
  const prevMonth = document.getElementById('prevMonth');
  const nextMonth = document.getElementById('nextMonth');
  const backTo3 = document.getElementById('backTo3');
  const toStep5 = document.getElementById('toStep5');

  let cal = new Date(); cal.setDate(1);
  let selDate = null, selTime = null;

  function renderCalendar(){
    calGrid.innerHTML='';
    const m = cal.getMonth(), y = cal.getFullYear();
    calTitle.textContent = `${cal.toLocaleString('default',{month:'long'})} ${y}`;

    const firstDay = new Date(y,m,1);
    const start = (firstDay.getDay()+7)%7;
    const days = new Date(y,m+1,0).getDate();
    const cells = Math.ceil((start+days)/7)*7;

    ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].forEach(d=>{
      const el=document.createElement('div'); el.className='dow'; el.textContent=d; calGrid.appendChild(el);
    });

    for(let i=0;i<cells;i++){
      const n=i-start+1;
      const btn=document.createElement('button');
      btn.type='button'; btn.className='day';
      if(n<=0||n>days){
        btn.textContent=''; btn.disabled=true;
      } else {
        btn.textContent=n;
        const d=new Date(y,m,n); d.setHours(0,0,0,0);
        if(selDate && d.getTime()===selDate.getTime()) btn.classList.add('selected');
        btn.addEventListener('click',()=>{
          selDate=d; selTime=null;
          renderCalendar(); renderSlots();
        });
      }
      calGrid.appendChild(btn);
    }
  }

  function renderSlots(){
    slotList.innerHTML='';
    if(!selDate){ slotList.textContent='Select a date to see times.'; return; }
    const slots=['9:00 AM','10:00 AM','11:00 AM','1:00 PM','2:00 PM','3:00 PM','4:00 PM','5:00 PM'];
    slots.forEach(t=>{
      const b=document.createElement('button');
      b.type='button'; b.className='slot'; b.textContent=t;
      b.addEventListener('click',()=>{
        slotList.querySelectorAll('.slot').forEach(s=>s.classList.remove('selected'));
        b.classList.add('selected');
        selTime=t; toStep5.removeAttribute('disabled');
      });
      slotList.appendChild(b);
    });
  }

  prevMonth?.addEventListener('click',()=>{ cal.setMonth(cal.getMonth()-1); renderCalendar(); });
  nextMonth?.addEventListener('click',()=>{ cal.setMonth(cal.getMonth()+1); renderCalendar(); });
  backTo3?.addEventListener('click',()=>window.setStep?.(3));

  renderCalendar();
})();


  // Step 4: Generate + Reveal
  const genWrap = $('#genWrap');
  const codeBox = $('#codeBox');
  const finalCode = $('#finalCode');
  const copyCodeBtn = $('#copyCodeBtn');

  function WinterCodeGenerate(){
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let a='', b='';
    for(let i=0;i<4;i++) a+=chars[(Math.random()*chars.length)|0];
    for(let i=0;i<4;i++) b+=chars[(Math.random()*chars.length)|0];
    return `Winter-${a}-${b}`;
  }
  function startGenerate(){
    if (genWrap) genWrap.classList.remove('hidden');
    if (codeBox) codeBox.classList.add('hidden');
    setTimeout(()=>{
      const code = WinterCodeGenerate();
      if (finalCode) finalCode.textContent = code;
      try{ localStorage.setItem('Winter_reserved_code', code); }catch(_){}
      const preview = $('#WinterPreview'); if (preview) preview.textContent = code;
      if (genWrap) genWrap.classList.add('hidden');
      if (codeBox) codeBox.classList.remove('hidden');
      popConfetti();
    }, 900);
  }
  copyCodeBtn?.addEventListener('click', async ()=>{
    try{ await navigator.clipboard.writeText(finalCode?.textContent.trim()||''); showToast('Winter code copied'); }
    catch(e){ showToast('Could not copy'); }
  });
  const saved = localStorage.getItem('Winter_reserved_code'); if (saved){ const preview = $('#WinterPreview'); if (preview) preview.textContent = saved; }
})();

/* ================================
   Winter Sticky Side Popup (RIGHT SIDE)
==================================*/
(function(){
  const CFG = { side:'right', width:340, delay:800, scrollTriggerPct:25, stockStart:5, dismissKey:'Winter_sidecard_dismissed_v4', stockKeyPrefix:'Winter_sidecard_stock_v1' };
  const today = new Date().toISOString().slice(0,10);
  if (localStorage.getItem(CFG.dismissKey) === today) return;
  if (document.getElementById('WinterSideCard')) return;
  const stockKey = CFG.stockKeyPrefix + ':' + today;
  let stock = parseInt(localStorage.getItem(stockKey) || CFG.stockStart, 10);
  if (isNaN(stock) || stock < 0) stock = CFG.stockStart;

  const style = document.createElement('style');
  style.textContent = `
#WinterSideCard{
  --w:${CFG.width}px; --alfa:#C22636; --alfa2:#971B29;
  position:fixed; z-index:9999; ${CFG.side==='left' ? 'left:20px; right:auto;' : 'right:20px; left:auto;'}
  top:50%; transform:translateY(-50%) translateX(${CFG.side==='left' ? '-12px' : '12px'}) scale(.98);
  width:var(--w); max-width:92vw; border-radius:16px; overflow:hidden; color:#fff;
  background:linear-gradient(145deg, rgba(10,35,66,.96), rgba(10,35,66,.86));
  border:1px solid rgba(255,255,255,.18);
  box-shadow:0 18px 56px rgba(0,0,0,.48), 0 4px 16px rgba(0,0,0,.25);
  opacity:0; transition:.26s cubic-bezier(.2,.8,.2,1);
}
#WinterSideCard.show{ opacity:1; transform:translateY(-50%) translateX(0) scale(1); }
#WinterSideCard::after{
  content:""; position:absolute; inset:-14px; border-radius:20px; z-index:-1;
  background: radial-gradient(40% 40% at 50% 50%, rgba(194,38,54,.35), transparent 60%);
  animation: WinterPulse 2.2s ease-in-out infinite; pointer-events:none;
}
@keyframes WinterPulse{ 0%,100%{opacity:.45; filter:blur(14px)} 50%{opacity:.75; filter:blur(20px)} }
#WinterSideCard .body{ padding:14px; display:grid; gap:10px }
#WinterSideCard .badge{
  display:inline-flex; gap:6px; align-items:center; font-weight:800; letter-spacing:.12em;
  font-size:11px; text-transform:uppercase; padding:6px 10px; border-radius:999px;
  background:linear-gradient(90deg, rgba(255,255,255,.18), rgba(255,255,255,.08));
  border:1px solid rgba(255,255,255,.24);
}
#WinterSideCard .title{ margin:0; font-weight:900; font-size:18px; line-height:1.05 }
#WinterSideCard .sub{ margin:0; font-size:13px; color:#e3ecff; opacity:.95 }
#WinterSideCard ul{ margin:6px 0 2px; padding-left:18px; }
#WinterSideCard li{ font-size:13px; margin:4px 0 }
#WinterSideCard .stock{
  display:inline-flex; gap:6px; align-items:center; font-weight:900; font-size:12px; color:#fff;
  background:linear-gradient(90deg, var(--alfa), var(--alfa2)); padding:6px 10px; border-radius:12px;
  box-shadow:0 10px 26px rgba(194,38,54,.38);
}
#WinterSideCard .btn{
  appearance:none; border:0; cursor:pointer; width:100%; padding:12px 14px; border-radius:12px;
  font-weight:900; letter-spacing:.04em; background:linear-gradient(90deg, var(--alfa), var(--alfa2));
  color:#fff; box-shadow:0 14px 36px rgba(194,38,54,.38); transition:.15s ease; font-size:14px;
}
#WinterSideCard .btn:hover{ filter:brightness(1.06); transform:translateY(-1px); }
#WinterSideCard .x{ position:absolute; top:8px; ${CFG.side==='left' ? 'right:8px;' : 'left:8px;'} width:28px; height:28px; border-radius:999px; border:0; background:transparent; color:#fff; font-size:20px; opacity:.85; cursor:pointer; }
#WinterSideCard .x:hover{ opacity:1 }
@media (max-width:640px){
  #WinterSideCard{ left:50% !important; right:auto !important; top:auto; bottom:16px; transform:translate(-50%, 10px) scale(.98); }
  #WinterSideCard.show{ transform:translate(-50%, 0) scale(1); }
}`;
  document.head.appendChild(style);

  const html = `
<div id="WinterSideCard" role="dialog" aria-label="Winter Bonus Code teaser" aria-modal="false">
  <button class="x" aria-label="Close">×</button>
  <div class="body">
    <span class="badge">Winter BONUS</span>
    <strong class="title">Claim your Winter Bonus Code</strong>
    <p class="sub">Full Tank of Gas • Visa Gift Card • Surprise Bonus when you purchase after your in-person appointment.</p>
    <span class="stock" id="WinterSideStock">Only ${stock} remaining today</span>
    <ul>
      <li>Fast 60-second claim</li>
      <li>One code per household</li>
    </ul>
    <button class="btn" id="WinterSideClaim">Claim Now</button>
  </div>
</div>`;
  let shown = false;
  function mount(){
    if (shown) return; shown = true;
    document.body.insertAdjacentHTML('beforeend', html);
    requestAnimationFrame(()=>document.getElementById('WinterSideCard')?.classList.add('show'));
    const sEl = document.getElementById('WinterSideStock'); if (sEl) sEl.textContent = `Only ${stock} remaining today`;
  }
  setTimeout(mount, CFG.delay);

  let scShown = false;
  window.addEventListener('scroll', function(){
    if (scShown) return;
    const max = (document.documentElement.scrollHeight - innerHeight) || 1;
    const pct = Math.max(0, Math.min(100, (scrollY / max) * 100));
    if (pct >= CFG.scrollTriggerPct){ scShown = true; mount(); }
  }, {passive:true});

  function dismiss(){
    const el = document.getElementById('WinterSideCard'); if (!el) return;
    el.classList.remove('show');
    try{ localStorage.setItem(CFG.dismissKey, today); }catch(_){}
    setTimeout(()=>el.remove(), 240);
  }
  function openWinter(){
    try{ if (typeof window.openModal === 'function'){ window.openModal(); return; } }catch(e){}
    const btn = document.getElementById('openWinterModalBtn'); btn?.click();
  }
  document.addEventListener('click', (e)=>{
    const t = e.target;
    if (t && t.id === 'WinterSideClaim'){
      e.preventDefault();
      stock = Math.max(0, stock - 1);
      try{ localStorage.setItem(stockKey, String(stock)); }catch(_){}
      const sEl = document.getElementById('WinterSideStock'); if (sEl) sEl.textContent = `Only ${stock} remaining today`;
      openWinter(); dismiss();
    }
    if (t && (t.classList?.contains('x') || t.closest?.('#WinterSideCard .x'))){ dismiss(); }
  });
})();

/* ================================
   Reviews demo data render (guarded)
==================================*/
(function(){
  const reviews = [
    { name:"Jesse Bulawka-Lepine", initials:"JB", date:"Jun 08, 2024", stars:5, text:"Bought a Stelvio here. Amazing staff — friendly and welcoming. Highly recommend!", platform:"facebook" },
    { name:"Mohsen Nikvan",        initials:"MN", date:"Jun 08, 2024", stars:5, text:"Exclusive dealership in Manitoba with fantastic service.", platform:"facebook" },
    { name:"Edward Xiao",          initials:"EX", date:"Jun 08, 2024", stars:5, text:"Wonderful experience. Professional team and great follow-up.", platform:"google" },
    { name:"Sam MK",               initials:"SM", date:"Jun 08, 2024", stars:5, text:"Bought a Civic — tremendous experience. Highly recommend.", platform:"google" },
    { name:"Shannon Turner-i",     initials:"ST", date:"Apr 01, 2024", stars:5, text:"Sales Manager went above and beyond to find the right vehicle.", platform:"google" },
    { name:"Dustin Farrell",       initials:"DF", date:"Nov 21, 2022", stars:5, text:"Decent to deal with. The team still helped while I was out of town.", platform:"facebook" },
    { name:"Maria G.",             initials:"MG", date:"May 14, 2024", stars:5, text:"Quick approval and transparent process. Loved the selection.", platform:"google" },
    { name:"Alex P.",              initials:"AP", date:"Mar 29, 2024", stars:5, text:"Financing options were tailored perfectly to my budget.", platform:"facebook" }
  ];
  const reviewsGrid = document.getElementById('reviewsGrid');
  if (!reviewsGrid) return;

  const starSVG = ()=> `
    <svg viewBox="0 0 20 20" aria-hidden="true" focusable="false">
      <path d="M10 1.8l2.6 5.2 5.8.8-4.2 4.1 1 5.8L10 14.9 4.8 17.7l1-5.8L1.6 7.8l5.8-.8L10 1.8z"/>
    </svg>`;

  function makeCard(r){
    const stars = Array.from({length:r.stars}).map(starSVG).join('');
    const platType = r.platform === 'google' ? 'google' : 'facebook';
    const platLetter = r.platform === 'google' ? 'G' : 'f';
    const div = document.createElement('article');
    div.className='rv-card';
    div.innerHTML = `
      <div class="rv-top">
        <div class="rv-rating"><span>5</span><span class="rv-stars" aria-label="${r.stars} out of 5 stars">${stars}</span></div>
        <div class="rv-date">${r.date}</div>
      </div>
      <div class="rv-text">${r.text}</div>
      <div class="rv-bottom">
        <div class="rv-profile">
          <div class="rv-avatar" aria-hidden="true">${r.initials}</div>
          <div class="rv-name">${r.name}</div>
        </div>
        <div class="rv-plat" data-type="${platType}" title="${platType==='google'?'Google':'Facebook'}">${platLetter}</div>
      </div>`;
    return div;
  }
  reviews.forEach(r=> reviewsGrid.appendChild(makeCard(r)));
})();

/* ================================
   PATCH 0: #easy-steps anchor alias
==================================*/
(function () {
  const hiw = document.getElementById('how-it-works');
  if (hiw && !document.getElementById('easy-steps')) {
    const a = document.createElement('div');
    a.id = 'easy-steps';
    a.style.position = 'relative';
    a.style.top = '-80px';
    hiw.prepend(a);
  }
})();

/* PATCH 1: Hero CTA smooth-scroll handlers */
(function () {
  const approvedBtn = document.querySelector('#btncontainer .approved');
  const dealBtn = document.querySelector('#btncontainer .learn-more');

  function goTo(id) {
    const el = document.querySelector(id);
    if (!el) return;
    if (location.hash !== id) history.replaceState(null, '', id);
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
  function track(){ /* hook analytics later */ }

  approvedBtn?.addEventListener('click', (e) => {
    e.preventDefault(); goTo('#alfa-specials'); track('hero_cta_click', { cta: 'get_me_approved' });
  });
  dealBtn?.addEventListener('click', (e) => {
    e.preventDefault(); goTo('#alfa-specials'); track('hero_cta_click', { cta: 'get_best_deal' });
  });
})();

/* PATCH 2: Easy Steps — inject buttons */
(function () {
  function inject() {
    const section = document.querySelector('#how-it-works');
    if (!section) return false;
    const steps = section.querySelectorAll('.step');
    if (!steps.length) return false;

    const labels  = ['Apply Online', 'Get the Best Deal', 'Schedule Appointment'];
    const classes = ['btn btn-primary', 'btn btn-outline', 'btn btn-primary'];
    const targets = ['#alfa-specials', '#alfa-specials', '#book-banner'];

    steps.forEach((stepEl, i) => {
      stepEl.querySelectorAll('.step-cta').forEach((n) => n.remove());
      const wrap = document.createElement('div'); wrap.className = 'step-cta';
      const btn = document.createElement('button'); btn.type = 'button'; btn.className = classes[i] || classes[0];
      btn.textContent = labels[i] || labels[0];
      btn.setAttribute('aria-label', btn.textContent);
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const id = targets[i] || targets[0];
        const el = document.querySelector(id);
        if (!el) return;
        if (location.hash !== id) history.replaceState(null, '', id);
        el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        if (i === 2) { try { document.getElementById('openWinterModalBtn')?.click(); } catch (e) {} }
      });
      wrap.appendChild(btn); stepEl.appendChild(wrap);
    });
    return true;
  }
  if (!inject()) {
    let tries = 0;
    const iv = setInterval(() => { tries++; if (inject() || tries > 20) clearInterval(iv); }, 150);
  }
})();

/* ================================
   FEATURED VEHICLES (Slider V2)
==================================*/
(function buildFeaturedVehiclesV2() {
  const track = document.getElementById('fvTrack');
  const viewport = document.querySelector('.fv-viewport');
  if (!track || !viewport) return;

  track.innerHTML = '';
  const vehicles2 = [
    {year:2020, make:'Toyota', model:'RAV4',  trim:'XLE',  km:'58,700 km', biweekly:122, sale:30995, retail:33995, img:'https://via.placeholder.com/800x500?text=2020+Toyota+RAV4+XLE', shop:'#', approve:'#', badge:'used'},
    {year:2021, make:'Honda',  model:'CR-V',  trim:'EX-L', km:'64,200 km', biweekly:138, sale:31995, retail:34995, img:'https://via.placeholder.com/800x500?text=2021+Honda+CR-V+EX-L',  shop:'#', approve:'#', badge:'used'},
    {year:2018, make:'Toyota', model:'Corolla', trim:'LE', km:'89,500 km', biweekly:98, sale:17495, retail:19995, img:'https://via.placeholder.com/800x500?text=2018+Toyota+Corolla+LE',    shop:'#', approve:'#', badge:'used'},
    {year:2017, make:'Honda',  model:'Accord',  trim:'LX', km:'106,400 km', biweekly:118, sale:18995, retail:21995, img:'https://via.placeholder.com/800x500?text=2017+Honda+Accord+LX',     shop:'#', approve:'#', badge:'used'},
    {year:2019, make:'Toyota', model:'Camry',   trim:'SE', km:'72,100 km',  biweekly:129, sale:24995, retail:27995, img:'https://via.placeholder.com/800x500?text=2019+Toyota+Camry+SE',    shop:'#', approve:'#', badge:'used'},
    {year:2020, make:'Honda',  model:'Civic',   trim:'EX', km:'49,300 km',  biweekly:112, sale:23995, retail:26995, img:'https://via.placeholder.com/800x500?text=2020+Honda+Civic+EX',     shop:'#', approve:'#', badge:'used'}
  ];

  const el = (tag, attrs = {}, html) => {
    const n = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) (k === 'class') ? n.className = v : n.setAttribute(k, v);
    if (html != null) n.innerHTML = html;
    return n;
  };

  vehicles2.forEach(v => {
    const li = el('li', { class: 'fv-card' });
    if (v.badge) li.appendChild(el('span', { class: 'fv-badge' }, v.badge));
    const media = el('a', { class: 'fv-media', href: v.shop });
    media.appendChild(el('img', { src: v.img, alt: `${v.year} ${v.make} ${v.model} ${v.trim}` }));
    li.appendChild(media);

    const body = el('div', { class: 'fv-body' });
    body.appendChild(el('h3', { class: 'fv-title' }, `${v.year} ${v.make} ${v.model}`));
    body.appendChild(el('div', { class: 'fv-sub' }, `${v.trim} &middot; ${v.km}`));

    const row = el('div', { class: 'fv-row' });
    const left = el('div', { class: 'fv-left' }, `$${v.biweekly}`); left.appendChild(el('small', {}, 'FINANCE Bi-Weekly'));
    const right = el('div', { class: 'fv-right' });
    if (v.retail) right.appendChild(el('span', { class: 'fv-retail' }, `$${v.retail.toLocaleString()}`));
    right.appendChild(el('span', { class: 'fv-sale' }, `SALE PRICE<br>$${v.sale.toLocaleString()}`));
    row.append(left, right); body.appendChild(row);

    const ctas = el('div', { class: 'fv-ctas' });
    ctas.appendChild(el('a', { href: v.shop, class: 'fv-btn shop', 'aria-label': 'Shop Now' }, 'Shop Now'));
    ctas.appendChild(el('a', { href: v.approve, class: 'fv-btn approve', 'aria-label': 'Get Me Approved' }, 'Get Me Approved'));
    body.appendChild(ctas);

    li.appendChild(body); track.appendChild(li);
  });

  const prev = document.querySelector('.fv-prev');
  const next = document.querySelector('.fv-next');
  const stepSize = () => {
    const card = track.querySelector('.fv-card');
    const w = card ? card.getBoundingClientRect().width : 340;
    return w + 20;
  };
  prev?.addEventListener('click', () => viewport.scrollBy({ left: -stepSize(), behavior: 'smooth' }));
  next?.addEventListener('click', () => viewport.scrollBy({ left: stepSize(), behavior: 'smooth' }));
})();

/* ================================
   CONTACT TUNNEL: robust open + steps + footer button
   (unchanged from your working version)
==================================*/
(function () {
  if (window.__ctInit) return;
  window.__ctInit = true;

  let modal = null, panels = [], wired = false, step = 1;
  const getModal = () => (modal ||= document.getElementById('contactTunnel'));
  const setStep = (n)=>{ step = n; panels.forEach((p,i)=>p.classList.toggle('active', i===n-1)); };

  function wireIfReady(){
    const m = getModal();
    if (!m || wired) return false;
    panels = ['ctStep1','ctStep2','ctStep3','ctStep4','ctStep5'].map(id => document.getElementById(id)).filter(Boolean);
    function openCT(){ m.setAttribute('aria-hidden','false'); setStep(1); setTimeout(()=>document.getElementById('ctReqCall')?.focus(), 30); document.body.style.overflow='hidden'; }
    function closeCT(){ m.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }
    window.openContactTunnel = openCT;

    $('#ctClose')?.addEventListener('click', closeCT);
    m.addEventListener('click', e=>{ if (e.target === m) closeCT(); });
    window.addEventListener('keydown', e=>{ if (e.key === 'Escape' && m.getAttribute('aria-hidden')==='false') closeCT(); });

    $('#ctReqCall')?.addEventListener('click', ()=> setStep(2));

    const ctName = $('#ctName');
    const ctTo3 = $('#ctTo3');
    const validateName = ()=>{ if (ctTo3) ctTo3.disabled = !(ctName?.value.trim().length >= 2); };
    ctName?.addEventListener('input', validateName);
    ctName?.addEventListener('keydown', e=>{ if(e.key==='Enter' && !ctTo3?.disabled){ e.preventDefault(); ctTo3.click(); }});
    ctTo3?.addEventListener('click', () => setStep(3));

    const ctPhone = $('#ctPhone');
    const ctTo4 = $('#ctTo4');
    bindPhoneFormatting(ctPhone, valid => { if (ctTo4) ctTo4.disabled = !valid; });
    ctPhone?.addEventListener('keydown', e=>{ if(e.key==='Enter' && !ctTo4?.disabled){ e.preventDefault(); ctTo4.click(); }});
    ctTo4?.addEventListener('click', () => setStep(4));

    const times = $('#ctTimes');
    const ctSubmit = $('#ctSubmit');
    times?.addEventListener('change', () => { if (ctSubmit) ctSubmit.disabled = !times.querySelector('input:checked'); });
    ctSubmit?.addEventListener('click', () => {
      try{
        const payload = {
          name: ctName?.value?.trim()||'',
          phone: (ctPhone?.value||'').replace(/\D/g,''),
          preferred: times.querySelector('input:checked')?.value||'',
          ts: new Date().toISOString()
        };
        localStorage.setItem('ct_latest_lead', JSON.stringify(payload));
      }catch(_){}
      setStep(5);
      showToast('Request received — we\'ll call you shortly.');
    });

    $('#ctDone')?.addEventListener('click', closeCT);

    (function injectFooterBtn() {
      const cols = document.querySelectorAll('.final-footer__col');
      let targetCol = null;
      cols.forEach(col => { const h = col.querySelector('h3'); if (h && /contact\s*us/i.test(h.textContent)) targetCol = col; });
      if (!targetCol || targetCol.querySelector('.footer-contact-btn')) return;
      const btn = document.createElement('button');
      btn.type = 'button'; btn.className = 'footer-contact-btn'; btn.textContent = 'Contact Us';
      btn.addEventListener('click', openCT);
      targetCol.insertBefore(btn, targetCol.firstElementChild?.nextElementSibling || targetCol.firstChild);
    })();

    wired = true;
    return true;
  }

  function openCTWithRetry(){
    let tries = 0;
    (function attempt(){
      const ok = wireIfReady();
      const m = getModal();
      if (ok && m){ window.openContactTunnel(); }
      else if (tries < 20){ tries++; setTimeout(attempt, 100); }
      else { document.getElementById('contact-us')?.scrollIntoView({ behavior:'smooth', block:'start' }); }
    })();
  }

  function wantsContactTunnel(target){
    if (!target) return false;
    if (target.closest?.('.footer-contact-btn')) return true;
    const a = target.closest?.('a'); if (!a) return false;
    const href = (a.getAttribute('href')||'').trim();
    return /#contact-us/i.test(href);
  }

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!wantsContactTunnel(t)) return;
    e.preventDefault(); e.stopPropagation(); e.stopImmediatePropagation?.();
    openCTWithRetry();
  }, true);

  window.addEventListener('hashchange', (e) => {
    if (/#contact-us/i.test(location.hash)){
      e.stopPropagation?.(); e.stopImmediatePropagation?.();
      history.replaceState(null, '', location.pathname + location.search);
      openCTWithRetry();
    }
  }, true);

  if (/#contact-us/i.test(location.hash)) {
    history.replaceState(null, '', location.pathname + location.search);
    openCTWithRetry();
  }
  wireIfReady();
})();

/* ================================
   REFER A FRIEND (Modal + wiring)
   - Opens from multiple trigger types (robust)
   - Validates: your name/phone + friend name/phone
   - Prevents other tunnels from hijacking clicks
==================================*/
(function(){
  if (window.__referInit) return; window.__referInit = true;

  // helpers (use shared ones when available)
  const _digitsLen = (v)=> (v||'').replace(/\D/g,'').length;
  const digits = (typeof window.digitsLen === 'function') ? window.digitsLen : _digitsLen;

  const _format = (v)=>{
    const d = (v||'').replace(/\D/g,'').slice(0,10);
    if(!d) return ''; if(d.length<=3) return `(${d}`;
    if(d.length<=6) return `(${d.slice(0,3)}) ${d.slice(3)}`;
    return `(${d.slice(0,3)}) ${d.slice(3,6)}-${d.slice(6)}`;
  };
  const fmt = (typeof window.formatNaPhone === 'function') ? window.formatNaPhone : _format;

  const bindFmt = (input, onValidityChange)=>{
    if (!input) return;
    const update = ()=>{
      const before = input.selectionStart ?? input.value.length;
      input.value = fmt(input.value);
      const valid = digits(input.value) >= 10;
      input.setAttribute('aria-invalid', valid ? 'false' : 'true');
      if (typeof onValidityChange === 'function') onValidityChange(valid);
      try{ input.setSelectionRange(before,before); }catch(_){}
    };
    input.addEventListener('input', update);
    input.addEventListener('blur', update);
    update();
  };

  const modal = document.getElementById('referModal');
  if (!modal) return;

  function openRefer(){
    modal.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    setTimeout(()=>document.getElementById('rfYourName')?.focus(), 40);
  }
  function closeRefer(){
    modal.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  }
  window.openReferModal = openRefer;

  // Close actions
  document.getElementById('referClose')?.addEventListener('click', closeRefer);
  document.getElementById('referDone')?.addEventListener('click', closeRefer);
  modal.addEventListener('click', e=>{ if (e.target === modal) closeRefer(); });
  window.addEventListener('keydown', e=>{ if (e.key==='Escape' && modal.getAttribute('aria-hidden')==='false') closeRefer(); });

  // TRIGGERS (capture so other tunnels can't intercept)
  document.addEventListener('click', (e)=>{
    const t = e.target.closest?.('[data-refer-open], #referStartBtn, .refer-card .cta.primary, a[href="#refer-friend"]');
    if (!t) return;
    e.preventDefault();
    e.stopPropagation();
    e.stopImmediatePropagation?.();
    openRefer();
  }, true);

  // Hash support
  if (/#refer-friend/i.test(location.hash)){
    history.replaceState(null,'',location.pathname+location.search);
    openRefer();
  }

  // FORM wiring
  const yourName   = $('#rfYourName');
  const yourPhone  = $('#rfYourPhone');
  const friendName = $('#rfFriendName');
  const friendPhone= $('#rfFriendPhone');
  const submit     = $('#referSubmit');
  const form       = $('#referForm');

  // enable/disable submit
  function validate(){
    const ok = (yourName?.value.trim().length>=2) &&
               (friendName?.value.trim().length>=2) &&
               digits(yourPhone?.value)>=10 &&
               digits(friendPhone?.value)>=10;
    if (submit) submit.disabled = !ok;
    return ok;
  }

  bindFmt(yourPhone,  validate);
  bindFmt(friendPhone,validate);
  [yourName, friendName].forEach(i=> i?.addEventListener('input', validate));
  validate();

  form?.addEventListener('submit', (e)=>{
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      yourName: yourName.value.trim(),
      yourPhone: yourPhone.value.replace(/\D/g,''),
      friendName: friendName.value.trim(),
      friendPhone: friendPhone.value.replace(/\D/g,''),
      ts: new Date().toISOString()
    };
    try{ localStorage.setItem('refer_latest_lead', JSON.stringify(payload)); }catch(_){}
    showToast('Thanks! We’ll reach out to your friend.');
    closeRefer();
  });
})();

/* ================================
   END
==================================*/





