/* ===== Mesin pemeriksa jawaban matematika ===== */
const SUP={'⁰':'0','¹':'1','²':'2','³':'3','⁴':'4','⁵':'5','⁶':'6','⁷':'7','⁸':'8','⁹':'9','⁻':'-','⁺':'+'};
const FR={'½':'(1/2)','⅓':'(1/3)','⅔':'(2/3)','¼':'(1/4)','¾':'(3/4)'};
function norm(s){
  return String(s).toLowerCase()
    .replace(/[⁰¹²³⁴⁵⁶⁷⁸⁹⁻⁺]+/g,m=>'^('+[...m].map(c=>SUP[c]).join('')+')')
    .replace(/[½⅓⅔¼¾]/g,c=>FR[c])
    .replace(/[−–—]/g,'-').replace(/[×·]/g,'*').replace(/÷/g,'/')
    .replace(/∛\s*\(/g,'cbrt(').replace(/∛\s*(\w+)/g,'cbrt($1)')
    .replace(/√\s*\(/g,'sqrt(').replace(/√\s*(\w+)/g,'sqrt($1)')
    .replace(/\s+/g,'');
}
function tok(s){
  const t=[];let i=0;
  while(i<s.length){
    const r=s.slice(i);let m;
    if((m=r.match(/^(\d+\.?\d*|\.\d+)/))){t.push({k:'n',v:parseFloat(m[0])});i+=m[0].length;}
    else if(r.startsWith('sqrt')||r.startsWith('cbrt')){t.push({k:'f',v:r.slice(0,4)});i+=4;}
    else if(/^[a-z]/.test(r)){t.push({k:'v',v:r[0]});i++;}
    else if('+-*/^()'.includes(r[0])){t.push({k:'o',v:r[0]});i++;}
    else return null;
  }
  const o=[];
  t.forEach(x=>{
    const p=o[o.length-1];
    if(p&&(p.k==='n'||p.k==='v'||(p.k==='o'&&p.v===')'))&&(x.k==='n'||x.k==='v'||x.k==='f'||(x.k==='o'&&x.v==='('))) o.push({k:'o',v:'*'});
    o.push(x);
  });
  return o;
}
function compile(src){
  try{
    const t=tok(norm(src));if(!t||!t.length)return null;
    let p=0;const pk=()=>t[p],nx=()=>t[p++];
    const isO=v=>pk()&&pk().k==='o'&&pk().v===v;
    const need=v=>{if(!isO(v))throw 0;p++;};
    function ex(){let l=tm();while(isO('+')||isO('-')){const o=nx().v,r=tm(),a=l;l=o==='+'?e=>a(e)+r(e):e=>a(e)-r(e);}return l;}
    function tm(){let l=un();while(isO('*')||isO('/')){const o=nx().v,r=un(),a=l;l=o==='*'?e=>a(e)*r(e):e=>a(e)/r(e);}return l;}
    function un(){if(isO('-')){p++;const u=un();return e=>-u(e);}if(isO('+')){p++;return un();}return pw();}
    function pw(){const b=at();if(isO('^')){p++;const x=un();return e=>Math.pow(b(e),x(e));}return b;}
    function at(){
      const x=nx();if(!x)throw 0;
      if(x.k==='n')return()=>x.v;
      if(x.k==='v')return e=>e[x.v]===undefined?NaN:e[x.v];
      if(x.k==='f'){need('(');const a=ex();need(')');const f=x.v==='sqrt'?Math.sqrt:Math.cbrt;return e=>f(a(e));}
      if(x.k==='o'&&x.v==='('){const a=ex();need(')');return a;}
      throw 0;
    }
    const f=ex();if(p!==t.length)return null;return f;
  }catch(e){return null;}
}
function eq(ans,key,opt){
  opt=opt||{};const A=compile(ans),K=compile(key);if(!A||!K)return false;
  const envs=opt.vars?[{x:1.7,a:2.3,n:2.5},{x:0.8,a:-1.4,n:3},{x:3.1,a:0.6,n:-2.5}]:[0.7,1.3,2.9,4.1].map(x=>({x}));
  const cl=(p,q)=>isFinite(p)&&isFinite(q)&&Math.abs(p-q)<=1e-6*Math.max(1,Math.abs(q));
  return envs.every(e=>{
    const e0=Object.assign({},e,{c:0});
    if(!cl(A(e0),K(e0)))return false;
    if(opt.needC)return cl(A(Object.assign({},e,{c:5}))-A(e0),5);
    return true;
  });
}
if(typeof module!=='undefined')module.exports={eq,norm};

/* ===== Data kunci jawaban (dari LKPD sumber + revisi) ===== */
const K1={f:['x^2','3x^3','7x^3-2x','3x^4-5x^2+4','\\frac{1}{2}x^2+3x'],key:['2x','9x^2','21x^2-2','12x^3-10x','x+3']};
const K3={d:['2x','9x^2','21x^2-2','12x^3-10x','x+3'],f:K1.f,c1:[2,9,21,12,1],c2:[1,3,7,3,'\\frac{1}{2}']};
const K4={tex:['\\int 4x^3\\,dx','\\int 2x\\,dx','\\int \\frac{2}{3}x^{-\\frac{2}{3}}\\,dx','\\int (3x^3+2x^2-x+1)\\,dx','\\int \\frac{1}{\\sqrt{x^3}}\\,dx'],
  key:['x^4+C','x^2+C','2*cbrt(x)+C','3/4*x^4+2/3*x^3-1/2*x^2+x+C','-2/sqrt(x)+C']};
const K5={tex:['\\int 4x^3\\,dx = x^4 + C','\\int 2x\\,dx = x^2 + C','\\int \\frac{2}{3}x^{-\\frac{2}{3}}\\,dx = 2\\sqrt[3]{x} + C','\\int (3x^3+2x^2-x+1)\\,dx = \\frac{3}{4}x^4+\\frac{2}{3}x^3-\\frac{1}{2}x^2+x+C','\\int \\frac{1}{\\sqrt{x^3}}\\,dx = -\\frac{2}{\\sqrt{x}} + C'],
  d:['\\frac{d}{dx}\\left(x^4+C\\right)=','\\frac{d}{dx}\\left(x^2+C\\right)=','\\frac{d}{dx}\\left(2\\sqrt[3]{x}+C\\right)=','\\frac{d}{dx}\\left(\\frac{3}{4}x^4+\\frac{2}{3}x^3-\\frac{1}{2}x^2+x+C\\right)=','\\frac{d}{dx}\\left(-\\frac{2}{\\sqrt{x}}+C\\right)='],
  key:['4x^3','2x','2/3*x^(-2/3)','3x^3+2x^2-x+1','1/sqrt(x^3)']};
const KW={
  k1q1:{re:/turunan/i,ok:'✓ Tepat! F′(x) merupakan turunan dari F(x).',no:'Belum sesuai. Perhatikan bahwa F′(x) merupakan turunan dari F(x).'},
  k1q2:{re:/(kebalikan|balik|invers|lawan)/i,ok:'✓ Tepat! Menemukan F(x) dari F′(x) adalah kebalikan dari proses turunan.',no:'Belum sesuai. Ingat: menemukan F(x) dari F′(x) merupakan kebalikan dari proses diferensiasi/turunan.'},
  pangkat:{re:/(tambah|naik|\+\s*1|plus)/i,ok:'✓ Tepat! Pangkat bertambah 1.',no:'Belum sesuai. Bandingkan pangkat x pada turunan dengan pangkat x pada fungsi asal.'},
  koef:{re:/(bagi|:|÷|\/|dibagi)/i,ok:'✓ Tepat! Koefisien dibagi dengan pangkat yang baru.',no:'Belum sesuai. Bandingkan koefisien pada turunan dengan koefisien pada fungsi asal, lalu lihat hubungannya dengan pangkat baru.'},
  k5a:{re:/(nol|\b0\b)/i,ok:'✓ Tepat! Turunan konstanta adalah 0, sehingga konstanta tidak mengubah hasil turunan.',no:'Belum sesuai. Ingat, berapa turunan dari suatu konstanta seperti 5?'},
  k5b:{re:/(banyak|keluarga|sembarang|konstanta)/i,ok:'✓ Tepat! C mewakili banyak fungsi (satu keluarga fungsi) yang memiliki turunan sama.',no:'Belum sesuai. Pikirkan: ada berapa fungsi yang turunannya 3x²? Apa yang diwakili oleh C?'}
};
const OBJ=[0,1,2,3,4].flatMap(i=>['k1_'+i,'k4_'+i,'k5_'+i]).concat([0,1,2,3,4,5].map(i=>'k6_'+i));
const LS='integralDetectiveLKPD';
let S;
try{S=Object.assign({ans:{},ok:{},page:0},JSON.parse(localStorage.getItem(LS)||'{}'));}catch(e){S={ans:{},ok:{},page:0};}
const save=()=>{try{localStorage.setItem(LS,JSON.stringify(S));}catch(e){}};
const $=id=>document.getElementById(id);
const SECS=['Beranda','Petunjuk','Kegiatan 1','Kegiatan 2','Kegiatan 3','Kegiatan 4','Kegiatan 5','Kegiatan 6','Kegiatan 7','Hasil'];

function inp(id,label,cls){return '<input type="text" data-id="'+id+'" data-label="'+label+'" autocomplete="off" spellcheck="false" placeholder="Jawabanmu" class="'+(cls||'')+'">';}
function howTo(){
  return '<span class="tag">Cara Menulis Jawaban</span><p>Kamu tidak perlu memakai LaTeX. Ketik seperti ini:</p><div class="howgrid"><div>Pangkat dua: <code>x^2</code></div><div>Pangkat tiga: <code>x^3</code></div><div>Pangkat pecahan: <code>x^(2/3)</code></div><div>Pangkat negatif: <code>x^(-2/3)</code></div><div>Pecahan: <code>1/2</code>, <code>3/4*x^4</code></div><div>Perkalian: <code>2*x</code></div><div>Akar kuadrat: <code>sqrt(x)</code></div><div>Akar pangkat tiga: <code>cbrt(x)</code></div><div>Konstanta integrasi: <code>+C</code></div></div><p>Contoh:</p><pre>x^4+C\n-2/sqrt(x)+C\n3/4*x^4+2/3*x^3</pre><p class="hint">Spasi tidak berpengaruh. Penulisan <code>x^4 + C</code> dan <code>x⁴+C</code> dianggap sama.</p>';
}
function build(){
  $('howto').innerHTML=howTo();$('howto2').innerHTML=howTo();
  $('k1table').innerHTML='<tr><th>No.</th><th>$F(x)$</th><th>Turunan $F\'(x)$</th><th>Konfirmasi</th></tr>'+K1.f.map((f,i)=>'<tr><td>'+(i+1)+'</td><td>$'+f+'$</td><td>'+inp('k1_'+i,'Kegiatan 1 no. '+(i+1)+' – turunan')+'</td><td><button class="btn sm" data-act="m" data-set="K1" data-i="'+i+'">Cek</button><div class="fb" id="fb-k1_'+i+'"></div></td></tr>').join('');
  $('k3a').innerHTML='<tr><th>Bentuk turunan</th><th>Bentuk fungsi asal</th><th>Perubahan pangkat</th><th>Konfirmasi</th></tr>'+K3.d.map((d,i)=>'<tr><td>$'+d+'$</td><td>$'+K3.f[i]+'$</td><td>'+inp('k3a_'+i,'Tabel pangkat baris '+(i+1))+'</td><td><button class="btn sm" data-act="kw" data-kw="pangkat" data-id="k3a_'+i+'">Cek</button><div class="fb" id="fb-k3a_'+i+'"></div></td></tr>').join('');
  $('k3b').innerHTML='<tr><th>Koefisien pada turunan</th><th>Koefisien pada fungsi asal</th><th>Perubahan koefisien</th><th>Konfirmasi</th></tr>'+K3.c1.map((c,i)=>'<tr><td>$'+c+'$</td><td>$'+K3.c2[i]+'$</td><td>'+inp('k3b_'+i,'Tabel koefisien baris '+(i+1))+'</td><td><button class="btn sm" data-act="kw" data-kw="koef" data-id="k3b_'+i+'">Cek</button><div class="fb" id="fb-k3b_'+i+'"></div></td></tr>').join('');
  $('k4list').innerHTML=K4.tex.map((t,i)=>'<div class="item"><div class="qrow"><b>'+(i+1)+'.</b> <span>$'+t+'=$</span>'+inp('k4_'+i,'Kegiatan 4 no. '+(i+1))+'<button class="btn sm" data-act="m" data-set="K4" data-i="'+i+'">Cek</button></div><div class="fb" id="fb-k4_'+i+'"></div></div>').join('');
  $('k5list').innerHTML=K5.tex.map((t,i)=>'<div class="item"><p class="focus">'+(i+1)+'. $'+t+'$</p><div class="qrow"><b>Turunkan kembali:</b> <span>$'+K5.d[i]+'$</span>'+inp('k5_'+i,'Kegiatan 5 no. '+(i+1)+' – turunan hasil')+'</div><p class="q"><b>Apakah hasilnya sama dengan fungsi yang diintegralkan?</b></p><div class="radios"><label><input type="radio" name="k5r_'+i+'" data-id="k5r_'+i+'" data-label="Kegiatan 5 no. '+(i+1)+' – sama?" value="Ya"> Ya</label><label><input type="radio" name="k5r_'+i+'" data-id="k5r_'+i+'" value="Tidak"> Tidak</label></div><div class="actions"><button class="btn sm" data-act="m5" data-i="'+i+'">Cek</button></div><div class="fb" id="fb-k5_'+i+'"></div></div>').join('');
  const L=[
    'Jika $F\'(x)=f(x)$, maka $F(x)$ disebut '+inp('k6_0','Kesimpulan 1','blank')+' dari $f(x)$.',
    'Proses untuk menentukan fungsi asal dari fungsi turunannya disebut '+inp('k6_1','Kesimpulan 2','blank')+'.',
    'Secara umum: $\\int f(x)\\,dx=$ '+inp('k6_2','Kesimpulan 3 – ∫ f(x) dx','blank'),
    'Untuk fungsi berbentuk $ax^n$, dengan $n\\neq -1$: $\\int ax^n\\,dx=$ '+inp('k6_3','Kesimpulan 4 – ∫ axⁿ dx','blank'),
    'Konstanta $C$ disebut '+inp('k6_4','Kesimpulan 5','blank')+'.',
    'Untuk memeriksa kebenaran hasil integral, kita dapat '+inp('k6_5','Kesimpulan 6','blank')+' hasil integral tersebut.'];
  $('k6box').innerHTML=L.map(l=>'<p class="sentence">'+l+'</p>').join('');
  document.querySelectorAll('[data-id]').forEach(el=>{
    const v=S.ans[el.dataset.id];if(v===undefined)return;
    if(el.type==='radio')el.checked=(el.value===v);else el.value=v;
  });
  Object.keys(S.ok).forEach(id=>paint(id));
  typeset();
}
function typeset(){if(window.MathJax&&MathJax.typesetPromise)MathJax.typesetPromise().catch(()=>{});}

/* ===== Umpan balik ===== */
function fb(id,ok,msg){
  const el=$('fb-'+id);if(el){el.className='fb '+(ok?'good':'bad');el.textContent=msg;}
  const inpEl=document.querySelector('input[data-id="'+id+'"][type="text"]');
  if(inpEl){inpEl.classList.remove('good','bad');inpEl.classList.add(ok?'good':'bad');}
  S.ok[id]=ok;save();
}
function paint(id){
  const ok=S.ok[id],inpEl=document.querySelector('input[data-id="'+id+'"][type="text"]');
  if(inpEl&&/^k6_/.test(id)){inpEl.classList.add(ok?'good':'bad');}
}
const MSG={K1:['✓ Benar! Turunanmu sudah sesuai.','Belum tepat. Coba periksa kembali aturan turunan.'],
  K4:['✓ Benar! Jawabanmu sesuai dengan kunci.','Belum tepat. Periksa kembali pangkat, koefisien, dan konstanta integrasi C.']};
const val=id=>(S.ans[id]||'').trim();

document.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.go!==undefined)return show(+b.dataset.go);
  const a=b.dataset.act,i=+b.dataset.i;
  if(a==='m'){
    const set=b.dataset.set,id=(set==='K1'?'k1_':'k4_')+i,v=val(id);
    if(!v)return fb(id,false,'Isi jawabanmu dulu, lalu tekan Cek.');
    const ok=eq(v,set==='K1'?K1.key[i]:K4.key[i],{needC:set==='K4'});
    fb(id,ok,MSG[set][ok?0:1]);
  }
  if(a==='m5'){
    const id='k5_'+i,v=val(id),r=S.ans['k5r_'+i];
    if(!v||!r)return fb(id,false,'Isi turunannya dan pilih Ya atau Tidak dulu.');
    const d=eq(v,K5.key[i]);
    if(d&&r==='Ya')fb(id,true,'✓ Benar! Turunannya sama dengan fungsi yang diintegralkan.');
    else if(d)fb(id,false,'Belum tepat. Turunanmu sudah benar; bandingkan sekali lagi dengan fungsi yang diintegralkan.');
    else fb(id,false,'Belum tepat. Turunkan kembali dengan teliti; ingat turunan konstanta adalah 0.');
  }
  if(a==='kw'){
    const id=b.dataset.id,v=val(id),k=KW[b.dataset.kw];
    if(!v)return fb(id,false,'Tulis jawabanmu dulu, lalu tekan Cek.');
    fb(id,k.re.test(v),k.re.test(v)?k.ok:k.no);
  }
  if(b.id==='k6check')checkK6();
  if(b.id==='printBtn')window.print();
  if(b.id==='resetBtn'||b.id==='resetBtn2')resetAll();
  if(b.id==='prev')show(S.page-1);
  if(b.id==='next')show(S.page+1);
});
function checkK6(){
  const R=[v=>/anti\s?-?turunan/i.test(v),v=>/integra/i.test(v),
    v=>['f(x)+c','c+f(x)'].includes(norm(v)),
    v=>eq(v,'a/(n+1)*x^(n+1)+C',{vars:true,needC:true}),
    v=>/(integrasi|sembarang)/i.test(v),v=>/turun/i.test(v)];
  let n=0;
  R.forEach((f,i)=>{
    const id='k6_'+i,v=val(id),el=document.querySelector('input[data-id="'+id+'"]');
    const ok=!!v&&f(v);if(ok)n++;S.ok[id]=ok;
    el.classList.remove('good','bad');el.classList.add(ok?'good':'bad');
  });
  save();
  const f=$('fb-k6');f.className='fb '+(n===6?'good':'bad');
  f.textContent=n===6?'✓ Benar! Semua isian sesuai dengan kunci.':'Belum tepat. '+n+' dari 6 isian sudah benar. Periksa kembali isian yang berwarna merah muda.';
}

/* ===== Penyimpanan & progress ===== */
document.addEventListener('input',e=>{
  const t=e.target;if(!t.dataset||!t.dataset.id)return;
  const id=t.dataset.id;S.ans[id]=t.value;
  if(S.ok[id]!==undefined){delete S.ok[id];const f=$('fb-'+id);if(f)f.className='fb';t.classList.remove('good','bad');}
  save();prog();
});
function prog(){
  const ids=[...new Set([...document.querySelectorAll('[data-id]')].map(e=>e.dataset.id))].filter(i=>!['nama','kelas','kelompok'].includes(i));
  const done=ids.filter(i=>(S.ans[i]||'').trim()!=='').length;
  const p=Math.round(done/ids.length*100);
  $('progfill').style.width=p+'%';$('progtxt').textContent=p+'%';
  return {p,done,total:ids.length};
}
function resetAll(){
  if(confirm('Apakah kamu yakin ingin menghapus semua jawaban?')){try{localStorage.removeItem(LS);}catch(e){}location.reload();}
}

/* ===== Navigasi ===== */
function show(i){
  i=Math.max(0,Math.min(SECS.length-1,i));S.page=i;save();
  document.querySelectorAll('.page').forEach((p,j)=>p.classList.toggle('active',j===i));
  document.querySelectorAll('#nav button').forEach((b,j)=>b.classList.toggle('active',j===i));
  $('prev').style.visibility=i===0?'hidden':'visible';
  $('next').style.visibility=i===SECS.length-1?'hidden':'visible';
  if(i===9)renderHasil();
  window.scrollTo({top:0,behavior:'smooth'});
  prog();typeset();
}
function renderHasil(){
  const {p,done,total}=prog();
  const benar=OBJ.filter(id=>S.ok[id]===true).length;
  const h=$('hasil');h.innerHTML='';
  const esc=s=>{const d=document.createElement('div');d.textContent=s;return d.innerHTML;};
  let html='<p><b>Nama:</b> '+esc(S.ans.nama||'-')+' &nbsp; <b>Kelas:</b> '+esc(S.ans.kelas||'-')+' &nbsp; <b>Kelompok:</b> '+esc(S.ans.kelompok||'-')+'</p>';
  html+='<div class="stat"><div><b>'+p+'%</b>Progress</div><div><b>'+done+'/'+total+'</b>Isian terisi</div><div><b>'+benar+'/'+OBJ.length+'</b>Soal objektif benar</div><div><b>'+Math.round(done/total*100)+'%</b>Penyelesaian</div></div>';
  html+='<p class="hint">Pertanyaan reflektif dan uraian tidak diberi nilai.</p><div class="summary">';
  document.querySelectorAll('.page').forEach((pg,idx)=>{
    if(idx<2||idx>8)return;
    const seen=new Set();let rows='';
    pg.querySelectorAll('[data-id][data-label]').forEach(el=>{
      const id=el.dataset.id;if(seen.has(id))return;seen.add(id);
      const v=(S.ans[id]||'').trim();
      let mk='';if(OBJ.includes(id)&&S.ok[id]!==undefined)mk=S.ok[id]?' <span class="mk g">✓</span>':' <span class="mk b">✗</span>';
      rows+='<div class="row"><small>'+esc(el.dataset.label)+'</small>'+(v?esc(v):'<i>(belum diisi)</i>')+mk+'</div>';
    });
    html+='<h4>'+esc(pg.dataset.title)+'</h4>'+rows;
  });
  h.innerHTML=html+'</div>';
}
document.addEventListener('DOMContentLoaded',()=>{
  $('nav').innerHTML=SECS.map((s,i)=>'<button data-go="'+i+'">'+s+'</button>').join('');
  build();show(S.page||0);
});
