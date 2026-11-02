function togglePw(id,btn){var inp=document.getElementById(id);var show=inp.type==='password';inp.type=show?'text':'password';btn.style.opacity=show?'1':'.5';}
document.addEventListener('DOMContentLoaded', function() {

// Guard: if Supabase CDN failed to load, show a visible error instead of crashing silently
if (!window.supabase) {
  var loadEl = document.getElementById('gs-load');
  if (loadEl) {
    loadEl.style.pointerEvents = 'auto';
    loadEl.innerHTML = '<div style="font-family:Georgia,serif;font-size:16px;font-weight:600;color:#c0392b;text-align:center;padding:24px;">Could not load app.<br><span style="font-size:13px;font-weight:400;color:#666;">Check your internet connection.</span><br><br><button onclick="location.reload()" style="background:#D44870;color:#fff;border:none;border-radius:10px;padding:12px 28px;font-size:14px;font-weight:600;cursor:pointer;">Refresh</button></div>';
  }
  return;
}

// Lock UI until auth resolves
document.body.classList.add('auth-mode');

// ── SUPABASE ──────────────────────────────────────────
var _supa = window.supabase.createClient(
  'https://qeuhuvdyhqynsllfcgyn.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFldWh1dmR5aHF5bnNsbGZjZ3luIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzk2NzQ1OTUsImV4cCI6MjA5NTI1MDU5NX0.noFoj2eqZr-4A7sLEIxBJWQhycAoiCfy69YJVQxz2S0',
  {auth:{autoRefreshToken:true,persistSession:true,storage:window.localStorage,storageKey:'gs-auth-token',flowType:'pkce'}}
);
var supaUser = null;
// Wraps any promise with a timeout so hanging Supabase queries don't freeze the UI
function _tq(promise,ms){return Promise.race([promise,new Promise(function(_,rej){setTimeout(function(){rej(new Error('timeout'));},ms||12000);})]);}


// ── DATA ──────────────────────────────────────────────
var CATS = ['Creative','Active','Learning','Social','Mindfulness','Productive','Digital','Outdoor','Entertainment','Personal'];
var CEM = {Creative:'🎨',Active:'💪',Learning:'📚',Social:'👯',Mindfulness:'🧘',Productive:'🔧',Digital:'💻',Outdoor:'🌿',Entertainment:'🎬',Personal:'🏡'};
var CAT_COLORS = {Creative:'#F0D8E0,#8E4066',Active:'#F0DBC4,#8C4A22',Learning:'#D8E2ED,#3B5A78',Social:'#DBE6D2,#4A6A44',Mindfulness:'#E4DAEC,#5A4680',Productive:'#F0E2C0,#846214',Digital:'#DDDDE4,#4A4E5A',Outdoor:'#E4EAD9,#4A6A4A',Entertainment:'#F0E4C0,#7A5C1C',Personal:'#F0DDD4,#8A422A'};
var ACTS = [
  {id:'drawing',name:'Drawing',emoji:'✏️',cat:'Creative',tags:['solo','mental','creative','calm']},
  {id:'painting',name:'Painting',emoji:'🖌️',cat:'Creative',tags:['solo','mental','creative','calm']},
  {id:'writing',name:'Creative writing',emoji:'📝',cat:'Creative',tags:['solo','mental','creative']},
  {id:'photography',name:'Photography',emoji:'📷',cat:'Creative',tags:['solo','outdoor','creative']},
  {id:'guitar',name:'Guitar',emoji:'🎸',cat:'Creative',tags:['solo','creative']},
  {id:'piano',name:'Piano',emoji:'🎹',cat:'Creative',tags:['solo','creative']},
  {id:'ukulele',name:'Ukulele',emoji:'🎵',cat:'Creative',tags:['solo','creative']},
  {id:'violin',name:'Violin',emoji:'🎻',cat:'Creative',tags:['solo','creative']},
  {id:'singing',name:'Singing',emoji:'🎤',cat:'Social',tags:['social','creative']},
  {id:'dancing',name:'Dancing',emoji:'💃',cat:'Creative',tags:['physical','social','creative']},
  {id:'crafts',name:'DIY crafts',emoji:'✂️',cat:'Creative',tags:['solo','hands-on','creative']},
  {id:'sewing',name:'Sewing',emoji:'🧵',cat:'Creative',tags:['solo','hands-on','creative']},
  {id:'pottery',name:'Pottery',emoji:'🏺',cat:'Creative',tags:['solo','hands-on','creative']},
  {id:'running',name:'Running',emoji:'🏃',cat:'Active',tags:['physical','outdoor','solo']},
  {id:'cycling',name:'Cycling',emoji:'🚴',cat:'Active',tags:['physical','outdoor']},
  {id:'yoga',name:'Yoga',emoji:'🧘',cat:'Active',tags:['physical','calm','solo']},
  {id:'gym',name:'Gym',emoji:'🏋️',cat:'Active',tags:['physical','solo']},
  {id:'swimming',name:'Swimming',emoji:'🏊',cat:'Active',tags:['physical','solo']},
  {id:'climbing',name:'Climbing',emoji:'🧗',cat:'Active',tags:['physical','social']},
  {id:'martial',name:'Martial arts',emoji:'🥋',cat:'Active',tags:['physical','social']},
  {id:'tennis',name:'Tennis',emoji:'🎾',cat:'Active',tags:['physical','social']},
  {id:'team',name:'Team sport',emoji:'⚽',cat:'Active',tags:['physical','social']},
  {id:'hiking',name:'Hiking',emoji:'🥾',cat:'Outdoor',tags:['physical','outdoor','social','calm']},
  {id:'birds',name:'Birdwatching',emoji:'🦜',cat:'Outdoor',tags:['outdoor','solo','calm']},
  {id:'garden',name:'Gardening',emoji:'🌱',cat:'Outdoor',tags:['outdoor','solo','hands-on','calm']},
  {id:'kayak',name:'Kayaking',emoji:'🛶',cat:'Outdoor',tags:['physical','outdoor']},
  {id:'language',name:'Language learning',emoji:'🗣️',cat:'Learning',tags:['mental','solo']},
  {id:'reading',name:'Reading',emoji:'📖',cat:'Learning',tags:['mental','solo','calm']},
  {id:'course',name:'Online course',emoji:'🎓',cat:'Learning',tags:['mental','solo']},
  {id:'history',name:'History',emoji:'🏛️',cat:'Learning',tags:['mental','solo']},
  {id:'science',name:'Science reading',emoji:'🔬',cat:'Learning',tags:['mental','solo']},
  {id:'podcast',name:'Educational podcast',emoji:'🎧',cat:'Learning',tags:['mental','calm']},
  {id:'boardgame',name:'Board games',emoji:'🎲',cat:'Social',tags:['social','fun']},
  {id:'cooking-s',name:'Cooking together',emoji:'👨‍🍳',cat:'Social',tags:['social','hands-on']},
  {id:'volunteer',name:'Volunteering',emoji:'🤝',cat:'Social',tags:['social','meaningful']},
  {id:'meditation',name:'Meditation',emoji:'🌸',cat:'Mindfulness',tags:['solo','calm','mental']},
  {id:'journaling',name:'Journaling',emoji:'📔',cat:'Mindfulness',tags:['solo','calm','mental']},
  {id:'breathwork',name:'Breathwork',emoji:'💨',cat:'Mindfulness',tags:['solo','calm']},
  {id:'nature',name:'Nature walk',emoji:'🌲',cat:'Mindfulness',tags:['outdoor','solo','calm']},
  {id:'cooking',name:'Cooking / baking',emoji:'🍳',cat:'Productive',tags:['solo','hands-on']},
  {id:'home-rep',name:'Home repair',emoji:'🔨',cat:'Productive',tags:['solo','hands-on']},
  {id:'finance',name:'Personal finance',emoji:'💰',cat:'Productive',tags:['mental','solo']},
  {id:'declutter',name:'Decluttering',emoji:'🗂️',cat:'Productive',tags:['solo','physical']},
  {id:'coding',name:'Coding project',emoji:'👨‍💻',cat:'Digital',tags:['mental','solo','technical']},
  {id:'video',name:'Video editing',emoji:'🎬',cat:'Digital',tags:['mental','solo','creative']},
  {id:'3d',name:'3D modeling',emoji:'🧊',cat:'Digital',tags:['mental','solo','creative','technical']},
  {id:'gamedev',name:'Game dev',emoji:'🕹️',cat:'Digital',tags:['mental','solo','creative','technical']},
  {id:'movies',name:'Watching films',emoji:'🍿',cat:'Entertainment',tags:['solo','calm','fun']},
  {id:'tvseries',name:'TV series',emoji:'📺',cat:'Entertainment',tags:['solo','calm','fun']},
  {id:'anime',name:'Anime',emoji:'⛩️',cat:'Entertainment',tags:['solo','calm','fun']},
  {id:'gaming',name:'Gaming',emoji:'🎮',cat:'Entertainment',tags:['solo','fun']},
  {id:'livemusic',name:'Live music / concerts',emoji:'🎶',cat:'Entertainment',tags:['social','fun','outdoor']},
  {id:'theatre',name:'Theatre / plays',emoji:'🎭',cat:'Entertainment',tags:['social','fun','calm']},
  {id:'standup',name:'Stand-up comedy',emoji:'🎤',cat:'Entertainment',tags:['social','fun']},
  {id:'karaoke',name:'Karaoke',emoji:'🎵',cat:'Entertainment',tags:['social','fun']},
  {id:'escape',name:'Escape room',emoji:'🔐',cat:'Entertainment',tags:['social','fun']},
];

// ── STATE ─────────────────────────────────────────────
function genUUID(){if(crypto.randomUUID)return crypto.randomUUID();return'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=crypto.getRandomValues(new Uint8Array(1))[0]&15;return(c==='x'?r:(r&0x3|0x8)).toString(16);});}
// Escape untrusted text for innerHTML interpolation (friend names, activity names, message previews)
function esc(s){return String(s==null?'':s).replace(/[&<>"']/g,function(c){return{'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c];});}
function ld(){try{var s=localStorage.getItem('gs-v3');if(s)return JSON.parse(s);}catch(e){}return{myActs:[],sessions:[],onboarded:false,profile:{},active:null,weeklyFocus:{weekKey:'',actIds:[]},archivedActs:[],collection:{pending:[],counts:{drop:0,leaf:0,petal:0,bee:0},trophies:[],awarded:[]},activityNotes:{},customCats:[],colorPalette:'green',lastWeeklyTs:0};}
function sv(){_sessCache={_v:++_svVersion};try{localStorage.setItem('gs-v3',JSON.stringify({userId:supaUser?supaUser.id:null,myActs:myActs,sessions:sessions,onboarded:onboarded,profile:profile,active:active,weeklyFocus:weeklyFocus,archivedActs:archivedActs,collection:collection,activityNotes:activityNotes,customCats:customCats,colorPalette:colorPalette,calPlanned:calPlanned,calRoutines:calRoutines,lastWeeklyTs:lastWeeklyTs}));}catch(e){}if(supaUser)_scheduleSync();}
var _svVersion=0,_sessCache={_v:-1,_n:-1};
function _sessFor(actId){if(_sessCache._v!==_svVersion||_sessCache._n!==sessions.length){_sessCache={_v:_svVersion,_n:sessions.length};for(var i=0;i<sessions.length;i++){var s=sessions[i];if(!_sessCache[s.actId])_sessCache[s.actId]=[];_sessCache[s.actId].push(s);}}return _sessCache[actId]||[];}
var st=ld(), myActs=st.myActs, sessions=st.sessions, onboarded=st.onboarded, profile=st.profile, active=st.active;
var calPlanned=st.calPlanned||[];
var calRoutines=st.calRoutines||[];
var lastWeeklyTs=st.lastWeeklyTs||0;
var weeklyFocus=st.weeklyFocus||{actIds:[]};
var archivedActs=st.archivedActs||[];
var activityNotes=st.activityNotes||{};
var customCats=st.customCats||[];
var collection=st.collection||{pending:[],counts:{drop:0,leaf:0,petal:0,bee:0},trophies:[],awarded:[]};
if(!collection.counts)collection.counts={drop:0,leaf:0,petal:0,bee:0};
if(!collection.awarded)collection.awarded=[];
var colorPalette=st.colorPalette||'green';
var seedsExpanded=true;

// ── PROJECTS / TREES (Phase 1) ────────────────────────
var MAX_TASKS_PER_PROJECT=26;
var FOCUS_LIMIT=12;
var TREE_HRS=[0,1,5,12,25]; // seed, sapling, young, mature, fruiting
function _normalizeSeed(a){
  if(!a)return a;
  if(!a.kind)a.kind='skill';
  if(a.kind==='project'){
    if(a.emoji==='🌲')a.emoji='🌳'; // projects' symbol changed from 🌲 to 🌳
    if(!Array.isArray(a.tasks))a.tasks=[];
    if(typeof a.notes!=='string')a.notes='';
  }
  return a;
}
function isProject(a){return !!(a&&a.kind==='project');}
function isSkill(a){return !isProject(a);}
function isFinished(a){return isProject(a)&&!!a.finishedAt;}
// Seeds list grouping: finished projects leave their category for one 'Finished' group
var FINISHED_GROUP='__finished__';
function _seedGroup(a){return isFinished(a)?FINISHED_GROUP:(a.cat||'Other');}
function getProjectTasks(a){return isProject(a)&&Array.isArray(a.tasks)?a.tasks:[];}
function getProjectDoneCount(a){return getProjectTasks(a).filter(function(t){return t&&t.done;}).length;}
// Deadline is a local 'YYYY-MM-DD' string, or absent.
function getDeadlineDays(a){
  if(!a||!a.deadline||isFinished(a))return null;
  var p=a.deadline.split('-');if(p.length!==3)return null;
  var due=new Date(+p[0],+p[1]-1,+p[2]),now=new Date();
  var today=new Date(now.getFullYear(),now.getMonth(),now.getDate());
  return Math.round((due-today)/86400000);
}
// Calendar-day distance from a timestamp to today: 'Today', '3 days ago', '5 weeks ago'...
function fmtDaysAgo(ts){
  var d=new Date(ts),now=new Date();
  var days=Math.round((new Date(now.getFullYear(),now.getMonth(),now.getDate())-new Date(d.getFullYear(),d.getMonth(),d.getDate()))/86400000);
  if(days<=0)return 'Today';
  if(days===1)return 'Yesterday';
  function n(v,u){return v+' '+u+(v===1?'':'s')+' ago';}
  if(days<7)return n(days,'day');
  if(days<30)return n(Math.floor(days/7),'week');
  if(days<365)return n(Math.floor(days/30),'month');
  return n(Math.floor(days/365),'year');
}
// Tappable 'x ago' value that flips to the full date and back.
function agoToggleHTML(ts){
  var full=new Date(ts).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
  return '<span class="ago-toggle" role="button" tabindex="0" data-ago="'+fmtDaysAgo(ts)+'" data-full="'+full+'" style="font-size:13px;font-weight:600;cursor:pointer;border-bottom:1px dotted var(--tx3);">'+fmtDaysAgo(ts)+'</span>';
}
function wireAgoToggles(root){
  root.querySelectorAll('.ago-toggle').forEach(function(el){
    var flip=function(){el.textContent=el.textContent===el.dataset.ago?el.dataset.full:el.dataset.ago;};
    el.addEventListener('click',flip);
    el.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();flip();}});
  });
}
function lastSessionTs(sessList){
  return sessList.reduce(function(m,x){return Math.max(m,new Date(x.date||0).getTime()||0);},0)||null;
}
function fmtDeadline(v){
  if(!v)return 'No deadline';
  var p=v.split('-');
  return new Date(+p[0],+p[1]-1,+p[2]).toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric',year:'numeric'});
}
// Date inputs sit invisibly over a text box: an empty iOS date input shows
// today's date faintly, which reads as if a deadline were set.
function syncDeadlineField(inp){
  var txt=inp.parentNode.querySelector('.dl-txt');if(!txt)return;
  txt.textContent=fmtDeadline(inp.value);txt.classList.toggle('empty',!inp.value);
}
function wireDeadlineField(inp){
  if(!inp)return;
  inp.addEventListener('change',function(){syncDeadlineField(this);});
  inp.addEventListener('click',function(){try{if(this.showPicker)this.showPicker();}catch(e){}});
}
function fmtDeadlineShort(v){
  var p=v.split('-'),d=new Date(+p[0],+p[1]-1,+p[2]);
  var o={weekday:'short',month:'short',day:'numeric'};if(d.getFullYear()!==new Date().getFullYear())o.year='numeric';
  return d.toLocaleDateString('en-US',o);
}
// Deadline line under a seed's title (skill or project): countdown + date;
// tap to change (date input sits invisibly on top), × to remove.
// Small outline pencil after a seed's name: the name itself is the edit button.
var EDIT_PEN_SVG='<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" style="flex-shrink:0;opacity:.55;"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/></svg>';
function deadlineLineHTML(a){
  var dl=deadlineLabel(a),h='';
  h+='<div style="display:flex;justify-content:center;align-items:center;gap:6px;margin-top:6px;">';
  h+='<span class="dl-field" style="flex:none;display:inline-block;"><span style="font-size:12px;font-weight:600;color:'+(dl?dl.color:'var(--tx3)')+';">'
    +(dl?'⏳ '+dl.text+' · '+fmtDeadlineShort(a.deadline):'+ Add deadline')
    +'</span><input type="date" class="seed-deadline-edit" aria-label="Deadline" value="'+(a.deadline||'')+'"></span>';
  if(a.deadline)h+='<button class="seed-deadline-clear" type="button" aria-label="Remove deadline" style="background:none;border:none;color:var(--tx3);font-size:15px;line-height:1;cursor:pointer;padding:2px 4px;">×</button>';
  return h+'</div>';
}
function wireDeadlineLine(root,a,rerender){
  var after=function(){sv();rMy();renderTodaySection();rerender();};
  var inp=root.querySelector('.seed-deadline-edit');
  wireDeadlineField(inp);
  if(inp)inp.addEventListener('change',function(){
    if(this.value)a.deadline=this.value;else delete a.deadline;
    after();
    if(a.deadline)offerDeadlineSchedule(a,rerender);
  });
  var clr=root.querySelector('.seed-deadline-clear');
  if(clr)clr.addEventListener('click',function(){delete a.deadline;after();});
}
// After a deadline is set: offer to block out time for it until then. If a
// deadline routine already exists, just move its end date.
function offerDeadlineSchedule(a,onDone){
  if(!a.deadline||getDeadlineDays(a)===null||getDeadlineDays(a)<0)return;
  var existing=(calRoutines||[]).filter(function(r){return r.actId===a.id&&r.fromDeadline;});
  if(existing.length){
    existing.forEach(function(r){r.until=a.deadline;});sv();renderTodaySection();
    showToast('Schedule now runs until '+fmtDeadlineShort(a.deadline),null);return;
  }
  var ov=document.getElementById('ed-ov');
  var back=function(){if(onDone)onDone();else ov.classList.remove('on');};
  var days=getDeadlineDays(a);
  routineForm({
    title:'Add it to your schedule?',
    sub:'<b style="color:var(--tx);">'+esc(a.name)+'</b> is due '+(days===0?'today':days===1?'tomorrow':'in '+days+' days')+' ('+fmtDeadlineShort(a.deadline)+').',
    days:[],hour:null,duration:1,
    cancelLabel:'Not now',saveLabel:'Add to schedule',onCancel:back,
    onSave:function(v){
      calRoutines.push({id:genUUID(),actId:a.id,actName:a.name,actEmoji:a.emoji,cat:a.cat||'',days:v.days,hour:v.hour,duration:v.duration,until:a.deadline,fromDeadline:true});
      sv();renderTodaySection();
      showToast('Added to your schedule until '+fmtDeadlineShort(a.deadline),null);
      back();
    }
  });
}
// Shared days / time / duration (/ end date) form, shown in the edit sheet
function routineForm(o){
  var ov=document.getElementById('ed-ov'),sh=document.getElementById('ed-sh');
  var lbl='font-size:11px;font-weight:700;color:var(--tx3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;';
  sh.innerHTML='<div style="font-family:var(--serif);font-size:19px;font-weight:700;margin-bottom:6px;">'+o.title+'</div>'
    +(o.sub?'<div style="font-size:13px;color:var(--tx2);line-height:1.5;margin-bottom:18px;">'+o.sub+'</div>':'<div style="height:10px;"></div>')
    +'<div style="'+lbl+'">Which days?</div><div id="rf-quick" style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;"></div>'
    +'<div id="rf-days" style="display:grid;grid-template-columns:repeat(7,1fr);gap:5px;margin-bottom:20px;"></div>'
    +'<div style="'+lbl+'">Time</div><select id="rf-hour" class="sinp" style="width:100%;padding:8px;font-size:14px;margin-bottom:20px;"></select>'
    +'<div style="'+lbl+'">Duration</div><div id="rf-dur" style="display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;"></div>'
    +(o.endDate?'<div style="'+lbl+'">Ends <span class="opt">optional</span></div><div style="display:flex;gap:6px;align-items:stretch;margin-bottom:20px;"><div class="dl-field"><div class="sinp dl-txt'+(o.until?'':' empty')+'">'+(o.until?fmtDeadline(o.until):'No end date')+'</div><input type="date" id="rf-until" aria-label="End date" value="'+(o.until||'')+'"></div><button id="rf-until-clear" type="button" style="padding:0 14px;border:1.5px solid var(--bg3);border-radius:var(--rsm);background:var(--bg2);color:var(--tx2);font-size:13px;font-weight:600;cursor:pointer;'+(o.until?'':'display:none;')+'">Clear</button></div>':'')
    +'<div style="display:flex;gap:8px;"><button id="rf-cancel" class="btn btn-s" style="flex:1;margin-top:0;">'+o.cancelLabel+'</button><button id="rf-save" class="btn btn-p" style="flex:1;margin-top:0;">'+o.saveLabel+'</button></div>';
  var sel=(o.days||[]).slice(),dayBtns=[],quick=[];
  function paint(){
    dayBtns.forEach(function(b,i){b.classList.toggle('on',sel.indexOf(i)>-1);});
    quick.forEach(function(q){q.el.classList.toggle('on',q.days.length===sel.length&&q.days.every(function(d){return sel.indexOf(d)>-1;}));});
  }
  [{l:'Every day',days:[0,1,2,3,4,5,6]},{l:'Weekdays',days:[0,1,2,3,4]},{l:'Weekend',days:[5,6]}].forEach(function(q){
    var b=document.createElement('button');b.type='button';b.className='fb';b.style.cssText='font-family:inherit;cursor:pointer;';b.textContent=q.l;
    b.addEventListener('click',function(){var same=q.days.length===sel.length&&q.days.every(function(d){return sel.indexOf(d)>-1;});sel=same?[]:q.days.slice();paint();});
    quick.push({el:b,days:q.days});sh.querySelector('#rf-quick').appendChild(b);
  });
  ['M','T','W','Th','F','S','S'].forEach(function(dn,i){
    var b=document.createElement('div');b.className='fb';b.textContent=dn;b.setAttribute('role','button');
    b.setAttribute('aria-label',['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'][i]);
    b.style.cssText='min-width:0;text-align:center;padding-left:0;padding-right:0;cursor:pointer;';
    b.addEventListener('click',function(){var k=sel.indexOf(i);if(k>-1)sel.splice(k,1);else sel.push(i);paint();});
    dayBtns.push(b);sh.querySelector('#rf-days').appendChild(b);
  });
  paint();
  var hs=sh.querySelector('#rf-hour');
  hs.innerHTML='<option value="-1">Any time</option>'+Array.from({length:24},function(_,h){return '<option value="'+h+'">'+(h<10?'0':'')+h+':00</option>';}).join('');
  hs.value=o.hour==null?'-1':String(o.hour);
  var dur=o.duration===undefined?1:o.duration;
  [{v:null,l:'Open'},{v:.5,l:'30m'},{v:1,l:'1h'},{v:1.5,l:'1.5h'},{v:2,l:'2h'},{v:3,l:'3h'}].forEach(function(d){
    var b=document.createElement('div');b.className='fb'+(d.v===dur?' on':'');b.textContent=d.l;b.style.cursor='pointer';
    b.addEventListener('click',function(){dur=d.v;sh.querySelectorAll('#rf-dur .fb').forEach(function(x){x.classList.remove('on');});b.classList.add('on');});
    sh.querySelector('#rf-dur').appendChild(b);
  });
  var ui=sh.querySelector('#rf-until'),uc=sh.querySelector('#rf-until-clear');
  if(ui){
    wireDeadlineField(ui);
    ui.addEventListener('change',function(){uc.style.display=this.value?'':'none';});
    uc.addEventListener('click',function(){ui.value='';syncDeadlineField(ui);uc.style.display='none';});
  }
  sh.querySelector('#rf-cancel').addEventListener('click',o.onCancel);
  sh.querySelector('#rf-save').addEventListener('click',function(){
    if(!sel.length){showToast('Pick at least one day',null);return;}
    var h=parseInt(hs.value);
    o.onSave({days:sel.slice().sort(),hour:h>=0?h:null,duration:dur,until:ui?(ui.value||null):undefined});
  });
  ov.classList.add('on');
}
// ✎ on a routine in the calendar: change its days, time, length or end date
function editRoutine(r){
  var ov=document.getElementById('ed-ov');
  routineForm({
    title:'Edit routine',sub:esc(r.actName),
    days:r.days,hour:r.hour,duration:r.duration===undefined?1:r.duration,endDate:true,until:r.until||'',
    cancelLabel:'Cancel',saveLabel:'Save',
    onCancel:function(){ov.classList.remove('on');},
    onSave:function(v){
      r.days=v.days;r.hour=v.hour;r.duration=v.duration;
      if(v.until)r.until=v.until;else delete r.until;
      sv();ov.classList.remove('on');
      if(document.getElementById('cal-ov').classList.contains('on'))renderCalWeek();
      renderTodaySection();updateHomeNudge();
      showToast('Routine updated',null);
    }
  });
}
// Short countdown for list rows: 'due in 30 days' / 'due tomorrow' / '2 days overdue'
function dueShort(a){
  var d=getDeadlineDays(a);if(d===null)return null;
  return {text:d<0?(-d)+' day'+(d===-1?'':'s')+' overdue':d===0?'due today':d===1?'due tomorrow':'due in '+d+' days',overdue:d<0};
}
function _actById(id){return myActs.find(function(x){return x.id===id;});}
function deadlineLabel(a){
  var d=getDeadlineDays(a);if(d===null)return null;
  var text=d<0?'Overdue by '+(-d)+' day'+(d===-1?'':'s'):d===0?'Due today':d===1?'Due tomorrow':d+' days left';
  return {text:text,color:d<0?'var(--co2)':d<=3?'var(--su2)':'var(--tx3)'};
}
myActs.forEach(_normalizeSeed);
archivedActs.forEach(_normalizeSeed);
var PALETTES={
  green:{gr:'#3D9E6A',gr2:'#2A7A50',grl:'#D8F2E8',grm:'#60C090',bg:'#F4FAF7',bg2:'#E6F5EE',bg3:'#C8E8D8',tx:'#0A1F14',tx2:'#2A5C40',tx3:'#60A07A',brC:'#B8D8C8',br2C:'#98C0B0',sh:'0 1px 4px rgba(22,36,24,.08)',pcGrad:'linear-gradient(150deg,#3D9E6A,#2A7A50,#154030)',mfGrad:'linear-gradient(90deg,#3D9E6A,#60C090)',fabSh:'0 4px 16px rgba(61,158,106,.4)',btnSh:'0 3px 10px rgba(61,158,106,.28)',fabActSh:'0 1px 6px rgba(61,158,106,.25)',pcSh:'0 4px 18px rgba(61,158,106,.3)',homeBg:'linear-gradient(135deg,#A8D8B8,#3D9E6A)',homeTc:'#0A2818',co:'#E8507A',co2:'#C03060',col:'#FDE8EF',decoGround:'#4A8A50',decoGrass1:'#2D7A38',decoGrass2:'#3D9A50',decoStem:'#3A7A38'},
  blue:{gr:'#1898C0',gr2:'#0E7098',grl:'#C8E8F8',grm:'#40B0D0',bg:'#F2F8FC',bg2:'#E0EEF8',bg3:'#C0D8EC',tx:'#081820',tx2:'#1A4860',tx3:'#487898',brC:'#A8C8E0',br2C:'#88A8D0',sh:'0 1px 4px rgba(8,24,32,.08)',pcGrad:'linear-gradient(150deg,#1898C0,#0E7098,#073858)',mfGrad:'linear-gradient(90deg,#1898C0,#40B0D0)',fabSh:'0 4px 16px rgba(24,152,192,.4)',btnSh:'0 3px 10px rgba(24,152,192,.28)',fabActSh:'0 1px 6px rgba(24,152,192,.25)',pcSh:'0 4px 18px rgba(24,152,192,.3)',homeBg:'linear-gradient(135deg,#70C8E0,#1898C0)',homeTc:'#041820',co:'#DB7873',co2:'#B45B5B',col:'#FDD5D0',decoGround:'#107898',decoGrass1:'#085878',decoGrass2:'#107890',decoStem:'#087080'},
  pink:{gr:'#2F3B7F',gr2:'#1D2458',grl:'#DEE2F2',grm:'#6F7EB8',bg:'#F8F9FC',bg2:'#EEEFF7',bg3:'#D1D5E6',tx:'#0D1126',tx2:'#2F365B',tx3:'#6F779B',brC:'#CBCFE2',br2C:'#ADB3CD',sh:'0 1px 4px rgba(13,17,38,.09)',pcGrad:'linear-gradient(150deg,#2F3B7F,#1D2458,#0E1333)',mfGrad:'linear-gradient(90deg,#2F3B7F,#6F7EB8)',fabSh:'0 4px 16px rgba(47,59,127,.4)',btnSh:'0 3px 10px rgba(47,59,127,.28)',fabActSh:'0 1px 6px rgba(47,59,127,.25)',pcSh:'0 4px 18px rgba(47,59,127,.3)',homeBg:'linear-gradient(135deg,#BFC7E4,#2F3B7F)',homeTc:'#0D1126',co:'#B8923F',co2:'#8E6E24',col:'#F5EBD6',decoGround:'#4A5480',decoGrass1:'#3B4570',decoGrass2:'#4E5888',decoStem:'#3F4A78'},
  yellow:{gr:'#C46325',gr2:'#A14E1C',grl:'#DCEAE2',grm:'#93B5A2',bg:'#FDF8EE',bg2:'#F7EDD9',bg3:'#E6D199',tx:'#2B1409',tx2:'#6B3221',tx3:'#926449',brC:'#EBDBB2',br2C:'#D8BF88',sh:'0 1px 4px rgba(62,26,10,.10)',pcGrad:'linear-gradient(150deg,#D9762E,#B04824,#7C2A18)',mfGrad:'linear-gradient(90deg,#C46325,#DCC578)',fabSh:'0 4px 16px rgba(196,99,37,.4)',btnSh:'0 3px 10px rgba(196,99,37,.28)',fabActSh:'0 1px 6px rgba(196,99,37,.25)',pcSh:'0 4px 18px rgba(158,54,32,.3)',homeBg:'linear-gradient(135deg,#DCC578,#C46325)',homeTc:'#2B1409',co:'#9E3620',co2:'#7A2715',col:'#F6DDD2',decoGround:'#B99A5E',decoGrass1:'#7FA48E',decoGrass2:'#5E8A74',decoStem:'#6E9682'}
};
function applyPalette(){
  var pal=PALETTES[colorPalette]||PALETTES.green;
  function g(k){return pal[k];}
  var r=document.documentElement.style;
  r.setProperty('--gr',g('gr'));r.setProperty('--gr2',g('gr2'));r.setProperty('--grl',g('grl'));r.setProperty('--grm',g('grm'));
  r.setProperty('--bg',g('bg'));r.setProperty('--bg2',g('bg2'));r.setProperty('--bg3',g('bg3'));
  r.setProperty('--tx',g('tx'));r.setProperty('--tx2',g('tx2'));r.setProperty('--tx3',g('tx3'));
  r.setProperty('--br','0.5px solid '+g('brC'));r.setProperty('--br2','0.5px solid '+g('br2C'));
  r.setProperty('--sh',g('sh'));
  r.setProperty('--pc-grad',g('pcGrad'));r.setProperty('--mf-grad',g('mfGrad'));
  r.setProperty('--fab-sh',g('fabSh'));r.setProperty('--btn-p-sh',g('btnSh'));
  r.setProperty('--fab-act-sh',g('fabActSh'));r.setProperty('--pc-sh',g('pcSh'));
  if(g('co'))r.setProperty('--co',g('co'));else r.removeProperty('--co');
  if(g('co2'))r.setProperty('--co2',g('co2'));else r.removeProperty('--co2');
  if(g('col'))r.setProperty('--col',g('col'));else r.removeProperty('--col');
  document.querySelectorAll('.pal-dot').forEach(function(d){
    d.style.boxShadow=d.dataset.pal===colorPalette?'0 0 0 2.5px #fff,0 0 0 4.5px '+g('gr'):'none';
    // Split swatch: theme colour one half, accent the other, both read straight
    // off that season's palette so a dot can never drift out of date.
    var dp=PALETTES[d.dataset.pal];
    if(dp)d.style.background='linear-gradient(135deg,'+dp.gr+' 0 50%,'+(dp.co||dp.grm)+' 50% 100%)';
  });
  CAT_COLORS.Outdoor=g('grl')+','+g('gr2');
  if(document.getElementById('s-home').classList.contains('on'))rHome();
}
function getWeekKey(){var d=new Date(),y=d.getFullYear(),s=new Date(y,0,1),w=Math.ceil(((d-s)/864e5+s.getDay()+1)/7);return y+'-W'+w;}
function isFocused(id){return weeklyFocus.actIds.length===0||weeklyFocus.actIds.indexOf(id)>-1;}
function hasFocusSet(){return weeklyFocus.actIds.length>0;}
// Focused seeds in the order the user arranged them in the focus sheet.
// weeklyFocus.actIds is the ordering; anything focused but missing from it
// (older data) keeps its packet order and trails behind.
function _focusedActs(){
  if(!hasFocusSet())return [];
  var byId={};myActs.forEach(function(a){byId[a.id]=a;});
  var out=[];
  weeklyFocus.actIds.forEach(function(id){if(byId[id])out.push(byId[id]);});
  myActs.forEach(function(a){if(weeklyFocus.actIds.indexOf(a.id)===-1&&isFocused(a.id))out.push(a);});
  return out;
}

// Scheduled plans/routines keep their own copy of a seed's name+emoji, so an
// archived or deleted seed would otherwise keep showing up on the calendar and
// in Today (routines recur forever). Read through these filters so orphans
// vanish from the UI, and purge them for real when a seed leaves the packet.
function _seedAlive(actId){return !!actId&&myActs.some(function(a){return a.id===actId;});}
function _livePlanned(){return (calPlanned||[]).filter(function(ev){return _seedAlive(ev.actId);});}
// A routine runs on its weekdays, up to its 'until' day if it has one
// (routines made from a deadline stop there), and not for finished projects.
function _routineOnDay(r,date){
  var dow=date.getDay()===0?6:date.getDay()-1;
  if(!r.days||r.days.indexOf(dow)<0)return false;
  if(r.until&&_dayKey(date.getTime())>r.until)return false;
  var a=myActs.find(function(x){return x.id===r.actId;});
  return !(a&&isFinished(a));
}
function _liveRoutines(){return (calRoutines||[]).filter(function(r){return _seedAlive(r.actId);});}
// Drops every schedule/focus reference to a seed; returns what it removed so
// the archive undo can put it back.
function _purgeSeedRefs(id){
  var removed={planned:(calPlanned||[]).filter(function(ev){return ev.actId===id;}),routines:(calRoutines||[]).filter(function(r){return r.actId===id;}),focused:weeklyFocus.actIds.indexOf(id)>-1};
  calPlanned=(calPlanned||[]).filter(function(ev){return ev.actId!==id;});
  calRoutines=(calRoutines||[]).filter(function(r){return r.actId!==id;});
  if(removed.focused)weeklyFocus.actIds.splice(weeklyFocus.actIds.indexOf(id),1);
  return removed;
}
function _restoreSeedRefs(id,removed){
  if(!removed)return;
  removed.planned.forEach(function(ev){calPlanned.push(ev);});
  removed.routines.forEach(function(r){calRoutines.push(r);});
  if(removed.focused&&weeklyFocus.actIds.indexOf(id)===-1)weeklyFocus.actIds.push(id);
}

// ── COLLECTIONS ───────────────────────────────────────
var STAGE_ITEMS=[
  {type:'drop', emoji:'💧', label:'Water Drop', desc:'Earned when a plant sprouts — log your first 30 min on any activity.'},
  {type:'leaf', emoji:'🍃', label:'Leaf', desc:'Earned when a plant takes root — reach 2 hours on any activity.'},
  {type:'petal', emoji:'🌸', label:'Petal', desc:'Earned when a plant flowers — reach 5 hours on any activity.'},
  {type:'bee', emoji:'🐝', label:'Bee', desc:'Earned when a plant reaches full bloom — 16 hours on any activity.'},
];
var TROPHIES=[
  // First steps
  {id:'first_seed',emoji:'🌱',name:'First Seed',desc:'Plant your first activity'},
  {id:'first_drop',emoji:'💧',name:'First Drop',desc:'Log your very first session'},
  {id:'first_sprout',emoji:'🪴',name:'First Sprout',desc:'A plant reaches Stage 1'},
  {id:'focused',emoji:'🎯',name:'Focused',desc:'Set a weekly focus'},
  {id:'feeling_good',emoji:'😊',name:'Good Vibes',desc:'End a session feeling great'},
  // Growing
  {id:'green_thumb',emoji:'🌿',name:'Green Thumb',desc:'Grow 5 activities'},
  {id:'busy_bee',emoji:'🐝',name:'Busy Bee',desc:'Log on 3 different days'},
  {id:'harvest_ten',emoji:'🌾',name:'Harvest Season',desc:'Log 10 sessions total'},
  {id:'ten_hours',emoji:'⏱️',name:'Ten Hours',desc:'Log 10 hours of growing'},
  {id:'deep_dive',emoji:'🌊',name:'Deep Dive',desc:'Log a single 2-hour session'},
  {id:'perfect_score',emoji:'⭐',name:'Perfect Score',desc:'Rate a session 10/10'},
  {id:'diverse',emoji:'🗺️',name:'Explorer',desc:'Grow in 3 different categories'},
  // Blooming
  {id:'first_bloom',emoji:'🌸',name:'Full Bloom',desc:'A plant reaches full bloom'},
  {id:'streak_3',emoji:'🔥',name:'On Fire',desc:'Log sessions 3 days in a row'},
  {id:'sessions_25',emoji:'📋',name:'Steady Growth',desc:'Log 25 sessions total'},
  {id:'ten_plants',emoji:'🏡',name:'Full Garden',desc:'Plant 10 activities'},
  {id:'hours_25',emoji:'⏰',name:'Committed',desc:'Log 25 hours of growing'},
  // In full bloom
  {id:'streak_7',emoji:'🌈',name:'Week Warrior',desc:'Log sessions 7 days in a row'},
  {id:'consistent',emoji:'📅',name:'Consistent',desc:'Log on 10 different days'},
  {id:'triple_bloom',emoji:'🌺',name:'Trio in Bloom',desc:'3 plants reach full bloom'},
  {id:'sessions_50',emoji:'🏅',name:'Half Century',desc:'Log 50 sessions total'},
  {id:'hours_50',emoji:'⌛',name:'Time Keeper',desc:'Log 50 hours of growing'},
  // Legendary
  {id:'hundred_hours',emoji:'💫',name:'Century',desc:'Log 100 hours of growing'},
  {id:'centurion',emoji:'🏆',name:'Centurion',desc:'Log 100 sessions total'},
];
function hasTrophy(id){return collection.trophies.indexOf(id)>-1;}
function trophyHint(id){
  if(hasTrophy(id))return null;
  var totalH=sessions.reduce(function(s,x){return s+(x.hours||0)+((x.mins||0)/60);},0);
  var udays=sessions.map(function(s){return new Date(s.date).toDateString();}).filter(function(d,i,a){return a.indexOf(d)===i;}).length;
  var m={green_thumb:[myActs.length,5],ten_plants:[myActs.length,10],
    harvest_ten:[sessions.length,10],sessions_25:[sessions.length,25],sessions_50:[sessions.length,50],centurion:[sessions.length,100],
    ten_hours:[Math.round(totalH),10],hours_25:[Math.round(totalH),25],hours_50:[Math.round(totalH),50],hundred_hours:[Math.round(totalH),100],
    busy_bee:[udays,3],consistent:[udays,10],
    triple_bloom:[myActs.filter(function(a){return getStage(getHours(a.id))>=4;}).length,3]};
  var p=m[id];return(p&&p[0]>0)?p[0]+'/'+p[1]:null;
}
var _trophyQ=[],_trophyQT=null;
function awardTrophy(id){
  if(hasTrophy(id))return;
  collection.trophies.push(id);
  var t=TROPHIES.find(function(x){return x.id===id;});
  if(!t)return;
  _trophyQ.push(t);
  clearTimeout(_trophyQT);
  _trophyQT=setTimeout(function(){
    var q=_trophyQ.splice(0);
    if(!q.length)return;
    haptic(18);
    if(q.length===1){
      showToast(q[0].emoji+' Trophy unlocked: '+q[0].name,null);
    } else {
      showToast('🏆 '+q.length+' trophies unlocked! Open Collections to see them.',null);
      updateCollectBadge();
    }
  },80);
}
function checkTrophies(){
  var totalH=sessions.reduce(function(s,x){return s+(x.hours||0)+((x.mins||0)/60);},0);
  var udays=sessions.map(function(s){return new Date(s.date).toDateString();}).filter(function(d,i,a){return a.indexOf(d)===i;});
  // Activities
  if(myActs.length>=1)awardTrophy('first_seed');
  if(myActs.length>=5)awardTrophy('green_thumb');
  if(myActs.length>=10)awardTrophy('ten_plants');
  // Sessions
  if(sessions.length>=1)awardTrophy('first_drop');
  if(sessions.length>=10)awardTrophy('harvest_ten');
  if(sessions.length>=25)awardTrophy('sessions_25');
  if(sessions.length>=50)awardTrophy('sessions_50');
  if(sessions.length>=100)awardTrophy('centurion');
  // Hours
  if(totalH>=10)awardTrophy('ten_hours');
  if(totalH>=25)awardTrophy('hours_25');
  if(totalH>=50)awardTrophy('hours_50');
  if(totalH>=100)awardTrophy('hundred_hours');
  // Plant stages
  var bloomCount=myActs.filter(function(a){return getStage(getHours(a.id))>=4;}).length;
  if(myActs.some(function(a){return getStage(getHours(a.id))>=1;}))awardTrophy('first_sprout');
  if(bloomCount>=1)awardTrophy('first_bloom');
  if(bloomCount>=3)awardTrophy('triple_bloom');
  // Focus & days
  if(hasFocusSet())awardTrophy('focused');
  if(udays.length>=3)awardTrophy('busy_bee');
  if(udays.length>=10)awardTrophy('consistent');
  // Session quality
  if(sessions.some(function(s){return s.feel!=null&&s.feel>=3;}))awardTrophy('feeling_good');
  if(sessions.some(function(s){return normRating(s.rating)>=5;}))awardTrophy('perfect_score');
  if(sessions.some(function(s){return (s.hours||0)>=2;}))awardTrophy('deep_dive');
  // Category diversity
  var cats=myActs.map(function(a){return a.cat;}).filter(function(c,i,arr){return arr.indexOf(c)===i;});
  if(cats.length>=3)awardTrophy('diverse');
  // Streaks (max consecutive days across all activities)
  var dayMs=24*3600*1000;
  var allDayTs=sessions.map(function(s){var d=new Date(s.date);d.setHours(0,0,0,0);return d.getTime();});
  allDayTs=allDayTs.filter(function(v,i){return allDayTs.indexOf(v)===i;}).sort(function(a,b){return a-b;});
  var maxStreak=allDayTs.length?1:0,curS=1;
  for(var i=1;i<allDayTs.length;i++){
    curS=allDayTs[i]-allDayTs[i-1]===dayMs?curS+1:1;
    if(curS>maxStreak)maxStreak=curS;
  }
  if(maxStreak>=3)awardTrophy('streak_3');
  if(maxStreak>=7)awardTrophy('streak_7');
}
function awardItem(actId, stage){
  var key=actId+':'+stage;
  if(collection.awarded.indexOf(key)>-1)return;
  var item=STAGE_ITEMS[stage-1];if(!item)return;
  var act=myActs.find(function(a){return a.id===actId;})||{emoji:'🌱',name:'Unknown'};
  collection.awarded.push(key);
  collection.pending.push({type:item.type,emoji:item.emoji,label:item.label,actId:actId,actName:act.name,actEmoji:act.emoji,earnedAt:Date.now()});
  updateCollectBadge();
}
function retroCheckItems(){
  myActs.forEach(function(a){
    var stage=getStage(getHours(a.id));
    for(var s=1;s<=stage;s++)awardItem(a.id,s);
  });
}
function updateCollectBadge(){
  var show=collection.pending.length>0;
  var dot=document.getElementById('mp-collect-dot');if(dot)dot.style.display=show?'block':'none';
}
function openCollect(){rCollect();document.getElementById('collect-ov').classList.add('on');}
function closeCollect(){document.getElementById('collect-ov').classList.remove('on');}
function rCollect(){
  updateCollectBadge();
  // Pending
  var pw=document.getElementById('collect-pending-wrap');
  pw.innerHTML='';
  if(collection.pending.length>0){
    var banner=document.createElement('div');banner.className='collect-pending-banner';
    banner.innerHTML='<div style="font-size:13px;font-weight:700;color:#92400E;margin-bottom:2px;">🌟 Ready to collect!</div>'
      +'<div style="font-size:12px;color:#A16207;">Tap each one to claim it</div>'
      +'<div class="collect-pending-grid" id="collect-pending-grid"></div>';
    pw.appendChild(banner);
    var grid=document.getElementById('collect-pending-grid');
    collection.pending.forEach(function(item,idx){
      var el=document.createElement('div');el.className='collect-item';
      el.innerHTML='<div style="font-size:34px;line-height:1.1;margin-bottom:4px;">'+item.emoji+'</div>'
        +'<div style="font-size:11px;font-weight:600;color:var(--tx2);">'+item.label+'</div>'
        +'<div style="font-size:10px;color:var(--tx3);margin-top:2px;">'+item.actEmoji+' '+item.actName+'</div>';
      (function(i,itm){
        el.addEventListener('click',function(){
          el.classList.add('popping');
          setTimeout(function(){
            collection.pending.splice(i,1);
            collection.counts[itm.type]=(collection.counts[itm.type]||0)+1;
            sv();rCollect();
            showToast(itm.emoji+' '+itm.label+' collected!',null);
          },340);
        });
      })(idx,item);
      grid.appendChild(el);
    });
  }
  // Shelf
  var shelf=document.getElementById('collect-shelf');
  shelf.innerHTML='';
  // Shared fixed tooltip — appended to collect-ov to escape the sh scroll container
  var shelfTip=document.getElementById('shelf-tip-float');
  if(!shelfTip){
    shelfTip=document.createElement('div');shelfTip.id='shelf-tip-float';
    shelfTip.style.cssText='position:fixed;z-index:9999;background:rgba(18,90,55,0.88);color:#d4f5e2;font-size:11px;line-height:1.5;padding:12px 10px;border-radius:12px;text-align:center;pointer-events:none;box-shadow:0 4px 18px rgba(0,0,0,.22);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);opacity:0;transform:scale(.92);transition:opacity .18s ease,transform .2s cubic-bezier(.34,1.4,.64,1);border:1px solid rgba(46,200,120,.25);';
    document.getElementById('collect-ov').appendChild(shelfTip);
  }
  shelfTip.style.opacity='0';shelfTip.style.pointerEvents='none';
  var _activeTipEl=null;
  function closeTip(){
    shelfTip.style.opacity='0';shelfTip.style.transform='scale(.92)';shelfTip.style.pointerEvents='none';
    if(_activeTipEl){_activeTipEl.querySelector('.shelf-tip-ov').style.opacity='0';_activeTipEl=null;}
  }
  STAGE_ITEMS.forEach(function(item){
    var n=collection.counts[item.type]||0;
    var el=document.createElement('div');el.className='shelf-item';el.style.cssText='cursor:pointer;position:relative;overflow:hidden;';
    el.innerHTML='<div class="shelf-item-em">'+item.emoji+'</div>'
      +'<div class="shelf-item-n">'+n+'</div>'
      +'<div class="shelf-item-l">'+item.label+'s</div>';
    var ov=document.createElement('div');ov.className='shelf-tip-ov';
    ov.style.cssText='position:absolute;inset:0;background:rgba(18,90,55,0.18);border-radius:14px;opacity:0;transition:opacity .18s ease;pointer-events:none;';
    el.appendChild(ov);
    el.addEventListener('click',function(e){
      e.stopPropagation();
      if(_activeTipEl===el){closeTip();return;}
      if(_activeTipEl)closeTip();
      _activeTipEl=el;
      shelfTip.textContent=item.desc;
      var r=el.getBoundingClientRect();
      var tipW=Math.round(r.width+16);
      shelfTip.style.width=tipW+'px';
      var left=r.left+(r.width-tipW)/2;
      left=Math.max(6,Math.min(left,window.innerWidth-tipW-6));
      shelfTip.style.left=left+'px';
      shelfTip.style.top='-9999px';
      // Reflow to get height, then centre vertically
      requestAnimationFrame(function(){
        var tipH=shelfTip.offsetHeight||70;
        var top=r.top+(r.height-tipH)/2;
        shelfTip.style.top=top+'px';
        shelfTip.style.opacity='1';shelfTip.style.transform='scale(1)';shelfTip.style.pointerEvents='auto';
        ov.style.opacity='1';
      });
    });
    shelf.appendChild(el);
  });
  document.getElementById('collect-ov').addEventListener('click',function(e){
    if(_activeTipEl&&!_activeTipEl.contains(e.target))closeTip();
  });
  // Trophies
  var tg=document.getElementById('trophy-grid');tg.innerHTML='';
  TROPHIES.forEach(function(t){
    var earned=hasTrophy(t.id);
    var hint=!earned?trophyHint(t.id):null;
    var el=document.createElement('div');el.className='trophy-card'+(earned?' earned':' locked');
    el.innerHTML='<div class="trophy-em">'+(earned?t.emoji:'🔒')+'</div>'
      +'<div class="trophy-name">'+t.name+'</div>'
      +'<div class="trophy-desc">'+t.desc+'</div>'
      +(hint?'<div class="trophy-prog">'+hint+'</div>':'');
    tg.appendChild(el);
  });
}

// ── NAVIGATION ────────────────────────────────────────
var backFrom = 'home';
function show(id){document.querySelectorAll('.scr').forEach(function(s){s.classList.remove('on');});document.getElementById(id).classList.add('on');}
function _updateHomeDeco(){}
function nav(v){
  show('s-'+v);
  ['home','my','garden','hist','friends'].forEach(function(t){document.getElementById('nb-'+t).classList.toggle('on',t===v);});
  document.getElementById('fab').style.display='none';
  var mb=document.getElementById('menu-btn');if(mb)mb.style.display=(v==='home'||v==='my'||v==='garden'||v==='hist'||v==='friends')?'flex':'none';
  if(v==='home')rHome();
  if(v==='my'){mySearch='';mySearchOpen=false;var ms=document.getElementById('my-search');if(ms)ms.value='';var msw=document.getElementById('my-search-wrap');if(msw)msw.classList.remove('open');rMy();}
  if(v==='garden')rGarden();
  if(v==='hist'){histSearch='';histPeriod='all';histCustomFrom=null;histCustomTo=null;var hs=document.getElementById('hist-search');if(hs)hs.value='';var hsw=document.getElementById('hist-search-wrap');if(hsw)hsw.classList.remove('open');var hst=document.getElementById('hist-search-toggle');if(hst)hst.classList.remove('on');if(typeof histSearchOpen!=='undefined')histSearchOpen=false;var cr=document.getElementById('hist-custom-range');if(cr)cr.style.display='none';rHist();}
  if(v==='friends'){_frTab='friends';['friends','feed','requests','messages'].forEach(function(t){document.getElementById('fr-tab-'+t).classList.toggle('on',t==='friends');});var _frs=document.getElementById('fr-seg');if(_frs)requestAnimationFrame(function(){positionSegThumb(_frs);});renderFriends();}
}
function goBack(){nav(backFrom);}
function launch(){
  document.body.classList.remove('ob-mode');
  show('s-home');
  document.getElementById('main-nav').classList.add('on');
  document.getElementById('fab').style.display='none';
  document.getElementById('menu-btn').style.display='flex';
  var isGuest=!supaUser;
  document.getElementById('mp-signin').style.display=isGuest?'flex':'none';
  syncSeasonPalette();
  applyPalette();
  rHome();
  setTimeout(function(){checkTrophies();retroCheckItems();sv();},600);
  checkWeeklySummary();
  updateCollectBadge();
  checkUnreadBadge();
}
function goToSignIn(){
  _guestMode=false;
  document.body.classList.add('auth-mode');
  show('s-auth');
  showAuthPanel('auth-form');
  document.getElementById('main-nav').classList.remove('on');
  document.getElementById('menu-btn').style.display='none';
}

// Nav buttons
document.getElementById('nb-home').addEventListener('click',function(){nav('home');});
document.getElementById('nb-my').addEventListener('click',function(){nav('my');});
document.getElementById('nb-garden').addEventListener('click',function(){nav('garden');});
document.getElementById('nb-hist').addEventListener('click',function(){nav('hist');});
document.getElementById('nb-friends').addEventListener('click',function(){nav('friends');});
function openGardenQuickLog(){
  if(!myActs.length){openAdd();return;}
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  buildActPicker({container:sh,sheet:sh,title:'Log session',sub:'Which activity?',
    onPick:function(a){closeEd();openLogDirect(a.id,'garden');},
    footer:function(c){c.appendChild(_pickerStickyRow([{label:'Cancel',fn:closeEd}]));},
    autofocus:80});
  document.getElementById('ed-ov').classList.add('on');
}
function openGardenFabMenu(){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var title=document.createElement('div');title.style.cssText='font-family:var(--serif);font-size:19px;font-weight:700;margin-bottom:4px;';title.textContent='What would you like to do?';sh.appendChild(title);
  var sub=document.createElement('div');sub.style.cssText='font-size:13px;color:var(--tx2);margin-bottom:18px;';sub.textContent='Choose an action for your garden.';sh.appendChild(sub);
  [{em:'🌱',title:'Plant a new seed',desc:'Add a new activity to your garden',fn:function(){closeEd();openAdd();}},
   {em:'📋',title:'Log session',desc:'Record time you grew today',fn:function(){closeEd();openGardenQuickLog();}}
  ].forEach(function(opt){
    var card=document.createElement('div');
    card.style.cssText='display:flex;align-items:center;gap:14px;background:var(--card);border:var(--br);border-radius:var(--rad);padding:16px;cursor:pointer;margin-bottom:10px;box-shadow:var(--sh);transition:transform .12s cubic-bezier(.34,1.56,.64,1);';
    card.innerHTML='<div style="font-size:30px;flex-shrink:0;">'+opt.em+'</div>'
      +'<div><div style="font-size:15px;font-weight:600;margin-bottom:2px;">'+opt.title+'</div>'
      +'<div style="font-size:12px;color:var(--tx2);">'+opt.desc+'</div></div>';
    card.addEventListener('click',opt.fn);
    card.addEventListener('touchstart',function(){card.style.transform='scale(.97)';},{passive:true});
    card.addEventListener('touchend',function(){card.style.transform='';},{passive:true});
    sh.appendChild(card);
  });
  var cancel=document.createElement('button');cancel.className='btn btn-s';cancel.style.marginTop='4px';cancel.textContent='Cancel';cancel.addEventListener('click',closeEd);sh.appendChild(cancel);
  document.getElementById('ed-ov').classList.add('on');
}
document.getElementById('fab').addEventListener('click',function(){
  var onHist=document.getElementById('s-hist').classList.contains('on');
  var onGarden=document.getElementById('s-garden').classList.contains('on');
  if(onHist)openHarvestQuickLog();
  else if(onGarden)openGardenFabMenu();
  else openAdd();
});
// Harvest filters
document.getElementById('hist-add-btn').addEventListener('click',openHarvestQuickLog);
(function(){var _hsT=null;document.getElementById('hist-search').addEventListener('input',function(){var v=this.value;histSearch=v;if(_hsT)clearTimeout(_hsT);_hsT=setTimeout(function(){_hsT=null;_smoothList(document.getElementById('hist-list'),rHist);},120);});})();
(function(){var _msT=null;document.getElementById('my-search').addEventListener('input',function(){var v=this.value;mySearch=v;if(_msT)clearTimeout(_msT);_msT=setTimeout(function(){_msT=null;_smoothList(document.getElementById('my-list'),rMy);},120);});})();
// Field notes segmented control
document.getElementById('hist-seg').addEventListener('keydown',function(e){
  if(e.key!=='Enter'&&e.key!==' ')return;
  var btn=e.target.closest('.my-seg-btn');if(!btn)return;
  e.preventDefault();btn.click();
});
document.getElementById('hist-seg').addEventListener('click',function(e){
  var btn=e.target.closest('.my-seg-btn');if(!btn)return;
  histPeriod=btn.dataset.p;
  this.querySelectorAll('.my-seg-btn').forEach(function(b){b.classList.toggle('on',b===btn);});
  positionSegThumb(this);
  var rangeEl=document.getElementById('hist-custom-range');
  rangeEl.style.display=(histPeriod==='custom')?'block':'none';
  rHist();
});
// Field notes search toggle
var histSearchOpen=false;
document.getElementById('hist-search-toggle').addEventListener('click',function(){
  histSearchOpen=!histSearchOpen;
  var w=document.getElementById('hist-search-wrap');
  var btn=this;
  w.classList.toggle('open',histSearchOpen);
  btn.classList.toggle('on',histSearchOpen);
  var inp=document.getElementById('hist-search');
  if(histSearchOpen){if(inp)setTimeout(function(){inp.focus();},280);}
  else{histSearch='';if(inp)inp.value='';rHist();}
});
(function(){
  function onCustomDate(){
    histCustomFrom=document.getElementById('hist-custom-from').value||null;
    histCustomTo=document.getElementById('hist-custom-to').value||null;
    if(histPeriod==='custom')rHist();
  }
  document.getElementById('hist-custom-from').addEventListener('change',onCustomDate);
  document.getElementById('hist-custom-to').addEventListener('change',onCustomDate);
})();
document.getElementById('btn-back').addEventListener('click',goBack);
document.getElementById('btn-save-log').addEventListener('click',saveLog);
document.getElementById('reflection-toggle').addEventListener('click',function(){
  var body=document.getElementById('reflection-body');
  var arrow=document.getElementById('reflection-arrow');
  var open=body.style.display==='none';
  body.style.display=open?'block':'none';
  arrow.style.transform=open?'rotate(90deg)':'rotate(0deg)';
});
document.getElementById('btn-foc-cancel').addEventListener('click',closeFocus);
document.getElementById('btn-foc-save').addEventListener('click',saveFocus);
// ── BACKUP / RESTORE ──────────────────────────────────
function decodeBackup(str){return JSON.parse(decodeURIComponent(escape(atob(str))));}

var pendingImport=null;
document.getElementById('btn-import-no').addEventListener('click',function(){
  document.getElementById('import-ov').classList.remove('on');
  history.replaceState(null,'',location.pathname);
});
document.getElementById('btn-import-yes').addEventListener('click',function(){
  if(!pendingImport)return;
  var d=pendingImport;
  myActs.splice(0,myActs.length);d.myActs.forEach(function(a){myActs.push(_normalizeSeed(a));});
  sessions.splice(0,sessions.length);d.sessions.forEach(function(s){sessions.push(s);});
  archivedActs.splice(0,archivedActs.length);(d.archivedActs||[]).forEach(function(a){archivedActs.push(_normalizeSeed(a));});
  if(d.profile)Object.assign(profile,d.profile);
  if(d.weeklyFocus)weeklyFocus=d.weeklyFocus;
  onboarded=d.onboarded!==undefined?d.onboarded:true;
  sv();document.getElementById('import-ov').classList.remove('on');
  history.replaceState(null,'',location.pathname);
  if(onboarded){launch();}else{show('s-ob1');rObCats();rObGrid();}
  showToast('✅ Data restored successfully',null);
});
(function checkBackupUrl(){
  var hash=location.hash;
  if(!hash.startsWith('#backup='))return;
  try{
    pendingImport=decodeBackup(hash.slice(8));
    document.getElementById('import-ov').classList.add('on');
  }catch(e){history.replaceState(null,'',location.pathname);}
})();

document.getElementById('btn-term-no').addEventListener('click',function(){document.getElementById('term-ov').classList.remove('on');});
document.getElementById('btn-term-yes').addEventListener('click',function(){
  myActs.forEach(function(a){archivedActs.push(Object.assign({},a,{_terminated:true}));_tombstone(a.id,'arch');});
  myActs.length=0;active=null;weeklyFocus={actIds:[]};calPlanned=[];calRoutines=[];onboarded=false;sv();
  document.getElementById('term-ov').classList.remove('on');
  document.getElementById('main-nav').classList.remove('on');
  document.getElementById('fab').style.display='none';
  document.getElementById('menu-btn').style.display='none';
  document.getElementById('ob-back-btn').style.display='block';
  show('s-ob1');rObCats();rObGrid();
});
document.getElementById('ob-back-btn').addEventListener('click',function(){
  onboarded=true;sv();launch();
  document.getElementById('ob-back-btn').style.display='none';
});
document.getElementById('btn-discard').addEventListener('click',discard);
document.getElementById('btn-ed-cancel').addEventListener('click',closeEd);
document.getElementById('btn-add-cancel-lib').addEventListener('click',closeAdd);
document.getElementById('btn-add-cancel-custom').addEventListener('click',closeAdd);
document.getElementById('btn-proj-cancel').addEventListener('click',closeAdd);
document.getElementById('btn-proj-cat-save').addEventListener('click',function(){
  var name=document.getElementById('proj-custom-cat').value.trim();
  if(!name)return;
  if(!customCats.includes(name))customCats.push(name);
  sv();renderProjectCats(name);showToast('Category saved',null);
});
document.getElementById('btn-proj-save').addEventListener('click',saveProject);
wireDeadlineField(document.getElementById('proj-deadline'));
document.getElementById('kind-tab-skill').addEventListener('click',function(){switchAddKind('skill');});
document.getElementById('kind-tab-project').addEventListener('click',function(){switchAddKind('project');});
document.getElementById('btn-add-cat').addEventListener('click',function(){
  var name=document.getElementById('ac-custom-name').value.trim();
  if(!name)return;
  if(!customCats.includes(name))customCats.push(name);
  sv();if(_renderCats)_renderCats(name);showToast('Category saved',null);
});
document.getElementById('btn-lib-save').addEventListener('click',function(){
  libSelected.forEach(function(id){var a=ACTS.find(function(x){return x.id===id;});if(a){myActs.push(Object.assign({},a,{type:'recreational',level:'beginner'}));_untombstone(id);pushFeedEvent('plant',a.name,a.emoji,null);}});
  _saveTombstones();
  checkTrophies();sv();closeAdd();rMy();
});
document.getElementById('btn-ed-save').addEventListener('click',saveEd);
document.getElementById('btn-add-save').addEventListener('click',saveAdd);
document.getElementById('ob-btn').addEventListener('click',goOQ);
document.getElementById('ob0-next').addEventListener('click',function(){show('s-ob1');});
document.getElementById('obs').addEventListener('input',function(){obSearch=this.value.toLowerCase();rObGrid();});

// ── SEASONS ───────────────────────────────────────────
var SEAS = {
  spring:{m:[2,3,4],label:'🌱 Spring',title:'New things are sprouting.',bg:'linear-gradient(135deg,#F5CCDA,#8FBC6C)',tc:'#22301C',deco:'🌸'},
  summer:{m:[5,6,7],label:'☀️ Summer',title:'Everything is in full bloom.',bg:'linear-gradient(135deg,#DDC8A0,#B08E5C)',tc:'#2D2010',deco:'🌻'},
  autumn:{m:[8,9,10],label:'🍂 Autumn',title:'Time to harvest what you have grown.',bg:'linear-gradient(135deg,#DCC578,#C46325)',tc:'#2B1409',deco:'🍁'},
  winter:{m:[11,0,1],label:'❄️ Winter',title:'A quieter time to go deep.',bg:'linear-gradient(135deg,#C4CCD4,#7E8894)',tc:'#141C24',deco:'🕯️'},
};
function getSeason(){var m=new Date().getMonth();return Object.values(SEAS).find(function(s){return s.m.includes(m);})||SEAS.winter;}
function getSeasonKey(){var m=new Date().getMonth();return Object.keys(SEAS).find(function(k){return SEAS[k].m.includes(m);})||'winter';}
var SEASON_PALETTES={spring:'green',summer:'blue',autumn:'yellow',winter:'pink'};
function syncSeasonPalette(){colorPalette=SEASON_PALETTES[getSeasonKey()]||'green';}

// ── HOME DECORATION ───────────────────────────────────
function homeDecoSVG(sk){
  var dp=PALETTES[colorPalette]||PALETTES.green;
  var w=400,h=108;
  var s='<svg viewBox="0 0 '+w+' '+h+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;pointer-events:none;">';
  var groundFill=dp.decoGround;
  var grass1=dp.decoGrass1;
  var grass2=dp.decoGrass2;
  var stem=dp.decoStem;
  s+='<rect x="0" y="72" width="'+w+'" height="36" fill="'+groundFill+'" opacity="0.22"/>';
  for(var i=0;i<w;i+=8){var h1=9+(i%7),h2=6+(i%5),jit=(i*7)%4-2;
    s+='<line x1="'+(i+jit)+'" y1="72" x2="'+(i+jit-2)+'" y2="'+(72-h1)+'" stroke="'+grass1+'" stroke-width="1.6" stroke-linecap="round" opacity="0.65"/>';
    s+='<line x1="'+(i+jit+3)+'" y1="72" x2="'+(i+jit+5)+'" y2="'+(72-h2)+'" stroke="'+grass2+'" stroke-width="1.2" stroke-linecap="round" opacity="0.5"/>';
  }
  var FC=['#E8A0B0','#C9A0DC','#F2B8A0','#F0D080','#E88090','#A8C898','#DCA0B8','#E0B0D0'];
  var centerFill='#FFF0A0';
  var centerFill2='#E8C040';
  var fls=[{x:22,y:61,r:7,c:FC[0]},{x:58,y:57,r:5.5,c:FC[2]},{x:95,y:63,r:6,c:FC[1]},{x:132,y:55,r:4.5,c:FC[3]},
    {x:165,y:60,r:7,c:FC[4]},{x:200,y:53,r:5,c:FC[6]},{x:238,y:62,r:6.5,c:FC[0]},{x:272,y:56,r:5,c:FC[7]},
    {x:308,y:61,r:6,c:FC[2]},{x:342,y:55,r:4.5,c:FC[3]},{x:375,y:60,r:6,c:FC[4]},{x:115,y:49,r:4,c:FC[5]},
    {x:255,y:47,r:3.5,c:FC[1]},{x:185,y:45,r:3.5,c:FC[7]}];
  fls.forEach(function(f){
    s+='<line x1="'+f.x+'" y1="'+(f.y+f.r*0.6)+'" x2="'+f.x+'" y2="72" stroke="'+stem+'" stroke-width="1.4" opacity="0.7" stroke-linecap="round"/>';
    [0,60,120,180,240,300].forEach(function(ang){
      var rad=ang*Math.PI/180,px=f.x+Math.cos(rad)*f.r*1.4,py=f.y+Math.sin(rad)*f.r*1.1;
      s+='<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="'+(f.r*0.85).toFixed(1)+'" ry="'+(f.r*0.55).toFixed(1)+'" fill="'+f.c+'" opacity="0.88" transform="rotate('+ang+','+px.toFixed(1)+','+py.toFixed(1)+')"/>';
    });
    s+='<circle cx="'+f.x+'" cy="'+f.y+'" r="'+(f.r*0.42).toFixed(1)+'" fill="'+centerFill+'" opacity="0.95"/>';
    s+='<circle cx="'+f.x+'" cy="'+f.y+'" r="'+(f.r*0.22).toFixed(1)+'" fill="'+centerFill2+'" opacity="0.9"/>';
  });
  if(sk==='summer'){s+='<circle cx="350" cy="23" r="20" fill="#FFE090" opacity="0.2"/><circle cx="350" cy="23" r="7" fill="#FFC030" opacity="0.45"/>';}
  if(sk==='autumn'){[{x:50,y:30,c:'#D9762E'},{x:160,y:20,c:'#C25A28'},{x:280,y:28,c:'#9E3620'}].forEach(function(l,i){s+='<ellipse cx="'+l.x+'" cy="'+l.y+'" rx="7" ry="4.5" fill="'+l.c+'" opacity="0.65" transform="rotate('+(i*30-20)+','+l.x+','+l.y+')"/>';});}
  if(sk==='winter'){for(var w2=0;w2<8;w2++){s+='<circle cx="'+(w2*52+18)+'" cy="'+(15+(w2%3)*12)+'" r="2.5" fill="white" opacity="0.6"/>';}}
  s+='</svg>';
  return s;
}

// ── DAILY QUOTE ───────────────────────────────────────
var QUOTES=[
  'Every master was once a beginner. Keep growing.',
  'Progress, not perfection. Your roots are deepening.',
  'Even the slowest seed becomes a tree in time.',
  'You planted the seed. Now trust the process.',
  'Small steps every day build the life you want.',
  'Consistency is quiet. Keep showing up anyway.',
  'What you water, grows.',
  'One session at a time, you are becoming.',
  'Rest is part of the rhythm, not a break from it.',
  'You are exactly where you need to be today.',
  'Growth happens in both the doing and the resting.',
  'Be patient with yourself. Good things take time.',
  'Today\'s effort is tomorrow\'s harvest.',
  'Not every day blooms. Show up anyway.',
  'It\'s okay to grow slowly.',
  'You are doing better than you think.',
  'Every moment you spend growing is a gift to your future self.',
  'Your dedication, however small, matters.',
  'Start before you\'re ready. Adjust as you grow.',
  'Momentum starts with a single step.',
  'Done is better than perfect.',
  'You don\'t find motivation, you build it by starting.',
  'What story will your future self tell about today?',
  'Every harvest, no matter how small, counts.',
  'Look how far you\'ve come since you started.',
  'The habit you build today becomes the strength you carry tomorrow.',
  'Gardens aren\'t built in a day. Neither is mastery.',
  'Roots grow in the dark before the flower blooms in the light.',
  'Tend your craft the way you\'d tend something you love.',
  'Seeds don\'t bloom on command. They bloom on commitment.',
  'What you nurture, nurtures you back.',
  'A tree that bends in the wind grows stronger roots.',
  'After every winter, spring returns.',
  'Like any garden, you need both sun and rain to grow.',
  'Each session is proof of your commitment.',
  'I am patient with my progress.',
  'I grow a little more every time I show up.',
  'My consistency is building something beautiful.',
  'I trust the process, even when I can\'t see the results.',
  'My effort today shapes my skill tomorrow.',
  'I celebrate every step forward, no matter how small.',
  'You don\'t need a perfect plan. You need a first step.',
  'Progress is built from small, repeated actions.',
  'Every expert was once a beginner with doubts.',
  'Showing up is already winning.',
  'Your future self is cheering you on.',
  'Good things grow slowly, and then all at once.',
  'You are one session away from momentum.',
  'The secret to getting ahead is getting started.',
  'You\'ve shown up before. You can show up again.',
  'Every season of growth requires a season of effort.',
  'The field rewards those who tend it regularly.',
  'Your past sessions are proof that you can do this.',
  'Discipline is choosing what you want most over what you want now.',
  'The only bad session is the one you didn\'t show up for.',
  'Make today count.',
  'Small, consistent actions are the only kind that matter.',
  'You are capable of more than you know.',
  'The soil of practice grows the fruit of skill.',
  'Even weeds remind us that life finds a way.',
  'Start where you are. Use what you have. Do what you can.',
  'The best investment you can make is in yourself.',
  'Difficult roads often lead to beautiful destinations.',
  'Your only competition is who you were yesterday.',
  'A little progress each day adds up to big results.',
  'You\'re not behind. You\'re building.',
];
var QUOTE_EMOJIS=['🌱','🌿','🌸','🌾','☀️','🪴','🍃','✨'];
function getDailyQuote(){
  var d=new Date().toDateString();
  var h=0;for(var i=0;i<d.length;i++)h=(h*31+d.charCodeAt(i))>>>0;
  return {text:QUOTES[h%QUOTES.length],emoji:QUOTE_EMOJIS[h%QUOTE_EMOJIS.length]};
}

// ── HOME ──────────────────────────────────────────────
function showTodayDetail(todaySess){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var title=document.createElement('div');title.style.cssText='font-family:var(--serif);font-size:19px;font-weight:700;margin-bottom:4px;';title.textContent='Today';sh.appendChild(title);
  var todayMins=todaySess.reduce(function(s,x){return s+(x.hours||0)*60+(x.mins||0);},0);
  var sub=document.createElement('div');sub.style.cssText='font-size:13px;color:var(--tx2);margin-bottom:16px;';sub.textContent=todaySess.length+' session'+(todaySess.length!==1?'s':'')+' · '+(todayMins>=60?Math.floor(todayMins/60)+'h '+(todayMins%60)+'m':todayMins+'m');sh.appendChild(sub);
  var list=document.createElement('div');list.style.cssText='display:flex;flex-direction:column;gap:8px;max-height:55vh;overflow-y:auto;';
  todaySess.slice().reverse().forEach(function(s){
    var act=myActs.find(function(a){return a.id===s.actId;})||{emoji:'?',name:'Unknown'};
    var mins=(s.hours||0)*60+(s.mins||0);
    var card=document.createElement('div');card.style.cssText='background:var(--bg2);border:var(--br);border-radius:var(--rsm);padding:10px 12px;';
    var top=document.createElement('div');top.style.cssText='display:flex;align-items:center;gap:8px;margin-bottom:4px;';
    top.innerHTML='<span style="font-size:20px;">'+act.emoji+'</span><div style="flex:1;font-size:14px;font-weight:600;">'+act.name+'</div><div style="font-size:12px;color:var(--gr);font-weight:600;">'+(mins>=60?Math.floor(mins/60)+'h '+(mins%60)+'m':mins+'m')+'</div>';
    card.appendChild(top);
    if(s.note){var note=document.createElement('div');note.style.cssText='font-size:12px;color:var(--tx2);padding-left:28px;';note.textContent=s.note;card.appendChild(note);}
    list.appendChild(card);
  });
  sh.appendChild(list);
  document.getElementById('ed-ov').classList.add('on');
}

function rHome(){
  // ── Session lock: when a session is in progress, take over the home
  if(active){
    document.body.classList.add('session-lock');
    var lockAct=myActs.find(function(a){return a.id===active.actId;})||{emoji:'🌱',name:'Unknown'};
    var lockEl=document.getElementById('s-lock');
    if(lockEl){
      var lockPaused=!!active.pausedAt;
      lockEl.style.display='flex';
      lockEl.innerHTML=
        '<div class="sess-lock-lbl">'+(lockPaused?'⏸ Session paused':'🌱 Currently growing')+'</div>'
       +'<div class="sess-lock-emoji">'+lockAct.emoji+'</div>'
       +'<div class="sess-lock-name">'+lockAct.name+'</div>'
       +'<div class="sess-lock-timer'+(lockPaused?' paused':'')+'" id="sess-lock-timer">00:00</div>'
       +'<button class="sess-lock-btn sess-lock-btn-s" id="sess-lock-pause">'+(lockPaused?'Resume session':'Pause session')+'</button>'
       +'<button class="sess-lock-btn sess-lock-btn-p" id="sess-lock-log">Log this session</button>'
       +'<button class="sess-lock-btn sess-lock-btn-d" id="sess-lock-discard">Discard session</button>';
      document.getElementById('sess-lock-pause').addEventListener('click',toggleSessPause);
      document.getElementById('sess-lock-log').addEventListener('click',resumeSess);
      document.getElementById('sess-lock-discard').addEventListener('click',function(){
        if(!confirm('Discard this session? Your time won\'t be saved.'))return;
        active=null;sv();rHome();
      });
    }
    if(_activeTimerInt)clearInterval(_activeTimerInt);
    (function(){function tick(){var el=document.getElementById('sess-lock-timer');if(el)el.textContent=_fmtElapsed(_activeElapsed());else{clearInterval(_activeTimerInt);_activeTimerInt=null;}}tick();if(!active.pausedAt)_activeTimerInt=setInterval(tick,1000);})();
    return;
  }
  document.body.classList.remove('session-lock');
  var lockElOff=document.getElementById('s-lock');if(lockElOff){lockElOff.style.display='none';lockElOff.innerHTML='';}

  var sea=getSeason(), sk=getSeasonKey();
  var pal=PALETTES[colorPalette]||PALETTES.green;
  var h=new Date().getHours();
  var greet=h<12?'Good morning':h<17?'Good afternoon':'Good evening';
  var nameStr=profile&&profile.name?(profile.name):'';
  var _streak=calcStreak();
  var streakMeta=_streak>=2?' · 🔥 '+_streak:'';
  // v2 hero
  var dateStr=new Date().toLocaleDateString('en-US',{month:'short',day:'numeric'});
  var v2Meta=document.getElementById('v2-hero-meta');
  if(v2Meta)v2Meta.textContent=sea.label+' · '+dateStr+streakMeta;
  var v2Greet=document.getElementById('v2-hero-greet');
  if(v2Greet)v2Greet.textContent=greet+(nameStr?', '+nameStr:'');
  var pbEm=document.getElementById('menu-btn-em');if(pbEm)pbEm.textContent=profile&&profile.emoji?profile.emoji:'👤';

  var ipW=document.getElementById('ip-wrap'), pcW=document.getElementById('pc-wrap');
  // Render Today section (schedule or empty) + tasks from focused projects
  renderTodaySection();
  // Render This week's focus (chips) into its own slot under the weekly overview
  renderWeekFocus();
  if(active){
    var act=myActs.find(function(a){return a.id===active.actId;})||{emoji:'?',name:'Unknown'};
    ipW.innerHTML='<div class="ip" id="ip-card"><div class="ip-dot"></div><div class="ip-lbl">🌱 Currently growing</div><div class="ip-name">'+act.emoji+' '+act.name+'</div><div class="ip-time" id="ip-elapsed" style="font-size:22px;font-weight:700;font-family:var(--mono,monospace);letter-spacing:.04em;color:#fff;margin-bottom:8px;"></div><div class="ip-btn">Finish &amp; log</div></div>';
    document.getElementById('ip-card').addEventListener('click',resumeSess);
    if(_activeTimerInt)clearInterval(_activeTimerInt);
    (function(){function tick(){var el=document.getElementById('ip-elapsed');if(el)el.textContent=_fmtElapsed(_activeElapsed());else{clearInterval(_activeTimerInt);_activeTimerInt=null;}}tick();if(!active.pausedAt)_activeTimerInt=setInterval(tick,1000);})();
    pcW.innerHTML='';
  } else {
    if(_activeTimerInt){clearInterval(_activeTimerInt);_activeTimerInt=null;}
    ipW.innerHTML='';
    // Always show the "Ready to start?" CTA under Today when no active session
    pcW.innerHTML='<div class="pc" id="pc-card" style="margin-left:0;margin-right:0;margin-top:14px;"><div class="pc-title">Ready to start?</div><div class="pc-sub">Pick a seed or answer a few questions for a suggestion.</div></div>';
    document.getElementById('pc-card').addEventListener('click',openPicker);
  }

  var todayStr=new Date().toDateString();
  var todaySess=sessions.filter(function(s){return new Date(s.date).toDateString()===todayStr;});
  var todayCnt=todaySess.length;
  var todayTm=todaySess.reduce(function(s,x){return s+(x.hours||0)*60+(x.mins||0);},0);
  document.getElementById('stats').innerHTML=
    '<div id="stat-sess" class="v2-stat" style="cursor:pointer;padding-left:8px;">'
      +'<div class="v2-stat-n">'+todayCnt+'</div>'
      +'<div class="v2-stat-l">Sessions</div>'
    +'</div>'
    +'<div id="stat-time" class="v2-stat" style="cursor:pointer;">'
      +'<div class="v2-stat-n">'+Math.floor(todayTm/60)+'h '+(todayTm%60)+'m</div>'
      +'<div class="v2-stat-l">Time</div>'
    +'</div>';
  document.getElementById('stat-sess').addEventListener('click',openSessionsStats);
  document.getElementById('stat-time').addEventListener('click',openTimeStats);

  // Feature 3: days since first session — shown above greeting in banner
  (function(){
    var el=document.getElementById('growing-days');if(!el)return;
    el.innerHTML='';
    var ex=document.getElementById('home-extras');if(ex)ex.innerHTML='';
    if(!sessions.length)return;
    var first=sessions.reduce(function(m,s){return s.date<m?s.date:m;},sessions[0].date);
    var days=Math.floor((Date.now()-first)/86400000);
    if(days<1)return;
    el.innerHTML='<div style="font-size:10px;font-weight:600;text-transform:uppercase;letter-spacing:1.2px;margin-bottom:6px;opacity:.8;">Day '+days+'</div>';
  })();

  (function(){
    var wb=document.getElementById('weekly-bar');if(!wb)return;
    var now=new Date();
    var dow=now.getDay();
    var weekStart=new Date(now);weekStart.setDate(now.getDate()-(dow===0?6:dow-1));weekStart.setHours(0,0,0,0);
    var days=['M','T','W','T','F','S','S'];
    var row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;align-items:center;';
    for(var i=0;i<7;i++){
      (function(idx){
        var d=new Date(weekStart);d.setDate(weekStart.getDate()+idx);
        var dStart=d.getTime(),dEnd=dStart+86400000;
        var isToday=d.toDateString()===now.toDateString();
        var hasLog=sessions.some(function(s){return s.date>=dStart&&s.date<dEnd;});
        var isFuture=d>now&&!isToday;
        var col=document.createElement('div');
        col.style.cssText='flex:1;display:flex;flex-direction:column;align-items:center;gap:4px;cursor:'+(isFuture?'default':'pointer')+';';
        var circle=document.createElement('div');
        circle.style.cssText='width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;'
          +(isToday?'background:var(--gr);box-shadow:0 0 0 3px var(--grl);box-shadow:0 0 0 3px color-mix(in srgb,var(--gr) 28%,var(--bg));':hasLog?'background:var(--grl);border:1.5px solid var(--gr);':'background:var(--bg2);border:1px solid var(--bg3);')
          +(isFuture?'opacity:.35;':'');
        if(hasLog&&!isToday){var dot=document.createElement('div');dot.style.cssText='width:8px;height:8px;border-radius:50%;background:var(--gr);';circle.appendChild(dot);}
        if(isToday){var dot2=document.createElement('div');dot2.style.cssText='width:8px;height:8px;border-radius:50%;background:#fff;';circle.appendChild(dot2);}
        var lbl=document.createElement('div');
        lbl.style.cssText='font-size:10px;font-weight:'+(isToday?'700':'600')+';color:'+(isToday?'var(--gr2)':'var(--tx3)')+';';
        lbl.textContent=days[idx];
        col.appendChild(circle);col.appendChild(lbl);
        if(!isFuture){col.addEventListener('click',function(){openDayRecap(d,dStart,dEnd);});}
        else {col.style.cursor='pointer';(function(dd){col.addEventListener('click',function(){openFutureDayRecap(new Date(dd));});})(d);}
        row.appendChild(col);
      })(i);
    }
    wb.innerHTML='';wb.appendChild(row);
  })();
  // Streak is now inline with greeting; empty the standalone pill container
  var _swEl=document.getElementById('streak-wrap');if(_swEl)_swEl.innerHTML='';

  updateHomeNudge();


  document.getElementById('home-deco').innerHTML=homeDecoSVG(sk);
  setTimeout(_updateHomeDeco,60);
  var q=getDailyQuote();
  document.getElementById('daily-quote').innerHTML='<div class="dq"><span class="dq-em">'+q.emoji+'</span><span class="dq-txt">'+q.text+'</span></div>';
}

function openDayRecap(d,dStart,dEnd){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var isToday=d.toDateString()===new Date().toDateString();
  var dateLabel=isToday?'Today':d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  var title=document.createElement('div');title.style.cssText='font-family:var(--serif);font-size:19px;font-weight:700;margin-bottom:14px;';title.textContent=dateLabel;sh.appendChild(title);
  var daySess=sessions.filter(function(s){return s.date>=dStart&&s.date<dEnd;}).sort(function(a,b){return a.date-b.date;});
  if(!daySess.length){
    var empty=document.createElement('div');empty.style.cssText='font-size:14px;color:var(--tx3);padding:8px 0 16px;';empty.textContent='Nothing logged this day.';sh.appendChild(empty);
  } else {
    var totalMins=daySess.reduce(function(s,x){return s+(x.hours||0)*60+(x.mins||0);},0);
    var summary=document.createElement('div');summary.style.cssText='font-size:12px;color:var(--tx3);margin-bottom:14px;';
    summary.textContent=daySess.length+' session'+(daySess.length!==1?'s':'')+' · '+(totalMins>=60?Math.floor(totalMins/60)+'h '+(totalMins%60)+'m':totalMins+'m');
    sh.appendChild(summary);
    daySess.forEach(function(s){
      var a=myActs.find(function(x){return x.id===s.actId;})||archivedActs.find(function(x){return x.id===s.actId;})||(s.actName?{emoji:s.actEmoji||'',name:s.actName}:{emoji:'',name:'Deleted activity'});
      var dur=(s.hours||0)*60+(s.mins||0);var durStr=dur>=60?Math.floor(dur/60)+'h '+(dur%60)+'m':dur+'m';
      var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:.5px solid var(--bg3);';
      var name=document.createElement('div');name.style.cssText='font-size:13px;font-weight:600;color:var(--tx);';name.textContent=a.name;
      var right=document.createElement('div');right.style.cssText='display:flex;align-items:center;gap:10px;flex-shrink:0;';
      var durEl=document.createElement('span');durEl.style.cssText='font-size:12px;color:var(--tx3);';durEl.textContent=durStr;
      right.appendChild(durEl);
      if(s.rating){var rEl=document.createElement('span');rEl.style.cssText='font-size:12px;font-weight:700;color:var(--co);';rEl.textContent=normRating(s.rating)+' ★';right.appendChild(rEl);}
      row.appendChild(name);row.appendChild(right);sh.appendChild(row);
    });
  }
  var btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:8px;margin-top:16px;';
  var isFuture=d>new Date()&&!isToday;
  if(!isFuture){
    var logBtn=document.createElement('button');logBtn.className='btn btn-p';logBtn.style.cssText='flex:1;margin:0;';
    logBtn.textContent='+ Log session';
    var _preDate=d.toLocaleDateString('en-CA');
    logBtn.addEventListener('click',function(){closeEd();showQuickLog(_preDate);});
    btnRow.appendChild(logBtn);
  }
  sh.appendChild(btnRow);
  document.getElementById('ed-ov').classList.add('on');
}

function openFutureDayRecap(d){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var dateLabel=d.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  var title=document.createElement('div');title.style.cssText='font-family:var(--serif);font-size:19px;font-weight:700;margin-bottom:14px;';title.textContent=dateLabel;sh.appendChild(title);
  var planned=_getScheduledForDate(d);
  if(!planned.length){
    var empty=document.createElement('div');empty.style.cssText='font-size:14px;color:var(--tx3);padding:8px 0 16px;';empty.textContent='Nothing planned yet.';sh.appendChild(empty);
  } else {
    var summary=document.createElement('div');summary.style.cssText='font-size:12px;color:var(--tx3);margin-bottom:14px;';
    summary.textContent=planned.length+' planned';sh.appendChild(summary);
    planned.forEach(function(it){
      var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;justify-content:space-between;padding:10px 0;border-bottom:.5px solid var(--bg3);';
      var name=document.createElement('div');name.style.cssText='font-size:13px;font-weight:600;color:var(--tx);';name.textContent=(it.emoji?it.emoji+' ':'')+(it.name||'Untitled');
      var right=document.createElement('div');right.style.cssText='display:flex;align-items:center;gap:10px;flex-shrink:0;';
      var timeEl=document.createElement('span');timeEl.style.cssText='font-size:12px;color:var(--tx3);';timeEl.textContent=(it.hour==null?'Any':_fmtHour12(it.hour));right.appendChild(timeEl);
      if(it.kind==='routine'){var rEl=document.createElement('span');rEl.style.cssText='font-size:11px;color:var(--gr2);background:var(--grl);padding:2px 8px;border-radius:999px;font-weight:600;';rEl.textContent='routine';right.appendChild(rEl);}
      row.appendChild(name);row.appendChild(right);sh.appendChild(row);
    });
  }
  var btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:8px;margin-top:16px;';
  var addBtn=document.createElement('button');addBtn.className='btn btn-p';addBtn.style.cssText='flex:1;margin:0;';
  addBtn.textContent='+ Add to schedule';
  var _d=new Date(d);
  addBtn.addEventListener('click',function(){closeEd();setTimeout(function(){_calScheduleForm(_d);},60);});
  btnRow.appendChild(addBtn);
  sh.appendChild(btnRow);
  document.getElementById('ed-ov').classList.add('on');
}

// ── ONBOARDING ────────────────────────────────────────
var obCat='all', obSearch='';

function rObCats(){
  var wrap=document.getElementById('ob-cats');
  wrap.innerHTML='';
  function makePill(label,cat){
    var p=document.createElement('div');
    p.className='pill'+(obCat===cat?'':' off');
    if(cat==='all'){p.style.background='var(--gr)';p.style.color='#fff';}
    else{var cc=CAT_COLORS[cat].split(',');p.style.background=cc[0];p.style.color=cc[1];}
    p.textContent=label;
    p.addEventListener('click',function(){obCat=cat;rObCats();rObGrid();});
    wrap.appendChild(p);
  }
  makePill('All','all');
  CATS.forEach(function(c){if(ACTS.some(function(a){return a.cat===c;}))makePill(CEM[c]+' '+c,c);});
}

function rObGrid(){
  var ids=myActs.map(function(a){return a.id;});
  var list=ACTS.filter(function(a){return(obCat==='all'||a.cat===obCat)&&(!obSearch||a.name.toLowerCase().includes(obSearch));});
  var grid=document.getElementById('ob-grid');
  grid.innerHTML='';
  list.forEach(function(a){
    var sel=ids.includes(a.id);
    var my=myActs.find(function(m){return m.id===a.id;})||{type:'recreational',level:'beginner'};
    var card=document.createElement('div');
    card.className='oc'+(sel?' on':'');
    card.dataset.actId=a.id;

    var inner=document.createElement('div');
    inner.style.cssText='display:flex;gap:10px;align-items:flex-start;flex:1;';
    inner.innerHTML='<div class="oc-em">'+a.emoji+'</div><div style="flex:1;"><div class="oc-name">'+a.name+'</div><div class="oc-cat">'+a.cat+'</div></div>';
    inner.addEventListener('click',function(){togOb(a.id);});

    var togs=document.createElement('div');
    togs.className='oc-togs';
    togs.addEventListener('click',function(e){e.stopPropagation();});


    inner.querySelector('div[style]').appendChild(togs);
    card.appendChild(inner);

    var chk=document.createElement('div');
    chk.className='oc-chk';
    chk.innerHTML='<div class="oc-cm"></div>';
    chk.addEventListener('click',function(){togOb(a.id);});
    card.appendChild(chk);

    grid.appendChild(card);
  });

  var cnt=myActs.length;
  var el=document.getElementById('ob-cnt');
  el.style.display=cnt>0?'block':'none';
  if(cnt>0)el.textContent=cnt+' planted';
  document.getElementById('ob-btn').disabled=cnt<1;
}

function togOb(id){
  var i=myActs.findIndex(function(a){return a.id===id;});
  if(i>-1){myActs.splice(i,1);_tombstone(id);}
  else{var b=ACTS.find(function(a){return a.id===id;});myActs.push(Object.assign({},b,{type:'recreational',level:'beginner'}));_untombstone(id);}
  sv();
  var sel=myActs.some(function(a){return a.id===id;});
  var card=document.querySelector('.oc[data-act-id="'+id+'"]');
  if(card){card.classList.toggle('on',sel);}
  var cnt=myActs.length;
  var el=document.getElementById('ob-cnt');
  el.style.display=cnt>0?'block':'none';
  if(cnt>0)el.textContent=cnt+' planted';
  document.getElementById('ob-btn').disabled=cnt<1;
}
function togInline(id,k,v){var a=myActs.find(function(a){return a.id===id;});if(a){a[k]=v;sv();}rObGrid();}
function cycLvl(id){var a=myActs.find(function(a){return a.id===id;});if(!a)return;var l=['beginner','intermediate','comfortable'];a.level=l[(l.indexOf(a.level)+1)%l.length];sv();rObGrid();}

var OQ=[
  {id:'goal',title:"What's your main goal?",sub:"How do you think about most of the activities in your seeds?",opts:[
    {v:'build',em:'📈',lbl:'Mastery & progress',sub:'I want to improve and see it'},
    {v:'enjoy',em:'🍂',lbl:'Joy & rest',sub:'Low pressure, high pleasure'},
    {v:'balance',em:'🌻',lbl:'A balance',sub:'Some serious, some just for fun'},
  ]},
  {id:'avail',title:"How long are your growing windows?",sub:"On a typical day, how much time can you give?",opts:[
    {v:'short',em:'⚡',lbl:'Short bursts',sub:'15-30 minutes'},
    {v:'medium',em:'⏱️',lbl:'An hour or so',sub:'30-90 minutes'},
    {v:'long',em:'🕰️',lbl:'Long sessions',sub:'2+ hours at a stretch'},
    {v:'varies',em:'🌦️',lbl:'It varies',sub:'Depends on the day'},
  ]},
];
var oqStep=0;
function goOQ(){show('s-ob2');oqStep=0;rOQ();}
function rOQ(){
  document.getElementById('oqf').style.width=Math.round((oqStep/OQ.length)*100)+'%';
  var q=OQ[oqStep];
  var body=document.getElementById('oq-body');
  body.innerHTML='';
  var num=document.createElement('div');num.className='oq-num';num.textContent='Question '+(oqStep+1)+' of '+OQ.length;body.appendChild(num);
  var title=document.createElement('div');title.className='oq-title';title.textContent=q.title;body.appendChild(title);
  var sub=document.createElement('div');sub.className='oq-sub';sub.textContent=q.sub;body.appendChild(sub);
  var opts=document.createElement('div');opts.style.cssText='display:flex;flex-direction:column;gap:8px;';
  q.opts.forEach(function(o){
    var opt=document.createElement('div');opt.className='oq-opt';
    opt.innerHTML='<span class="oq-em">'+o.em+'</span><div><div class="oq-lbl">'+o.lbl+'</div><div class="oq-slbl">'+o.sub+'</div></div>';
    opt.addEventListener('click',function(){pickOQ(q.id,o.v);});
    opts.appendChild(opt);
  });
  body.appendChild(opts);
  var back=document.createElement('button');back.className='btn btn-s';back.style.marginTop='12px';back.textContent='← Back';
  back.addEventListener('click',function(){
    if(oqStep>0){oqStep--;rOQ();}
    else{show('s-ob1');}
  });
  body.appendChild(back);
}
function pickOQ(key,val){
  profile[key]=val;
  setTimeout(function(){
    if(oqStep<OQ.length-1){oqStep++;rOQ();}
    else{openProfileStep();}
  },260);
}

var PROF_EMOJIS=['🌱','🌿','🍀','🌾','🌵','🌲','🌲','🌴','🎋','🌻','🌸','🌺','🌹','🌷','🌼','💐','🪴','🍃','🍁','🌊','☀️','🌙'];
var profEmoji='🌱';
var _needsProfile=false;
function openProfileStep(){
  profEmoji=profile.emoji||'🌱';
  document.getElementById('prof-name').value=profile.name||'';
  document.getElementById('prof-em-preview').textContent=profEmoji;
  document.getElementById('ob3-username-wrap').style.display=_needsProfile?'block':'none';
  document.getElementById('ob3-username').value='';
  document.getElementById('ob3-err').style.display='none';
  var grid=document.getElementById('prof-em-grid');grid.innerHTML='';
  PROF_EMOJIS.forEach(function(em){
    var btn=document.createElement('div');
    btn.style.cssText='font-size:26px;text-align:center;padding:8px 4px;border-radius:12px;cursor:pointer;border:2px solid transparent;transition:all .15s;';
    btn.textContent=em;
    if(em===profEmoji){btn.style.borderColor='var(--gr)';btn.style.background='var(--grl)';}
    btn.addEventListener('click',function(){
      profEmoji=em;
      document.getElementById('prof-em-preview').textContent=em;
      grid.querySelectorAll('div').forEach(function(b){b.style.borderColor='transparent';b.style.background='';});
      btn.style.borderColor='var(--gr)';btn.style.background='var(--grl)';
    });
    grid.appendChild(btn);
  });
  show('s-ob3');
}
document.getElementById('btn-prof-done').addEventListener('click',async function(){
  var name=document.getElementById('prof-name').value.trim();
  if(_needsProfile&&supaUser){
    var username=document.getElementById('ob3-username').value.trim().toLowerCase();
    if(!username){document.getElementById('ob3-err').textContent='Please choose a username.';document.getElementById('ob3-err').style.display='block';return;}
    if(!/^[a-z0-9_]+$/.test(username)){document.getElementById('ob3-err').textContent='Letters, numbers and underscores only.';document.getElementById('ob3-err').style.display='block';return;}
    this.disabled=true;this.textContent='Saving…';
    var res=await _supa.from('profiles').insert({id:supaUser.id,username:username,display_name:name||username,emoji:profEmoji,email:supaUser.email});
    if(res.error){
      document.getElementById('ob3-err').textContent=res.error.code==='23505'?'That username is taken.':res.error.message;
      document.getElementById('ob3-err').style.display='block';
      this.disabled=false;this.textContent='Start growing 🌱';return;
    }
    _needsProfile=false;
  }
  profile.name=name;profile.emoji=profEmoji;
  onboarded=true;sv();launch();
});
document.getElementById('btn-prof-back').addEventListener('click',function(){
  show('s-ob2');oqStep=OQ.length-1;rOQ();
});

function openProfileEdit(){
  var tmpEmoji=profile.emoji||'🌱';
  var sh=document.getElementById('ed-sh');
  sh.innerHTML='<div style="display:flex;align-items:center;gap:8px;margin-bottom:16px;">'
    +'<button id="pe-back" aria-label="Back" style="background:none;border:none;font-size:24px;line-height:1;padding:0 4px 0 0;cursor:pointer;color:var(--tx2);">‹</button>'
    +'<div style="font-family:var(--serif);font-size:17px;font-weight:700;">Edit profile</div>'
    +'</div>'
    +'<div id="pe-account-section"></div>'
    +'<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">Your name</div>'
    +'<input id="pe-name" class="sinp" placeholder="e.g. Sillyblackcat" style="width:100%;font-size:16px;margin-bottom:18px;" maxlength="30">'
    +'<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:10px;">Your emblem</div>'
    +'<div id="pe-em-grid" style="display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin-bottom:20px;"></div>';
  document.getElementById('pe-back').addEventListener('click',function(){closeEd();setTimeout(openMenuPanel,180);});
  var peNameEl=document.getElementById('pe-name');peNameEl.value=profile.name||'';setTimeout(function(){peNameEl.select();},80);
  var grid=document.getElementById('pe-em-grid');
  PROF_EMOJIS.forEach(function(em){
    var btn=document.createElement('div');
    btn.style.cssText='font-size:26px;text-align:center;padding:8px 4px;border-radius:12px;cursor:pointer;border:2px solid transparent;transition:all .15s;';
    btn.textContent=em;
    if(em===tmpEmoji){btn.style.borderColor='var(--gr)';btn.style.background='var(--grl)';}
    btn.addEventListener('click',function(){
      tmpEmoji=em;
      grid.querySelectorAll('div').forEach(function(b){b.style.borderColor='transparent';b.style.background='';});
      btn.style.borderColor='var(--gr)';btn.style.background='var(--grl)';
    });
    grid.appendChild(btn);
  });
  var saveBtn=document.createElement('button');saveBtn.className='btn btn-p';saveBtn.textContent='Save';
  saveBtn.addEventListener('click',async function(){
    profile.name=document.getElementById('pe-name').value.trim();
    profile.emoji=tmpEmoji;
    if(supaUser){
      try{await _supa.from('profiles').update({display_name:profile.name,emoji:tmpEmoji}).eq('id',supaUser.id);}catch(e){}
    }
    sv();closeEd();rHome();
  });
  sh.appendChild(saveBtn);
  var cancelBtn=document.createElement('button');cancelBtn.className='btn btn-s';cancelBtn.style.marginTop='20px';cancelBtn.textContent='Cancel';
  cancelBtn.addEventListener('click',closeEd);
  sh.appendChild(cancelBtn);
  if(supaUser){
    var signOutBtn=document.createElement('button');signOutBtn.className='btn btn-s';signOutBtn.style.cssText='margin-top:8px;color:#EF4444;';signOutBtn.textContent='Sign out';
    signOutBtn.addEventListener('click',function(){closeEd();doSignOut();});
    sh.appendChild(signOutBtn);
    var resetTxt=document.createElement('div');resetTxt.style.cssText='margin-top:12px;font-size:11px;color:#EF4444;text-align:center;cursor:pointer;';resetTxt.textContent='Erase my data';
    resetTxt.addEventListener('click',function(){closeEd();document.getElementById('term-ov').classList.add('on');});
    sh.appendChild(resetTxt);
    // Async fetch username and insert account section
    _tq(_supa.from('profiles').select('username').eq('id',supaUser.id).single()).then(function(res){
      var sec=document.getElementById('pe-account-section');if(!sec)return;
      if(res.data&&res.data.username){sec.innerHTML='<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.7px;margin-bottom:8px;">Account</div><div style="background:var(--bg2);border-radius:12px;padding:10px 12px;margin-bottom:16px;"><div style="font-size:11px;color:var(--tx3);margin-bottom:2px;">Username</div><div style="font-size:15px;font-weight:600;color:var(--tx);">@'+res.data.username+'</div></div>';}
    }).catch(function(){});
  }
  requestAnimationFrame(function(){document.getElementById('ed-ov').classList.add('on');});
}
// ── NOTES ─────────────────────────────────────────────
var NOTE_SECTIONS=[
  {key:'goals',   emoji:'🎯', label:'To work on',  placeholder:'Goals, things to improve, skills to build…'},
  {key:'ideas',   emoji:'💡', label:'Ideas',        placeholder:'Things to try, approaches, experiments…'},
  {key:'blockers',emoji:'🚧', label:'What\'s stopping me', placeholder:'Doubts, obstacles, anything getting in the way…'},
  {key:'general', emoji:'📝', label:'General',      placeholder:'Anything else — links, references, random thoughts…'},
];
var PERSONAL_NOTE_SECTIONS=[
  {key:'thoughts', emoji:'💭', label:'Thoughts',       placeholder:'What\'s on your mind right now?'},
  {key:'intentions',emoji:'🌟',label:'Intentions',     placeholder:'What do you want to cultivate in yourself?'},
  {key:'patterns', emoji:'🧠', label:'Patterns',       placeholder:'Things you\'re noticing about yourself, habits, energy…'},
  {key:'freewrite',emoji:'📓', label:'Free write',     placeholder:'Open space — no structure needed…'},
];
var _noteSaveTimer=null;
// ── CALENDAR ──────────────────────────────────────────
var _CAT_DOT={Creative:'#C97FB8',Active:'#D4845A',Learning:'#5B8FD4',Social:'#4FA88A',Mindfulness:'#9272C8',Productive:'#C9A050',Digital:'#7077C4',Outdoor:'#5AAA76',Entertainment:'#C4A230',Personal:'#CC5272'};
var _calWeekOffset=0; // 0=current week, -1=last week, min -3
var _calDayDate=new Date();_calDayDate.setHours(0,0,0,0);
var _calNowTimer=null;

function _transitionSheet(sh,fn){
  sh.style.transition='opacity .12s ease,transform .12s ease';
  sh.style.opacity='0';sh.style.transform='translateY(4px)';
  setTimeout(function(){
    fn();
    sh.style.transition='opacity .18s ease,transform .2s cubic-bezier(.25,.46,.45,.94)';
    sh.style.transform='translateY(6px)';
    requestAnimationFrame(function(){
      requestAnimationFrame(function(){
        sh.style.opacity='1';sh.style.transform='translateY(0)';
        setTimeout(function(){sh.style.opacity='';sh.style.transform='';sh.style.transition='';},220);
      });
    });
  },130);
}

function _calMidnight(d){var m=new Date(d);m.setHours(0,0,0,0);return m;}
function _calWeekMon(offset){var n=new Date();n.setHours(0,0,0,0);var dow=n.getDay();var diff=dow===0?-6:1-dow;n.setDate(n.getDate()+diff+(offset||0)*7);return n;}
function _fmtHour(h){if(h==null)return 'Any time';return (h<10?'0':'')+h+':00';}

function openCalendar(){
  _calWeekOffset=0;
  var sh=document.getElementById('cal-sh');
  sh.style.cssText='max-width:480px;padding:20px 18px 28px;';
  sh.style.opacity='';sh.style.transform='';sh.style.transition='';
  renderCalWeek();
  document.getElementById('cal-ov').classList.add('on');
  setTimeout(checkCalPlanned,400);
}

function renderCalWeek(){
  var sh=document.getElementById('cal-sh');
  sh.style.cssText='max-width:480px;padding:0;max-height:88vh;display:flex;flex-direction:column;overflow:hidden;';
  document.getElementById('cal-title').parentElement.style.display='none';

  var DOWS=['M','T','W','T','F','S','S'];
  var MNAMES=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var today=new Date();today.setHours(0,0,0,0);

  // Fixed top: title bar + DOW header
  var existingTop=sh.querySelector('#cal-dynamic-top');if(existingTop)sh.removeChild(existingTop);
  var topBar=document.createElement('div');
  topBar.id='cal-dynamic-top';
  topBar.style.cssText='flex-shrink:0;padding:18px 18px 0;background:var(--bg);';

  var titleRow=document.createElement('div');
  titleRow.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;';
  var titleLbl=document.createElement('div');titleLbl.style.cssText='font-family:var(--serif);font-size:20px;font-weight:700;';titleLbl.textContent='Calendar';
  var closeBtn=document.createElement('button');closeBtn.className='iconbtn';closeBtn.setAttribute('aria-label','Close');closeBtn.textContent='×';
  closeBtn.addEventListener('click',function(){document.getElementById('cal-ov').classList.remove('on');});
  titleRow.appendChild(titleLbl);titleRow.appendChild(closeBtn);
  topBar.appendChild(titleRow);

  var dowHdr=document.createElement('div');
  dowHdr.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;padding-bottom:8px;border-bottom:.5px solid var(--bg3);';
  DOWS.forEach(function(d){var c=document.createElement('div');c.style.cssText='text-align:center;font-size:11px;font-weight:600;color:var(--tx3);';c.textContent=d;dowHdr.appendChild(c);});
  topBar.appendChild(dowHdr);
  sh.appendChild(topBar);

  // Scrollable body
  var body=document.getElementById('cal-body');
  body.innerHTML='';body.style.cssText='flex:1;overflow-y:auto;-webkit-overflow-scrolling:touch;padding:0 18px 28px;';
  sh.appendChild(body);

  var currentWeekEl=null;

  [-2,-1,0,1,2].forEach(function(wkOff){
    var mon=_calWeekMon(wkOff);
    var sun=new Date(mon);sun.setDate(mon.getDate()+6);
    var isCurrent=wkOff===0;

    // Collect week sessions first so we can use count in the label
    var wkSess=[];
    for(var wi=0;wi<7;wi++){var wd=new Date(mon);wd.setDate(mon.getDate()+wi);var wMid=wd.getTime();wkSess=wkSess.concat(sessions.filter(function(s){return s.date>=wMid&&s.date<wMid+86400000;}));}

    // Week label row
    var wkHeader=document.createElement('div');
    wkHeader.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-top:14px;margin-bottom:6px;';
    var wkLabel=document.createElement('div');
    wkLabel.style.cssText='font-size:11px;font-weight:700;color:'+(isCurrent?'var(--co)':'var(--tx3)')+';text-transform:uppercase;letter-spacing:.6px;';
    wkLabel.textContent=(wkOff===0?'This week · ':wkOff===1?'Next week · ':'')+MNAMES[mon.getMonth()]+' '+mon.getDate()+(mon.getMonth()!==sun.getMonth()?' – '+MNAMES[sun.getMonth()]+' '+sun.getDate():'–'+sun.getDate());
    wkHeader.appendChild(wkLabel);
    if(wkSess.length){
      var wkBadge=document.createElement('div');
      wkBadge.style.cssText='font-size:11px;font-weight:600;color:var(--co);cursor:pointer;padding:2px 0;';
      wkBadge.textContent=wkSess.length+' session'+(wkSess.length!==1?'s':'')+' ›';
      (function(m,ws){wkBadge.addEventListener('click',function(){_transitionSheet(sh,function(){renderCalWeekDetails(m,ws);});});})(mon,wkSess);
      wkHeader.appendChild(wkBadge);
    }
    if(isCurrent)currentWeekEl=wkHeader;
    body.appendChild(wkHeader);

    // 7-day grid
    var grid=document.createElement('div');
    grid.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:4px;';
    for(var di=0;di<7;di++){
      (function(dayOff){
        var d=new Date(mon);d.setDate(mon.getDate()+dayOff);
        var isToday=d.getTime()===today.getTime();
        var dayMid=d.getTime(),dayEnd=dayMid+86400000;
        var daySess=sessions.filter(function(s){return s.date>=dayMid&&s.date<dayEnd;});
        var dayPlanned=_livePlanned().filter(function(ev){return _calMidnight(new Date(ev.date)).getTime()===dayMid;});
        var dayOfWeek=d.getDay()===0?6:d.getDay()-1;
        var dayRoutines=_liveRoutines().filter(function(r){return _routineOnDay(r,d);});
        var cell=document.createElement('div');
        // Date with its dots right underneath, the pair centred in the cell
        cell.style.cssText='position:relative;border-radius:10px;padding:6px 3px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;cursor:pointer;transition:transform .12s;min-height:54px;'+(isToday?'background:var(--co);':'background:var(--bg2);');
        cell.addEventListener('touchstart',function(){cell.style.transform='scale(.94)';},{passive:true});
        cell.addEventListener('touchend',function(){cell.style.transform='';},{passive:true});
        var num=document.createElement('div');num.style.cssText='font-size:13px;font-weight:'+(isToday?'700':'500')+';color:'+(isToday?'#fff':'var(--tx)')+';line-height:1;';num.textContent=d.getDate();cell.appendChild(num);
        var dotsWrap=document.createElement('div');dotsWrap.style.cssText='display:flex;flex-wrap:wrap;justify-content:center;gap:2px;pointer-events:none;';
        var cats=[...new Set(daySess.map(function(s){var a=myActs.find(function(x){return x.id===s.actId;})||{};return a.cat||'';}))].slice(0,3);
        cats.forEach(function(cat){var dot=document.createElement('div');dot.style.cssText='width:5px;height:5px;border-radius:50%;background:'+(_CAT_DOT[cat]||'var(--gr)')+';flex-shrink:0;'+(isToday?'opacity:.85;':'');dotsWrap.appendChild(dot);});
        if(dayPlanned.length||dayRoutines.length){var pd=document.createElement('div');pd.style.cssText='width:5px;height:5px;border-radius:50%;border:1.5px solid '+(isToday?'rgba(255,255,255,.7)':'var(--co)')+';flex-shrink:0;';dotsWrap.appendChild(pd);}
        if(dotsWrap.childNodes.length)cell.appendChild(dotsWrap);
        cell.addEventListener('click',function(){_transitionSheet(sh,function(){renderCalDay(d);});});
        grid.appendChild(cell);
      })(di);
    }
    body.appendChild(grid);
  });

  // Routines section
  var _liveRt=_liveRoutines();
  if(_liveRt.length){
    var rtSec=document.createElement('div');rtSec.style.cssText='margin-top:18px;';
    var rtHdr=document.createElement('div');rtHdr.style.cssText='font-size:11px;font-weight:700;color:var(--co2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;';rtHdr.textContent='Routines';rtSec.appendChild(rtHdr);
    var DNAMES_SHORT=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    _liveRt.forEach(function(r){
      var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:10px;padding:9px 10px;background:var(--bg2);border-radius:10px;margin-bottom:6px;cursor:pointer;';
      var dayStr=r.days.length===7?'Every day':r.days.length===5&&r.days.every(function(d){return d<5;})?'Weekdays':r.days.map(function(d){return DNAMES_SHORT[d];}).join(', ');
      var untilStr=r.until?(_dayKey(Date.now())>r.until?' · ended ':' · until ')+fmtDeadlineShort(r.until):'';
      var _ra=_actById(r.actId)||{};
      row.innerHTML='<span style="font-size:18px;">'+(_ra.emoji||r.actEmoji)+'</span><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:var(--tx);">'+esc(_ra.name||r.actName)+'</div><div style="font-size:11px;color:var(--tx3);">'+dayStr+' · '+_fmtHour(r.hour)+untilStr+'</div></div><button class="rt-edit" aria-label="Edit routine" style="background:none;border:none;cursor:pointer;color:var(--tx3);padding:4px;flex-shrink:0;display:flex;">'+EDIT_PEN_SVG.replace('width="12" height="12"','width="14" height="14"')+'</button><button class="rt-del" aria-label="Remove routine" style="background:none;border:none;font-size:16px;cursor:pointer;color:var(--tx3);padding:2px 4px;flex-shrink:0;">✕</button>';
      row.querySelector('.rt-edit').addEventListener('click',function(e){e.stopPropagation();editRoutine(r);});
      row.querySelector('.rt-del').addEventListener('click',function(e){e.stopPropagation();if(!confirm('Remove this routine?'))return;calRoutines=calRoutines.filter(function(x){return x.id!==r.id;});sv();renderCalWeek();updateHomeNudge();});
      rtSec.appendChild(row);
    });
    body.appendChild(rtSec);
  }

  // Scroll to current week
  if(currentWeekEl){setTimeout(function(){currentWeekEl.scrollIntoView({block:'start',behavior:'instant'});},30);}
}

function _drawPieSVG(slices,size){
  var total=slices.reduce(function(s,d){return s+d.v;},0);
  if(!total)return '';
  var cx=size/2,cy=size/2,r=size/2-3,angle=-Math.PI/2;
  var svg='<svg width="'+size+'" height="'+size+'" viewBox="0 0 '+size+' '+size+'">';
  if(slices.length===1){svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+r+'" fill="'+slices[0].c+'"/>';}
  else{slices.forEach(function(d){if(!d.v)return;var sweep=2*Math.PI*d.v/total;var x1=cx+r*Math.cos(angle),y1=cy+r*Math.sin(angle),x2=cx+r*Math.cos(angle+sweep),y2=cy+r*Math.sin(angle+sweep),large=sweep>Math.PI?1:0;svg+='<path d="M '+cx+' '+cy+' L '+x1.toFixed(2)+' '+y1.toFixed(2)+' A '+r+' '+r+' 0 '+large+' 1 '+x2.toFixed(2)+' '+y2.toFixed(2)+' Z" fill="'+d.c+'"/>';angle+=sweep;});}
  svg+='<circle cx="'+cx+'" cy="'+cy+'" r="'+(r*0.46)+'" fill="var(--bg2)"/>';
  svg+='</svg>';return svg;
}

function renderCalWeekDetails(mon,wkSess){
  var sh=document.getElementById('cal-sh');
  sh.style.cssText='max-width:480px;padding:0;max-height:88vh;height:88vh;overflow:hidden;display:flex;flex-direction:column;';
  document.getElementById('cal-title').parentElement.style.display='none';
  var _dynTop=sh.querySelector('#cal-dynamic-top');if(_dynTop)_dynTop.style.display='none';
  var body=document.getElementById('cal-body');body.innerHTML='';
  body.style.cssText='flex:1;overflow-y:auto;display:flex;flex-direction:column;';

  var MNAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];
  var sun=new Date(mon);sun.setDate(mon.getDate()+6);
  var wkMins=wkSess.reduce(function(t,s){return t+(s.hours||0)*60+(s.mins||0);},0);

  // Header
  var navHdr=document.createElement('div');
  navHdr.style.cssText='padding:22px 16px 18px;border-bottom:.5px solid var(--bg2);flex-shrink:0;background:var(--bg);';
  var topRow=document.createElement('div');topRow.style.cssText='display:flex;align-items:center;justify-content:space-between;margin-bottom:6px;';
  var lbl=document.createElement('div');lbl.style.cssText='font-family:var(--serif);font-size:17px;font-weight:700;margin-left:2px;margin-top:2px;';lbl.textContent='Week breakdown';
  var closeBtn=document.createElement('button');closeBtn.className='iconbtn';closeBtn.setAttribute('aria-label','Close');closeBtn.textContent='×';
  closeBtn.addEventListener('click',function(){document.getElementById('cal-ov').classList.remove('on');});
  topRow.appendChild(lbl);topRow.appendChild(closeBtn);
  var dateRow=document.createElement('div');dateRow.style.cssText='display:flex;align-items:center;gap:16px;';
  var backBtn=document.createElement('button');
  backBtn.className='iconbtn back';backBtn.setAttribute('aria-label','Back');backBtn.textContent='‹';
  backBtn.addEventListener('click',function(){sh.style.cssText='max-width:480px;padding:28px 20px 28px;';_transitionSheet(sh,renderCalWeek);});
  var titleWrap=document.createElement('div');titleWrap.style.cssText='flex:1;min-width:0;font-size:14px;font-weight:500;color:var(--tx2);';
  titleWrap.textContent=MNAMES[mon.getMonth()]+' '+mon.getDate()+'–'+sun.getDate();
  dateRow.appendChild(backBtn);dateRow.appendChild(titleWrap);
  navHdr.appendChild(topRow);navHdr.appendChild(dateRow);
  body.appendChild(navHdr);

  var content=document.createElement('div');content.style.cssText='padding:16px;flex:1;';

  // Summary strip
  var strip=document.createElement('div');strip.style.cssText='display:flex;gap:8px;margin-bottom:20px;';
  [{n:wkSess.length,l:'Sessions'},{n:_fmtMins(wkMins),l:'Total time'},{n:[...new Set(wkSess.map(function(s){return s.actId;}))].length,l:'Activities'}].forEach(function(d){
    var c=document.createElement('div');c.style.cssText='flex:1;background:var(--bg2);border-radius:12px;padding:10px 8px;text-align:center;';
    c.innerHTML='<div style="font-family:var(--serif);font-size:18px;font-weight:700;color:var(--co);">'+d.n+'</div><div style="font-size:10px;color:var(--tx3);margin-top:1px;">'+d.l+'</div>';
    strip.appendChild(c);
  });
  content.appendChild(strip);

  // By category
  var catMap={};
  wkSess.forEach(function(s){var a=myActs.find(function(x){return x.id===s.actId;})||{cat:''};var cat=a.cat||'Other';var m=(s.hours||0)*60+(s.mins||0);catMap[cat]=(catMap[cat]||0)+m;});
  var catEntries=Object.keys(catMap).map(function(k){return{label:k,v:catMap[k],c:_CAT_DOT[k]||'var(--gr)'};}).sort(function(a,b){return b.v-a.v;});

  if(catEntries.length){
    var catHdr=document.createElement('div');catHdr.style.cssText='font-size:11px;font-weight:700;color:var(--co2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:12px;';catHdr.textContent='By category';content.appendChild(catHdr);
    var pieRow=document.createElement('div');pieRow.style.cssText='display:flex;align-items:center;gap:16px;margin-bottom:16px;';
    var pieSVG=document.createElement('div');pieSVG.style.cssText='flex-shrink:0;';
    pieSVG.innerHTML=_drawPieSVG(catEntries,120);
    var legend=document.createElement('div');legend.style.cssText='flex:1;display:flex;flex-direction:column;gap:6px;';
    catEntries.forEach(function(d){
      var pct=Math.round(d.v/wkMins*100);
      var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:7px;';
      row.innerHTML='<div style="width:10px;height:10px;border-radius:3px;background:'+d.c+';flex-shrink:0;"></div><div style="flex:1;font-size:12px;color:var(--tx);">'+d.label+'</div><div style="font-size:11px;font-weight:600;color:var(--tx2);">'+pct+'%</div>';
      legend.appendChild(row);
    });
    pieRow.appendChild(pieSVG);pieRow.appendChild(legend);content.appendChild(pieRow);
  }

  // By activity
  var actMap={};
  wkSess.forEach(function(s){var m=(s.hours||0)*60+(s.mins||0);if(!actMap[s.actId])actMap[s.actId]={actId:s.actId,mins:0,count:0};actMap[s.actId].mins+=m;actMap[s.actId].count++;});
  var actEntries=Object.keys(actMap).map(function(k){var a=myActs.find(function(x){return x.id===k;})||archivedActs.find(function(x){return x.id===k;})||(wkSess.find(function(s){return s.actId===k;})||{});return{emoji:a.emoji||'🌱',name:a.name||'Unknown',cat:a.cat||'',mins:actMap[k].mins,count:actMap[k].count};}).sort(function(a,b){return b.mins-a.mins;});

  if(actEntries.length){
    var actHdr=document.createElement('div');actHdr.style.cssText='font-size:11px;font-weight:700;color:var(--co2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:10px;';actHdr.textContent='By activity';content.appendChild(actHdr);
    actEntries.forEach(function(a){
      var pct=wkMins?Math.round(a.mins/wkMins*100):0;
      var cc=CAT_COLORS[a.cat]?CAT_COLORS[a.cat].split(','):['var(--bg2)','var(--tx)'];
      var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border:var(--br);border-radius:12px;box-shadow:var(--sh);margin-bottom:10px;';
      row.innerHTML='<span style="font-size:18px;flex-shrink:0;">'+a.emoji+'</span>'
        +'<div style="flex:1;min-width:0;">'
          +'<div style="display:flex;justify-content:space-between;margin-bottom:4px;">'
            +'<span style="font-size:13px;font-weight:600;color:var(--tx);">'+a.name+'</span>'
            +'<span style="font-size:11px;color:var(--tx3);">'+_fmtMins(a.mins)+' · '+a.count+'x</span>'
          +'</div>'
          +'<div style="height:5px;background:var(--bg3);border-radius:3px;overflow:hidden;">'
            +'<div style="height:100%;width:'+pct+'%;background:'+(_CAT_DOT[a.cat]||'var(--gr)')+';border-radius:3px;"></div>'
          +'</div>'
        +'</div>';
      content.appendChild(row);
    });
  }

  body.appendChild(content);
}

function renderCalDay(dateObj){
  _calDayDate=_calMidnight(dateObj);
  var sh=document.getElementById('cal-sh');
  sh.style.cssText='max-width:480px;padding:0;max-height:88vh;height:88vh;overflow:hidden;display:flex;flex-direction:column;';
  document.getElementById('cal-title').parentElement.style.display='none';
  var _dynTop=sh.querySelector('#cal-dynamic-top');if(_dynTop)_dynTop.style.display='none';
  var body=document.getElementById('cal-body');body.innerHTML='';
  body.style.cssText='flex:1;overflow-y:auto;display:flex;flex-direction:column;';

  var today=new Date();today.setHours(0,0,0,0);
  var isToday=_calDayDate.getTime()===today.getTime();
  var isFuture=_calDayDate>today;
  var DNAMES=['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var MNAMES=['January','February','March','April','May','June','July','August','September','October','November','December'];

  // Header
  var navHdr=document.createElement('div');
  // gap must clear the back button's hover background: .iconbtn bleeds 10px
  // past its layout box (padding 6/10 with matching negative margin), so an
  // 8px gap let the hover tint run under the date.
  navHdr.style.cssText='display:flex;align-items:center;gap:16px;padding:16px 16px 18px;border-bottom:.5px solid var(--bg2);flex-shrink:0;background:var(--bg);';
  var backBtn=document.createElement('button');
  backBtn.className='iconbtn back';backBtn.setAttribute('aria-label','Back');
  backBtn.textContent='‹';
  backBtn.addEventListener('click',function(){sh.style.cssText='max-width:480px;padding:20px 18px 28px;';_transitionSheet(sh,renderCalWeek);});
  var titleWrap=document.createElement('div');titleWrap.style.cssText='flex:1;min-width:0;';
  if(isToday){var todayLbl=document.createElement('div');todayLbl.style.cssText='font-size:10px;font-weight:700;color:var(--co);text-transform:uppercase;letter-spacing:.8px;';todayLbl.textContent='Today';titleWrap.appendChild(todayLbl);}
  var dateLbl=document.createElement('div');dateLbl.style.cssText='font-family:var(--serif);font-size:16px;font-weight:700;color:var(--tx);';
  dateLbl.textContent=DNAMES[_calDayDate.getDay()]+', '+_calDayDate.getDate()+' '+MNAMES[_calDayDate.getMonth()];
  titleWrap.appendChild(dateLbl);
  var calDayCloseBtn=document.createElement('button');calDayCloseBtn.className='iconbtn';calDayCloseBtn.setAttribute('aria-label','Close');calDayCloseBtn.textContent='×';
  calDayCloseBtn.addEventListener('click',function(){document.getElementById('cal-ov').classList.remove('on');});
  var navBtns=document.createElement('div');navBtns.style.cssText='display:flex;gap:4px;flex-shrink:0;';
  ['‹','›'].forEach(function(ar,i){
    var b=document.createElement('button');b.style.cssText='background:var(--bg2);border:var(--br);border-radius:8px;width:34px;height:34px;font-size:15px;cursor:pointer;display:flex;align-items:center;justify-content:center;box-shadow:var(--sh);touch-action:manipulation;';
    b.setAttribute('aria-label',i===0?'Previous day':'Next day');
    b.textContent=ar;
    b.addEventListener('click',function(){
      var nd=new Date(_calDayDate);nd.setDate(nd.getDate()+(i===0?-1:1));
      var earliest=_calWeekMon(-2);
      var latest=_calWeekMon(2);latest.setDate(latest.getDate()+6);
      if(nd<earliest||nd>latest)return;
      _transitionSheet(sh,function(){renderCalDay(nd);});
    });
    navBtns.appendChild(b);
  });
  navHdr.appendChild(backBtn);navHdr.appendChild(titleWrap);navHdr.appendChild(calDayCloseBtn);
  body.appendChild(navHdr);

  var content=document.createElement('div');content.style.cssText='padding:16px;flex:1;';

  // Logged sessions
  var dayMid=_calDayDate.getTime(),dayEnd=dayMid+86400000;
  var daySess=sessions.filter(function(s){return s.date>=dayMid&&s.date<dayEnd;}).sort(function(a,b){return a.date-b.date;});

  var logHdr=document.createElement('div');logHdr.style.cssText='font-size:11px;font-weight:700;color:var(--co2);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;';logHdr.textContent='Logged';
  content.appendChild(logHdr);

  if(daySess.length){
    daySess.forEach(function(s){
      var act=myActs.find(function(a){return a.id===s.actId;})||archivedActs.find(function(a){return a.id===s.actId;})||(s.actName?{emoji:s.actEmoji||'📋',name:s.actName,cat:''}:{emoji:'📋',name:'Deleted activity',cat:''});
      var cc=CAT_COLORS[act.cat]?CAT_COLORS[act.cat].split(','):['var(--bg2)','var(--tx)'];
      var dur=_fmtMins((s.hours||0)*60+(s.mins||0));
      var card=document.createElement('div');card.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 12px;background:'+cc[0]+';border-radius:12px;margin-bottom:6px;';
      var d=new Date(s.date);var timeStr=(d.getHours()<10?'0':'')+d.getHours()+':'+(d.getMinutes()<10?'0':'')+d.getMinutes();
      card.innerHTML='<span style="font-size:20px;flex-shrink:0;">'+act.emoji+'</span><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:'+cc[1]+';">'+act.name+'</div><div style="font-size:11px;color:'+cc[1]+';opacity:.7;">'+dur+(s.rating?'&nbsp;·&nbsp;★ '+normRating(s.rating):'')+'</div></div><div style="font-size:11px;color:'+cc[1]+';opacity:.6;flex-shrink:0;">'+timeStr+'</div>';
      content.appendChild(card);
    });
  } else {
    var none=document.createElement('div');none.style.cssText='font-size:13px;color:var(--tx3);padding:4px 0 14px;';none.textContent='Nothing logged yet.';content.appendChild(none);
  }

  // Scheduled section
  var dayOfWeek=_calDayDate.getDay()===0?6:_calDayDate.getDay()-1;
  var dayPlanned=_livePlanned().filter(function(ev){return _calMidnight(new Date(ev.date)).getTime()===dayMid;}).sort(function(a,b){var ah=a.hour==null?9999:a.hour;var bh=b.hour==null?9999:b.hour;return ah-bh;});
  var dayRoutines=_liveRoutines().filter(function(r){return _routineOnDay(r,_calDayDate);});

  if(dayPlanned.length||dayRoutines.length||true){
    var schHdr=document.createElement('div');schHdr.style.cssText='font-size:11px;font-weight:700;color:var(--co2);text-transform:uppercase;letter-spacing:.6px;margin-top:16px;margin-bottom:8px;';schHdr.textContent='Scheduled';
    content.appendChild(schHdr);

    dayRoutines.forEach(function(r){
      var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--col);border-radius:12px;margin-bottom:6px;';
      row.innerHTML='<span style="font-size:18px;flex-shrink:0;">'+r.actEmoji+'</span><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:var(--co2);">'+r.actName+'</div><div style="font-size:11px;color:var(--co2);opacity:.75;">Routine · '+_fmtHour(r.hour)+(r.duration?(' · '+_fmtMins(r.duration*60)):'')+'</div></div>';
      content.appendChild(row);
    });

    dayPlanned.forEach(function(ev){
      var isPast=ev.hour==null?(ev.date+86400000<=Date.now()):(new Date(ev.date).setHours(ev.hour+Math.ceil(ev.duration||1),0,0,0)<=Date.now());
      var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border-radius:12px;margin-bottom:6px;cursor:pointer;';
      row.innerHTML='<span style="font-size:18px;flex-shrink:0;">'+ev.actEmoji+'</span><div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:var(--tx);">'+ev.actName+'</div><div style="font-size:11px;color:var(--tx3);">Planned · '+_fmtHour(ev.hour)+(ev.duration?(' · '+_fmtMins(ev.duration*60)):'')+'</div></div>'+(isPast?'<button style="background:var(--gr);color:#fff;border:none;border-radius:8px;padding:4px 10px;font-size:11px;font-weight:600;cursor:pointer;flex-shrink:0;">Log</button>':'<button aria-label="Remove planned event" style="background:none;border:none;font-size:15px;cursor:pointer;color:var(--tx3);flex-shrink:0;">✕</button>');
      var btn=row.querySelector('button');
      if(isPast){
        btn.addEventListener('click',function(e){e.stopPropagation();document.getElementById('cal-ov').classList.remove('on');calPlanned=calPlanned.filter(function(p){return p.id!==ev.id;});sv();var act=myActs.find(function(a){return a.id===ev.actId;});if(act){setupLogScreen(act.id,'home',null);}});
      } else {
        btn.addEventListener('click',function(e){e.stopPropagation();if(!confirm('Remove this scheduled event?'))return;calPlanned=calPlanned.filter(function(p){return p.id!==ev.id;});sv();renderCalDay(_calDayDate);});
      }
      content.appendChild(row);
    });

    if(!dayPlanned.length&&!dayRoutines.length){
      var noneS=document.createElement('div');noneS.style.cssText='font-size:13px;color:var(--tx3);padding:4px 0;';noneS.textContent='Nothing scheduled.';content.appendChild(noneS);
    }
  }

  // Add schedule button
  var addBtn=document.createElement('button');
  addBtn.style.cssText='margin-top:16px;width:100%;padding:11px;background:var(--bg2);border:var(--br);border-radius:var(--rad);font-size:13px;font-weight:600;color:var(--tx2);cursor:pointer;display:flex;align-items:center;justify-content:center;gap:6px;box-shadow:var(--sh);';
  addBtn.innerHTML='<span>+</span><span>Schedule something</span>';
  addBtn.addEventListener('click',function(){_calScheduleForm(_calDayDate);});
  content.appendChild(addBtn);

  body.appendChild(content);

  var bottomNav=document.createElement('div');
  bottomNav.style.cssText='display:flex;justify-content:center;gap:16px;padding:12px 16px 20px;flex-shrink:0;border-top:.5px solid var(--bg2);background:var(--bg);';
  navBtns.style.cssText='display:flex;gap:16px;';
  bottomNav.appendChild(navBtns);
  body.appendChild(bottomNav);
}

function _calScheduleForm(dayDate){
  var ov=document.getElementById('ed-ov'),sh=document.getElementById('ed-sh');sh.innerHTML='';
  var t=document.createElement('div');t.style.cssText='font-family:var(--serif);font-size:18px;font-weight:700;margin-bottom:16px;';t.textContent='Schedule';sh.appendChild(t);

  // Activity picker with search (multi-select)
  var aLbl=document.createElement('div');aLbl.style.cssText='font-size:11px;font-weight:700;color:var(--tx3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;';aLbl.textContent='Activities';sh.appendChild(aLbl);
  var _selActs=[];
  // Search and the focus filter share one row — the filter is a compact
  // square toggle so the search field keeps nearly all the width.
  var aSearchRow=document.createElement('div');
  aSearchRow.style.cssText='display:flex;align-items:stretch;gap:6px;margin-bottom:8px;';
  var aSearch=document.createElement('input');
  aSearch.type='search';aSearch.placeholder='Search seeds…';aSearch.className='sinp';
  aSearch.style.cssText='flex:1;min-width:0;padding:9px 12px;border-radius:10px;border:1px solid var(--bg3);background:var(--card);font-size:14px;outline:none;-webkit-appearance:none;';
  aSearchRow.appendChild(aSearch);
  // Only worth showing when a focus set exists — otherwise it would filter to
  // everything and read as broken.
  var _aFocusOnly=false;
  var aFocBtn=null;
  if(hasFocusSet()){
    aFocBtn=document.createElement('button');
    aFocBtn.type='button';
    aFocBtn.textContent='🎯';
    aFocBtn.title='Show only seeds in focus';
    aFocBtn.setAttribute('aria-label','Show only seeds in focus');
    aFocBtn.setAttribute('aria-pressed','false');
    function _paintFocBtn(){
      aFocBtn.style.cssText='flex-shrink:0;width:38px;border:1px solid '+(_aFocusOnly?'var(--gr)':'var(--bg3)')+';background:'+(_aFocusOnly?'var(--grl)':'var(--card)')+';border-radius:10px;font-size:15px;line-height:1;cursor:pointer;font-family:inherit;padding:0;display:flex;align-items:center;justify-content:center;opacity:'+(_aFocusOnly?'1':'.55')+';transition:background .12s,border-color .12s,opacity .12s;';
      aFocBtn.setAttribute('aria-pressed',_aFocusOnly?'true':'false');
    }
    _paintFocBtn();
    aFocBtn.addEventListener('click',function(){_aFocusOnly=!_aFocusOnly;_paintFocBtn();_renderActPicker();});
    aSearchRow.appendChild(aFocBtn);
  }
  sh.appendChild(aSearchRow);
  var aList=document.createElement('div');
  aList.style.cssText='display:flex;flex-direction:column;gap:4px;margin-bottom:22px;max-height:140px;overflow-y:auto;';
  sh.appendChild(aList);
  function _isSelActs(id){return _selActs.some(function(x){return x.id===id;});}
  function _renderActPicker(){
    var q=(aSearch.value||'').trim().toLowerCase();
    aList.innerHTML='';
    var matches=myActs.filter(function(a){
      if(_aFocusOnly&&weeklyFocus.actIds.indexOf(a.id)===-1)return false;
      return !q||a.name.toLowerCase().indexOf(q)>-1||a.emoji.indexOf(q)>-1;
    });
    if(!matches.length){var none=document.createElement('div');none.style.cssText='padding:12px;text-align:center;color:var(--tx3);font-size:13px;';none.textContent=_aFocusOnly?'Nothing in focus matches.':'No matches';aList.appendChild(none);return;}
    matches.forEach(function(a){
      var on=_isSelActs(a.id);
      var p=document.createElement('div');
      p.style.cssText='display:flex;align-items:center;gap:10px;padding:9px 12px;border-radius:10px;cursor:pointer;background:'+(on?'var(--grl)':'var(--bg2)')+';border:1.5px solid '+(on?'var(--gr)':'transparent')+';transition:background .12s,border-color .12s;';
      p.innerHTML='<span style="font-size:16px;">'+a.emoji+'</span><span style="font-size:14px;font-weight:500;color:var(--tx);flex:1;">'+a.name+'</span>'+(on?'<span style="color:var(--gr);font-weight:700;">✓</span>':'');
      p.addEventListener('click',(function(act){return function(){var i=_selActs.findIndex(function(x){return x.id===act.id;});if(i>-1)_selActs.splice(i,1);else _selActs.push(act);_renderActPicker();};})(a));
      aList.appendChild(p);
    });
  }
  aSearch.addEventListener('input',_renderActPicker);
  _renderActPicker();

  // Time picker (optional)
  var tLbl=document.createElement('div');tLbl.style.cssText='font-size:11px;font-weight:700;color:var(--tx3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;';tLbl.innerHTML='Time';sh.appendChild(tLbl);
  var timeRow=document.createElement('div');timeRow.style.cssText='display:flex;gap:8px;margin-bottom:22px;align-items:center;';
  var hourSel=document.createElement('select');hourSel.className='sinp';hourSel.style.cssText='flex:1;padding:8px;font-size:14px;';
  var anyOpt=document.createElement('option');anyOpt.value='-1';anyOpt.textContent='Any time';anyOpt.selected=true;hourSel.appendChild(anyOpt);
  for(var h=0;h<24;h++){var o=document.createElement('option');o.value=h;o.textContent=(h<10?'0':'')+h+':00';hourSel.appendChild(o);}
  timeRow.appendChild(hourSel);sh.appendChild(timeRow);

  // Duration
  var dLbl=document.createElement('div');dLbl.style.cssText='font-size:11px;font-weight:700;color:var(--tx3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;';dLbl.innerHTML='Duration';sh.appendChild(dLbl);
  var durRow=document.createElement('div');durRow.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-bottom:22px;';
  var _dur=1;
  // null = no set duration. Every display site already guards on a falsy
  // duration, and the "is it past yet?" checks fall back to an hour.
  [{v:null,l:'Open'},{v:.5,l:'30m'},{v:1,l:'1h'},{v:1.5,l:'1.5h'},{v:2,l:'2h'},{v:3,l:'3h'}].forEach(function(d){
    var b=document.createElement('div');b.className='fb'+(d.v===_dur?' on':'');b.textContent=d.l;
    if(d.v===null)b.title='No set duration';
    b.addEventListener('click',function(){_dur=d.v;durRow.querySelectorAll('.fb').forEach(function(x){x.classList.remove('on');});b.classList.add('on');});
    durRow.appendChild(b);
  });sh.appendChild(durRow);

  // Repeat / Routine
  var rLbl=document.createElement('div');rLbl.style.cssText='font-size:11px;font-weight:700;color:var(--tx3);margin-bottom:8px;text-transform:uppercase;letter-spacing:.5px;';rLbl.textContent='Repeat';sh.appendChild(rLbl);
  var _isRoutine=false;
  var repRow=document.createElement('div');repRow.style.cssText='display:flex;gap:6px;margin-bottom:10px;';
  var onceBtn=document.createElement('div');onceBtn.className='fb on';onceBtn.textContent='One-off';
  var routBtn=document.createElement('div');routBtn.className='fb';routBtn.textContent='Routine';
  var dayPicker=document.createElement('div');dayPicker.style.cssText='display:none;margin-bottom:16px;';
  var dpLbl=document.createElement('div');dpLbl.style.cssText='font-size:11px;font-weight:600;color:var(--tx3);margin-bottom:8px;';dpLbl.textContent='Which days?';dayPicker.appendChild(dpLbl);
  // Quick sets, named the way the calendar already labels a saved routine
  // ("Every day", "Weekdays"), so picking and reading back use one vocabulary.
  var _selDays=[];
  var _dayBtns=[];
  function _paintDays(){
    _dayBtns.forEach(function(b,i){b.classList.toggle('on',_selDays.indexOf(i)>-1);});
    _quickBtns.forEach(function(q){
      var same=q.days.length===_selDays.length&&q.days.every(function(d){return _selDays.indexOf(d)>-1;});
      q.el.classList.toggle('on',same);
    });
  }
  function _setDays(days){
    // Tapping the set you're already on clears it, so it works as a toggle.
    var same=days.length===_selDays.length&&days.every(function(d){return _selDays.indexOf(d)>-1;});
    _selDays=same?[]:days.slice();
    _paintDays();
  }
  var _quickBtns=[];
  var quickRow=document.createElement('div');quickRow.style.cssText='display:flex;gap:6px;flex-wrap:wrap;margin-bottom:8px;';
  [{l:'Every day',days:[0,1,2,3,4,5,6]},{l:'Weekdays',days:[0,1,2,3,4]},{l:'Weekend',days:[5,6]}].forEach(function(q){
    var b=document.createElement('button');b.type='button';b.className='fb';b.textContent=q.l;
    b.style.cssText='font-family:inherit;cursor:pointer;';
    b.addEventListener('click',function(){_setDays(q.days);});
    _quickBtns.push({el:b,days:q.days});
    quickRow.appendChild(b);
  });
  dayPicker.appendChild(quickRow);
  // Seven equal columns with initials, so the week always reads as one row —
  // "Sun" used to wrap onto a line of its own. Full names stay in the title
  // and aria-label, which also tells the two S's apart.
  var DINITIALS=['M','T','W','Th','F','S','S'];
  var DNAMES_FULL=['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday','Sunday'];
  var dpRow=document.createElement('div');dpRow.style.cssText='display:grid;grid-template-columns:repeat(7,1fr);gap:5px;';
  DINITIALS.forEach(function(dn,i){
    var db=document.createElement('div');db.className='fb';db.textContent=dn;
    db.style.cssText='min-width:0;text-align:center;padding-left:0;padding-right:0;';
    db.title=DNAMES_FULL[i];
    db.setAttribute('role','button');
    db.setAttribute('aria-label',DNAMES_FULL[i]);
    db.addEventListener('click',function(){
      var idx=_selDays.indexOf(i);
      if(idx>-1)_selDays.splice(idx,1); else _selDays.push(i);
      _paintDays();
    });
    _dayBtns.push(db);
    dpRow.appendChild(db);
  });
  dayPicker.appendChild(dpRow);
  onceBtn.addEventListener('click',function(){_isRoutine=false;onceBtn.classList.add('on');routBtn.classList.remove('on');dayPicker.style.display='none';});
  routBtn.addEventListener('click',function(){_isRoutine=true;routBtn.classList.add('on');onceBtn.classList.remove('on');dayPicker.style.display='block';});
  repRow.appendChild(onceBtn);repRow.appendChild(routBtn);sh.appendChild(repRow);sh.appendChild(dayPicker);

  var btnRow=document.createElement('div');btnRow.style.cssText='display:flex;gap:8px;margin-top:8px;';
  var cancelB=document.createElement('button');cancelB.className='btn btn-s';cancelB.style.flex='1';cancelB.textContent='Cancel';cancelB.addEventListener('click',function(){ov.classList.remove('on');});
  var saveB=document.createElement('button');saveB.className='btn btn-p';saveB.style.flex='1';saveB.textContent='Save';
  saveB.addEventListener('click',function(){
    if(!_selActs.length){showToast('Pick at least one activity',null);return;}
    var hourVal=parseInt(hourSel.value);
    var hour=hourVal>=0?hourVal:null;
    if(_isRoutine){
      if(!_selDays.length){showToast('Pick at least one day',null);return;}
      _selActs.forEach(function(a){calRoutines.push({id:genUUID(),actId:a.id,actName:a.name,actEmoji:a.emoji,cat:a.cat||'',days:_selDays.slice(),hour:hour,duration:_dur});});
      sv();ov.classList.remove('on');
      if(document.getElementById('cal-ov').classList.contains('on'))renderCalDay(dayDate);
      if(document.getElementById('s-home').classList.contains('on'))rHome();
      updateHomeNudge();
      showToast(_selActs.length>1?_selActs.length+' routines added':'Routine added: '+_selActs[0].emoji+' '+_selActs[0].name,null);
    } else {
      _selActs.forEach(function(a){calPlanned.push({id:genUUID(),actId:a.id,actName:a.name,actEmoji:a.emoji,cat:a.cat||'',date:_calMidnight(dayDate).getTime(),hour:hour,duration:_dur,notified:false});});
      sv();ov.classList.remove('on');
      if(document.getElementById('cal-ov').classList.contains('on'))renderCalDay(dayDate);
      if(document.getElementById('s-home').classList.contains('on'))rHome();
      updateHomeNudge();
      showToast(_selActs.length>1?_selActs.length+' activities scheduled':'Scheduled '+_selActs[0].emoji+' '+_selActs[0].name,null);
    }
  });
  btnRow.appendChild(cancelB);btnRow.appendChild(saveB);sh.appendChild(btnRow);ov.classList.add('on');
}


function updateHomeNudge(){
  // v2: today's schedule now lives inside 'On today's list' — legacy nudge disabled
  var el=document.getElementById('home-due');if(el)el.innerHTML='';
}

// Mondays: offer once to go over the week's focus
function checkMondayFocus(){
  var now=new Date(),today=_dayKey(now.getTime());
  if(now.getDay()!==1||!onboarded||!myActs.length||weeklyFocus.askedOn===today)return;
  var ov=document.getElementById('ed-ov');
  if(ov.classList.contains('on')||document.querySelector('.ov.on'))return; // don't stack on another sheet
  weeklyFocus.askedOn=today;sv();
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var t=document.createElement('div');t.style.cssText='font-family:var(--serif);font-size:20px;font-weight:700;margin-bottom:6px;';t.textContent='New week 🌱';sh.appendChild(t);
  var foc=_focusedActs(),cur=foc.slice(0,4).map(function(a){return a.emoji+' '+esc(a.name);}).join(', ');
  var sub=document.createElement('div');sub.style.cssText='font-size:14px;color:var(--tx2);line-height:1.5;margin-bottom:20px;';
  sub.innerHTML='Want to go over your focus for the week?'+(cur?'<br><span style="color:var(--tx3);font-size:13px;">Right now: '+cur+(foc.length>4?'…':'')+'</span>':'');
  sh.appendChild(sub);
  var yesB=document.createElement('button');yesB.className='btn btn-p';yesB.style.marginBottom='8px';yesB.textContent='🎯 Go over my focus';
  yesB.addEventListener('click',function(){ov.classList.remove('on');openFocus();});
  var noB=document.createElement('button');noB.className='btn btn-s';noB.textContent='Not now';
  noB.addEventListener('click',function(){ov.classList.remove('on');});
  sh.appendChild(yesB);sh.appendChild(noB);ov.classList.add('on');
}

function checkCalPlanned(){
  var now=Date.now();
  var due=_livePlanned().filter(function(ev){if(ev.notified)return false;if(ev.hour==null)return false;var evEnd=ev.date+ev.hour*3600000+(ev.duration||1)*3600000;return evEnd<=now;});
  if(!due.length)return;
  var ev=due[0];ev.notified=true;sv();
  var ov=document.getElementById('ed-ov'),sh=document.getElementById('ed-sh');sh.innerHTML='';
  var t=document.createElement('div');t.style.cssText='font-family:var(--serif);font-size:20px;font-weight:700;margin-bottom:6px;';t.textContent='Did you do it?';sh.appendChild(t);
  var sub=document.createElement('div');sub.style.cssText='font-size:14px;color:var(--tx2);margin-bottom:20px;';sub.textContent='You had '+ev.actEmoji+' '+ev.actName+' planned.';sh.appendChild(sub);
  var yesB=document.createElement('button');yesB.className='btn btn-p';yesB.style.marginBottom='8px';yesB.textContent='🌱 Yes, log the session';
  yesB.addEventListener('click',function(){ov.classList.remove('on');calPlanned=calPlanned.filter(function(p){return p.id!==ev.id;});sv();var act=myActs.find(function(a){return a.id===ev.actId;});if(act){setupLogScreen(act.id,'home',null);}});
  var noB=document.createElement('button');noB.className='btn btn-s';noB.textContent='No, discard';
  noB.addEventListener('click',function(){calPlanned=calPlanned.filter(function(p){return p.id!==ev.id;});sv();ov.classList.remove('on');});
  sh.appendChild(yesB);sh.appendChild(noB);ov.classList.add('on');
}


// Search state lives across the list and editor, reset each time the sheet opens
var _notesSearch='',_notesSearchOpen=false;
function openNotes(){_notesSearch='';_notesSearchOpen=false;rNotesList();document.getElementById('notes-ov').classList.add('on');}
function closeNotes(){if(_nbPendingCommit)_nbPendingCommit();document.getElementById('notes-ov').classList.remove('on');}
function rNotesList(){
  _nbShutChipMenu();
  _nbPendingCommit=null;
  var nb=document.getElementById('notes-body');nb.ontouchstart=nb.ontouchend=null;
  document.getElementById('notes-title').textContent='Notes';
  document.getElementById('btn-notes-back').style.display='none';
  var body=document.getElementById('notes-body');body.innerHTML='';
  // Personal card at top
  var meName=(profile&&profile.name)?profile.name:'Me';
  var meEmoji=(profile&&profile.emoji)?profile.emoji:'🌿';
  var meAct={id:'__me__',name:meName,emoji:meEmoji,_personal:true};
  var meSum=noteSummary('__me__');
  var meHas=meSum.count>0;
  var meCard=document.createElement('div');meCard.className='notes-act-card';
  meCard.style.cssText='background:var(--grl);border-color:var(--grm);';
  meCard.innerHTML='<div class="notes-act-em">'+meEmoji+'</div>'
    +'<div style="flex:1;min-width:0;">'
      +'<div class="notes-act-name">'+esc(meName)+'</div>'
      +(meHas?'<div class="notes-act-count">'+meSum.count+' page'+(meSum.count===1?'':'s')+'</div>':'<div class="notes-act-preview" style="color:var(--tx3);">Your personal space</div>')
    +'</div>'
    +'<span style="font-size:16px;color:var(--tx3);">›</span>';
  meCard.addEventListener('click',function(){_transitionNotesBody(function(){rNoteEditor(meAct);});});
  body.appendChild(meCard);
  // Activity tabs + list
  var tabRow=document.createElement('div');
  tabRow.style.cssText='display:flex;align-items:center;gap:8px;padding:8px 3px 12px;';
  migrateProjectNotes();
  var _notesTab='all';
  var _tabs=[{id:'all',label:'All activities'},{id:'skill',label:'Skills'},{id:'project',label:'Projects'}].map(function(t){
    var el=document.createElement('div');el.className='fb'+(t.id===_notesTab?' on':'');el.textContent=t.label;
    el.addEventListener('click',function(){
      if(_notesTab===t.id)return;_notesTab=t.id;
      _tabs.forEach(function(x){x.classList.toggle('on',x===el);});
      renderNotesList();animateIn(listWrap);
    });
    tabRow.appendChild(el);return el;
  });
  var srchBtn=document.createElement('button');srchBtn.className='my-icon-tog'+(_notesSearchOpen?' on':'');
  srchBtn.setAttribute('aria-label','Search');srchBtn.textContent='🔍';srchBtn.style.marginLeft='auto';
  tabRow.appendChild(srchBtn);
  body.appendChild(tabRow);

  var srchWrap=document.createElement('div');srchWrap.className='sw'+(_notesSearchOpen?' open':'');srchWrap.id='notes-search-wrap';
  srchWrap.innerHTML='<span class="sic">🔍</span><input class="si" placeholder="Search notes…" autocomplete="off">';
  var srchInp=srchWrap.querySelector('input');srchInp.value=_notesSearch;
  body.appendChild(srchWrap);
  var _nsT=null;
  srchInp.addEventListener('input',function(){
    _notesSearch=this.value;
    if(_nsT)clearTimeout(_nsT);
    _nsT=setTimeout(function(){_nsT=null;_smoothList(listWrap,renderNotesList);},120);
  });
  srchBtn.addEventListener('click',function(){
    _notesSearchOpen=!_notesSearchOpen;
    srchWrap.classList.toggle('open',_notesSearchOpen);
    srchBtn.classList.toggle('on',_notesSearchOpen);
    if(_notesSearchOpen)setTimeout(function(){srchInp.focus();},280);
    else if(_notesSearch){_notesSearch='';srchInp.value='';_smoothList(listWrap,renderNotesList);}
  });

  var listWrap=document.createElement('div');body.appendChild(listWrap);

  function renderNotesList(){
    listWrap.innerHTML='';
    var all=myActs.concat(archivedActs.map(function(a){return Object.assign({},a,{_archived:true});}));
    if(!all.length){
      var emp=document.createElement('p');emp.style.cssText='color:var(--tx2);font-size:14px;text-align:center;padding:16px 0;';emp.textContent='Plant some seeds first to add notes.';listWrap.appendChild(emp);return;
    }
    var filtered=_notesTab==='skill'?all.filter(isSkill):_notesTab==='project'?all.filter(isProject):all;
    // Search matches the seed's name or anything written in its notes
    var q=_notesSearch.trim().toLowerCase();
    if(q){
      filtered=filtered.filter(function(a){
        if(a.name.toLowerCase().includes(q))return true;
        return _getNotePages(a.id).some(function(pg){return (pg.blocks||[]).some(function(b){return b.text&&b.text.toLowerCase().includes(q);});});
      });
      if(!filtered.length){
        var nm=document.createElement('p');nm.style.cssText='color:var(--tx2);font-size:13px;text-align:center;padding:20px 0;';nm.textContent='No notes match “'+_notesSearch.trim()+'”.';listWrap.appendChild(nm);return;
      }
    }
    if(!filtered.length){
      var none=document.createElement('p');none.style.cssText='color:var(--tx2);font-size:13px;text-align:center;padding:20px 0;';none.textContent=_notesTab==='project'?'No projects yet.':'No skills yet.';listWrap.appendChild(none);return;
    }
    // Activities with notes first, most recently written at the top
    var rows=filtered.map(function(a,i){
      var sum=noteSummary(a.id);
      return {a:a,sum:sum,has:sum.count>0,last:sum.last,i:i};
    });
    rows.sort(function(x,y){
      if(x.has!==y.has)return x.has?-1:1;
      if(x.has&&x.last!==y.last)return y.last-x.last;
      return x.i-y.i;
    });
    // Where the search matched inside the notes, when it wasn't the name
    function _matchLine(a){
      if(!q||a.name.toLowerCase().includes(q))return '';
      var hit='';
      _getNotePages(a.id).slice().reverse().some(function(pg){
        return (pg.blocks||[]).some(function(b){if(b.text&&b.text.toLowerCase().includes(q)){hit=b.text.replace(/\s+/g,' ');return true;}});
      });
      var at=hit.toLowerCase().indexOf(q);if(at<0)return '';
      var from=Math.max(0,at-20);
      return '<div class="notes-act-preview">'+(from?'…':'')+esc(hit.slice(from,at))
        +'<b style="color:var(--tx);font-weight:600;">'+esc(hit.slice(at,at+q.length))+'</b>'+esc(hit.slice(at+q.length))+'</div>';
    }
    var _lastGroup=null;
    rows.forEach(function(r){
      var a=r.a,hasNotes=r.has;
      var cnt=r.sum.count;
      if(hasNotes!==_lastGroup){
        _lastGroup=hasNotes;
        var gh=document.createElement('div');gh.className='notes-act-group';gh.textContent=hasNotes?'Recent':'No notes yet';
        listWrap.appendChild(gh);
      }
      var card=document.createElement('div');card.className='notes-act-card';
      if(a._archived)card.style.opacity='.6';
      card.innerHTML='<div class="notes-act-em">'+a.emoji+'</div>'
        +'<div style="flex:1;min-width:0;">'
          +'<div class="notes-act-name">'+esc(a.name)+(a._archived?' <span style="font-size:10px;color:var(--tx3);">(archived)</span>':'')+'</div>'
          +_matchLine(a)
          +(hasNotes?'<div class="notes-act-count">'+cnt+' page'+(cnt===1?'':'s')+'</div>':'')
        +'</div>'
        +'<span style="font-size:16px;color:var(--tx3);">›</span>';
      card.addEventListener('click',function(){_transitionNotesBody(function(){rNoteEditor(a);});});
      listWrap.appendChild(card);
    });
  }

  renderNotesList();
  _flushNoteMigration();
}
// ── NOTEBOOK ──────────────────────────────────────────
// Notes are a notebook per seed: one page per day, each page a list of
// paragraphs tagged with a category. activityNotes[id].pages =
//   [{day:'YYYY-MM-DD', updatedAt, blocks:[{cat:'ideas', text:'…'}]}]
var NOTE_CHIPS={
  goals:{emoji:'🎯',label:'To work on',prompts:['What do you want to get better at?','What would make the next session feel like progress?','What’s the smallest next step?']},
  ideas:{emoji:'💡',label:'Ideas',prompts:['What would you try if it couldn’t fail?','What inspired you lately?','Is there a different way to approach this?']},
  blockers:{emoji:'🚧',label:'Obstacles',prompts:['What’s getting in the way right now?','What are you putting off, and why?','What would make this easier?']},
  general:{emoji:'📝',label:'General',prompts:['Anything else on your mind?','Links, references, random thoughts…','What do you want to remember about today?']},
  thoughts:{emoji:'💭',label:'Thoughts',prompts:['What’s on your mind right now?','What surprised you today?']},
  intentions:{emoji:'🌟',label:'Intentions',prompts:['What do you want to cultivate in yourself?','How do you want tomorrow to feel?']},
  patterns:{emoji:'🧠',label:'Patterns',prompts:['What are you noticing about your habits or energy?','When did you feel most like yourself?']},
  freewrite:{emoji:'📓',label:'Free write',prompts:['Open space — no structure needed…']}
};
var _noteMigrated=false;
function _flushNoteMigration(){if(_noteMigrated){_noteMigrated=false;sv();}}
function _dayKey(ts){var d=new Date(ts);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
function _dayTs(day){var p=day.split('-');return new Date(+p[0],+p[1]-1,+p[2]).getTime();}
function _pageHasText(pg){return (pg.blocks||[]).some(function(b){return b.text&&b.text.trim();});}
function _byDay(x,y){return x.day<y.day?-1:x.day>y.day?1:0;}
// Returns the seed's pages (oldest first), folding in any older-format notes:
// dated entries become that day's page, one paragraph per filled section.
function _getNotePages(actId){
  var n=activityNotes[actId]||(activityNotes[actId]={});
  var secs=NOTE_SECTIONS.concat(PERSONAL_NOTE_SECTIONS);
  var entries=Array.isArray(n.entries)?n.entries.slice():[];
  var flat={},hasFlat=false;
  secs.forEach(function(sec){
    var v=n[sec.key];
    if(typeof v==='string'&&v.trim()){flat[sec.key]=v.trim();hasFlat=true;}
    else if(Array.isArray(v)&&v.length){flat[sec.key]=v.map(function(e){return e.text;}).join('\n\n');hasFlat=true;}
    if(v!==undefined){delete n[sec.key];_noteMigrated=true;}
  });
  if(hasFlat)entries.push(Object.assign({date:Date.now()},flat));
  if(!Array.isArray(n.pages)){n.pages=[];_noteMigrated=true;}
  if(entries.length){
    entries.slice().reverse().forEach(function(e){ // entries were newest first
      var day=_dayKey(e.date||Date.now());
      var pg=n.pages.find(function(x){return x.day===day;});
      if(!pg){pg={day:day,updatedAt:e.date||Date.now(),blocks:[]};n.pages.push(pg);}
      secs.forEach(function(sec){if(e[sec.key]&&String(e[sec.key]).trim())pg.blocks.push({cat:sec.key,text:String(e[sec.key]).trim()});});
      pg.updatedAt=Math.max(pg.updatedAt||0,e.date||0);
    });
    n.pages.sort(_byDay);
    _noteMigrated=true;
  }
  if(n.entries!==undefined){delete n.entries;_noteMigrated=true;}
  return n.pages;
}
// Count of written pages, the latest page's first paragraph, last-written time
function noteSummary(actId){
  var pages=_getNotePages(actId).filter(_pageHasText);
  if(!pages.length)return {count:0,preview:'',last:0};
  var latest=pages[pages.length-1];
  var b=latest.blocks.find(function(x){return x.text&&x.text.trim();});
  var txt=b?b.text.trim().split('\n')[0]:'';
  return {count:pages.length,preview:txt.slice(0,60)+(txt.length>60?'…':''),last:latest.updatedAt||_dayTs(latest.day)};
}
// Add a paragraph to today's page (for text that arrives from elsewhere)
function _addNoteBlock(actId,cat,text){
  var pages=_getNotePages(actId),day=_dayKey(Date.now());
  var pg=pages.find(function(x){return x.day===day;});
  if(!pg){pg={day:day,updatedAt:Date.now(),blocks:[]};pages.push(pg);pages.sort(_byDay);}
  pg.blocks.push({cat:cat,text:text});pg.updatedAt=Date.now();
}
// Projects used to keep a separate free-text notebook (a.notes). Fold any
// such text into the notebook as a 'General' paragraph, once.
function migrateProjectNotes(){
  var changed=false;
  myActs.concat(archivedActs).forEach(function(a){
    if(!isProject(a)||!a.notes||!a.notes.trim())return;
    _addNoteBlock(a.id,'general',a.notes.trim());
    a.notes='';changed=true;
  });
  if(changed){_noteMigrated=false;sv();}else _flushNoteMigration();
}
var _noteBackFn=null,_nbPendingCommit=null,_nbCloseChipMenu=null,_nbChipOwner=null;
function _nbShutChipMenu(){if(_nbCloseChipMenu)_nbCloseChipMenu();}
function rNoteEditor(a,day){
  document.getElementById('notes-title').textContent=a.emoji+' '+a.name;
  document.getElementById('btn-notes-back').style.display='block';
  var cats=(a._personal?PERSONAL_NOTE_SECTIONS:NOTE_SECTIONS).map(function(sec){return sec.key;});
  _nbShutChipMenu();
  var pages=_getNotePages(a.id);_flushNoteMigration();
  var today=_dayKey(Date.now());
  day=day||today;
  // Pages you can flip to: every written page, plus today's
  var days=pages.filter(_pageHasText).map(function(pg){return pg.day;});
  if(days.indexOf(today)<0)days.push(today);
  if(days.indexOf(day)<0)days.push(day);
  days.sort();
  var idx=days.indexOf(day);
  var page=pages.find(function(x){return x.day===day;})||{day:day,updatedAt:0,blocks:[]};
  // Edit a copy so empty paragraphs never get stored
  var blocks=(page.blocks||[]).map(function(b){return {cat:cats.indexOf(b.cat)>-1?b.cat:cats[cats.length-1],text:b.text};});
  if(!blocks.length)blocks.push({cat:cats[0],text:''});

  var body=document.getElementById('notes-body');body.innerHTML='';
  var t=_dayTs(day),diff=Math.round((_dayTs(today)-t)/86400000);
  var o={weekday:'short',month:'short',day:'numeric'};if(new Date(t).getFullYear()!==new Date().getFullYear())o.year='numeric';
  var label=diff===0?'Today':diff===1?'Yesterday':new Date(t).toLocaleDateString('en-US',o);
  var nav=document.createElement('div');nav.className='nb-nav';
  nav.innerHTML='<button type="button" class="nb-flip" data-dir="-1" aria-label="Previous page"'+(idx>0?'':' disabled')+'>‹</button>'
    +'<div class="nb-day"><div>'+label+'</div><div class="nb-pg">Page '+(idx+1)+' of '+days.length+'</div></div>'
    +'<button type="button" class="nb-flip" data-dir="1" aria-label="Next page"'+(idx<days.length-1?'':' disabled')+'>›</button>';
  body.appendChild(nav);
  var list=document.createElement('div');list.className='nb-page';body.appendChild(list);
  var addRow=document.createElement('button');addRow.type='button';addRow.className='nb-add';addRow.textContent='+ New paragraph';body.appendChild(addRow);

  // Saves as you type (debounced); flipping, going back or closing saves at once
  var saveT=null;
  function commit(){
    if(saveT){clearTimeout(saveT);saveT=null;}
    var kept=blocks.filter(function(b){return b.text&&b.text.trim();}).map(function(b){return {cat:b.cat,text:b.text.replace(/\s+$/,'')};});
    // Re-resolve against live state: a background sync can replace activityNotes
    // wholesale, which would orphan the array captured when this page opened.
    var live=_getNotePages(a.id),pi=-1;
    for(var k=0;k<live.length;k++)if(live[k].day===day){pi=k;break;}
    if(kept.length){
      if(pi>-1&&JSON.stringify(kept)===JSON.stringify(live[pi].blocks))return;
      var tgt=pi>-1?live[pi]:{day:day,updatedAt:0,blocks:[]};
      tgt.blocks=kept;tgt.updatedAt=Date.now();
      if(pi<0){live.push(tgt);live.sort(_byDay);}
      page=tgt;pages=live;
    } else if(pi>-1){live.splice(pi,1);pages=live;}
    else return;
    _noteMigrated=false;
    sv();
  }
  function queueSave(){if(saveT)clearTimeout(saveT);saveT=setTimeout(commit,500);}
  _nbPendingCommit=commit;
  _noteBackFn=function(){commit();rNotesList();};

  function grow(ta){ta.style.height='auto';ta.style.height=ta.scrollHeight+'px';}
  function prompt(b,i){var p=NOTE_CHIPS[b.cat].prompts;return p[i%p.length];}
  function chipHTML(cat){var c=NOTE_CHIPS[cat];return '<span>'+c.emoji+'</span><span>'+c.label+'</span>';}
  // Rows are built and focused synchronously so the keyboard stays up on phones
  function focusAt(ta,c){ta.focus();if(c==null)c=ta.value.length;try{ta.setSelectionRange(c,c);}catch(_){}}
  function makeRow(b){
    var row=document.createElement('div');row.className='nb-row';
    var head=document.createElement('div');head.className='nb-head';
    var chip=document.createElement('button');chip.type='button';chip.className='nb-chip';chip.innerHTML=chipHTML(b.cat);
    chip.title='Change category';chip.setAttribute('aria-haspopup','true');chip.setAttribute('aria-expanded','false');
    var ta=document.createElement('textarea');ta.className='nb-ta';ta.rows=1;ta.value=b.text;ta.placeholder=prompt(b,blocks.indexOf(b));
    chip.addEventListener('click',function(e){
      e.stopPropagation();
      // Pressing the open chip again just closes the picker
      var mine=_nbChipOwner===chip;
      _nbShutChipMenu();
      if(mine)return;
      var menu=document.createElement('div');menu.className='nb-chipmenu';
      cats.forEach(function(key){
        var c=NOTE_CHIPS[key];
        var mi=document.createElement('button');mi.type='button';mi.className='nb-mi'+(key===b.cat?' on':'');
        mi.innerHTML='<span class="nb-mi-em">'+c.emoji+'</span><span class="nb-mi-lbl">'+c.label+'</span>'
          +(key===b.cat?'<span class="nb-mi-ck">\u2713</span>':'');
        mi.addEventListener('click',function(ev){
          ev.stopPropagation();
          b.cat=key;chip.innerHTML=chipHTML(b.cat);ta.placeholder=prompt(b,blocks.indexOf(b));
          _nbShutChipMenu();queueSave();focusAt(ta);
        });
        menu.appendChild(mi);
      });
      head.appendChild(menu);
      chip.setAttribute('aria-expanded','true');
      function away(ev){if(!menu.contains(ev.target)&&ev.target!==chip)_nbShutChipMenu();}
      function esc(ev){if(ev.key==='Escape'){ev.preventDefault();_nbShutChipMenu();focusAt(ta);}}
      _nbChipOwner=chip;
      _nbCloseChipMenu=function(){
        document.removeEventListener('click',away,true);
        document.removeEventListener('keydown',esc,true);
        if(menu.parentNode)menu.parentNode.removeChild(menu);
        chip.setAttribute('aria-expanded','false');
        _nbCloseChipMenu=null;_nbChipOwner=null;
      };
      // Safe to bind now: this click already passed the document capture phase
      document.addEventListener('click',away,true);
      document.addEventListener('keydown',esc,true);
    });
    ta.addEventListener('input',function(){b.text=ta.value;grow(ta);queueSave();});
    ta.addEventListener('keydown',function(e){
      var i=blocks.indexOf(b);
      if(e.key==='Enter'&&!e.shiftKey&&!e.isComposing){
        // New paragraph, same category; text after the cursor moves with it
        e.preventDefault();
        var pos=ta.selectionStart,nb={cat:b.cat,text:b.text.slice(ta.selectionEnd)};
        b.text=b.text.slice(0,pos);ta.value=b.text;grow(ta);
        blocks.splice(i+1,0,nb);
        var nr=makeRow(nb);row.parentNode.insertBefore(nr.row,row.nextSibling);grow(nr.ta);
        focusAt(nr.ta,0);queueSave();
      } else if(e.key==='Backspace'&&ta.selectionStart===0&&ta.selectionEnd===0&&i>0){
        // Join with the paragraph above
        e.preventDefault();
        var prev=blocks[i-1],at=prev.text.length,prevTa=row.previousSibling.querySelector('textarea');
        prev.text=prev.text+b.text;prevTa.value=prev.text;blocks.splice(i,1);
        row.remove();grow(prevTa);focusAt(prevTa,at);queueSave();
      }
    });
    head.appendChild(chip);row.appendChild(head);row.appendChild(ta);
    return {row:row,ta:ta};
  }
  function render(){
    list.innerHTML='';
    blocks.forEach(function(b){var r=makeRow(b);list.appendChild(r.row);requestAnimationFrame(function(){grow(r.ta);});});
  }
  render();
  addRow.addEventListener('click',function(){
    var last=blocks[blocks.length-1],tas=list.querySelectorAll('textarea');
    if(last&&!last.text.trim()){focusAt(tas[tas.length-1]);return;}
    var nb={cat:last?last.cat:cats[0],text:''};blocks.push(nb);
    var nr=makeRow(nb);list.appendChild(nr.row);grow(nr.ta);focusAt(nr.ta);
  });
  function flip(dir){
    var ni=idx+dir;if(ni<0||ni>=days.length)return;
    commit();
    rNoteEditor(a,days[ni]);
    var pg=document.querySelector('#notes-body .nb-page');
    if(pg)pg.style.animation=(dir>0?'nbInR':'nbInL')+' .22s ease';
  }
  nav.querySelectorAll('.nb-flip').forEach(function(btn){btn.addEventListener('click',function(){flip(+this.dataset.dir);});});
  // Swipe sideways to turn the page
  var sx=null,sy=null;
  body.ontouchstart=function(e){var t0=e.touches[0];sx=t0.clientX;sy=t0.clientY;};
  body.ontouchend=function(e){
    if(sx==null)return;var t1=e.changedTouches[0],dx=t1.clientX-sx,dy=t1.clientY-sy;sx=null;
    if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.5)flip(dx<0?1:-1);
  };
}
document.getElementById('btn-notes-close').addEventListener('click',closeNotes);
document.getElementById('btn-notes-back').addEventListener('click',function(){_transitionNotesBody(function(){if(_noteBackFn)_noteBackFn();else rNotesList();});});
document.getElementById('btn-cal-close').addEventListener('click',function(){document.getElementById('cal-ov').classList.remove('on');});

function openMenuPanel(){
  var em=document.getElementById('mp-em');if(em)em.textContent=profile&&profile.emoji?profile.emoji:'🌱';
  var nm=document.getElementById('mp-name');if(nm)nm.textContent=profile&&profile.name?profile.name:'My profile';
  document.getElementById('menu-ov').classList.add('on');
}
function closeMenuPanel(){
  document.getElementById('menu-ov').classList.remove('on');
}
document.getElementById('menu-btn').addEventListener('click',openMenuPanel);
document.getElementById('menu-ov').addEventListener('click',function(e){if(e.target===this)closeMenuPanel();});
// Tap outside the sheet dismisses these overlays too
['ed-ov','foc-ov','cal-ov','notes-ov','add-ov','collect-ov','pq-ov'].forEach(function(oid){
  var ov=document.getElementById(oid);
  if(ov)ov.addEventListener('click',function(e){if(e.target!==this)return;if(oid==='notes-ov'&&_nbPendingCommit)_nbPendingCommit();ov.classList.remove('on');});
});
document.getElementById('mp-profile').addEventListener('click',function(){closeMenuPanel();setTimeout(openProfileEdit,220);});
document.getElementById('mp-signin').addEventListener('click',function(){closeMenuPanel();goToSignIn();});
document.getElementById('mp-collect').addEventListener('click',function(){closeMenuPanel();openCollect();});
document.getElementById('mp-cal').addEventListener('click',function(){closeMenuPanel();openCalendar();});
// v2 section links (home)
document.querySelectorAll('#s-home .v2-sec-link,#s-home .v2-sec-hdr-clickable').forEach(function(el){
  el.addEventListener('click',function(){
    var a=this.dataset.action;
    if(a==='open-cal')openCalendar();
    else if(a==='open-week')openWeeklySummary();
    else if(a==='open-today')openTodayOverview();
  });
});
document.getElementById('mp-notes').addEventListener('click',function(){closeMenuPanel();openNotes();});
document.getElementById('mp-palette').addEventListener('click',function(e){
  var dot=e.target.closest('.pal-dot');
  if(!dot)return;
  e.stopPropagation();
  colorPalette=dot.dataset.pal;
  applyPalette();
  sv();
});
// ── PALETTE DOT HOVER TOOLTIP ─────────────────────────
(function(){
  var tip=document.getElementById('pal-tip');
  document.addEventListener('mouseover',function(e){
    var dot=e.target.closest('.pal-dot');
    if(!dot||!dot.dataset.season)return;
    tip.textContent=dot.dataset.season;
    var r=dot.getBoundingClientRect();
    tip.style.opacity='1';
    tip.style.top=(r.top-30)+'px';
    tip.style.left=(r.left+r.width/2)+'px';
    tip.style.transform='translateX(-50%)';
  });
  document.addEventListener('mouseout',function(e){
    if(!e.target.closest('.pal-dot'))return;
    tip.style.opacity='0';
  });
})();
document.getElementById('btn-collect-close').addEventListener('click',closeCollect);
document.getElementById('btn-stageup-close').addEventListener('click',function(){document.getElementById('stageup-ov').classList.remove('on');});

// ── FRIENDS ──────────────────────────────────────────
// Required Supabase tables:
//   CREATE TABLE friendships (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, requester_id uuid REFERENCES auth.users(id), addressee_id uuid REFERENCES auth.users(id), status text DEFAULT 'pending', created_at timestamptz DEFAULT now(), UNIQUE(requester_id,addressee_id));
//   CREATE TABLE messages (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, from_id uuid REFERENCES auth.users(id), to_id uuid REFERENCES auth.users(id), content text, created_at timestamptz DEFAULT now(), read_at timestamptz);
//   CREATE TABLE feed_events (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, username text, user_emoji text, type text NOT NULL, act_name text, act_emoji text, stage text, created_at timestamptz DEFAULT now());
//   Enable RLS and add policies allowing users to read/write their own rows.

function _fmtAgo(ts){var s=Math.floor((Date.now()-new Date(ts).getTime())/1000);if(s<60)return 'just now';var m=Math.floor(s/60);if(m<60)return m+'m ago';var h=Math.floor(m/60);if(h<24)return h+'h ago';var d=Math.floor(h/24);if(d===1)return 'yesterday';if(d<7)return d+'d ago';return new Date(ts).toLocaleDateString([],{month:'short',day:'numeric'});}

async function pushFeedEvent(type,actName,actEmoji,stage){
  if(!supaUser)return;
  try{
    await _supa.from('feed_events').insert({
      user_id:supaUser.id,
      username:profile&&profile.username||null,
      user_emoji:profile&&profile.emoji||'🌱',
      type:type,
      act_name:actName||null,
      act_emoji:actEmoji||null,
      stage:stage||null
    });
  }catch(e){console.warn('feed push error',e);}
}

async function renderFeed(){
  var body=document.getElementById('fr-body');
  if(!supaUser){body.innerHTML='<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:14px;">Sign in to see your friends\' activity</div>';return;}
  body.innerHTML='<div style="text-align:center;padding:24px;color:var(--tx3);font-size:13px;">Loading…</div>';
  try{
    var fRes=await _tq(_supa.from('friendships').select('requester_id,addressee_id').or('requester_id.eq.'+supaUser.id+',addressee_id.eq.'+supaUser.id).eq('status','accepted'));
    if(fRes.error)throw fRes.error;
    var friendIds=(fRes.data||[]).map(function(f){return f.requester_id===supaUser.id?f.addressee_id:f.requester_id;});
    if(!friendIds.length){
      body.innerHTML='<div style="text-align:center;padding:44px 0;"><div style="font-size:38px;margin-bottom:12px;">🌱</div><div style="color:var(--tx2);font-size:14px;line-height:1.6;">Add friends to see their activity here.</div></div>';
      return;
    }
    var evRes=await _tq(_supa.from('feed_events').select('*').in('user_id',friendIds).order('created_at',{ascending:false}).limit(60));
    if(evRes.error)throw evRes.error;
    var evs=evRes.data||[];
    body.innerHTML='';
    if(!evs.length){
      body.innerHTML='<div style="text-align:center;padding:44px 0;"><div style="font-size:38px;margin-bottom:12px;">🌿</div><div style="color:var(--tx2);font-size:14px;line-height:1.6;">Nothing yet — your friends have been quiet!</div></div>';
      return;
    }
    evs.forEach(function(ev){
      var name=ev.username?('@'+esc(ev.username)):'A friend';
      var em=esc(ev.user_emoji||'🌱');
      var text='';
      if(ev.type==='session')text='grew '+esc(ev.act_emoji)+' '+esc(ev.act_name);
      else if(ev.type==='plant')text='planted '+esc(ev.act_emoji)+' '+esc(ev.act_name)+' as a new seed';
      else if(ev.type==='levelup')text='leveled up in '+esc(ev.act_emoji)+' '+esc(ev.act_name)+(ev.stage?' → '+esc(ev.stage):'');
      else text=esc(ev.type);
      var card=document.createElement('div');
      card.style.cssText='display:flex;gap:11px;padding:12px 0;border-bottom:.5px solid var(--bg2);align-items:flex-start;';
      card.innerHTML='<div class="fr-em">'+em+'</div>'
        +'<div style="flex:1;min-width:0;">'
          +'<div style="font-size:13px;font-weight:600;color:var(--tx);margin-bottom:2px;">'+name+'</div>'
          +'<div style="font-size:13px;color:var(--tx2);line-height:1.45;">'+text+'</div>'
          +'<div style="font-size:11px;color:var(--tx3);margin-top:4px;">'+_fmtAgo(ev.created_at)+'</div>'
        +'</div>';
      body.appendChild(card);
    });
  }catch(e){
    var msg=e&&e.message||'';var code=e&&e.code||'';
    var isMissing=code==='42P01'||msg.indexOf('does not exist')>-1||msg.indexOf('relation')>-1;
    var isPerm=msg.indexOf('permission denied')>-1||msg.indexOf('insufficient privilege')>-1||code==='42501';
    var isTimeout=msg==='timeout';
    var sql='GRANT SELECT, INSERT ON feed_events TO authenticated;\n\nDROP POLICY IF EXISTS &quot;insert_own&quot; ON feed_events;\nDROP POLICY IF EXISTS &quot;read_all&quot; ON feed_events;\nDROP POLICY IF EXISTS &quot;Users can insert their own events&quot; ON feed_events;\nDROP POLICY IF EXISTS &quot;Users can read friends events&quot; ON feed_events;\nDROP POLICY IF EXISTS &quot;Authenticated users can read feed events&quot; ON feed_events;\n\nALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;\nCREATE POLICY &quot;insert_own&quot; ON feed_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);\nCREATE POLICY &quot;read_all&quot; ON feed_events FOR SELECT TO authenticated USING (true);';
    body.innerHTML='<div style="padding:20px;color:var(--tx3);font-size:13px;">'
      +(isMissing
        ?'<b>feed_events table not found.</b><br><br>Run this in Supabase → SQL Editor:<br><pre style="background:var(--bg2);padding:10px;border-radius:8px;font-size:11px;margin-top:8px;white-space:pre-wrap;text-align:left;overflow-x:auto;">CREATE TABLE feed_events (id uuid DEFAULT gen_random_uuid() PRIMARY KEY, user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, username text, user_emoji text, type text NOT NULL, act_name text, act_emoji text, stage text, created_at timestamptz DEFAULT now());\nALTER TABLE feed_events ENABLE ROW LEVEL SECURITY;\nGRANT SELECT, INSERT ON feed_events TO authenticated;\nCREATE POLICY &quot;insert_own&quot; ON feed_events FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);\nCREATE POLICY &quot;read_all&quot; ON feed_events FOR SELECT TO authenticated USING (true);</pre>'
        :isTimeout
        ?'<div style="text-align:center;padding:24px 0;"><div style="font-size:32px;margin-bottom:8px;">⏱</div><div style="color:var(--tx2);font-size:13px;">Feed took too long to load. Check your connection and try again.</div><button onclick="renderFeed()" style="margin-top:12px;padding:8px 18px;border-radius:20px;border:var(--br);background:var(--bg2);color:var(--tx);font-size:13px;cursor:pointer;">Retry</button></div>'
        :isPerm
        ?'<b>Permission error on feed_events.</b><br><br>Run this in Supabase → SQL Editor:<br><pre style="background:var(--bg2);padding:10px;border-radius:8px;font-size:11px;margin-top:8px;white-space:pre-wrap;text-align:left;overflow-x:auto;">'+sql+'</pre>'
        :'Error loading feed: '+(msg||'unknown error'))
      +'</div>';
  }
}
var _frTab='friends';
var _convUserId=null,_convName=null,_convUn=null,_convEmoji=null;
var GIFTS=['🍎','🍊','🍋','🍓','🍇','🌸','🌻','⭐','🌿','🫧'];
var _activeTimerInt=null;
function _fmtElapsed(ms){var s=Math.floor(ms/1000);var h=Math.floor(s/3600);var m=Math.floor((s%3600)/60);var sec=s%60;if(h>0)return h+'h '+(m<10?'0':'')+m+'m '+(sec<10?'0':'')+sec+'s';return (m<10?'0':'')+m+':'+(sec<10?'0':'')+sec;}
var _frSearchTimer=null;

function openFriends(){nav('friends');}
function closeFriends(){nav('home');}

function openConvOv(userId,name,un,emoji){
  _convUserId=userId;_convName=name;_convUn=un;_convEmoji=emoji||'🌱';
  document.getElementById('conv-em').textContent=_convEmoji;
  document.getElementById('conv-name').textContent=name||un||'?';
  document.getElementById('conv-un').textContent='@'+(un||'');
  document.getElementById('conv-input').value='';
  document.getElementById('conv-ov').classList.add('on');
  renderConv();
}
function closeConv(){document.getElementById('conv-ov').classList.remove('on');if(_frTab==='messages')renderConvList();checkUnreadBadge();}
async function checkUnreadBadge(){
  var navBadge=document.getElementById('nb-friends-badge');
  var msgTabBadge=document.getElementById('fr-msg-badge');
  if(!supaUser)return;
  try{
    var r=await _supa.from('messages').select('id',{count:'exact',head:true}).eq('to_id',supaUser.id).is('read_at',null);
    var n=r.count||0;
    var label=n>9?'9+':String(n);
    if(navBadge){navBadge.textContent=label;navBadge.style.display=n>0?'inline-block':'none';}
    if(msgTabBadge){msgTabBadge.textContent=label;msgTabBadge.style.display=n>0?'inline-block':'none';}
  }catch(e){}
}

async function renderFriends(){
  if(_frTab==='friends')await renderFriendsList();
  else if(_frTab==='feed')await renderFeed();
  else if(_frTab==='requests')await renderRequests();
  else await renderConvList();
}

async function renderFriendsList(){
  var body=document.getElementById('fr-body');
  if(!supaUser){body.innerHTML='<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:14px;">Sign in to connect with friends</div>';return;}
  var skEl='<div style="display:flex;align-items:center;gap:12px;padding:12px 0;border-bottom:.5px solid var(--bg3);">'
    +'<div style="width:42px;height:42px;border-radius:50%;background:var(--bg2);flex-shrink:0;"></div>'
    +'<div style="flex:1;"><div style="height:13px;background:var(--bg2);border-radius:6px;width:55%;margin-bottom:6px;"></div>'
    +'<div style="height:11px;background:var(--bg2);border-radius:6px;width:35%;"></div></div></div>';
  body.innerHTML=skEl+skEl+skEl;
  try{
    var res=await _tq(_supa.from('friendships').select('id,requester_id,addressee_id').or('requester_id.eq.'+supaUser.id+',addressee_id.eq.'+supaUser.id).eq('status','accepted'));
    if(res.error)throw res.error;
    var friends=res.data||[];
    if(!friends.length){
      body.innerHTML='<div style="text-align:center;padding:44px 0;"><div style="font-size:38px;margin-bottom:12px;">🌱</div><div style="color:var(--tx2);font-size:14px;line-height:1.6;">No friends yet.<br>Search for someone by their @username.</div></div>';
      return;
    }
    var ids=friends.map(function(f){return f.requester_id===supaUser.id?f.addressee_id:f.requester_id;});
    var pRes=await _tq(_supa.from('profiles').select('id,username,display_name,emoji').in('id',ids));
    var profiles={};(pRes.data||[]).forEach(function(p){profiles[p.id]=p;});
    body.innerHTML='';
    friends.forEach(function(f,_fi){
      var fid=f.requester_id===supaUser.id?f.addressee_id:f.requester_id;
      var p=profiles[fid]||{};
      var em=p.emoji||'🌱';var name=p.display_name||p.username||'?';var un=p.username||'';
      var row=document.createElement('div');row.className='fr-row';row.style.cssText='cursor:pointer;animation:fadeIn .2s ease both;animation-delay:'+(_fi*40)+'ms;';
      row.innerHTML='<div class="fr-em">'+esc(em)+'</div>'
        +'<div class="fr-info"><div class="fr-name">'+esc(name)+'</div><div class="fr-un">@'+esc(un)+'</div></div>'
        +'<div class="fr-acts">'
          +'<button class="fr-ic-btn" data-action="wave" title="Wave">👋</button>'
          +'<button class="fr-ic-btn" data-action="clap" title="Cheer">👏</button>'
        +'</div>';
      row.addEventListener('click',function(e){
        if(e.target.closest('.fr-ic-btn'))return;
        openFriendProfile(fid,p,f.id);
      });
      row.querySelectorAll('.fr-ic-btn').forEach(function(btn){
        btn.addEventListener('click',function(e){
          e.stopPropagation();
          if(btn.dataset.action==='wave'){
            waveAt(fid);btn.textContent='✅';setTimeout(function(){btn.textContent='👋';},1500);
          } else {
            cheerAt(fid);btn.textContent='✅';setTimeout(function(){btn.textContent='👏';},1500);
          }
        });
      });
      body.appendChild(row);
    });
  }catch(e){
    var msg=e&&e.message?e.message:'Unknown error';
    body.innerHTML='<div style="text-align:center;padding:30px;color:var(--tx3);font-size:13px;">Error: '+msg+'</div>';
  }
}

async function openFriendProfile(fid,p,fshipId){
  var ov=document.getElementById('ed-ov'),sh=document.getElementById('ed-sh');
  var em=p.emoji||'🌱';var name=p.display_name||p.username||'?';var un=p.username||'';
  sh.innerHTML='';
  ov.classList.add('on');

  // Avatar + name
  var avatar=document.createElement('div');avatar.style.cssText='text-align:center;margin-bottom:14px;';
  avatar.innerHTML='<div style="font-size:52px;width:72px;height:72px;border-radius:50%;background:var(--bg2);border:var(--br);display:flex;align-items:center;justify-content:center;margin:0 auto 10px;">'+esc(em)+'</div>'
    +'<div style="font-family:var(--serif);font-size:19px;font-weight:700;color:var(--tx);">'+esc(name)+'</div>'
    +'<div style="font-size:13px;color:var(--tx3);margin-top:2px;">@'+esc(un)+'</div>';
  sh.appendChild(avatar);

  // Seed count stat — renders immediately with placeholder, fills in after fetch
  var stat=document.createElement('div');
  stat.style.cssText='display:flex;justify-content:center;margin-bottom:20px;';
  stat.innerHTML='<div style="background:var(--grl);border-radius:12px;padding:10px 22px;text-align:center;">'
    +'<div id="fp-seed-count" style="font-size:22px;font-weight:700;color:var(--gr);">·</div>'
    +'<div id="fp-seed-lbl" style="font-size:11px;color:var(--tx2);margin-top:2px;">seeds planted</div>'
    +'</div>';
  sh.appendChild(stat);
  (async function(){
    try{
      var aRes=await _tq(_supa.from('activities').select('id').eq('user_id',fid));
      var c=(aRes.data||[]).length;
      var cEl=document.getElementById('fp-seed-count');var lEl=document.getElementById('fp-seed-lbl');
      if(cEl)cEl.textContent=c;if(lEl)lEl.textContent='seed'+(c!==1?'s':'')+' planted';
    }catch(e){}
  })();

  // Action buttons row
  var actions=document.createElement('div');actions.style.cssText='display:flex;gap:8px;margin-bottom:18px;';
  var waveBtn=document.createElement('button');waveBtn.className='btn btn-s';waveBtn.style.flex='1';waveBtn.textContent='👋 Wave';
  waveBtn.addEventListener('click',function(){waveAt(fid);waveBtn.textContent='✅ Sent!';setTimeout(function(){waveBtn.textContent='👋 Wave';},1800);});
  var msgBtn=document.createElement('button');msgBtn.className='btn btn-s';msgBtn.style.flex='1';msgBtn.textContent='💬 Message';
  msgBtn.addEventListener('click',function(){ov.classList.remove('on');openConvOv(fid,name,un,em);});
  actions.appendChild(waveBtn);actions.appendChild(msgBtn);sh.appendChild(actions);

  // Gift picker
  var giftLbl=document.createElement('div');giftLbl.style.cssText='font-size:11px;font-weight:600;color:var(--tx3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:8px;';giftLbl.textContent='Send a gift';sh.appendChild(giftLbl);
  var gifts=GIFTS;
  var giftRow=document.createElement('div');giftRow.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-bottom:20px;';
  gifts.forEach(function(g){
    var btn=document.createElement('button');
    btn.style.cssText='font-size:22px;background:var(--bg2);border:var(--br);border-radius:10px;width:42px;height:42px;cursor:pointer;transition:transform .12s;display:flex;align-items:center;justify-content:center;';
    btn.textContent=g;
    btn.addEventListener('click',async function(){
      btn.style.transform='scale(1.3)';
      await _supa.from('messages').insert({from_id:supaUser.id,to_id:fid,content:g});
      setTimeout(function(){btn.style.transform='';},200);
      giftLbl.textContent='Sent '+g+'!';giftLbl.style.color='var(--gr)';
      setTimeout(function(){giftLbl.textContent='Send a gift';giftLbl.style.color='';},2000);
    });
    giftRow.appendChild(btn);
  });
  sh.appendChild(giftRow);

  // Remove friend (small, at bottom)
  var removeBtn=document.createElement('button');
  removeBtn.style.cssText='background:none;border:none;font-size:12px;color:var(--tx3);cursor:pointer;width:100%;padding:6px 0;text-decoration:underline;margin-top:16px;';
  removeBtn.textContent='Remove friend';
  removeBtn.addEventListener('click',async function(){
    if(!confirm('Remove '+name+' as a friend?'))return;
    removeBtn.disabled=true;removeBtn.textContent='Removing…';
    await _supa.from('friendships').delete().eq('id',fshipId);
    ov.classList.remove('on');renderFriendsList();
  });
  sh.appendChild(removeBtn);
}

async function renderRequests(){
  var body=document.getElementById('fr-body');
  if(!supaUser){body.innerHTML='<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:14px;">Sign in to see requests</div>';return;}
  body.innerHTML='<div style="text-align:center;padding:24px;color:var(--tx3);font-size:13px;">Loading…</div>';
  try{
    var res=await _tq(_supa.from('friendships').select('id,requester_id,addressee_id,status,created_at').or('requester_id.eq.'+supaUser.id+',addressee_id.eq.'+supaUser.id).eq('status','pending'));
    if(res.error)throw res.error;
    var reqs=res.data||[];
    var incoming=reqs.filter(function(r){return r.addressee_id===supaUser.id;});
    var outgoing=reqs.filter(function(r){return r.requester_id===supaUser.id;});
    var badge=document.getElementById('fr-req-badge');
    if(incoming.length){badge.textContent=incoming.length;badge.style.display='inline';}
    else{badge.style.display='none';}
    body.innerHTML='';

    function mkLabel(text,mt){
      var d=document.createElement('div');
      d.style.cssText='font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.7px;margin:'+(mt||'0')+' 0 10px;';
      d.textContent=text;return d;
    }
    body.appendChild(mkLabel('Incoming'));
    if(!incoming.length){
      var em=document.createElement('div');em.style.cssText='color:var(--tx3);font-size:13px;margin-bottom:18px;';em.textContent='No incoming requests';body.appendChild(em);
    } else {
      var iids=incoming.map(function(r){return r.requester_id;});
      var pRes=await _supa.from('profiles').select('id,username,display_name,emoji').in('id',iids);
      var ip={};(pRes.data||[]).forEach(function(p){ip[p.id]=p;});
      incoming.forEach(function(req){
        var p=ip[req.requester_id]||{};
        var em2=p.emoji||'🌱';var name=p.display_name||p.username||'?';var un=p.username||'';
        var row=document.createElement('div');row.className='fr-row';
        row.innerHTML='<div class="fr-em">'+esc(em2)+'</div>'
          +'<div class="fr-info"><div class="fr-name">'+esc(name)+'</div><div class="fr-un">@'+esc(un)+'</div></div>'
          +'<div class="fr-acts">'
            +'<button style="background:var(--gr);color:#fff;" data-reqid="'+req.id+'" class="fr-action-btn fr-accept-btn">Accept</button>'
            +'<button aria-label="Decline request" style="background:var(--bg2);color:var(--tx2);border:var(--br);" data-reqid="'+req.id+'" class="fr-action-btn fr-decline-btn">✕</button>'
          +'</div>';
        row.querySelector('.fr-accept-btn').addEventListener('click',async function(){
          var id=this.dataset.reqid;
          this.textContent='…';this.disabled=true;
          await _supa.from('friendships').update({status:'accepted'}).eq('id',id);
          renderFriends();
        });
        row.querySelector('.fr-decline-btn').addEventListener('click',async function(){
          var id=this.dataset.reqid;
          await _supa.from('friendships').delete().eq('id',id);
          renderFriends();
        });
        body.appendChild(row);
      });
    }

    body.appendChild(mkLabel('Sent','16px'));
    if(!outgoing.length){
      var em3=document.createElement('div');em3.style.cssText='color:var(--tx3);font-size:13px;';em3.textContent='No pending requests';body.appendChild(em3);
    } else {
      var oids=outgoing.map(function(r){return r.addressee_id;});
      var pRes2=await _supa.from('profiles').select('id,username,display_name,emoji').in('id',oids);
      var op={};(pRes2.data||[]).forEach(function(p){op[p.id]=p;});
      outgoing.forEach(function(req){
        var p=op[req.addressee_id]||{};
        var em4=p.emoji||'🌱';var name=p.display_name||p.username||'?';var un=p.username||'';
        var row=document.createElement('div');row.className='fr-row';
        row.innerHTML='<div class="fr-em">'+esc(em4)+'</div>'
          +'<div class="fr-info"><div class="fr-name">'+esc(name)+'</div><div class="fr-un">@'+esc(un)+'</div></div>'
          +'<div style="font-size:12px;color:var(--tx3);font-style:italic;">Pending…</div>';
        body.appendChild(row);
      });
    }
  }catch(e){
    var msg2=e&&e.message&&e.message.indexOf('does not exist')>-1?'Friends feature needs DB setup.':'Something went wrong.';
    body.innerHTML='<div style="text-align:center;padding:30px;color:var(--tx3);font-size:13px;">'+msg2+'</div>';
  }
}

async function renderConvList(){
  var body=document.getElementById('fr-body');
  if(!supaUser){body.innerHTML='<div style="text-align:center;padding:40px 0;color:var(--tx3);font-size:14px;">Sign in to see messages</div>';return;}
  body.innerHTML='<div style="text-align:center;padding:24px;color:var(--tx3);font-size:13px;">Loading…</div>';
  try{
    var res=await _supa.from('messages').select('*').or('from_id.eq.'+supaUser.id+',to_id.eq.'+supaUser.id).order('created_at',{ascending:false});
    if(res.error)throw res.error;
    var msgs=res.data||[];
    if(!msgs.length){
      body.innerHTML='<div style="text-align:center;padding:44px 0;"><div style="font-size:38px;margin-bottom:12px;">💬</div><div style="color:var(--tx2);font-size:14px;line-height:1.6;">No messages yet.<br>Wave or message a friend to get started.</div></div>';
      return;
    }
    var convMap={};
    msgs.forEach(function(m){
      var other=m.from_id===supaUser.id?m.to_id:m.from_id;
      if(!convMap[other]){convMap[other]={lastMsg:m,unread:0};}
      if(m.from_id!==supaUser.id&&!m.read_at)convMap[other].unread++;
    });
    var otherIds=Object.keys(convMap);
    var pRes=await _supa.from('profiles').select('id,username,display_name,emoji').in('id',otherIds);
    var profiles={};(pRes.data||[]).forEach(function(p){profiles[p.id]=p;});
    body.innerHTML='';
    otherIds.forEach(function(oid){
      var p=profiles[oid]||{};
      var em=p.emoji||'🌱';var name=p.display_name||p.username||'?';var un=p.username||'';
      var conv=convMap[oid];
      var last=conv.lastMsg.content==='__wave__'?'👋 wave':conv.lastMsg.content==='__clap__'?'👏 cheer':(conv.lastMsg.content||'');
      if(last.length>32)last=last.slice(0,32)+'…';
      var isOut=conv.lastMsg.from_id===supaUser.id;
      var t=new Date(conv.lastMsg.created_at);
      var now=new Date();
      var timeStr=t.toDateString()===now.toDateString()?t.toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'}):t.toLocaleDateString([],{month:'short',day:'numeric'});
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:11px;padding:12px 0;border-bottom:.5px solid var(--bg3);cursor:pointer;';
      row.innerHTML='<div class="fr-em">'+esc(em)+'</div>'
        +'<div style="flex:1;min-width:0;">'
          +'<div style="font-size:14px;font-weight:'+(conv.unread?700:500)+';color:var(--tx);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+esc(name)+'</div>'
          +'<div style="font-size:12px;color:var(--tx3);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(isOut?'You: ':'')+esc(last)+'</div>'
        +'</div>'
        +'<div style="display:flex;flex-direction:column;align-items:flex-end;gap:4px;flex-shrink:0;">'
          +'<div style="font-size:11px;color:var(--tx3);">'+timeStr+'</div>'
          +(conv.unread?'<div style="background:#E53E3E;color:#fff;border-radius:10px;font-size:10px;min-width:16px;padding:1px 5px;text-align:center;">'+conv.unread+'</div>':'')
        +'</div>';
      row.addEventListener('click',function(){openConvOv(oid,name,un,em);});
      body.appendChild(row);
    });
  }catch(e){
    body.innerHTML='<div style="text-align:center;padding:30px;color:var(--tx3);font-size:13px;">Error: '+(e&&e.message?e.message:'unknown')+'</div>';
  }
}

async function renderConv(){
  var container=document.getElementById('conv-msgs');
  container.innerHTML='<div style="text-align:center;padding:24px;color:var(--tx3);font-size:13px;">Loading…</div>';
  if(!supaUser||!_convUserId)return;
  try{
    var uid=supaUser.id,fid=_convUserId;
    var res=await _supa.from('messages').select('*')
      .or('and(from_id.eq.'+uid+',to_id.eq.'+fid+'),and(from_id.eq.'+fid+',to_id.eq.'+uid+')')
      .order('created_at',{ascending:true});
    if(res.error)throw res.error;
    var data=res.data||[];
    // Mark received messages as read
    var unreadIds=data.filter(function(m){return m.from_id===fid&&!m.read_at;}).map(function(m){return m.id;});
    if(unreadIds.length){await _supa.from('messages').update({read_at:new Date().toISOString()}).in('id',unreadIds);checkUnreadBadge();}
    container.innerHTML='';
    if(!data.length){
      container.innerHTML='<div style="text-align:center;padding:50px 0;"><div style="font-size:38px;margin-bottom:10px;">👋</div><div style="color:var(--tx3);font-size:13px;">Send a message or wave!</div></div>';
      return;
    }
    data.forEach(function(m,i){
      var isOut=m.from_id===uid;
      var isWave=m.content==='__wave__';
      var isClap=m.content==='__clap__';
      if(i===0||(new Date(m.created_at)-new Date(data[i-1].created_at))>3600000){
        var td=document.createElement('div');td.className='msg-time';
        td.textContent=new Date(m.created_at).toLocaleString([],{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'});
        container.appendChild(td);
      }
      var el=document.createElement('div');
      var isGift=GIFTS.indexOf(m.content)>-1;
      if(isWave||isClap){
        el.className='msg-wave';
        var other=_convName||'them';
        if(isWave)el.textContent=isOut?'👋 You waved at '+other:'👋 '+other+' waved at you';
        else el.textContent=isOut?'👏 You cheered for '+other:'👏 '+other+' cheered for you';
      } else if(isGift){
        el.className='msg-wave';
        el.style.cssText='text-align:center;padding:10px 0;';
        var gname=_convName||'them';
        var gEmoji=m.content;
        var gBig=document.createElement('div');gBig.style.cssText='font-size:34px;margin-bottom:4px;';gBig.textContent=gEmoji;el.appendChild(gBig);
        var gLine=document.createElement('div');gLine.style.cssText='font-size:13px;color:var(--tx2);margin-bottom:6px;';
        gLine.textContent=isOut?'You sent '+gname+' a '+gEmoji+'!':(gname+' sent you a '+gEmoji+'!');
        el.appendChild(gLine);
        if(!isOut){
          var others=GIFTS.filter(function(g){return g!==gEmoji;});
          var sug=others[Math.floor(Math.random()*others.length)];
          var sbBtn=document.createElement('button');
          sbBtn.style.cssText='background:var(--grl);border:1px solid var(--grm);border-radius:16px;padding:4px 12px;font-size:12px;color:var(--gr2);cursor:pointer;font-weight:600;';
          sbBtn.textContent='Send back a '+sug+'?';
          (function(s){sbBtn.addEventListener('click',async function(){await _supa.from('messages').insert({from_id:supaUser.id,to_id:_convUserId,content:s});renderConv();});})(sug);
          el.appendChild(sbBtn);
        }
      } else {el.className=isOut?'msg-out':'msg-in';el.textContent=m.content;}
      container.appendChild(el);
    });
    container.scrollTop=container.scrollHeight;
  }catch(e){
    container.innerHTML='<div style="text-align:center;padding:30px;color:var(--tx3);">Could not load messages.</div>';
  }
}

async function waveAt(toId){
  if(!supaUser)return;
  await _supa.from('messages').insert({from_id:supaUser.id,to_id:toId,content:'__wave__'});
}
async function cheerAt(toId){
  if(!supaUser)return;
  await _supa.from('messages').insert({from_id:supaUser.id,to_id:toId,content:'__clap__'});
}

async function sendMessage(){
  var inp=document.getElementById('conv-input');
  var content=(inp.value||'').trim();
  if(!content||!supaUser||!_convUserId)return;
  inp.value='';
  var btn=document.getElementById('btn-conv-send');
  btn.disabled=true;
  await _supa.from('messages').insert({from_id:supaUser.id,to_id:_convUserId,content:content});
  btn.disabled=false;
  renderConv();
}

async function searchUser(username){
  var res=document.getElementById('fr-search-result');
  if(!username){res.innerHTML='';return;}
  if(!supaUser){res.innerHTML='<div style="color:var(--tx3);font-size:13px;padding:6px 0;">Sign in to search</div>';return;}
  username=username.toLowerCase().replace(/^@/,'');
  res.innerHTML='<div style="color:var(--tx3);font-size:13px;padding:6px 0;">Searching…</div>';
  try{
    var r=await _supa.from('profiles').select('id,username,display_name,emoji').eq('username',username).maybeSingle();
    if(r.error)throw r.error;
    if(!r.data){res.innerHTML='<div style="color:var(--tx3);font-size:13px;padding:6px 0;">No user found with @'+esc(username)+'</div>';return;}
    var p=r.data;
    if(p.id===supaUser.id){res.innerHTML='<div style="color:var(--tx3);font-size:13px;padding:6px 0;">That\'s you!</div>';return;}
    var fr=await _supa.from('friendships').select('id,status,requester_id').or('and(requester_id.eq.'+supaUser.id+',addressee_id.eq.'+p.id+'),and(requester_id.eq.'+p.id+',addressee_id.eq.'+supaUser.id+')').maybeSingle();
    var btnHtml='';
    if(fr.data){
      if(fr.data.status==='accepted')btnHtml='<span style="color:var(--gr);font-size:12px;font-weight:600;">✓ Friends</span>';
      else if(fr.data.requester_id===supaUser.id)btnHtml='<span style="color:var(--tx3);font-size:12px;">Pending…</span>';
      else btnHtml='<button id="fr-add-btn" class="fr-action-btn" style="background:var(--gr);color:#fff;">Accept</button>';
    } else {
      btnHtml='<button id="fr-add-btn" class="fr-action-btn" style="background:var(--gr);color:#fff;">+ Add</button>';
    }
    res.innerHTML='<div class="fr-row" style="background:var(--bg2);border-radius:12px;padding:10px 12px;margin-top:2px;">'
      +'<div class="fr-em">'+esc(p.emoji||'🌱')+'</div>'
      +'<div class="fr-info"><div class="fr-name">'+esc(p.display_name||p.username||'?')+'</div><div class="fr-un">@'+esc(p.username||'')+'</div></div>'
      +'<div>'+btnHtml+'</div>'
      +'</div>';
    var addBtn=document.getElementById('fr-add-btn');
    if(addBtn){
      var isAccept=fr.data&&fr.data.status==='pending'&&fr.data.requester_id!==supaUser.id;
      addBtn.addEventListener('click',async function(){
        addBtn.disabled=true;addBtn.textContent='…';
        if(isAccept){
          var upd=await _supa.from('friendships').update({status:'accepted'}).eq('id',fr.data.id);
          if(upd.error){addBtn.disabled=false;addBtn.textContent='Error: '+upd.error.message;console.error('accept error',upd.error);return;}
          addBtn.textContent='Friends ✓';
        } else {
          var ins=await _supa.from('friendships').insert({requester_id:supaUser.id,addressee_id:p.id,status:'pending'});
          if(ins.error){addBtn.disabled=false;addBtn.textContent='Error';console.error('add friend error',ins.error);
            res.innerHTML+='<div style="font-size:11px;color:var(--co);margin-top:6px;">'+ins.error.message+'</div>';return;}
          addBtn.textContent='Sent!';showToast('Friend request sent! 🌱',null);
        }
      });
    }
  }catch(e){res.innerHTML='<div style="color:var(--tx3);font-size:13px;padding:6px 0;">Search failed.</div>';}
}

function _switchFrTab(tab){
  if(_frTab===tab)return;
  _frTab=tab;
  ['friends','feed','requests','messages'].forEach(function(t){document.getElementById('fr-tab-'+t).classList.toggle('on',t===tab);});
  var seg=document.getElementById('fr-seg');if(seg)positionSegThumb(seg);
  var body=document.getElementById('fr-body');
  body.style.opacity='0';
  setTimeout(function(){body.style.opacity='1';renderFriends();},80);
}
document.getElementById('fr-tab-friends').addEventListener('click',function(){_switchFrTab('friends');});
document.getElementById('fr-tab-feed').addEventListener('click',function(){_switchFrTab('feed');});
document.getElementById('fr-tab-requests').addEventListener('click',function(){_switchFrTab('requests');});
document.getElementById('fr-tab-messages').addEventListener('click',function(){_switchFrTab('messages');});
document.getElementById('btn-conv-back').addEventListener('click',closeConv);
document.getElementById('btn-conv-close').addEventListener('click',function(){closeConv();});
document.getElementById('btn-conv-send').addEventListener('click',sendMessage);
document.getElementById('conv-input').addEventListener('keydown',function(e){if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();sendMessage();}});
document.getElementById('btn-conv-wave').addEventListener('click',async function(){
  if(!supaUser||!_convUserId)return;
  var btn=this;btn.style.opacity='.5';
  await _supa.from('messages').insert({from_id:supaUser.id,to_id:_convUserId,content:'__wave__'});
  btn.style.opacity='1';renderConv();
});
document.getElementById('btn-conv-clap').addEventListener('click',async function(){
  if(!supaUser||!_convUserId)return;
  var btn=this;btn.style.opacity='.5';
  await _supa.from('messages').insert({from_id:supaUser.id,to_id:_convUserId,content:'__clap__'});
  btn.style.opacity='1';renderConv();
});
document.getElementById('fr-search').addEventListener('input',function(){
  clearTimeout(_frSearchTimer);
  var v=this.value.trim();
  _frSearchTimer=setTimeout(function(){searchUser(v);},420);
});

// ── ACTIVITY PICKER ───────────────────────────────────
function animateIn(el){
  el.style.opacity='0';
  el.style.transform='translateY(6px)';
  el.style.transition='none';
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){
      el.style.transition='opacity .18s ease, transform .2s cubic-bezier(.25,.46,.45,.94)';
      el.style.opacity='1';
      el.style.transform='translateY(0)';
    });
  });
}
function animateOut(el, cb){
  el.style.transition='opacity .12s ease, transform .12s ease';
  el.style.opacity='0';
  el.style.transform='translateY(-4px)';
  setTimeout(cb, 130);
}

var PQ=[
  {id:'mode',q:'Mind or body?',sub:'',opts:[{v:'mental',lbl:'Mental',em:'🧠'},{v:'physical',lbl:'Physical',em:'💪'},{v:'creative',lbl:'Creative',em:'🎨'},{v:'calm',lbl:'Something calm',em:'🌿'},{v:'any',lbl:'Down for whatever',em:'🎲'}]},
  {id:'time',q:'How long is your window?',sub:'',opts:[{v:'short',lbl:'15-30 min',em:'⚡'},{v:'medium',lbl:'30-90 min',em:'⏱️'},{v:'long',lbl:'2+ hours',em:'🕰️'},{v:'flex',lbl:'No limit',em:'🌊'}]},
  {id:'energy',q:'How does your body feel?',sub:'',opts:[{v:'low',lbl:'Low / drained',em:'😴'},{v:'mid',lbl:'Moderate',em:'😐'},{v:'high',lbl:'Fired up',em:'⚡'},{v:'restless',lbl:'Restless',em:'🤸'}]},
  {id:'social',q:'Solo or social?',sub:'',opts:[{v:'solo',lbl:'Solo',em:'🎯'},{v:'social',lbl:'With others',em:'👫'},{v:'either',lbl:'Either',em:'✨'}]},
];
var pqStep=0, pqA={};

function openPicker(){if(active){resumeSess();return;}pqStep=0;pqA={};document.getElementById('pq-ov').classList.add('on');rPQ();}
function closePicker(){document.getElementById('pq-ov').classList.remove('on');}

function rPQ(){
  if(pqStep>=PQ.length){rResults();return;}
  var q=PQ[pqStep];
  var body=document.getElementById('pq-body');
  body.innerHTML='';
  var qEl=document.createElement('div');qEl.className='pq-q';qEl.textContent=q.q;if(!q.sub)qEl.style.marginBottom='14px';body.appendChild(qEl);
  if(q.sub){var sEl=document.createElement('div');sEl.className='pq-sub';sEl.textContent=q.sub;body.appendChild(sEl);}
  var grid=document.createElement('div');grid.className='pq-opts';
  q.opts.forEach(function(o,idx){
    var opt=document.createElement('div');opt.className='pq-opt';
    if(idx===q.opts.length-1&&q.opts.length%2===1){opt.style.gridColumn='1/-1';}
    opt.innerHTML='<span class="pq-em">'+o.em+'</span>'+o.lbl;
    opt.addEventListener('click',function(){aPQ(q.id,o.v);});
    grid.appendChild(opt);
  });
  body.appendChild(grid);
  if(pqStep>0){var back=document.createElement('button');back.className='btn btn-s';back.style.marginTop='10px';back.textContent='Back';back.addEventListener('click',function(){pqStep--;rPQ();});body.appendChild(back);}
  var orDiv=document.createElement('div');orDiv.className='or-div';orDiv.innerHTML='<div class="or-line"></div><div class="or-txt">or</div><div class="or-line"></div>';body.appendChild(orDiv);
  var browse=document.createElement('button');browse.className='btn btn-s';browse.textContent='Browse all activities directly';browse.addEventListener('click',showBrowse);body.appendChild(browse);
  var cancel=document.createElement('button');cancel.className='btn btn-s';cancel.style.marginTop='6px';cancel.textContent='Cancel';cancel.addEventListener('click',closePicker);body.appendChild(cancel);
  animateIn(body);
}
function aPQ(qid,val){
  pqA[qid]=val;
  var body=document.getElementById('pq-body');
  animateOut(body, function(){pqStep++;rPQ();});
}

function scoreA(a){
  var sc=0,t=a.tags||[],cat=a.cat||'';
  // Tag match for chosen mode
  if(pqA.mode==='any'){sc+=Math.random()*3;}
  else if(pqA.mode==='physical'&&t.includes('physical'))sc+=3;
  else if(pqA.mode==='mental'&&t.includes('mental'))sc+=3;
  else if(pqA.mode==='creative'&&t.includes('creative'))sc+=3;
  else if(pqA.mode==='calm'&&t.includes('calm'))sc+=3;
  // Category bonus: prefer activities whose primary category matches the mode
  // This breaks ties so e.g. mode=mental ranks Learning above Creative-with-mental-tag
  if(pqA.mode==='mental'&&(cat==='Learning'||cat==='Mindfulness'||cat==='Digital'||cat==='Productive'))sc+=2;
  if(pqA.mode==='creative'&&(cat==='Creative'||cat==='Digital'))sc+=2;
  if(pqA.mode==='physical'&&(cat==='Active'||cat==='Outdoor'))sc+=2;
  if(pqA.mode==='calm'&&(cat==='Mindfulness'||cat==='Entertainment'||cat==='Learning'))sc+=2;
  if(pqA.social==='solo'&&t.includes('solo'))sc+=2;
  if(pqA.social==='social'&&t.includes('social'))sc+=2;
  if(pqA.social==='either')sc+=1;
  if(pqA.energy==='low'){
    if(t.includes('calm'))sc+=3;
    else if(t.includes('mental'))sc+=2;
    if(t.includes('physical'))sc-=2;
    if(t.includes('creative')&&!t.includes('calm'))sc-=1;
  }else if(pqA.energy==='high'){
    if(t.includes('physical'))sc+=3;
    if(t.includes('calm')&&!t.includes('creative'))sc-=1;
  }else if(pqA.energy==='restless'){
    if(t.includes('physical'))sc+=3;
    if(t.includes('calm'))sc-=2;
  }else if(pqA.energy==='mid'){sc+=1;}
  return{a:a,sc:sc};
}

function rResults(){
  var arr=myActs.slice();
  for(var i=arr.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var tmp=arr[i];arr[i]=arr[j];arr[j]=tmp;}
  var scored=arr.map(scoreA).sort(function(a,b){return b.sc-a.sc;});
  var maxSc=(scored[0]&&scored[0].sc>0)?scored[0].sc:1;
  var body=document.getElementById('pq-body');
  body.innerHTML='';
  var h=document.createElement('div');h.style.cssText='font-family:var(--serif);font-size:17px;font-weight:700;margin-bottom:3px;';h.textContent='Ready for the field';body.appendChild(h);
  var s=document.createElement('div');s.style.cssText='font-size:13px;color:var(--tx2);margin-bottom:12px;';s.textContent='Tap one to start growing';body.appendChild(s);
  scored.slice(0,4).forEach(function(r){
    var pct=Math.round((r.sc/maxSc)*100);
    var cnt=_sessFor(r.a.id).length;
    var last=_sessFor(r.a.id).slice().sort(function(a,b){return b.date-a.date;})[0];
    var days=last?Math.floor((Date.now()-last.date)/86400000):9999;
    var hist=cnt===0?'Never grown':days<2?'Just tended':days+'d ago - '+cnt+'x';
    var card=document.createElement('div');card.className='rc';
    card.innerHTML='<div class="rc-top"><div class="rc-em">'+r.a.emoji+'</div><div><div class="rc-name">'+r.a.name+'</div><span class="rc-badge cat-'+r.a.cat+'">'+r.a.cat+'</span></div></div><div class="rc-hist">'+hist+'</div><div class="mb"><div class="mf" style="width:'+pct+'%"></div></div>';
    card.addEventListener('click',function(){startFrom(r.a.id);});
    body.appendChild(card);
  });
  var tryAgain=document.createElement('button');tryAgain.className='btn btn-s';tryAgain.textContent='← Back';tryAgain.addEventListener('click',function(){pqStep=Math.max(0,pqStep-1);rPQ();});body.appendChild(tryAgain);
  var orDiv=document.createElement('div');orDiv.className='or-div';orDiv.innerHTML='<div class="or-line"></div><div class="or-txt">or</div><div class="or-line"></div>';body.appendChild(orDiv);
  var browse=document.createElement('button');browse.className='btn btn-s';browse.textContent='Browse all activities';browse.addEventListener('click',showBrowse);body.appendChild(browse);
  var cancel=document.createElement('button');cancel.className='btn btn-s';cancel.style.marginTop='6px';cancel.textContent='Cancel';cancel.addEventListener('click',closePicker);body.appendChild(cancel);
  animateIn(body);
}

function _transitionNotesBody(fn){
  fn();
  animateIn(document.getElementById('notes-body'));
}

function showBrowse(){
  var body=document.getElementById('pq-body');body.innerHTML='';
  buildActPicker({container:body,sheet:document.querySelector('#pq-ov .sh'),title:'Pick from your seeds',titleSize:17,maxH:'38vh',focusPill:true,focusMark:true,
    onPick:function(a){startFrom(a.id);},
    footer:function(c){c.appendChild(_pickerStickyRow([
      {label:'← Back',fn:function(){pqStep=0;pqA={};rPQ();}},
      {label:'Cancel',fn:closePicker}
    ]));}});
  animateIn(body);
}

function startFrom(id){closePicker();active={actId:id,startedAt:Date.now(),pausedAt:null,pauseMs:0};sv();nav('home');}
function resumeSess(){if(!active)return;openFinish(active.actId,'home');}
// Running time of the active session: wall clock minus whatever was spent paused
function _activeElapsed(){if(!active)return 0;return Math.max(0,(active.pausedAt||Date.now())-active.startedAt-(active.pauseMs||0));}
function toggleSessPause(){
  if(!active)return;
  if(active.pausedAt){active.pauseMs=(active.pauseMs||0)+(Date.now()-active.pausedAt);active.pausedAt=null;}
  else active.pausedAt=Date.now();
  sv();rHome();
}

var _lastSuggestedId=null;
function suggestAct(){
  if(!myActs.length){showToast('Plant some seeds first!',null);return;}
  var now=Date.now();
  var hour=new Date().getHours();
  var pool=hasFocusSet()?myActs.filter(function(a){return isFocused(a.id);}):myActs;
  if(!pool.length)pool=myActs;
  // Time-based filter: late night (10pm–5am), skip high-energy physical/outdoor
  function _timeOk(a){
    if(hour>=22||hour<5){
      var tags=a.tags||[];var cat=a.cat||'';
      if(cat==='Active'||cat==='Outdoor')return false;
      if(tags.indexOf('physical')>-1||tags.indexOf('outdoor')>-1)return false;
    }
    return true;
  }
  var timeFiltPool=pool.filter(_timeOk);
  if(timeFiltPool.length)pool=timeFiltPool;
  var candidates=pool.filter(function(a){return a.id!==_lastSuggestedId;});
  if(!candidates.length)candidates=pool;
  var scored=candidates.map(function(a){
    var lastS=_sessFor(a.id).slice().sort(function(x,y){return y.date-x.date;})[0];
    var daysSince=lastS?(now-lastS.date)/(24*3600*1000):999;
    // Morning (5am–9am): boost calm/mindfulness activities
    var timeBonus=0;
    if(hour>=5&&hour<9){var tags=a.tags||[];if(tags.indexOf('calm')>-1||a.cat==='Mindfulness')timeBonus=4;}
    return{a:a,score:daysSince+Math.random()*3+timeBonus};
  });
  scored.sort(function(a,b){return b.score-a.score;});
  var pick=scored[0].a;
  _lastSuggestedId=pick.id;
  var body=document.getElementById('pq-body');body.innerHTML='';
  var h=document.createElement('div');h.style.cssText='font-family:var(--serif);font-size:17px;font-weight:700;margin-bottom:4px;';h.textContent='🎲 How about this?';body.appendChild(h);
  var card=document.createElement('div');card.style.cssText='background:var(--bg2);border-radius:16px;padding:20px;text-align:center;margin:16px 0;';
  card.innerHTML='<div style="font-size:48px;margin-bottom:8px;">'+pick.emoji+'</div><div style="font-size:18px;font-weight:700;margin-bottom:4px;">'+pick.name+'</div><div style="font-size:12px;color:var(--tx2);">'+pick.cat+'</div>';
  body.appendChild(card);
  var startBtn=document.createElement('button');startBtn.className='btn btn-p';startBtn.textContent='Start this now';
  startBtn.addEventListener('click',function(){closePicker();startFrom(pick.id);});body.appendChild(startBtn);
  var again=document.createElement('button');again.className='btn btn-s';again.style.marginTop='8px';again.textContent='Try another suggestion';
  again.addEventListener('click',suggestAct);body.appendChild(again);
  var cancel=document.createElement('button');cancel.className='btn btn-s';cancel.style.marginTop='8px';cancel.textContent='Cancel';cancel.addEventListener('click',closePicker);body.appendChild(cancel);
  document.getElementById('pq-ov').classList.add('on');
}

function showQuickLog(preDate){
  if(!myActs.length){openAdd();return;}
  var body=document.getElementById('pq-body');body.innerHTML='';
  var subTxt=preDate?'Which activity? Session will be dated '+new Date(preDate+'T12:00:00').toLocaleDateString(undefined,{weekday:'long',month:'short',day:'numeric'})+'.':'Which activity did you just do?';
  buildActPicker({container:body,sheet:document.querySelector('#pq-ov .sh'),title:'Log session',titleSize:17,sub:subTxt,
    onPick:function(a){closePicker();openLogDirect(a.id,'home',preDate);},
    footer:function(c){var cancel=document.createElement('button');cancel.className='btn btn-s';cancel.style.marginTop='10px';cancel.textContent='Cancel';cancel.addEventListener('click',closePicker);c.appendChild(cancel);},
    autofocus:0});
  document.getElementById('pq-ov').classList.add('on');
}

// ── LOG SESSION ───────────────────────────────────────
var logId=null, logRating=0, logFeels=[], logMomentum='', logTimeOfDay='morning';
function _currentPeriod(){var h=new Date().getHours();if(h<12)return'morning';if(h<17)return'afternoon';return'evening';}
var STAR_LBLS={0.5:'Rough session',1:'Not great',1.5:'Okay-ish',2:'Decent',2.5:'Pretty good',3:'Good session',3.5:'Really good',4:'Great session',4.5:'Excellent',5:'Perfect ⭐'};
function normRating(r){if(!r)return 0;return r>5?Math.round(r/2*2)/2:r;}
var POS_FEELS=['⚡ Energized','😌 Calm','🌟 Proud','✨ Inspired','🎯 Focused','😊 Happy','💪 Accomplished','🥰 Good','🤩 Excited'];
var NEG_FEELS=['🤔 Unsure','😴 Tired','😵 Distracted','😤 Frustrated','🪫 Drained','🤔 Rusty','😐 Meh'];
function makeFeelsCategories(wrap,feelsArr){
  var openPos=false,openNeg=false;
  function render(){
    wrap.innerHTML='';
    var row=document.createElement('div');row.style.cssText='display:flex;gap:8px;';
    [['+  Positive',POS_FEELS,'pos'],['−  Negative',NEG_FEELS,'neg']].forEach(function(cfg){
      var lbl=cfg[0],list=cfg[1],key=cfg[2];
      var isOpen=key==='pos'?openPos:openNeg;
      var hasSel=list.some(function(f){return feelsArr.indexOf(f)>-1;});
      var btn=document.createElement('button');btn.type='button';
      btn.style.cssText='flex:1;padding:9px 0;border-radius:10px;border:1.5px solid '+(isOpen?'var(--gr)':'var(--bg3)')+';background:'+(isOpen?'var(--grl)':'#fff')+';font-size:13px;font-weight:600;color:'+(isOpen?'var(--gr2)':'var(--tx2)')+';cursor:pointer;transition:all .15s;'+(hasSel?'box-shadow:0 0 0 2px var(--grm);':'');
      btn.textContent=lbl+(hasSel?' ·':'');
      btn.addEventListener('click',function(){if(key==='pos')openPos=!openPos;else openNeg=!openNeg;render();});
      row.appendChild(btn);
    });
    wrap.appendChild(row);
    [[openPos,POS_FEELS],[openNeg,NEG_FEELS]].forEach(function(cfg){
      if(!cfg[0])return;
      var fr=document.createElement('div');fr.style.cssText='display:flex;flex-wrap:wrap;gap:6px;margin-top:8px;';
      cfg[1].forEach(function(f,idx){
        var b=document.createElement('div');b.className='fb'+(feelsArr.indexOf(f)>-1?' on':'');b.textContent=f;
        b.style.cssText+='opacity:0;transform:translateY(6px);transition:opacity .18s ease,transform .18s ease;transition-delay:'+(idx*28)+'ms;';
        b.addEventListener('click',function(){var i=feelsArr.indexOf(f);if(i>-1)feelsArr.splice(i,1);else feelsArr.push(f);render();});
        fr.appendChild(b);
      });
      wrap.appendChild(fr);
      requestAnimationFrame(function(){
        fr.querySelectorAll('.fb').forEach(function(b){b.style.opacity='1';b.style.transform='translateY(0)';});
      });
    });
  }
  render();
}
function makeMomentumScale(wrap,current,onChange){
  var labels=['Not really','Somewhat','Definitely',"Can't stop now"];
  wrap.innerHTML='';
  var row=document.createElement('div');
  row.style.cssText='display:flex;justify-content:flex-start;align-items:center;gap:12px;';
  labels.forEach(function(lbl,i){
    var circle=document.createElement('div');
    var isOn=current===lbl;
    circle.style.cssText='width:40px;height:40px;border-radius:50%;border:1.5px solid '+(isOn?'var(--gr)':'var(--bg3)')+';background:'+(isOn?'var(--gr)':'#fff')+';color:'+(isOn?'#fff':'var(--tx2)')+';display:flex;align-items:center;justify-content:center;font-size:14px;font-weight:600;cursor:pointer;transition:background .15s,border-color .15s,color .15s,transform .12s cubic-bezier(.34,1.56,.64,1);user-select:none;flex-shrink:0;';
    circle.textContent=i+1;
    circle.addEventListener('click',(function(c,l){return function(){c.style.transform='scale(0.8)';setTimeout(function(){onChange(l);makeMomentumScale(wrap,l,onChange);},80);};})(circle,lbl));
    row.appendChild(circle);
  });
  wrap.appendChild(row);
  var ends=document.createElement('div');
  ends.style.cssText='display:flex;gap:12px;margin-top:5px;';
  var noL=document.createElement('span');noL.style.cssText='font-size:11px;color:var(--tx3);width:40px;text-align:center;';noL.textContent='No';
  var midL=document.createElement('span');midL.style.cssText='font-size:11px;color:transparent;width:40px;flex:none;';midL.textContent='.';
  var mid2L=document.createElement('span');mid2L.style.cssText='font-size:11px;color:transparent;width:40px;flex:none;';mid2L.textContent='.';
  var yesL=document.createElement('span');yesL.style.cssText='font-size:11px;color:var(--tx3);width:40px;text-align:center;';yesL.textContent='Yes';
  ends.appendChild(noL);ends.appendChild(midL);ends.appendChild(mid2L);ends.appendChild(yesL);
  wrap.appendChild(ends);
}
function makeStarRating(wrap,initVal,onChg){
  wrap.innerHTML='';wrap.style.cssText='display:flex;gap:8px;';
  var cur=initVal||0,sEls=[];
  function apply(val){
    sEls.forEach(function(s,i){
      var n=i+1;
      if(val>=n){s.style.cssText='font-size:28px;cursor:pointer;line-height:1;user-select:none;color:var(--gr);';}
      else if(val>=n-0.5){s.style.cssText='font-size:28px;cursor:pointer;line-height:1;user-select:none;background:linear-gradient(to right,var(--gr) 50%,var(--bg3) 50%);-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;';}
      else{s.style.cssText='font-size:28px;cursor:pointer;line-height:1;user-select:none;color:var(--bg3);';}
    });
  }
  for(var i=1;i<=5;i++){(function(n){
    var s=document.createElement('span');s.textContent='★';
    function hit(clientX){var r=s.getBoundingClientRect();return clientX-r.left<r.width/2?n-0.5:n;}
    s.addEventListener('click',function(e){cur=hit(e.clientX);apply(cur);onChg(cur,STAR_LBLS[cur]||'');});
    s.addEventListener('mousemove',function(e){apply(hit(e.clientX));});
    s.addEventListener('touchstart',function(e){e.preventDefault();cur=hit(e.touches[0].clientX);apply(cur);onChg(cur,STAR_LBLS[cur]||'');},{passive:false});
    wrap.appendChild(s);sEls.push(s);
  })(i);}
  wrap.addEventListener('mouseleave',function(){apply(cur);});
  apply(cur);
}

function setupLogScreen(id,from,startedAt,preDate){
  backFrom=from;logId=id;logRating=0;logFeels=[];logMomentum='';
  var a=myActs.find(function(x){return x.id===id;});
  var cnt=_sessFor(id).length;
  document.getElementById('le').textContent=a.emoji;
  document.getElementById('lt').textContent=a.name;
  document.getElementById('ls').textContent=cnt===0?'First session!':cnt+' session'+(cnt!==1?'s':'')+' so far';

  if(startedAt){
    document.getElementById('lbadge-wrap').innerHTML='<div class="lbadge">🌱 Started at '+new Date(startedAt).toLocaleTimeString([],{hour:'2-digit',minute:'2-digit'})+'</div>';
    var elapsedMin=function(){
      if(active&&active.startedAt===startedAt)return Math.round(_activeElapsed()/60000);
      return Math.max(0,Math.round((Date.now()-startedAt)/60000));
    };
    var elMin=elapsedMin();
    document.getElementById('lh').value=Math.floor(elMin/60);
    document.getElementById('lm').value=elMin%60;
    var auBtn=document.getElementById('au-btn');
    auBtn.textContent='Use actual time ('+elMin+'min)';
    auBtn.onclick=function(){var e=elapsedMin();document.getElementById('lh').value=Math.floor(e/60);document.getElementById('lm').value=e%60;};
  } else {
    document.getElementById('lbadge-wrap').innerHTML='';
    document.getElementById('lh').value=0;
    document.getElementById('lm').value=30;
    document.getElementById('au-btn').textContent='';
  }

  // Task check-off for projects
  var tw=document.getElementById('log-tasks-wrap');
  var tl=document.getElementById('log-tasks-list');
  if(isProject(a)){
    var _openTasks=getProjectTasks(a).filter(function(t){return !t.done;});
    if(_openTasks.length){
      tw.style.display='';
      tl.innerHTML='';
      _openTasks.forEach(function(t){
        var row=document.createElement('label');
        row.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 12px;background:var(--bg2);border-radius:10px;margin-bottom:6px;cursor:pointer;';
        var safe=(t.text||'').replace(/</g,'&lt;');
        row.innerHTML='<input type="checkbox" class="log-task-check" data-tid="'+t.id+'" style="width:18px;height:18px;accent-color:var(--gr);flex-shrink:0;"><span style="font-size:13px;color:var(--tx);flex:1;line-height:1.4;">'+safe+'</span>';
        tl.appendChild(row);
      });
    } else { tw.style.display='none'; }
  } else { tw.style.display='none'; }

  logFeels=[];
  var feels=document.getElementById('feels');
  makeFeelsCategories(feels,logFeels);

  logRating=0;
  makeStarRating(document.getElementById('stars'),0,function(val,lbl){logRating=val;document.getElementById('slbl').textContent=lbl;});
  var _logToday=!preDate;
  var logTodayBtn=document.getElementById('log-today-btn');
  var logDateInp=document.getElementById('log-date');
  logDateInp.value=preDate||new Date().toLocaleDateString('en-CA');
  if(_logToday){
    logDateInp.style.display='none';
    logTodayBtn.style.background='var(--grl)';logTodayBtn.style.color='var(--gr2)';logTodayBtn.style.borderColor='var(--grm)';logTodayBtn.textContent='✓ Today';
  } else {
    logDateInp.style.display='block';
    logTodayBtn.style.background='var(--bg2)';logTodayBtn.style.color='var(--tx2)';logTodayBtn.style.borderColor='var(--bg3)';logTodayBtn.textContent='Pick a date';
  }
  logTodayBtn.onclick=function(){
    _logToday=!_logToday;
    if(_logToday){logDateInp.style.display='none';logTodayBtn.textContent='✓ Today';logTodayBtn.style.background='var(--grl)';logTodayBtn.style.color='var(--gr2)';logTodayBtn.style.borderColor='var(--grm)';}
    else{logDateInp.style.display='block';logDateInp.value=new Date().toLocaleDateString('en-CA');logTodayBtn.textContent='Pick a date';logTodayBtn.style.background='var(--bg2)';logTodayBtn.style.color='var(--tx2)';logTodayBtn.style.borderColor='var(--bg3)';}
  };
  logTimeOfDay=_currentPeriod();
  var todWrap=document.getElementById('log-timeofday');todWrap.innerHTML='';
  [{v:'morning',l:'🌅 Morning'},{v:'afternoon',l:'☀️ Afternoon'},{v:'evening',l:'🌙 Evening'}].forEach(function(p){
    var b=document.createElement('div');b.className='fb'+(logTimeOfDay===p.v?' on':'');b.textContent=p.l;
    b.addEventListener('click',function(){logTimeOfDay=p.v;todWrap.querySelectorAll('.fb').forEach(function(x){x.classList.remove('on');});b.classList.add('on');});
    todWrap.appendChild(b);
  });
  document.getElementById('ln').value='';
  document.getElementById('ln-well').value='';
  document.getElementById('ln-diff').value='';
  document.getElementById('reflection-body').style.display='none';
  document.getElementById('reflection-arrow').style.transform='rotate(0deg)';
  document.getElementById('slbl').textContent='';
  var mom=document.getElementById('momentum');
  makeMomentumScale(mom,'',function(val){logMomentum=val;});
  show('s-log');
}

function _fmtMins(m){if(m===0)return '0m';return(m>=60?Math.floor(m/60)+'h ':'')+(m%60?m%60+'m':'');}
function _periodMins(sArr){return sArr.reduce(function(t,s){return t+(s.hours||0)*60+(s.mins||0);},0);}

var STREAK_GRACE=3;
function calcStreak(){
  if(!sessions.length)return 0;
  var today=new Date();today.setHours(0,0,0,0);
  var todayMs=today.getTime();
  var hasTodaySess=sessions.some(function(s){return s.date>=todayMs&&s.date<todayMs+86400000;});
  var earliestSess=sessions.reduce(function(m,s){return s.date<m?s.date:m;},Infinity);
  var earliestDay=new Date(earliestSess);earliestDay.setHours(0,0,0,0);
  var streak=0,graceUsed=0;
  var d=new Date(today);
  if(!hasTodaySess)d.setDate(d.getDate()-1);
  while(d.getTime()>=earliestDay.getTime()){
    var start=d.getTime(),end=start+86400000;
    if(sessions.some(function(s){return s.date>=start&&s.date<end;})){
      streak++;
    } else {
      graceUsed++;
      if(graceUsed>STREAK_GRACE)break;
    }
    d.setDate(d.getDate()-1);
  }
  return streak;
}

function openTodayOverview(){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var now=new Date();
  var mid=new Date(now);mid.setHours(0,0,0,0);
  var todaySess=sessions.filter(function(s){return new Date(s.date).toDateString()===now.toDateString();});
  var scheduled=_getTodayScheduled();
  var focusActs=_focusedActs();
  var focusProjects=focusActs.filter(isProject);
  var openTasks=[];
  focusProjects.forEach(function(p){getProjectTasks(p).forEach(function(t){if(!t.done)openTasks.push({proj:p,task:t});});});

  var hdr=document.createElement('div');
  // Centre the button against the whole header block: flex-start lined its box
  // up with the text box, but the heading's line-height leaves leading above the
  // glyphs, so the button's visible edge sat higher than 'Today'.
  hdr.style.cssText='margin-bottom:18px;display:flex;align-items:center;gap:12px;';
  var hdrText=document.createElement('div');
  hdrText.style.cssText='flex:1;min-width:0;';
  hdrText.innerHTML='<div style="font-family:var(--serif);font-size:22px;font-weight:700;letter-spacing:-.005em;line-height:1.2;">Today</div>';
  hdr.appendChild(hdrText);
  // Shortcut straight to the calendar — this sheet is where you land when
  // you're thinking about the day, so the month view is one tap away.
  var calBtn=document.createElement('button');
  calBtn.type='button';
  calBtn.setAttribute('aria-label','Open calendar');
  calBtn.title='Calendar';
  calBtn.textContent='🗓️';
  calBtn.style.cssText='flex-shrink:0;width:40px;height:40px;border-radius:12px;background:var(--bg2);border:var(--br);font-size:19px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;padding:0;transition:transform .12s ease,background .15s ease;';
  calBtn.addEventListener('pointerdown',function(){calBtn.style.transform='scale(.92)';});
  ['pointerup','pointerleave','pointercancel'].forEach(function(ev){
    calBtn.addEventListener(ev,function(){calBtn.style.transform='';});
  });
  calBtn.addEventListener('click',function(){closeEd();setTimeout(openCalendar,60);});
  hdr.appendChild(calBtn);
  sh.appendChild(hdr);

  function subHdr(text){
    var el=document.createElement('div');
    el.style.cssText='font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:1.2px;margin:14px 0 8px;';
    el.textContent=text;
    return el;
  }

  // ── Scheduled ──
  if(scheduled.length){
    sh.appendChild(subHdr('Scheduled'));
    scheduled.forEach(function(it){
      var dur=it.duration?(' · '+(it.duration>=1?it.duration+'h':(Math.round(it.duration*60))+'m')):'';
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--grl);background:color-mix(in srgb,var(--gr) 14%,var(--bg));border:1px solid color-mix(in srgb,var(--gr) 30%,var(--bg));border-radius:12px;margin-bottom:6px;';
      row.innerHTML='<div style="font-size:11px;font-weight:700;color:var(--gr2);min-width:36px;letter-spacing:.02em;text-transform:uppercase;">'+(it.hour==null?'Any':_fmtHour12(it.hour))+'</div>'
        +'<div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--gr2);line-height:1.2;">'+(it.name||'Untitled')+'</div><div style="font-size:11px;color:var(--gr2);opacity:.75;margin-top:2px;">'+(it.kind==='routine'?'Routine':'Planned')+dur+(function(){var du=dueShort(_actById(it.actId));return du?' · <span style="'+(du.overdue?'color:var(--co2);opacity:1;':'')+'font-weight:600;">'+du.text+'</span>':'';})()+'</div></div>'
        +'<button data-startid="'+(it.actId||'')+'" style="background:var(--gr);color:#FFFBF3;border:none;border-radius:12px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;">Start</button>'
        +'<button data-schedid="'+it.id+'" data-schedkind="'+it.kind+'" aria-label="Remove" style="background:transparent;border:1px solid color-mix(in srgb,var(--gr2) 45%,transparent);color:var(--gr2);border-radius:50%;width:26px;height:26px;font-size:13px;font-weight:600;cursor:pointer;display:flex;align-items:center;justify-content:center;flex-shrink:0;line-height:1;">✕</button>';
      sh.appendChild(row);
    });
  }

  // ── Logged today ──
  if(todaySess.length){
    sh.appendChild(subHdr('Logged today'));
    var lWrap=document.createElement('div');
    lWrap.style.cssText='background:var(--bg2);border-radius:12px;padding:2px 12px;';
    todaySess.slice().reverse().forEach(function(s,i,arr){
      var act=myActs.find(function(a){return a.id===s.actId;})||{emoji:'?',name:'Unknown'};
      var mins=(s.hours||0)*60+(s.mins||0);
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 0;'+(i<arr.length-1?'border-bottom:.5px solid var(--bg3);':'');
      row.innerHTML='<span style="font-size:18px;">'+act.emoji+'</span><div style="flex:1;font-size:13px;font-weight:600;">'+act.name+'</div><div style="font-size:12px;color:var(--gr);font-weight:600;">'+(mins>=60?Math.floor(mins/60)+'h '+(mins%60)+'m':mins+'m')+'</div>';
      lWrap.appendChild(row);
    });
    sh.appendChild(lWrap);
  }

  // Nothing scheduled or logged yet: say what this sheet is for
  if(sh.childElementCount===1){
    var empty=document.createElement('div');
    empty.style.cssText='background:var(--bg2);border-radius:12px;padding:14px 16px;text-align:left;font-size:13px;line-height:1.5;color:var(--tx2);';
    empty.innerHTML='A quiet day so far.<br><span style="color:var(--tx3);">Plan something or log a session to fill it in.</span>';
    sh.appendChild(empty);
  }

  // ── Quick actions ──
  var spacer=document.createElement('div');spacer.style.height='18px';sh.appendChild(spacer);
  var actRow=document.createElement('div');
  actRow.style.cssText='display:flex;gap:8px;';
  var schedBtn=document.createElement('button');
  schedBtn.className='btn btn-p';schedBtn.style.flex='1';schedBtn.textContent='+ Schedule';
  schedBtn.addEventListener('click',function(){closeEd();setTimeout(function(){_calScheduleForm(mid);},60);});
  actRow.appendChild(schedBtn);
  var logBtn=document.createElement('button');
  logBtn.className='btn btn-s';logBtn.style.flex='1';logBtn.textContent='+ Log session';
  logBtn.addEventListener('click',function(){closeEd();setTimeout(function(){openGardenQuickLog();},60);});
  actRow.appendChild(logBtn);
  sh.appendChild(actRow);

  // Wire schedule Start buttons
  sh.querySelectorAll('button[data-startid]').forEach(function(b){
    b.addEventListener('click',function(e){e.stopPropagation();var id=this.dataset.startid;if(id){closeEd();openActInfo(id,'home');}});
  });
  // Wire schedule × remove buttons
  sh.querySelectorAll('button[data-schedid]').forEach(function(b){
    b.addEventListener('click',function(e){
      e.stopPropagation();
      var id=this.dataset.schedid,kind=this.dataset.schedkind;
      if(kind==='routine'){
        if(!confirm('Remove this routine?'))return;
        calRoutines=calRoutines.filter(function(r){return r.id!==id;});
      } else {
        calPlanned=calPlanned.filter(function(p){return p.id!==id;});
      }
      sv();
      if(document.getElementById('s-home').classList.contains('on'))rHome();
      openTodayOverview();
    });
  });

  document.getElementById('ed-ov').classList.add('on');
}

function openWeeklySummary(preferLast){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var ov=document.getElementById('ed-ov');
  var today=new Date();today.setHours(0,0,0,0);
  var thisMonStart=_startOf('week');
  var lastMonStart=thisMonStart-7*86400000;
  var lastWkSess=sessions.filter(function(s){return s.date>=lastMonStart&&s.date<thisMonStart;});
  var thisWkSess=sessions.filter(function(s){return s.date>=thisMonStart;});
  var showLast=preferLast===true&&lastWkSess.length>0;
  var wkSess=showLast?lastWkSess:thisWkSess;
  var wkStartMs=showLast?lastMonStart:thisMonStart;
  var wkEndMs=showLast?thisMonStart:today.getTime()+86400000;
  var wkMins=_periodMins(wkSess);
  var wkDays=new Set();
  wkSess.forEach(function(s){var d=new Date(s.date);d.setHours(0,0,0,0);wkDays.add(d.getTime());});
  var daysActive=wkDays.size;
  var actCount={};
  wkSess.forEach(function(s){actCount[s.actId]=(actCount[s.actId]||0)+1;});
  var topActs=Object.keys(actCount).sort(function(a,b){return actCount[b]-actCount[a];}).slice(0,3).map(function(id){
    var a=myActs.find(function(x){return x.id===id;})||archivedActs.find(function(x){return x.id===id;});
    return a?{emoji:a.emoji,name:a.name,count:actCount[id]}:null;
  }).filter(Boolean);
  var MNAMES=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  var wkStartDate=new Date(wkStartMs),wkEndDate=new Date(wkEndMs-86400000);
  var dateStr=MNAMES[wkStartDate.getMonth()]+' '+wkStartDate.getDate()+' – '+wkEndDate.getDate();
  var hdr=document.createElement('div');hdr.style.cssText='text-align:center;margin-bottom:20px;';
  hdr.innerHTML=(showLast?'<div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:1px;color:var(--tx3);margin-bottom:5px;">Last week</div>':'')
    +'<div style="font-family:var(--serif);font-size:18px;font-weight:700;">'+dateStr+'</div>'
    +(wkSess.length?'':'<div style="font-size:13px;color:var(--tx3);margin-top:8px;">No sessions logged.</div>');
  sh.appendChild(hdr);
  if(wkSess.length){
    var grid=document.createElement('div');
    grid.style.cssText='background:var(--bg2);border-radius:14px;padding:12px 10px;margin-bottom:16px;display:flex;align-items:flex-start;gap:8px;';
    function mkStat(val){var d=document.createElement('div');d.style.cssText='flex:1;min-width:0;text-align:center;';d.innerHTML='<div style="font-family:var(--serif);font-size:16px;font-weight:700;color:var(--gr2);line-height:1.1;white-space:nowrap;">'+val+'</div>';grid.appendChild(d);}
    mkStat(wkSess.length+'×');
    mkStat(Math.floor(wkMins/60)+'h '+(wkMins%60)+'m');
    mkStat(daysActive+'/7');
    sh.appendChild(grid);
    if(topActs.length){
      var actLbl=document.createElement('div');actLbl.style.cssText='font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.7px;color:var(--tx3);margin-bottom:8px;';actLbl.textContent='Most grown';sh.appendChild(actLbl);
      var actList=document.createElement('div');actList.style.cssText='background:var(--bg2);border-radius:14px;padding:0 14px;margin-bottom:16px;';
      topActs.forEach(function(a,i){var row=document.createElement('div');row.style.cssText='display:flex;align-items:center;gap:10px;padding:10px 0;'+(i<topActs.length-1?'border-bottom:.5px solid var(--bg3);':'');row.innerHTML='<span style="font-size:18px;">'+a.emoji+'</span><span style="font-size:14px;font-weight:600;color:var(--tx);flex:1;">'+a.name+'</span><span style="font-size:12px;color:var(--tx3);">'+a.count+' session'+(a.count>1?'s':'')+'</span>';actList.appendChild(row);});
      sh.appendChild(actList);
    }
  }
  var closeBtn=document.createElement('button');closeBtn.className='btn btn-p';closeBtn.textContent='Keep growing';closeBtn.addEventListener('click',closeEd);sh.appendChild(closeBtn);
  ov.classList.add('on');
}

function checkWeeklySummary(){
  var today=new Date();today.setHours(0,0,0,0);
  if(today.getDay()!==1)return;
  var mondayTs=today.getTime();
  if(lastWeeklyTs>=mondayTs)return;
  var lastWkSess=sessions.filter(function(s){return s.date>=mondayTs-7*86400000&&s.date<mondayTs;});
  lastWeeklyTs=mondayTs;sv();
  if(lastWkSess.length>0)setTimeout(function(){openWeeklySummary(true);},1000);
}
function _startOf(unit){
  var d=new Date();
  if(unit==='day'){d.setHours(0,0,0,0);return d.getTime();}
  if(unit==='week'){d.setHours(0,0,0,0);d.setDate(d.getDate()-((d.getDay()+6)%7));return d.getTime();}// Mon start
  if(unit==='month'){d.setDate(1);d.setHours(0,0,0,0);return d.getTime();}
  if(unit==='6mo'){d.setMonth(d.getMonth()-6);d.setHours(0,0,0,0);return d.getTime();}
}
function _sessIn(ts){return sessions.filter(function(s){return s.date>=ts;});}

function openSessionsStats(){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var title=document.createElement('div');title.style.cssText='font-family:var(--serif);font-size:19px;font-weight:700;margin-bottom:16px;';title.textContent='Sessions logged';sh.appendChild(title);
  var rows=[
    {label:'Today',count:_sessIn(_startOf('day')).length},
    {label:'This week',count:_sessIn(_startOf('week')).length},
    {label:'This month',count:_sessIn(_startOf('month')).length},
    {label:'Past 6 months',count:_sessIn(_startOf('6mo')).length}
  ];
  var tbl=document.createElement('div');tbl.style.cssText='background:var(--bg2);border-radius:14px;padding:0 14px;margin-bottom:16px;';
  rows.forEach(function(r,i){
    var row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:12px 0;'+(i<rows.length-1?'border-bottom:.5px solid var(--bg3);':'');
    row.innerHTML='<span style="font-size:14px;color:var(--tx2);">'+r.label+'</span><span style="font-size:15px;font-weight:700;color:var(--gr);">'+r.count+'</span>';
    tbl.appendChild(row);
  });
  sh.appendChild(tbl);
  document.getElementById('ed-ov').classList.add('on');
}

function openTimeStats(){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var title=document.createElement('div');title.style.cssText='font-family:var(--serif);font-size:19px;font-weight:700;margin-bottom:4px;';title.textContent='Time growing';sh.appendChild(title);
  var sub=document.createElement('div');sub.style.cssText='font-size:12px;color:var(--tx3);margin-bottom:14px;';sub.textContent='This week';sh.appendChild(sub);
  // Compact M T W T F S S grid
  var weekStart=_startOf('week');
  var dayLetters=['M','T','W','T','F','S','S'];
  var today=new Date();today.setHours(0,0,0,0);
  var grid=document.createElement('div');grid.style.cssText='background:var(--bg2);border-radius:14px;padding:14px 10px;margin-bottom:14px;display:grid;grid-template-columns:repeat(7,1fr);gap:4px;text-align:center;';
  dayLetters.forEach(function(letter,i){
    var dayMs=weekStart+i*86400000;
    var isToday=dayMs===today.getTime();
    var h=document.createElement('div');h.style.cssText='font-size:11px;font-weight:700;color:'+(isToday?'var(--gr)':'var(--tx3)')+';margin-bottom:6px;';h.textContent=letter;grid.appendChild(h);
  });
  dayLetters.forEach(function(_,i){
    var dayMs=weekStart+i*86400000;
    var mins=_periodMins(sessions.filter(function(s){return s.date>=dayMs&&s.date<dayMs+86400000;}));
    var isToday=(weekStart+i*86400000)===today.getTime();
    var v=document.createElement('div');
    v.style.cssText='font-size:11px;font-weight:'+(mins>0?'700':'400')+';color:'+(isToday&&mins>0?'var(--gr)':mins>0?'var(--tx)':'var(--tx3)')+';';
    v.textContent=mins>0?(mins>=60?Math.floor(mins/60)+'h':(mins+'m')):'—';
    grid.appendChild(v);
  });
  sh.appendChild(grid);
  var totals=[
    {label:'This week',mins:_periodMins(_sessIn(_startOf('week')))},
    {label:'This month',mins:_periodMins(_sessIn(_startOf('month')))},
    {label:'Past 6 months',mins:_periodMins(_sessIn(_startOf('6mo')))}
  ];
  var totTbl=document.createElement('div');totTbl.style.cssText='background:var(--bg2);border-radius:14px;padding:0 14px;margin-bottom:16px;';
  totals.forEach(function(r,i){
    var row=document.createElement('div');row.style.cssText='display:flex;justify-content:space-between;align-items:center;padding:12px 0;'+(i<totals.length-1?'border-bottom:.5px solid var(--bg3);':'');
    row.innerHTML='<span style="font-size:14px;color:var(--tx2);">'+r.label+'</span><span style="font-size:15px;font-weight:700;color:var(--gr);">'+_fmtMins(r.mins)+'</span>';
    totTbl.appendChild(row);
  });
  sh.appendChild(totTbl);
  document.getElementById('ed-ov').classList.add('on');
}

function openActInfo(actId,from){
  var act=myActs.find(function(a){return a.id===actId;});
  if(!act)return;
  if(isProject(act))return showProjectInfo(actId,from);
  var actSess=_sessFor(actId);
  var totalMins=actSess.reduce(function(t,s){return t+(s.hours||0)*60+(s.mins||0);},0);
  var sorted=actSess.slice().sort(function(a,b){return (a.date||0)-(b.date||0);});
  var lastSess=sorted.length?sorted[sorted.length-1]:null;
  var rows='';
  rows+='<div id="act-info-sess" role="button" tabindex="0" style="display:flex;justify-content:space-between;align-items:center;padding:10px 0;border-bottom:.5px solid var(--bg3);cursor:pointer;"><span style="font-size:13px;color:var(--tx3);">Sessions</span><span style="font-size:13px;font-weight:600;">'+actSess.length+(actSess.length?'<span style="color:var(--tx3);font-weight:400;margin-left:6px;">›</span>':'')+'</span></div>';
  rows+='<div style="display:flex;justify-content:space-between;padding:10px 0;'+(lastSess?'border-bottom:.5px solid var(--bg3);':'')+'"><span style="font-size:13px;color:var(--tx3);">Time spent</span><span style="font-size:13px;font-weight:600;">'+Math.floor(totalMins/60)+'h '+(totalMins%60)+'m</span></div>';
  if(lastSess)rows+='<div style="display:flex;justify-content:space-between;padding:10px 0;"><span style="font-size:13px;color:var(--tx3);">Last session</span>'+agoToggleHTML(lastSess.date)+'</div>';
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  sh.innerHTML='<div style="text-align:center;margin-bottom:16px;"><div style="display:inline-flex;align-items:center;gap:6px;"><button id="act-info-edit-btn" class="name-edit" title="Edit activity"><span style="font-family:var(--serif);font-size:20px;font-weight:700;">'+esc(act.name)+'</span>'+EDIT_PEN_SVG+'</button></div>'+deadlineLineHTML(act)+'</div>'
    +'<div style="background:var(--bg2);border-radius:14px;padding:0 14px;margin-bottom:16px;">'+rows+'</div>';
  wireAgoToggles(sh);
  wireDeadlineLine(sh,act,function(){openActInfo(actId,from);});
  document.getElementById('act-info-edit-btn').addEventListener('click',function(){openActInfoEdit(actId,from);});
  // Sessions row opens this skill's sessions in the logbook
  var sessRow=sh.querySelector('#act-info-sess');
  if(actSess.length){
    var openSess=function(){closeEd();show('s-hist');['home','my','garden','hist'].forEach(function(t){document.getElementById('nb-'+t).classList.toggle('on',t==='hist');});document.getElementById('fab').style.display='none';histSearch=act.name;histPeriod='all';var hs=document.getElementById('hist-search');if(hs)hs.value=act.name;rHist();};
    sessRow.addEventListener('click',openSess);
    sessRow.addEventListener('keydown',function(e){if(e.key==='Enter'){e.preventDefault();openSess();}});
  } else {sessRow.style.cursor='default';sessRow.removeAttribute('role');sessRow.removeAttribute('tabindex');}
  // Notes row — same as on the project sheet
  var _nSum=noteSummary(actId),_nPrev=_nSum.preview,_nCnt=_nSum.count;
  var notesRow=document.createElement('button');notesRow.type='button';
  notesRow.style.cssText='width:100%;display:flex;align-items:center;gap:12px;background:var(--bg2);border:none;border-radius:12px;padding:12px 14px;margin-bottom:16px;cursor:pointer;text-align:left;font-family:inherit;color:var(--tx);';
  notesRow.innerHTML='<span style="flex:1;min-width:0;"><span style="display:block;font-size:13px;font-weight:600;">Notes'+(_nCnt?' ('+_nCnt+')':'')+'</span>'
    +'<span style="display:block;font-size:12px;color:var(--tx3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(_nPrev?esc(_nPrev):'Nothing written yet')+'</span></span>'
    +'<span style="font-size:18px;color:var(--tx3);line-height:1;">›</span>';
  notesRow.addEventListener('click',function(){closeEd();openNotes();rNoteEditor(act);});
  sh.appendChild(notesRow);
  var startBtn=document.createElement('button');startBtn.className='btn btn-p';startBtn.textContent='▶ Start';
  startBtn.addEventListener('click',function(){closeEd();startFrom(actId);});
  sh.appendChild(startBtn);
  var logBtn=document.createElement('button');logBtn.className='btn btn-s';logBtn.style.marginTop='8px';logBtn.textContent='+ Log session';
  logBtn.addEventListener('click',function(){closeEd();openLogDirect(actId,from);});
  sh.appendChild(logBtn);
  document.getElementById('ed-ov').classList.add('on');
}
function openActInfoEdit(actId,from){
  var act=myActs.find(function(a){return a.id===actId;});
  if(!act)return;
  var sh=document.getElementById('ed-sh');
  _transitionSheet(sh,function(){sh.innerHTML='';
  var editCat=act.cat||CATS[0];
  var title=document.createElement('div');title.style.cssText='font-family:var(--serif);font-size:16px;font-weight:700;margin-bottom:13px;';title.textContent=isProject(act)?'Edit project':'Edit activity';sh.appendChild(title);
  var sf1=document.createElement('div');sf1.className='sf';
  var sl1=document.createElement('div');sl1.className='sl';sl1.textContent='Name';
  var nameRow=document.createElement('div');nameRow.style.cssText='display:flex;gap:8px;';
  var emojiInp=document.createElement('input');emojiInp.className='sinp';emojiInp.style.cssText='width:52px;text-align:center;flex-shrink:0;';emojiInp.maxLength=2;emojiInp.placeholder='🌱';emojiInp.value=act.emoji;
  var nameInp=document.createElement('input');nameInp.className='sinp';nameInp.style.flex='1';nameInp.placeholder=isProject(act)?'Project name':'Activity name';nameInp.value=act.name;
  nameRow.appendChild(emojiInp);nameRow.appendChild(nameInp);sf1.appendChild(sl1);sf1.appendChild(nameRow);sh.appendChild(sf1);
  var sf2=document.createElement('div');sf2.className='sf';
  var sl2=document.createElement('div');sl2.className='sl';sl2.textContent='Category';
  var catWrap=document.createElement('div');catWrap.className='so';
  function addCat(cat,label,cc){
    var b=document.createElement('div');b.className='sop'+(editCat===cat?' on':'');b.textContent=label;
    if(editCat===cat){b.style.background=cc[0];b.style.color=cc[1];b.style.borderColor=cc[1];}
    b.addEventListener('click',function(){
      editCat=cat;
      catWrap.querySelectorAll('.sop').forEach(function(x){x.classList.remove('on');x.style.background='';x.style.color='';x.style.borderColor='';});
      b.classList.add('on');b.style.background=cc[0];b.style.color=cc[1];b.style.borderColor=cc[1];
    });
    catWrap.appendChild(b);
  }
  CATS.forEach(function(cat){var cc=CAT_COLORS[cat]?CAT_COLORS[cat].split(','):['var(--bg2)','var(--tx)'];addCat(cat,cat,cc);});
  customCats.forEach(function(cat){addCat(cat,'🌱 '+cat,['var(--bg3)','var(--tx)']);});
  sf2.appendChild(sl2);sf2.appendChild(catWrap);sh.appendChild(sf2);
  var srow=document.createElement('div');srow.className='srow';
  var cancelBtn=document.createElement('button');cancelBtn.className='btn btn-s';cancelBtn.style.cssText='flex:1;margin-top:0;';cancelBtn.textContent='Cancel';
  cancelBtn.addEventListener('click',function(){_transitionSheet(sh,function(){openActInfo(actId,from);});});
  var saveBtn=document.createElement('button');saveBtn.className='btn btn-p';saveBtn.style.cssText='flex:1;margin-top:0;';saveBtn.textContent='Save';
  saveBtn.addEventListener('click',function(){
    var newName=nameInp.value.trim();var newEmoji=emojiInp.value.trim();
    if(newName)act.name=newName;
    if(newEmoji)act.emoji=newEmoji;
    act.cat=editCat;
    sv();rMy();rHome();
    _transitionSheet(sh,function(){openActInfo(actId,from);});
  });
  srow.appendChild(cancelBtn);srow.appendChild(saveBtn);sh.appendChild(srow);
  });}// end _transitionSheet + openActInfoEdit
function openLogDirect(id,from,preDate){setupLogScreen(id,from,null,preDate);}
function openFinish(id,from){setupLogScreen(id,from,active?active.startedAt:null);}

function saveLog(){
  try{
    var _logAct=myActs.find(function(x){return x.id===logId;})||{};
    var _isProj=isProject(_logAct);
    var stageBefore=_isProj?getTreeStage(getHours(logId)):getStage(getHours(logId));
    var logDateVal=document.getElementById('log-date').value;
    var _todayActive=document.getElementById('log-today-btn').textContent.indexOf('✓')>-1;
    var _ph={morning:'09',afternoon:'14',evening:'19'}[logTimeOfDay]||'12';
    var logTs;
    if(_todayActive){var _d=new Date();_d.setHours(parseInt(_ph),0,0,0);logTs=_d.getTime();}
    else{logTs=logDateVal?new Date(logDateVal+'T'+_ph+':00:00').getTime():Date.now();}
    var _sid=genUUID();
    sessions.push({id:_sid,actId:logId,actName:_logAct.name||'',actEmoji:_logAct.emoji||'',date:logTs,hours:parseInt(document.getElementById('lh').value)||0,mins:parseInt(document.getElementById('lm').value)||0,feel:logFeels.slice(),rating:logRating,notes:document.getElementById('ln').value.trim(),well:document.getElementById('ln-well').value.trim(),diff:document.getElementById('ln-diff').value.trim(),momentum:logMomentum,startedAt:active?active.startedAt:null});
    // Auto-clear any one-off scheduled events for this activity on the logged day
    var _logDayStart=new Date(logTs);_logDayStart.setHours(0,0,0,0);
    var _logDayStartMs=_logDayStart.getTime(),_logDayEndMs=_logDayStartMs+86400000;
    calPlanned=calPlanned.filter(function(ev){return !(ev.actId===logId&&ev.date>=_logDayStartMs&&ev.date<_logDayEndMs);});
    // Mark checked project tasks done
    var _checkedTasks=[];
    document.querySelectorAll('.log-task-check:checked').forEach(function(cb){_checkedTasks.push(cb.dataset.tid);});
    if(_isProj&&_checkedTasks.length&&Array.isArray(_logAct.tasks)){
      _logAct.tasks.forEach(function(t){
        if(_checkedTasks.indexOf(t.id)>-1){t.done=true;t.doneAt=Date.now();}
      });
    }
    var stageAfter=_isProj?getTreeStage(getHours(logId)):getStage(getHours(logId));
    if(!_isProj){for(var s=stageBefore+1;s<=stageAfter;s++)awardItem(logId,s);}
    checkTrophies();
    active=null;sv();rHome();goBack();
    showHarvestBurst(_logAct.emoji);
    pushFeedEvent('session',_logAct.name||'',_logAct.emoji||'',null);
    if(stageAfter>stageBefore){
      var a=myActs.find(function(x){return x.id===logId;});
      if(a){
        var lbl=_isProj?TREE_STAGE_LABELS[stageAfter]:STAGE_LABELS[stageAfter];
        pushFeedEvent('levelup',a.name,a.emoji,lbl||null);
        setTimeout(function(){showStageUp(a,stageAfter,_isProj);},320);
      }
    }
  }catch(e){showToast('Save error: '+e.message,null);console.error('saveLog error',e);}
}
function showHarvestBurst(actEmoji){
  var wrap=document.createElement('div');
  wrap.style.cssText='position:fixed;inset:0;pointer-events:none;z-index:9998;overflow:hidden;';
  var pool=[actEmoji||'🌱','✨','🌿','🍃','⭐','🌸','💧','🌾'];
  for(var i=0;i<14;i++){
    var sp=document.createElement('span');
    sp.textContent=pool[i%pool.length];
    var x=15+Math.random()*70;
    var dx=(Math.random()-.5)*60;
    var delay=Math.random()*.35;
    var dur=.9+Math.random()*.6;
    var size=15+Math.random()*18;
    sp.style.cssText='position:absolute;left:'+x+'%;bottom:25%;font-size:'+size+'px;transform:translateX('+dx+'px);animation:suFloat '+dur+'s ease-out '+delay+'s both;';
    wrap.appendChild(sp);
  }
  document.body.appendChild(wrap);
  setTimeout(function(){if(wrap.parentNode)wrap.parentNode.removeChild(wrap);},1800);
}
function showStageUp(a,stage,isTree){
  var stagePlants=isTree?['🌰','🌱','🌿','🌲','🍎']:['🌰','🌱','🪴','🌸','🌺'];
  var stageLabel=(isTree?TREE_STAGE_LABELS:STAGE_LABELS)[stage];
  document.getElementById('stageup-plant').textContent=stagePlants[stage]||a.emoji;
  document.getElementById('stageup-aname').textContent=a.name;
  document.getElementById('stageup-stage').textContent=(isTree&&stage===4?'🎉 Harvest time! ':'Now: Stage '+stage+' — ')+stageLabel;
  var conf=document.getElementById('stageup-confetti');conf.innerHTML='';
  var emojis=['🌿','✨','🌸','🍃','⭐','🌱'];
  for(var i=0;i<14;i++){
    var sp=document.createElement('span');
    sp.textContent=emojis[i%emojis.length];
    var x=Math.random()*100,delay=Math.random()*0.6,dur=1.2+Math.random()*0.8;
    sp.style.cssText='position:absolute;left:'+x+'%;bottom:10%;font-size:'+(14+Math.random()*14)+'px;animation:suFloat '+dur+'s ease-out '+delay+'s both;';
    conf.appendChild(sp);
  }
  haptic(25);
  document.getElementById('stageup-ov').classList.add('on');
  setTimeout(function(){if(document.getElementById('stageup-ov').classList.contains('on'))document.getElementById('stageup-ov').classList.remove('on');},5000);
}
function discard(){active=null;sv();goBack();}

// ── WEEKLY FOCUS ──────────────────────────────────────
var focusTmp=[];
// The picked seeds, in the order Home will show them. Up/down rather than
// drag: this list sits inside an already-scrolling sheet, where a drag would
// fight the scroll.
function renderFocusOrder(){
  var list=document.getElementById('foc-order');
  if(!list)return;
  list.innerHTML='';
  if(!focusTmp.length){
    var none=document.createElement('div');
    none.style.cssText='text-align:center;color:var(--tx3);font-size:13px;padding:24px 0;';
    none.textContent='Nothing picked yet.';
    list.appendChild(none);
    return;
  }
  var byId={};myActs.forEach(function(a){byId[a.id]=a;});
  focusTmp.forEach(function(id,i){
    var a=byId[id];
    if(!a)return;
    var row=document.createElement('div');row.dataset.id=id;
    row.style.cssText='display:flex;align-items:center;gap:8px;padding:10px 12px;background:var(--bg2);border-radius:12px;flex-shrink:0;';
    row.innerHTML='<span style="font-size:11px;font-weight:700;color:var(--tx3);width:14px;flex-shrink:0;font-variant-numeric:tabular-nums;">'+(i+1)+'</span>'
      +'<span style="font-size:16px;flex-shrink:0;width:22px;text-align:center;">'+esc(a.emoji)+'</span>'
      +'<span style="flex:1;min-width:0;font-size:13px;font-weight:600;color:var(--tx);overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">'+esc(a.name)+'</span>';
    var grip=document.createElement('span');
    grip.textContent='⠿';grip.setAttribute('aria-hidden','true');
    grip.style.cssText='font-size:18px;line-height:1;color:var(--tx3);padding:6px 8px;margin:-6px -8px -6px 0;cursor:grab;flex-shrink:0;touch-action:none;';
    row.appendChild(grip);
    _focDragRow(grip,row,list);
    list.appendChild(row);
  });
}
// Drag a focus row by its grip: the row follows the finger, the others slide
// out of the way, and the order is committed on release.
function _focDragRow(grip,row,list){
  grip.addEventListener('pointerdown',function(e){
    if(e.button>0)return;
    e.preventDefault();
    var rows=Array.prototype.slice.call(list.children),from=rows.indexOf(row);
    var step=row.offsetHeight+(parseFloat(getComputedStyle(list).rowGap)||0);
    var startY=e.clientY,to=from;
    try{grip.setPointerCapture(e.pointerId);}catch(_){}
    row.style.position='relative';row.style.zIndex='2';row.style.transition='box-shadow .15s';
    row.style.boxShadow='0 8px 24px rgba(0,0,0,.16)';grip.style.cursor='grabbing';
    rows.forEach(function(r){if(r!==row)r.style.transition='transform .16s cubic-bezier(.4,0,.2,1)';});
    function move(ev){
      var dy=ev.clientY-startY;
      // Keep the lifted row within the list
      dy=Math.max(-from*step,Math.min((rows.length-1-from)*step,dy));
      row.style.transform='translateY('+dy+'px)';
      to=Math.max(0,Math.min(rows.length-1,from+Math.round(dy/step)));
      rows.forEach(function(r,j){
        if(r===row)return;
        var shift=(from<j&&j<=to)?-step:(to<=j&&j<from)?step:0;
        r.style.transform=shift?'translateY('+shift+'px)':'';
      });
    }
    function up(){
      grip.removeEventListener('pointermove',move);
      grip.removeEventListener('pointerup',up);
      grip.removeEventListener('pointercancel',up);
      if(to!==from){
        var ids=rows.map(function(r){return r.dataset.id;});
        ids.splice(to,0,ids.splice(from,1)[0]);
        focusTmp=ids.concat(focusTmp.filter(function(id){return ids.indexOf(id)<0;}));
      }
      renderFocusOrder();
    }
    grip.addEventListener('pointermove',move);
    grip.addEventListener('pointerup',up);
    grip.addEventListener('pointercancel',up);
  });
}
function renderFocusList(query){
  var list=document.getElementById('foc-list');list.innerHTML='';
  var q=(query||'').toLowerCase().trim();
  var groups={};
  myActs.forEach(function(a){
    if(q&&a.name.toLowerCase().indexOf(q)<0&&a.cat.toLowerCase().indexOf(q)<0)return;
    var c=a.cat||'Other';if(!groups[c])groups[c]=[];groups[c].push(a);
  });
  var keys=Object.keys(groups);
  if(!keys.length){
    var none=document.createElement('div');none.style.cssText='text-align:center;color:var(--tx3);font-size:13px;padding:24px 0;';none.textContent='No activities found';list.appendChild(none);return;
  }
  keys.forEach(function(cat){
    var catLbl=document.createElement('div');
    catLbl.style.cssText='font-size:11px;font-weight:700;color:var(--co2);text-transform:uppercase;letter-spacing:.6px;margin:14px 0 8px;padding-left:2px;';
    catLbl.textContent=(CEM[cat]||'🌱')+' '+cat;
    list.appendChild(catLbl);
    groups[cat].forEach(function(a){
      var item=document.createElement('div');
      var on=focusTmp.indexOf(a.id)>-1;
      item.className='foc-item'+(on?' on':'');
      item.innerHTML='<div class="foc-item-em">'+esc(a.emoji)+'</div><div class="foc-item-info"><div class="foc-item-name">'+esc(a.name)+'</div></div><div class="foc-item-check">'+(on?'✓':'')+'</div>';
      item.addEventListener('click',function(){
        var idx=focusTmp.indexOf(a.id);
        if(idx>-1){focusTmp.splice(idx,1);item.classList.remove('on');item.querySelector('.foc-item-check').textContent='';}
        else{
          if(focusTmp.length>=FOCUS_LIMIT){showToast('Focus limit is '+FOCUS_LIMIT,null);return;}
          focusTmp.push(a.id);item.classList.add('on');item.querySelector('.foc-item-check').textContent='✓';
        }
        _focModeBtnState();
      });
      list.appendChild(item);
    });
  });
}
// The sheet has two modes: pick (search the full packet) and reorder. The
// header's button swaps between them, so neither crowds the other.
var _focMode='pick';
function setFocMode(mode){
  _focMode=mode;
  var pick=document.getElementById('foc-pick');
  var order=document.getElementById('foc-order-wrap');
  var btn=document.getElementById('btn-foc-mode');
  var title=document.getElementById('foc-title');
  if(!pick||!order||!btn)return;
  var ordering=mode==='order';
  pick.style.display=ordering?'none':'flex';
  order.style.display=ordering?'flex':'none';
  if(title)title.textContent=ordering?'Order on home':"What's calling you?";
  btn.textContent=ordering?'✓':'⇅';
  btn.title=ordering?'Done reordering':'Reorder';
  btn.setAttribute('aria-label',ordering?'Done reordering':'Reorder your focus');
  btn.setAttribute('aria-pressed',ordering?'true':'false');
  btn.style.background=ordering?'var(--gr)':'var(--bg2)';
  btn.style.color=ordering?'#FFFBF3':'var(--tx2)';
  if(ordering)renderFocusOrder();
}
function _focModeBtnState(){
  var btn=document.getElementById('btn-foc-mode');
  if(!btn)return;
  // Ordering a single seed is meaningless — keep the button in place but inert
  // so the header doesn't jump as seeds are ticked.
  var usable=focusTmp.length>1||_focMode==='order';
  btn.disabled=!usable;
  btn.style.opacity=usable?'1':'.35';
  btn.style.cursor=usable?'pointer':'default';
}
function openFocus(){
  focusTmp=weeklyFocus.actIds.slice();
  var searchEl=document.getElementById('foc-search');
  searchEl.value='';
  searchEl.oninput=function(){renderFocusList(searchEl.value);};
  renderFocusList('');
  setFocMode('pick');
  _focModeBtnState();
  var clearBtn=document.getElementById('btn-foc-clear');
  if(clearBtn)clearBtn.onclick=function(){focusTmp=[];renderFocusList(searchEl.value);_focModeBtnState();};
  var modeBtn=document.getElementById('btn-foc-mode');
  if(modeBtn)modeBtn.onclick=function(){if(!modeBtn.disabled)setFocMode(_focMode==='order'?'pick':'order');};
  document.getElementById('foc-ov').classList.add('on');
}
function closeFocus(){document.getElementById('foc-ov').classList.remove('on');}
function saveFocus(){
  weeklyFocus={actIds:focusTmp.slice(),askedOn:weeklyFocus.askedOn};
  if(weeklyFocus.actIds.length>0)myFocusOnly=true;
  checkTrophies();sv();closeFocus();rMy();rHome();
}

// ── TOAST ─────────────────────────────────────────────
var toastTimer=null, undoFn=null;
function showToast(msg,onUndo){
  var t=document.getElementById('toast'),m=document.getElementById('toast-msg'),u=document.getElementById('toast-undo');
  m.textContent=msg; undoFn=onUndo; u.style.display=onUndo?'':'none';
  t.classList.add('on'); clearTimeout(toastTimer);
  toastTimer=setTimeout(function(){t.classList.remove('on');undoFn=null;},4000);
}
document.getElementById('toast-undo').addEventListener('click',function(){
  if(undoFn){undoFn();undoFn=null;}
  document.getElementById('toast').classList.remove('on');clearTimeout(toastTimer);
});

// ── SWIPE TO ARCHIVE ──────────────────────────────────
function addSwipe(wrap,card,onArchive,onFocus){
  var del=wrap.querySelector('.mc-del');
  var foc=wrap.querySelector('.mc-foc');
  var startX,startY,dx=0,decided=false,isSwipe=false,mouseDown=false;
  var threshold=90;

  function onStart(clientX,clientY){
    startX=clientX;startY=clientY;dx=0;decided=false;isSwipe=false;
  }
  function onMove(clientX,clientY){
    if(dragState)return;
    dx=clientX-startX;
    var dy=clientY-startY;
    if(!decided){
      if(Math.abs(dx)<5&&Math.abs(dy)<5)return;
      isSwipe=Math.abs(dx)>Math.abs(dy);
      decided=true;
      if(isSwipe)card.style.transition='none';
    }
    if(!isSwipe)return;
    if(dx<0){
      card.style.transform='translateX('+dx+'px)';
      if(del)del.style.opacity=Math.min(Math.abs(dx)/threshold,1);
      if(foc)foc.style.opacity=0;
    } else if(dx>0&&onFocus){
      card.style.transform='translateX('+Math.min(dx,threshold*1.1)+'px)';
      if(foc)foc.style.opacity=Math.min(dx/threshold,1);
      if(del)del.style.opacity=0;
    } else {
      card.style.transform='translateX(0)';
      if(del)del.style.opacity=0;
      if(foc)foc.style.opacity=0;
    }
  }
  function _blockNextClick(){
    card.addEventListener('click',function blocker(e){e.stopPropagation();e.preventDefault();card.removeEventListener('click',blocker,true);},true);
  }
  function onEnd(){
    if(isSwipe&&dx<-threshold){
      card.style.transition='transform .28s cubic-bezier(.55,.06,.68,.19)';
      card.style.transform='translateX(-110vw)';
      if(del)del.style.opacity=0;
      _blockNextClick();
      setTimeout(onArchive,240);
    } else if(isSwipe&&dx>threshold&&onFocus){
      card.style.transition='transform .2s cubic-bezier(.25,.46,.45,.94)';
      card.style.transform='translateX(55px)';
      if(foc)foc.style.opacity=0;
      _blockNextClick();
      setTimeout(function(){
        card.style.transition='transform .34s cubic-bezier(.34,1.56,.64,1)';
        card.style.transform='translateX(0)';
        onFocus();
      },160);
    } else {
      if(isSwipe){
        card.style.transition='';
        card.style.transform='';
      }
      if(del)del.style.opacity=0;
      if(foc)foc.style.opacity=0;
    }
    decided=false;isSwipe=false;dx=0;
  }

  // Touch
  card.addEventListener('touchstart',function(e){onStart(e.touches[0].clientX,e.touches[0].clientY);},{passive:true});
  card.addEventListener('touchmove',function(e){onMove(e.touches[0].clientX,e.touches[0].clientY);if(isSwipe)e.preventDefault();},{passive:false});
  card.addEventListener('touchend',onEnd);

  // Mouse — attach move/up to document so drag works even when cursor leaves the card
  card.addEventListener('mousedown',function(e){
    onStart(e.clientX,e.clientY);
    function onMouseMove(e){if(isSwipe)e.preventDefault();onMove(e.clientX,e.clientY);}
    function onMouseUp(){document.removeEventListener('mousemove',onMouseMove);document.removeEventListener('mouseup',onMouseUp);onEnd();}
    document.addEventListener('mousemove',onMouseMove);
    document.addEventListener('mouseup',onMouseUp);
  });
}

// ── DRAG TO REORDER ───────────────────────────────────
var dragState=null;
function _dragMove(clientY){
  dragState.ghost.style.top=(clientY-dragState.offsetY)+'px';
  var wraps=document.querySelectorAll('.mc-wrap[data-drag-cat]');
  var best=null,bestDist=Infinity;
  wraps.forEach(function(w){
    if(w===dragState.wrap||w.dataset.dragCat!==dragState.cat)return;
    var r=w.getBoundingClientRect(),mid=r.top+r.height/2,dist=Math.abs(clientY-mid);
    if(dist<bestDist){bestDist=dist;best=w;}
  });
  document.querySelectorAll('.mc-wrap.drag-over').forEach(function(x){x.classList.remove('drag-over');});
  if(best){best.classList.add('drag-over');dragState.targetId=best.dataset.dragId;}
  else{dragState.targetId=null;}
}
function _dragEnd(){
  dragState.ghost.remove();
  dragState.wrap.classList.remove('dragging');
  document.querySelectorAll('.mc-wrap.drag-over').forEach(function(x){x.classList.remove('drag-over');});
  if(dragState.targetId&&dragState.targetId!==dragState.actId){
    var fi=myActs.findIndex(function(a){return a.id===dragState.actId;});
    var ti=myActs.findIndex(function(a){return a.id===dragState.targetId;});
    if(fi>-1&&ti>-1){var item=myActs.splice(fi,1)[0];myActs.splice(ti,0,item);sv();rMy();}
  }
  dragState=null;
}
document.addEventListener('touchmove',function(e){
  if(!dragState||!dragState.isTouch)return;
  e.preventDefault();
  _dragMove(e.touches[0].clientY);
},{passive:false});
document.addEventListener('touchend',function(){
  if(!dragState||!dragState.isTouch)return;
  _dragEnd();
});
document.addEventListener('mousemove',function(e){
  if(!dragState||dragState.isTouch)return;
  _dragMove(e.clientY);
});
document.addEventListener('mouseup',function(){
  if(!dragState||dragState.isTouch)return;
  _dragEnd();
});
function _startDrag(clientY,card,wrap,actId,cat,isTouch){
  var rect=card.getBoundingClientRect();
  var ghost=card.cloneNode(true);
  ghost.style.cssText='position:fixed;left:'+rect.left+'px;top:'+rect.top+'px;width:'+rect.width+'px;height:'+rect.height+'px;opacity:.9;z-index:9998;pointer-events:none;border-radius:12px;box-shadow:0 8px 32px rgba(0,0,0,.22);background:var(--bg);display:flex;align-items:center;gap:12px;padding:14px;animation:none;';
  document.body.appendChild(ghost);
  wrap.classList.add('dragging');
  dragState={ghost:ghost,wrap:wrap,actId:actId,cat:cat,offsetY:clientY-rect.top,targetId:null,isTouch:isTouch};
}
function initDrag(handle,wrap,actId,cat){
  handle.addEventListener('touchstart',function(e){
    e.stopPropagation();e.preventDefault();
    var card=wrap.querySelector('.mc');
    _startDrag(e.touches[0].clientY,card,wrap,actId,cat,true);
  },{passive:false});
  handle.addEventListener('mousedown',function(e){
    if(dragState)return;
    e.preventDefault();e.stopPropagation();
    var card=wrap.querySelector('.mc');
    _startDrag(e.clientY,card,wrap,actId,cat,false);
  });
}

// ── PLOT (MY LIST) ─────────────────────────────────────
var catOpen={};
var _myColUpd=null;
var mySearch='';
var mySearchOpen=false;
var myFocusOnly=false;
var focusCatFilter='all';
var gardenTab='all';
var myKind='all';
function positionSegThumb(seg){
  if(!seg)return;
  var thumb=seg.querySelector('.my-seg-thumb');
  if(!thumb){thumb=document.createElement('div');thumb.className='my-seg-thumb';seg.insertBefore(thumb,seg.firstChild);}
  var active=seg.querySelector('.my-seg-btn.on');
  if(!active||seg.offsetWidth===0){thumb.style.opacity='0';return;}
  // First placement (or coming back from hidden): jump into place, no width/slide animation
  var firstPos=!thumb.style.width||thumb.style.opacity==='0';
  if(firstPos){thumb.style.transition='none';}
  thumb.style.opacity='1';
  thumb.style.transform='translateX('+active.offsetLeft+'px)';
  thumb.style.width=active.offsetWidth+'px';
  if(firstPos){thumb.getBoundingClientRect();thumb.style.transition='';}
}
function rMy(){
  var el=document.getElementById('my-list');
  // Prune focus IDs that no longer exist
  var _validIds=weeklyFocus.actIds.filter(function(id){return myActs.some(function(a){return a.id===id;});});
  if(_validIds.length!==weeklyFocus.actIds.length){weeklyFocus.actIds=_validIds;sv();}
  if(!hasFocusSet())myFocusOnly=false;

  // Kind segmented control — only when both types exist
  var segEl=document.getElementById('my-kind-seg');
  if(segEl){
    var hasProjects=myActs.some(isProject);
    var hasSkills=myActs.some(isSkill);
    if(hasProjects&&hasSkills){
      segEl.style.display='flex';
      if(!segEl.querySelector('.my-seg-btn')){
        [{id:'all',label:'All'},{id:'skill',label:'Skills'},{id:'project',label:'Projects'}].forEach(function(t){
          var b=document.createElement('div');
          b.className='my-seg-btn'+(myKind===t.id?' on':'');
          b.dataset.kind=t.id;
          b.setAttribute('role','button');b.tabIndex=0;
          b.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();b.click();}});
          b.textContent=t.label;
          b.addEventListener('click',(function(k){return function(){myKind=k;_smoothList(document.getElementById('my-list'),rMy);};})(t.id));
          segEl.appendChild(b);
        });
      } else {
        segEl.querySelectorAll('.my-seg-btn').forEach(function(b){
          b.classList.toggle('on',b.dataset.kind===myKind);
        });
      }
      requestAnimationFrame(function(){positionSegThumb(segEl);});
    } else {
      segEl.style.display='none';
      myKind='all';
    }
  }

  // Focus toggle — off when no focus set (tap opens editor instead)
  var focBtn=document.getElementById('my-focus-toggle');
  if(focBtn){
    focBtn.classList.toggle('on',myFocusOnly&&hasFocusSet());
    focBtn.onclick=function(){
      if(!hasFocusSet()){openFocus();return;}
      var willBeOn=!myFocusOnly;
      if(willBeOn){
        var focusedIds={};weeklyFocus.actIds.forEach(function(id){focusedIds[id]=true;});
        var wraps=document.querySelectorAll('#my-list .mc-wrap');
        var leavers=[];
        wraps.forEach(function(w){var id=w.dataset.dragId;if(id&&!focusedIds[id])leavers.push(w);});
        if(leavers.length){
          leavers.forEach(function(w){
            var h=w.offsetHeight;
            w.style.transition='none';
            w.style.maxHeight=h+'px';
            w.style.marginBottom='8px';
            w.style.opacity='1';
            w.style.transform='translateY(0)';
          });
          // Force per-element reflow so the transition has a starting value
          leavers.forEach(function(w){w.getBoundingClientRect();});
          requestAnimationFrame(function(){
            leavers.forEach(function(w){
              w.style.transition='max-height .3s cubic-bezier(.4,0,.2,1),opacity .22s ease,transform .28s cubic-bezier(.4,0,.2,1),margin-bottom .3s cubic-bezier(.4,0,.2,1)';
              w.style.maxHeight='0px';
              w.style.marginBottom='0px';
              w.style.opacity='0';
              w.style.transform='translateY(-16px)';
              w.style.pointerEvents='none';
            });
          });
          setTimeout(function(){myFocusOnly=true;rMy();},340);
        } else {myFocusOnly=true;rMy();}
      } else {
        myFocusOnly=false;
        var listEl=document.getElementById('my-list');
        _smoothList(listEl,rMy);
        // Cards hidden by the filter stagger-fade back in (focused ones keep their place)
        listEl.querySelectorAll('.mc-wrap:not(.mc-focused)').forEach(function(w,i){
          w.style.animation='cardIn .28s ease both';
          w.style.animationDelay=Math.min(i*30,240)+'ms';
        });
      }
    };
  }

  // Search toggle
  var srchBtn=document.getElementById('my-search-toggle');
  var srchWrap=document.getElementById('my-search-wrap');
  if(srchBtn&&srchWrap){
    srchBtn.classList.toggle('on',mySearchOpen);
    srchWrap.classList.toggle('open',mySearchOpen);
    srchBtn.onclick=function(){
      mySearchOpen=!mySearchOpen;
      srchWrap.classList.toggle('open',mySearchOpen);
      srchBtn.classList.toggle('on',mySearchOpen);
      var inp=document.getElementById('my-search');
      if(mySearchOpen){if(inp)setTimeout(function(){inp.focus();},280);}
      else{mySearch='';if(inp)inp.value='';_smoothList(document.getElementById('my-list'),rMy);}
    };
  }

  // Add-seed button
  var addBtn=document.getElementById('my-add-btn');
  if(addBtn)addBtn.onclick=function(){openAdd();};

  // Filter by kind + focus for the render
  var _origMyActs=myActs;
  var _filtered=myKind==='skill'?myActs.filter(isSkill):myKind==='project'?myActs.filter(isProject):myActs;
  if(myFocusOnly&&hasFocusSet())_filtered=_filtered.filter(function(a){return isFocused(a.id);});
  var pc=document.getElementById('plot-count');
  if(pc){
    var label=myKind==='skill'?'skill':myKind==='project'?'tree':'seed';
    // Only worth a line when the focus filter is on; otherwise the tabs and category counts say it
    pc.textContent=myFocusOnly?_filtered.length+' '+label+(_filtered.length!==1?'s':'')+' in focus':'';
  }

  // Collapse-all button — based on visible category set
  var colBtn=document.getElementById('my-collapse-toggle');
  var visCatSet={};_filtered.forEach(function(a){visCatSet[_seedGroup(a)]=true;});
  var visCats=Object.keys(visCatSet);
  if(colBtn){
    if(visCats.length){
      colBtn.style.display='';
      _myColUpd=function(){
        var all=visCats.every(function(c){return catOpen[c]===true;});
        colBtn.textContent=all?'Collapse all':'Expand all';
      };
      _myColUpd();
      colBtn.onclick=function(){
        var target=!visCats.every(function(c){return catOpen[c]===true;});
        // Drive each rendered section through its own header animation
        el.querySelectorAll('.cat-hdr').forEach(function(h){
          var c=h.dataset.cat;
          if(c&&(catOpen[c]===true)!==target)h.click();
        });
        visCats.forEach(function(c){catOpen[c]=target;});
        _myColUpd();
      };
    } else {
      colBtn.style.display='none';
      _myColUpd=null;
    }
  }

  myActs=_filtered;
  try{_rMyBody(el,_origMyActs);}finally{myActs=_origMyActs;}

  // Archived footer link
  var arWrap=document.getElementById('my-archived-link');
  if(arWrap){
    var visibleArchived=archivedActs.filter(function(a){return !a._terminated;});
    if(visibleArchived.length){
      arWrap.innerHTML='<button id="my-archived-btn" style="background:none;border:none;font-size:12px;color:var(--tx3);cursor:pointer;padding:18px 0 4px;display:block;width:100%;text-align:center;font-weight:500;letter-spacing:.02em;">🗃️ '+visibleArchived.length+' archived '+(visibleArchived.length===1?'seed':'seeds')+' ›</button>';
      document.getElementById('my-archived-btn').addEventListener('click',showArchivedList);
    } else {
      arWrap.innerHTML='';
    }
  }
}
function _rMyBody(el,allActs){
  if(!myActs.length){el.innerHTML='<p style="color:var(--tx2);font-size:14px;text-align:center;padding:24px 0;">'+(myFocusOnly?'Nothing in focus matches these filters.':'Nothing planted yet.')+'</p>';return;}
  el.innerHTML='';
  var _mySrch=mySearch.trim().toLowerCase();

  var groups={};
  myActs.filter(function(a){return !_mySrch||a.name.toLowerCase().includes(_mySrch)||a.emoji.includes(_mySrch);}).forEach(function(a){var c=_seedGroup(a);if(!groups[c])groups[c]=[];groups[c].push(a);});
  // Finished projects get their own group, always last (collapsed until opened)
  var _cats=Object.keys(groups).filter(function(c){return c!==FINISHED_GROUP;});
  if(groups[FINISHED_GROUP])_cats.push(FINISHED_GROUP);
  _cats.forEach(function(cat){
    var acts=groups[cat];
    var isOpen=catOpen[cat]===true;
    var section=document.createElement('div');section.className='cat-section';
    var hdr=document.createElement('div');hdr.className='cat-hdr';hdr.dataset.cat=cat;
    hdr.setAttribute('role','button');hdr.tabIndex=0;hdr.setAttribute('aria-expanded',isOpen?'true':'false');
    hdr.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();hdr.click();}});
    hdr.innerHTML='<span class="cat-hdr-label">'+(cat===FINISHED_GROUP?'Finished':cat)+'</span>'
      +'<span class="cat-arrow'+(isOpen?' open':'')+'">›</span>'
      +'<span class="cat-hdr-count">'+acts.length+'</span>';
    var body=document.createElement('div');body.className='cat-body'+(isOpen?' open':'');
    var bodyInner=document.createElement('div');bodyInner.className='cat-body-inner';
    acts.forEach(function(a){
      var cnt=_sessFor(a.id).length;
      var isAct=active&&active.actId===a.id;
      var wrap=document.createElement('div');wrap.className='mc-wrap'+(hasFocusSet()&&!myFocusOnly&&isFocused(a.id)?' mc-focused':'');wrap.dataset.dragId=a.id;wrap.dataset.dragCat=cat;
      var del=document.createElement('div');del.className='mc-del';del.textContent='🗃️';wrap.appendChild(del);
      var focEl=document.createElement('div');focEl.className='mc-foc';focEl.textContent='🎯';wrap.appendChild(focEl);
      var card=document.createElement('div');card.className='mc'+(isAct?' ip-card':'');
      var inner=document.createElement('div');inner.style.cssText='flex:1;display:flex;align-items:center;gap:12px;min-height:34px;'; // room for two right-hand lines, so cards stay one height
      var streak=getStreakAt(a.id,Date.now());
      // Right side: finished / deadline countdown, step progress, then sessions/time once there are any
      var _dl=deadlineLabel(a),_dd=getDeadlineDays(a);
      var _steps=getProjectTasks(a),_fin=isFinished(a);
      var _dlShort=_dd===null?'':_dd<0?(-_dd)+' day'+(_dd===-1?'':'s')+' overdue':_dd===0?'due today':_dd===1?'due tomorrow':'in '+_dd+' days';
      inner.innerHTML='<div style="flex:1;min-width:0;"><div class="mc-n"><span style="margin-right:6px;font-size:14px;opacity:.85;">'+(isProject(a)?'🌳':'🌱')+'</span>'+esc(a.name)+(streak>=2?'<span style="margin-left:6px;font-size:11px;background:var(--grm);color:#fff;border-radius:8px;padding:1px 6px;font-weight:600;">🔥'+streak+'</span>':'')+'</div></div>'
        +'<div class="mc-r">'
        +(isAct?'<span class="badge badge-ip">active</span>':'')
        +(_fin?'<span style="font-size:12px;color:var(--gr);font-weight:600;white-space:nowrap;">✓ Finished</span>':'')
        +(_dl?'<span style="font-size:12px;color:'+_dl.color+';font-weight:600;white-space:nowrap;">'+_dlShort+'</span>':'')
        +(!_fin&&_steps.length?'<span style="font-size:12px;color:var(--tx3);white-space:nowrap;">'+getProjectDoneCount(a)+'/'+_steps.length+' steps</span>':'')
        +(cnt?'<span style="font-size:12px;color:var(--tx3);white-space:nowrap;">'+cnt+' session'+(cnt!==1?'s':'')+' · '+Math.round(getHours(a.id)*10)/10+'h</span>':'')
        +'</div>';
      card.appendChild(inner);
      card.addEventListener('click',function(){if(isAct)resumeSess();else openActInfo(a.id,'my');});
      if(!isAct){(function(act){
        addSwipe(wrap,card,function(){
          var idx=myActs.findIndex(function(x){return x.id===act.id;});
          if(idx>-1){myActs.splice(idx,1);archivedActs.push(act);_tombstone(act.id,'arch');var _rmRefs=_purgeSeedRefs(act.id);sv();rMy();rHome();
            showToast(act.emoji+' '+act.name+' archived',function(){archivedActs.splice(archivedActs.indexOf(act),1);myActs.splice(idx,0,act);_untombstone(act.id);_restoreSeedRefs(act.id,_rmRefs);sv();rMy();rHome();});}
        },function(){
          var fi=weeklyFocus.actIds.indexOf(act.id);
          if(fi>-1){weeklyFocus.actIds.splice(fi,1);showToast(act.emoji+' '+act.name+' removed from focus',null);}
          else{weeklyFocus.actIds.push(act.id);showToast('🎯 '+act.name+' added to focus',null);}
          sv();rMy();rHome();
        });
      })(a);}
      wrap.appendChild(card);bodyInner.appendChild(wrap);
    });
    body.appendChild(bodyInner);
    if(isOpen){body.style.maxHeight='none';body.style.opacity='1';}
    hdr.addEventListener('click',function(){
      var nowOpen=!body.classList.contains('open');
      catOpen[cat]=nowOpen;
      hdr.setAttribute('aria-expanded',nowOpen?'true':'false');
      if(_myColUpd)_myColUpd();
      var arrow=hdr.querySelector('.cat-arrow');
      arrow.classList.toggle('open',nowOpen);
      if(nowOpen){
        body.classList.add('open');
        body.style.transition='none';
        body.style.maxHeight='0px';
        body.style.opacity='0';
        body.getBoundingClientRect();
        var target=body.scrollHeight;
        requestAnimationFrame(function(){
          body.style.transition='max-height .3s cubic-bezier(.4,0,.2,1),opacity .22s ease';
          body.style.maxHeight=target+'px';
          body.style.opacity='1';
        });
        setTimeout(function(){if(body.classList.contains('open')){body.style.maxHeight='none';body.style.transition='';}},340);
      } else {
        body.style.transition='none';
        body.style.maxHeight=body.scrollHeight+'px';
        body.style.opacity='1';
        body.getBoundingClientRect();
        body.classList.remove('open');
        requestAnimationFrame(function(){
          body.style.transition='max-height .3s cubic-bezier(.4,0,.2,1),opacity .22s ease';
          body.style.maxHeight='0px';
          body.style.opacity='0';
        });
      }
    });
    section.appendChild(hdr);section.appendChild(body);el.appendChild(section);
  });
}

function showArchivedList(){
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  var head=document.createElement('div');
  head.style.cssText='margin-bottom:16px;';
  head.innerHTML='<div style="font-family:var(--serif);font-size:20px;font-weight:700;line-height:1.2;">Archived seeds</div><div style="font-size:12px;color:var(--tx3);margin-top:4px;">Restore anything back into your packet, or delete for good.</div>';
  sh.appendChild(head);
  var visibleArchived=archivedActs.filter(function(a){return !a._terminated;});
  if(!visibleArchived.length){
    var empty=document.createElement('div');
    empty.style.cssText='padding:22px 0;text-align:center;color:var(--tx3);font-size:13px;';
    empty.textContent='Nothing archived.';
    sh.appendChild(empty);
  } else {
    var list=document.createElement('div');
    list.style.cssText='background:var(--bg2);border-radius:14px;padding:0 14px;margin-bottom:16px;max-height:60vh;overflow-y:auto;';
    visibleArchived.forEach(function(a,i){
      var row=document.createElement('div');
      row.style.cssText='display:flex;align-items:center;gap:10px;padding:12px 0;'+(i<visibleArchived.length-1?'border-bottom:.5px solid var(--bg3);':'');
      row.innerHTML='<span style="font-size:22px;">'+(a.emoji||'🌱')+'</span><div style="flex:1;min-width:0;"><div style="font-size:14px;font-weight:600;color:var(--tx);">'+a.name+'</div><div style="font-size:11px;color:var(--tx3);">'+(a.cat||'Uncategorised')+'</div></div>';
      var btns=document.createElement('div');btns.style.cssText='display:flex;gap:6px;flex-shrink:0;';
      var restoreBtn=document.createElement('button');
      restoreBtn.textContent='Restore';
      restoreBtn.style.cssText='background:var(--gr);color:#FFFBF3;border:none;border-radius:12px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;';
      var deleteBtn=document.createElement('button');
      deleteBtn.textContent='Delete';
      deleteBtn.style.cssText='background:none;border:1px solid var(--bg3);color:var(--tx3);border-radius:12px;padding:6px 12px;font-size:12px;font-weight:600;cursor:pointer;';
      (function(act){
        restoreBtn.addEventListener('click',function(){
          var ai=archivedActs.indexOf(act);
          if(ai>-1){archivedActs.splice(ai,1);myActs.push(_normalizeSeed(act));_untombstone(act.id);sv();showToast(act.emoji+' '+act.name+' restored',null);showArchivedList();rMy();rHome();}
        });
        deleteBtn.addEventListener('click',function(){
          if(!confirm('Delete "'+act.name+'" for good? This cannot be undone.'))return;
          var ai=archivedActs.indexOf(act);
          if(ai>-1){archivedActs.splice(ai,1);_tombstone(act.id,'del');_purgeSeedRefs(act.id);delete activityNotes[act.id];sv();_flushSync();showToast(act.emoji+' '+act.name+' deleted',null);showArchivedList();rMy();rHome();}
        });
      })(a);
      btns.appendChild(restoreBtn);btns.appendChild(deleteBtn);
      row.appendChild(btns);
      list.appendChild(row);
    });
    sh.appendChild(list);
  }
  document.getElementById('ed-ov').classList.add('on');
}

// ── HARVEST ───────────────────────────────────────────
function getStreakAt(actId, date){
  var dayMs=24*3600*1000;
  var d=new Date(date);d.setHours(0,0,0,0);
  var actDays=_sessFor(actId).map(function(s){
    var sd=new Date(s.date);sd.setHours(0,0,0,0);return sd.getTime();
  });
  actDays=actDays.filter(function(v,i){return actDays.indexOf(v)===i;});
  if(!actDays.length)return 0;
  var earliest=Math.min.apply(null,actDays);
  var streak=0,graceUsed=0,check=d.getTime();
  if(actDays.indexOf(check)===-1){check-=dayMs;}
  while(check>=earliest){
    if(actDays.indexOf(check)>-1){streak++;}
    else{graceUsed++;if(graceUsed>STREAK_GRACE)break;}
    check-=dayMs;
  }
  return streak;
}
var histSearch='', histPeriod='all', histCustomFrom=null, histCustomTo=null, histDayOpen={};

function rHist(){
  // Sync period pills
  document.querySelectorAll('#hist-seg .my-seg-btn').forEach(function(b){b.classList.toggle('on',b.dataset.p===histPeriod);});
  var _histSeg=document.getElementById('hist-seg');if(_histSeg)requestAnimationFrame(function(){positionSegThumb(_histSeg);});
  var el=document.getElementById('hist-list');
  if(!sessions.length){el.innerHTML='<p style="color:var(--tx2);font-size:14px;line-height:1.55;padding:8px 4px;">No harvests yet.<br><span style="color:var(--tx3);">Tap + to log your first session and start your garden.</span></p>';return;}
  el.innerHTML='';

  var now=new Date();
  var weekAgo=new Date(now);weekAgo.setDate(weekAgo.getDate()-7);
  var monthAgo=new Date(now);monthAgo.setDate(1);monthAgo.setHours(0,0,0,0);
  var q=(histSearch||'').toLowerCase().trim();

  var _actMap={};myActs.forEach(function(a){_actMap[a.id]=a;});archivedActs.forEach(function(a){if(!_actMap[a.id])_actMap[a.id]=a;});
  var sorted=sessions.slice().sort(function(a,b){return b.date-a.date;}).filter(function(s){
    var a=_actMap[s.actId]||(s.actName?{name:s.actName}:{name:'Deleted activity'});
    if(histPeriod==='week'&&s.date<weekAgo.getTime())return false;
    if(histPeriod==='month'&&s.date<monthAgo.getTime())return false;
    if(histPeriod==='custom'){
      if(histCustomFrom&&s.date<new Date(histCustomFrom+'T00:00:00').getTime())return false;
      if(histCustomTo&&s.date>new Date(histCustomTo+'T23:59:59').getTime())return false;
    }
    if(q&&a.name.toLowerCase().indexOf(q)<0&&(s.notes||'').toLowerCase().indexOf(q)<0)return false;
    return true;
  });

  var countEl=document.getElementById('hist-count');
  var isFiltered=q||histPeriod!=='all'||(histPeriod==='custom'&&(histCustomFrom||histCustomTo));
  if(isFiltered&&countEl){countEl.style.display='block';countEl.textContent=sorted.length+' session'+(sorted.length!==1?'s':'');}
  else if(countEl){countEl.style.display='none';}

  if(!sorted.length){
    el.innerHTML='<div style="text-align:center;padding:32px 0;color:var(--tx3);font-size:14px;">No sessions match</div>';
    return;
  }

  var today=new Date(),yesterday=new Date(today);yesterday.setDate(yesterday.getDate()-1);
  function dayKey(d){return new Date(d).toDateString();}
  function dayLabel(d){
    var ds=new Date(d);
    if(dayKey(ds)===dayKey(today))return'Today';
    if(dayKey(ds)===dayKey(yesterday))return'Yesterday';
    return ds.toLocaleDateString(undefined,{weekday:'long',month:'long',day:'numeric'});
  }
  // Group sessions by day so each day can be collapsed
  var _dayGroups={};var _dayOrder=[];
  sorted.forEach(function(s){var k=dayKey(s.date);if(!_dayGroups[k]){_dayGroups[k]=[];_dayOrder.push(k);}_dayGroups[k].push(s);});
  var _hi=0;
  _dayOrder.forEach(function(_dk){
    var _daySess=_dayGroups[_dk];
    var _isDayOpen=histDayOpen[_dk]!==false;
    var _dayWrap=document.createElement('div');
    var _dayHdr=document.createElement('div');
    _dayHdr.style.cssText='display:flex;align-items:center;gap:6px;font-size:11px;font-weight:700;color:var(--co2);text-transform:uppercase;letter-spacing:.7px;padding:14px 0 6px;cursor:pointer;user-select:none;';
    _dayHdr.innerHTML='<span>'+dayLabel(_daySess[0].date)+'</span><span class="hist-day-arrow" style="font-size:14px;font-weight:400;display:inline-block;transition:transform .28s cubic-bezier(.4,0,.2,1);transform:rotate('+(_isDayOpen?'90':'0')+'deg);line-height:1;">›</span>';
    var _dayBody=document.createElement('div');_dayBody.className='hist-day-body'+(_isDayOpen?' open':'');
    var _dayInner=document.createElement('div');_dayInner.className='hist-day-inner';
    if(_isDayOpen){_dayBody.style.maxHeight='none';_dayBody.style.opacity='1';}
    _dayHdr.setAttribute('role','button');_dayHdr.tabIndex=0;_dayHdr.setAttribute('aria-expanded',_isDayOpen?'true':'false');
    _dayHdr.addEventListener('keydown',function(e){if(e.key==='Enter'||e.key===' '){e.preventDefault();_dayHdr.click();}});
    (function(k,bd,hd){hd.addEventListener('click',function(){
      var wasOpen=bd.classList.contains('open');
      hd.setAttribute('aria-expanded',!wasOpen?'true':'false');
      var arr=hd.querySelector('.hist-day-arrow');
      if(arr)arr.style.transform='rotate('+(!wasOpen?'90':'0')+'deg)';
      histDayOpen[k]=!wasOpen;
      if(!wasOpen){
        bd.classList.add('open');
        bd.style.transition='none';bd.style.maxHeight='0px';bd.style.opacity='0';bd.getBoundingClientRect();
        var t=bd.scrollHeight;
        requestAnimationFrame(function(){bd.style.transition='max-height .3s cubic-bezier(.4,0,.2,1),opacity .22s ease';bd.style.maxHeight=t+'px';bd.style.opacity='1';});
        setTimeout(function(){if(bd.classList.contains('open')){bd.style.maxHeight='none';bd.style.transition='';}},320);
      } else {
        bd.style.transition='none';bd.style.maxHeight=bd.scrollHeight+'px';bd.style.opacity='1';bd.getBoundingClientRect();
        bd.classList.remove('open');
        requestAnimationFrame(function(){bd.style.transition='max-height .3s cubic-bezier(.4,0,.2,1),opacity .22s ease';bd.style.maxHeight='0px';bd.style.opacity='0';});
      }
    });})(_dk,_dayBody,_dayHdr);
    _daySess.forEach(function(s){
    var a=_actMap[s.actId]||(s.actName?{emoji:s.actEmoji||'📋',name:s.actName}:{emoji:'📋',name:'Deleted activity'});
    var dur=s.hours>0?s.hours+'h '+s.mins+'min':s.mins+'min';
    var stage=getStage(getHours(s.actId));
    var stageClrs=['#8FA89A','#3A9A70','#2E7D52','#B03870','#C87800'];
    var stageBgs=['#E8F0EC','#D4F2E4','#C0E8D0','#FDEAE6','#FFF3D0'];
    var stageEl='<span style="font-size:10px;font-weight:600;padding:2px 7px;border-radius:9px;margin-left:6px;background:'+stageBgs[stage]+';color:'+stageClrs[stage]+';">'+STAGE_LABELS[stage]+'</span>';
    var streak=getStreakAt(s.actId,s.date);
    var streakEl=streak>=3?'<span style="font-size:11px;font-weight:600;color:#C05C00;">🔥 '+streak+' days</span>':'';
    var tW=52,tH=68;
    var pW=38,pH=50;
    // Widen the viewBox so the plant draws 8% smaller, centred, still on the ground
    var vW=pW/0.92,vH=pH/0.92,vX=((pW-vW)/2).toFixed(2),vY=(pH-vH).toFixed(2);
    var plantInner=drawPlant(stage,pW,pH,a.cat,_plantHash(a.id));
    var plantBg=['linear-gradient(180deg,rgba(216,232,216,.55),rgba(168,200,160,.55))','linear-gradient(180deg,rgba(200,232,208,.55),rgba(126,184,144,.55))','linear-gradient(180deg,rgba(176,216,184,.55),rgba(86,168,112,.55))','linear-gradient(180deg,rgba(240,200,208,.55),rgba(192,112,144,.55))','linear-gradient(180deg,rgba(248,232,160,.55),rgba(212,168,48,.55))'];
    var plantCol=plantInner?'<div style="width:'+tW+'px;flex-shrink:0;background:'+plantBg[stage]+';display:flex;align-items:flex-end;border-radius:var(--rad);overflow:hidden;box-shadow:var(--sh);"><svg viewBox="'+vX+' '+vY+' '+vW.toFixed(2)+' '+vH.toFixed(2)+'" width="'+tW+'" height="'+tH+'" xmlns="http://www.w3.org/2000/svg">'+plantInner+'</svg></div>':'';
    var hc=document.createElement('div');hc.className='hc';hc.style.cssText='cursor:pointer;display:flex;align-items:stretch;gap:6px;padding:0;background:none;border:none;box-shadow:none;animation-delay:'+(_hi*36)+'ms;margin-left:8px;margin-right:8px;width:calc(100% - 20px);';_hi++;
    hc.innerHTML='<div class="hc-main" style="flex:1;padding:8px 14px;min-width:0;display:flex;align-items:center;gap:8px;background:var(--card);border:var(--br);border-radius:var(--rad);box-shadow:var(--sh);">'
      +'<div style="flex:1;"><div style="font-size:15px;font-weight:600;color:var(--tx);line-height:1.2;">'+a.name+'</div><div style="font-size:12px;color:var(--tx3);margin-top:2px;">'+dur+'</div></div>'
      +((s.notes||s.well||s.diff)?'<span style="font-size:13px;color:var(--tx3);flex-shrink:0;" title="Has notes">✎</span>':'')
      +(s.rating?'<span class="hc-r" style="flex-shrink:0;">'+normRating(s.rating)+' ★</span>':'')
      +'</div>'+plantCol;
    (function(sess,act){hc.addEventListener('click',function(){openSessionDetail(sess,act);});})(s,a);
    _dayInner.appendChild(hc);
    });
    _dayBody.appendChild(_dayInner);
    _dayWrap.appendChild(_dayHdr);_dayWrap.appendChild(_dayBody);
    el.appendChild(_dayWrap);
  });
}

// ── SESSION DETAIL ────────────────────────────────────
function openSessionDetail(s,a){
  var dur=s.hours>0?s.hours+'h '+s.mins+'min':s.mins+'min';
  var sh=document.getElementById('ed-sh');
  sh.innerHTML='<div style="font-family:var(--serif);font-size:18px;font-weight:700;text-align:center;margin-bottom:2px;">'+a.name+'</div>'
    +'<div style="font-size:12px;color:var(--tx2);text-align:center;margin-bottom:16px;">'+new Date(s.date).toLocaleDateString(undefined,{weekday:'long',year:'numeric',month:'long',day:'numeric'})+'</div>'
    +(s.rating
      ?'<div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:14px;">'
        +'<div style="background:var(--bg2);border-radius:10px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--gr);">'+dur+'</div><div style="font-size:11px;color:var(--tx3);">Time spent</div></div>'
        +'<div style="background:var(--bg2);border-radius:10px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--gr);">★ '+normRating(s.rating)+'</div><div style="font-size:11px;color:var(--tx3);">Rating</div></div>'
      +'</div>'
      :'<div style="margin-bottom:14px;"><div style="background:var(--bg2);border-radius:10px;padding:10px;text-align:center;"><div style="font-size:18px;font-weight:700;color:var(--gr);">'+dur+'</div><div style="font-size:11px;color:var(--tx3);">Time spent</div></div></div>');
  // What was written when logging: feeling/momentum tags, then the notes in one box
  var feels=Array.isArray(s.feel)?s.feel:(s.feel?[s.feel]:[]);
  var tags=feels.concat(s.momentum?[s.momentum]:[]);
  var extra='';
  if(tags.length)extra+='<div style="display:flex;gap:6px;flex-wrap:wrap;margin-bottom:12px;">'+tags.map(function(t){
    return '<span style="font-size:12px;font-weight:600;padding:5px 11px;border-radius:20px;background:var(--grl);background:color-mix(in srgb,var(--gr) 14%,var(--bg));color:var(--gr2);">'+esc(t)+'</span>';
  }).join('')+'</div>';
  var noteRows=[['Field notes',s.notes],['Went well',s.well],['Next time',s.diff]].filter(function(r){return r[1]&&String(r[1]).trim();});
  if(noteRows.length)extra+='<div style="background:var(--bg2);border-radius:10px;padding:0 14px;margin-bottom:14px;">'+noteRows.map(function(r,i){
    return '<div style="padding:11px 0;'+(i<noteRows.length-1?'border-bottom:.5px solid var(--bg3);':'')+'">'
      +'<div style="font-size:10.5px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:.6px;margin-bottom:4px;">'+r[0]+'</div>'
      +'<div style="font-size:13px;color:var(--tx);line-height:1.5;white-space:pre-wrap;word-break:break-word;">'+esc(r[1])+'</div></div>';
  }).join('')+'</div>';
  if(extra)sh.insertAdjacentHTML('beforeend',extra);
  var row=document.createElement('div');row.style.cssText='display:flex;gap:8px;margin-top:8px;';
  var editBtn=document.createElement('button');editBtn.className='btn btn-p';editBtn.style.cssText='flex:1;margin-top:0;';editBtn.textContent='Edit';
  editBtn.addEventListener('click',function(){closeEd();openSessionEdit(s,a);});
  var deleteBtn=document.createElement('button');deleteBtn.className='btn btn-s';deleteBtn.style.cssText='flex:1;margin-top:0;color:var(--co);border-color:var(--co);';deleteBtn.textContent='Delete';
  deleteBtn.addEventListener('click',function(){
    var idx=sessions.findIndex(function(x){return x.date===s.date&&x.actId===s.actId;});
    if(idx>-1){var removed=sessions.splice(idx,1)[0];_tombstone(removed.id);sv();rHist();closeEd();showToast('Session removed',function(){sessions.splice(idx,0,removed);if(removed.id)_untombstone(removed.id);sv();rHist();});}
  });
  row.appendChild(editBtn);row.appendChild(deleteBtn);sh.appendChild(row);
  document.getElementById('ed-ov').classList.add('on');
}

// ── SESSION EDIT ──────────────────────────────────────
var _editSessionDate=null, _editSessionFeels=[], _editSessionRating=0, _editSessionMomentum='';
function openSessionEdit(s,a){
  _editSessionDate=s.date;
  _editSessionFeels=Array.isArray(s.feel)?s.feel.slice():(s.feel?[s.feel]:[]);
  _editSessionRating=s.rating||0;
  _editSessionMomentum=s.momentum||'';
  var sh=document.getElementById('ed-sh');
  var _d=new Date(s.date),_dv=_d.getFullYear()+'-'+String(_d.getMonth()+1).padStart(2,'0')+'-'+String(_d.getDate()).padStart(2,'0');
  sh.innerHTML='<div style="font-family:var(--serif);font-size:18px;font-weight:700;margin-bottom:4px;">Edit session</div>'
    +'<div style="font-size:12px;color:var(--tx2);margin-bottom:18px;">'+a.emoji+' '+a.name+'</div>'
    +'<div class="fl"><div class="fl-lbl">Date</div><input type="date" class="sinp" id="ses-edit-date" value="'+_dv+'" style="width:100%;"></div>'
    +'<div class="fl"><div class="fl-lbl">Time spent</div>'
      +'<div class="dr"><input type="number" class="di" id="ses-edit-h" min="0" max="24" value="'+(s.hours||0)+'"><span class="du">h</span><input type="number" class="di" id="ses-edit-m" min="0" max="59" value="'+(s.mins||0)+'"><span class="du">min</span></div></div>'
    +'<div class="fl"><div class="fl-lbl">Feeling after <span class="opt">optional</span></div><div id="ses-edit-feels"></div></div>'
    +'<div class="fl"><div class="fl-lbl">Rate this session</div><div class="stars" id="ses-edit-stars"></div><div class="slbl" id="ses-edit-slbl"></div></div>'
    +'<div class="fl"><div class="fl-lbl">Momentum</div><div class="fr" id="ses-edit-momentum"></div></div>'
    +'<div class="fl"><div class="fl-lbl">Field notes <span class="opt">optional</span></div><textarea class="nta" id="ses-edit-notes" placeholder="What did you work on?">'+(s.notes||'')+'</textarea></div>'
    +'<div class="fl"><div class="fl-lbl">What went well? <span class="opt">optional</span></div><textarea class="nta" id="ses-edit-well" style="min-height:56px;" placeholder="A small win…">'+(s.well||'')+'</textarea></div>'
    +'<div class="fl"><div class="fl-lbl">Do differently next time? <span class="opt">optional</span></div><textarea class="nta" id="ses-edit-diff" style="min-height:56px;" placeholder="One thing to adjust…">'+(s.diff||'')+'</textarea></div>';

  // feels
  var feelsWrap=sh.querySelector('#ses-edit-feels');
  makeFeelsCategories(feelsWrap,_editSessionFeels);

  // stars
  var starsWrap=sh.querySelector('#ses-edit-stars');
  var slbl=sh.querySelector('#ses-edit-slbl');
  makeStarRating(starsWrap,normRating(_editSessionRating),function(val,lbl){_editSessionRating=val;slbl.textContent=lbl;});
  slbl.textContent=STAR_LBLS[normRating(_editSessionRating)]||'';

  // momentum
  var momWrap=sh.querySelector('#ses-edit-momentum');
  makeMomentumScale(momWrap,_editSessionMomentum,function(val){_editSessionMomentum=val;});

  var row=document.createElement('div');row.style.cssText='display:flex;gap:8px;margin-top:8px;';
  var saveBtn=document.createElement('button');saveBtn.className='btn btn-p';saveBtn.style.cssText='flex:1;margin-top:0;';saveBtn.textContent='Save changes';
  saveBtn.addEventListener('click',function(){
    var idx=sessions.findIndex(function(x){return x.date===_editSessionDate&&x.actId===(a.id||s.actId);});
    if(idx>-1){
      var _dateVal=sh.querySelector('#ses-edit-date').value;
      if(_dateVal)sessions[idx].date=new Date(_dateVal+'T12:00:00').getTime();
      sessions[idx].hours=parseInt(sh.querySelector('#ses-edit-h').value)||0;
      sessions[idx].mins=parseInt(sh.querySelector('#ses-edit-m').value)||0;
      sessions[idx].feel=_editSessionFeels.slice();
      sessions[idx].rating=_editSessionRating;
      sessions[idx].momentum=_editSessionMomentum;
      sessions[idx].notes=sh.querySelector('#ses-edit-notes').value.trim();
      sessions[idx].well=sh.querySelector('#ses-edit-well').value.trim();
      sessions[idx].diff=sh.querySelector('#ses-edit-diff').value.trim();
    }
    sv();closeEd();rHist();showToast('Session updated',null);
  });
  var cancelBtn=document.createElement('button');cancelBtn.className='btn btn-s';cancelBtn.style.cssText='flex:1;margin-top:0;';cancelBtn.textContent='Cancel';
  cancelBtn.addEventListener('click',function(){closeEd();openSessionDetail(s,a);});
  row.appendChild(saveBtn);row.appendChild(cancelBtn);
  row.style.cssText='display:flex;gap:8px;position:sticky;bottom:-26px;background:var(--bg);padding:12px 22px 26px;margin:8px -22px -26px;border-top:0.5px solid var(--bg3);';
  sh.appendChild(row);
  document.getElementById('ed-ov').classList.add('on');
}

// ── EDIT SHEET ────────────────────────────────────────
var edId=null, edTmp={};
function openEd(id){
  edId=id;
  var a=myActs.find(function(x){return x.id===id;});
  document.getElementById('ed-title').textContent='Tend: '+a.name;
  edTmp={name:a.name,emoji:a.emoji,cat:a.cat||CATS[0]};

  document.getElementById('ed-name').value=a.name;
  document.getElementById('ed-emoji').value=a.emoji;

  var catWrap=document.getElementById('ed-cat');catWrap.innerHTML='';
  function addEdCat(cat,label,cc){
    var b=document.createElement('div');b.className='sop'+(edTmp.cat===cat?' on':'');b.textContent=label;
    if(edTmp.cat===cat){b.style.background=cc[0];b.style.color=cc[1];b.style.borderColor=cc[1];}
    b.addEventListener('click',function(){
      edTmp.cat=cat;
      catWrap.querySelectorAll('.sop').forEach(function(x){x.classList.remove('on');x.style.background='';x.style.color='';x.style.borderColor='';});
      b.classList.add('on');b.style.background=cc[0];b.style.color=cc[1];b.style.borderColor=cc[1];
    });
    catWrap.appendChild(b);
  }
  CATS.forEach(function(cat){var cc=CAT_COLORS[cat]?CAT_COLORS[cat].split(','):['var(--bg2)','var(--tx)'];addEdCat(cat,cat,cc);});
  customCats.forEach(function(cat){addEdCat(cat,'🌱 '+cat,['var(--bg3)','var(--tx)']);});

  document.getElementById('ed-ov').classList.add('on');
}
// Shared activity picker (title + search + category pills + card grid).
// Static shell builds once; filter changes rebuild only the grid inside _resizeSheet,
// so the sheet height animates and the search input keeps focus.
// o: {container, sheet, title, titleSize, sub, maxH, focusPill, focusMark, onPick(act), footer(container), autofocus}
function buildActPicker(o){
  var c=o.container;
  var pCat='all',pSearch='',pFocus=false;
  var title=document.createElement('div');title.style.cssText='font-family:var(--serif);font-size:'+(o.titleSize||19)+'px;font-weight:700;margin-bottom:'+(o.sub?'4px':'10px')+';';title.textContent=o.title;c.appendChild(title);
  if(o.sub){var sub=document.createElement('div');sub.style.cssText='font-size:13px;color:var(--tx2);margin-bottom:12px;';sub.textContent=o.sub;c.appendChild(sub);}
  var sw=document.createElement('div');sw.className='sw';sw.style.marginBottom='8px';
  var sic=document.createElement('span');sic.className='sic';sic.textContent='🔍';sw.appendChild(sic);
  var inp=document.createElement('input');inp.className='si';inp.placeholder='Search...';
  var _sT=null;
  inp.addEventListener('input',function(){var v=this.value.toLowerCase();if(_sT)clearTimeout(_sT);_sT=setTimeout(function(){_sT=null;pSearch=v;_resizeSheet(o.sheet,rGrid);},120);});
  sw.appendChild(inp);c.appendChild(sw);
  var pills=document.createElement('div');pills.style.cssText='display:flex;flex-wrap:wrap;gap:5px;margin-bottom:10px;';
  function refilter(){
    // Focus-pill pickers restyle pills (colors mute while focus filter is on) — rebuild;
    // plain pickers just toggle classes in place so the CSS transition animates
    if(o.focusPill)rPills();
    else pills.querySelectorAll('.pill').forEach(function(x){x.classList.toggle('off',x.dataset.cat!==pCat);});
    _resizeSheet(o.sheet,rGrid);
  }
  function rPills(){
    pills.innerHTML='';
    if(o.focusPill&&hasFocusSet()){
      var fp=document.createElement('div');fp.className='pill'+(pFocus?'':' off');
      if(pFocus){fp.style.background='var(--gr)';fp.style.color='#fff';}
      fp.textContent='🎯 Focus';
      fp.addEventListener('click',function(){pFocus=!pFocus;refilter();});
      pills.appendChild(fp);
    }
    function mkPill(label,cat){
      var p=document.createElement('div');p.className='pill'+((!pFocus&&pCat===cat)?'':' off');p.dataset.cat=cat;
      if(!pFocus&&cat==='all'){p.style.background='var(--gr)';p.style.color='#fff';}
      else if(!pFocus&&cat!=='all'){var cc=CAT_COLORS[cat]?CAT_COLORS[cat].split(','):['var(--bg3)','var(--tx)'];p.style.background=cc[0];p.style.color=cc[1];}
      p.textContent=label;
      p.addEventListener('click',function(){pFocus=false;pCat=cat;refilter();});
      pills.appendChild(p);
    }
    mkPill('All','all');CATS.forEach(function(cat){mkPill(CEM[cat],cat);});
  }
  rPills();
  c.appendChild(pills);
  var grid=document.createElement('div');grid.style.cssText='display:flex;flex-direction:column;gap:7px;max-height:'+(o.maxH||'50vh')+';overflow-y:auto;';
  function rGrid(){
    grid.innerHTML='';
    var base=(o.focusPill&&pFocus)?myActs.filter(function(a){return weeklyFocus.actIds.indexOf(a.id)>-1;}):myActs;
    var list=base.filter(function(a){return((o.focusPill&&pFocus)||pCat==='all'||a.cat===pCat)&&(!pSearch||a.name.toLowerCase().includes(pSearch));});
    list.forEach(function(a){
      var cnt=_sessFor(a.id).length;
      var isFoc=o.focusMark&&hasFocusSet()&&weeklyFocus.actIds.indexOf(a.id)>-1;
      var card=document.createElement('div');card.className='bp-card';
      card.innerHTML='<span style="font-size:22px;">'+esc(a.emoji)+'</span><div style="flex:1;"><div style="font-size:13px;font-weight:600;">'+esc(a.name)+(isFoc?' 🎯':'')+'</div><div style="font-size:11px;color:var(--tx2);">'+esc(a.cat)+'</div></div><span style="font-size:11px;color:var(--tx3);">'+cnt+'x</span>';
      card.addEventListener('click',function(){o.onPick(a);});
      grid.appendChild(card);
    });
    if(!list.length){var empty=document.createElement('div');empty.style.cssText='font-size:13px;color:var(--tx2);padding:12px 0;';empty.textContent='No activities found';grid.appendChild(empty);}
  }
  rGrid();
  c.appendChild(grid);
  if(o.footer)o.footer(c);
  if(o.autofocus===0)inp.focus();
  else if(o.autofocus)setTimeout(function(){inp.focus();},o.autofocus);
}
// Sticky footer row used by the sheet-based pickers
function _pickerStickyRow(buttons){
  var row=document.createElement('div');
  row.style.cssText='display:flex;gap:8px;position:sticky;bottom:-26px;background:var(--bg);padding:12px 22px 26px;margin:8px -22px -26px;border-top:0.5px solid var(--bg3);';
  buttons.forEach(function(b){
    var btn=document.createElement('button');btn.className='btn btn-s';btn.style.cssText='flex:1;margin-top:0;';
    btn.textContent=b.label;btn.addEventListener('click',b.fn);row.appendChild(btn);
  });
  return row;
}
function openHarvestQuickLog(){
  if(!myActs.length){openAdd();return;}
  var sh=document.getElementById('ed-sh');sh.innerHTML='';
  buildActPicker({container:sh,sheet:sh,title:'Log session',sub:'Which activity?',
    onPick:function(a){closeEd();openLogDirect(a.id,'hist');},
    footer:function(c){c.appendChild(_pickerStickyRow([{label:'Cancel',fn:closeEd}]));},
    autofocus:80});
  document.getElementById('ed-ov').classList.add('on');
}
function closeEd(){document.getElementById('ed-ov').classList.remove('on');}
function saveEd(){
  var a=myActs.find(function(x){return x.id===edId;});
  if(a){
    var newName=document.getElementById('ed-name').value.trim();
    var newEmoji=document.getElementById('ed-emoji').value.trim();
    if(newName)a.name=newName;
    if(newEmoji)a.emoji=newEmoji;
    a.cat=edTmp.cat;
  }
  sv();closeEd();rMy();rHome();
}

// ── ADD SHEET ─────────────────────────────────────────
var libCat='all', libSearch='', libSelected=[], _renderCats=null;

function _fadeInPanel(el){
  if(!el)return;
  el.style.transition='none';
  el.style.opacity='0';
  el.style.display='block';
  el.getBoundingClientRect();
  el.style.transition='opacity .22s ease';
  el.style.opacity='1';
}
function _resizeSheet(sh,work){
  if(!sh){work();return;}
  // Reentrant-safe: if a previous resize is mid-flight, continue from the current height
  if(sh._rsT){clearTimeout(sh._rsT);sh._rsT=null;}
  var oldH=sh.offsetHeight;
  sh.style.transition='';sh.style.height='';sh.style.overflow='';
  work();
  var newH=sh.scrollHeight;
  if(Math.abs(newH-oldH)<8){return;}
  sh.style.overflow='hidden';
  sh.style.height=oldH+'px';
  sh.getBoundingClientRect();
  sh.style.transition='height .22s cubic-bezier(.4,0,.2,1)';
  sh.style.height=newH+'px';
  sh._rsT=setTimeout(function(){sh._rsT=null;sh.style.height='';sh.style.transition='';sh.style.overflow='';},230);
}
// Animate an in-page container's height across a rebuild (same FLIP trick as _resizeSheet)
function _smoothList(el,work){
  if(!el||el.offsetParent===null){work();return;}
  if(el._rsT){clearTimeout(el._rsT);el._rsT=null;}
  var oldH=el.offsetHeight;
  el.style.transition='';el.style.height='';el.style.overflow='';
  work();
  var newH=el.offsetHeight;
  if(Math.abs(newH-oldH)<8){return;}
  el.style.overflow='hidden';
  el.style.height=oldH+'px';
  el.getBoundingClientRect();
  el.style.transition='height .28s cubic-bezier(.4,0,.2,1)';
  el.style.height=newH+'px';
  el._rsT=setTimeout(function(){el._rsT=null;el.style.height='';el.style.transition='';el.style.overflow='';},290);
}
function switchAddTab(tab){
  var isLib = tab==='library';
  var lib=document.getElementById('add-panel-library'),cus=document.getElementById('add-panel-custom');
  var show=isLib?lib:cus, hide=isLib?cus:lib;
  _resizeSheet(document.querySelector('#add-ov .sh'),function(){
    hide.style.display='none';hide.style.opacity='';hide.style.transition='';
    _fadeInPanel(show);
  });
  document.getElementById('tab-library').style.background = isLib?'var(--gr)':'var(--bg2)';
  document.getElementById('tab-library').style.color = isLib?'#fff':'var(--tx2)';
  document.getElementById('tab-custom').style.background = isLib?'var(--bg2)':'var(--gr)';
  document.getElementById('tab-custom').style.color = isLib?'var(--tx2)':'#fff';
}

function rLibGrid(){
  var existing = myActs.map(function(a){return a.id;});
  var list = ACTS.filter(function(a){
    return (libCat==='all'||a.cat===libCat)
      && (!libSearch||a.name.toLowerCase().includes(libSearch))
      && !existing.includes(a.id);
  });
  var grid = document.getElementById('lib-grid');
  grid.innerHTML='';
  if(!list.length){
    var empty=document.createElement('div');
    empty.style.cssText='font-size:13px;color:var(--tx3);padding:12px 0;text-align:center;';
    empty.textContent = existing.length===ACTS.length ? 'You have planted everything in the library!' : 'No matches found.';
    grid.appendChild(empty);
    return;
  }
  list.forEach(function(a){
    var card=document.createElement('div');
    card.className='bp-card';
    card.style.cursor='pointer';
    var cc=CAT_COLORS[a.cat].split(',');
    var sel=libSelected.indexOf(a.id)>-1;
    card.style.borderColor=sel?'var(--gr)':'';
    card.style.background=sel?'var(--grl)':'';
    card.innerHTML='<span style="font-size:22px;">'+a.emoji+'</span>'
      +'<div style="flex:1;"><div style="font-size:13px;font-weight:600;color:var(--tx);">'+a.name+'</div>'
      +'<span style="font-size:11px;padding:1px 7px;border-radius:8px;background:'+cc[0]+';color:'+cc[1]+';">'+a.cat+'</span></div>'
      +'<span class="lib-chk" style="font-size:18px;color:var(--gr);font-weight:700;width:24px;text-align:center;">'+(sel?'✓':'+')+'</span>';
    card.addEventListener('click',function(){
      var idx=libSelected.indexOf(a.id);
      var nowSel;
      if(idx>-1){libSelected.splice(idx,1);nowSel=false;}else{libSelected.push(a.id);nowSel=true;}
      // Update this card in-place so the CSS transition can animate
      card.style.borderColor=nowSel?'var(--gr)':'';
      card.style.background=nowSel?'var(--grl)':'';
      var chk=card.querySelector('.lib-chk');
      if(chk)chk.textContent=nowSel?'✓':'+';
      var btn=document.getElementById('btn-lib-save');
      btn.disabled=libSelected.length===0;
      btn.textContent=libSelected.length===0?'Select seeds to plant':'Plant '+libSelected.length+' seed'+(libSelected.length!==1?'s':'');
    });
    grid.appendChild(card);
  });
}

function rLibCats(){
  var wrap=document.getElementById('lib-cats');
  if(wrap.children.length){
    // Already built — just update on/off classes so CSS transition animates
    wrap.querySelectorAll('.pill').forEach(function(p){
      var isOn=p.dataset.cat===libCat;
      p.classList.toggle('on',isOn);p.classList.toggle('off',!isOn);
    });
    return;
  }
  function mkPill(label,cat){
    var p=document.createElement('div');
    p.className='pill'+(libCat===cat?' on':' off');
    p.dataset.cat=cat;
    if(cat==='all'){p.style.background='var(--gr)';p.style.color='#fff';}
    else{var cc=CAT_COLORS[cat].split(',');p.style.background=cc[0];p.style.color=cc[1];}
    p.textContent=label;
    p.addEventListener('click',function(){libCat=cat;rLibCats();_resizeSheet(document.querySelector('#add-ov .sh'),rLibGrid);});
    wrap.appendChild(p);
  }
  mkPill('All','all');
  CATS.forEach(function(c){mkPill(c,c);});
}

// Shared category-pill picker for the add forms (custom skill + project tab).
// opts: {wrap, customWrap, inputId, selected, deletable}
function renderCatPicker(opts){
  var wrap=opts.wrap,customWrap=opts.customWrap;
  wrap.innerHTML='';customWrap.style.display='none';
  wrap.style.cssText='display:flex;flex-wrap:wrap;gap:5px;';
  function addCatPill(cat,label,bg,fg){
    var b=document.createElement('div');b.className='pill'+(cat===opts.selected?' on':' off');b.dataset.cat=cat;
    b.style.background=bg;b.style.color=fg;
    b.textContent=label;
    b.addEventListener('click',function(){wrap.querySelectorAll('.pill').forEach(function(x){x.classList.add('off');x.classList.remove('on');});b.classList.add('on');b.classList.remove('off');_resizeSheet(document.querySelector('#add-ov .sh'),function(){customWrap.style.display='none';});});
    wrap.appendChild(b);return b;
  }
  CATS.forEach(function(cat){var cc=CAT_COLORS[cat].split(',');addCatPill(cat,cat,cc[0],cc[1]);});
  customCats.forEach(function(cat){
    var pill=addCatPill(cat,cat,'var(--bg3)','var(--tx)');
    if(opts.deletable){
      var del=document.createElement('span');
      del.textContent='×';del.style.cssText='margin-left:5px;opacity:.5;font-size:13px;cursor:pointer;line-height:1;';
      del.addEventListener('click',function(e){
        e.stopPropagation();
        customCats.splice(customCats.indexOf(cat),1);
        sv();renderCatPicker(Object.assign({},opts,{selected:null}));
      });
      pill.appendChild(del);
    }
  });
  var newPill=document.createElement('div');newPill.className='pill off';newPill.dataset.cat='__new__';
  newPill.style.background='var(--bg2)';newPill.style.color='var(--tx2)';
  newPill.textContent='＋ New';
  newPill.addEventListener('click',function(){
    wrap.querySelectorAll('.pill').forEach(function(x){x.classList.add('off');x.classList.remove('on');});
    newPill.classList.add('on');newPill.classList.remove('off');
    _resizeSheet(document.querySelector('#add-ov .sh'),function(){customWrap.style.display='';});
    var inp=document.getElementById(opts.inputId);inp.value='';inp.focus();
  });
  wrap.appendChild(newPill);
}
function openAdd(){
  libCat='all';libSearch='';libSelected=[];
  document.getElementById('an').value='';
  var libBtn=document.getElementById('btn-lib-save');libBtn.disabled=true;libBtn.textContent='Select seeds to plant';
  switchAddKind('skill');
  switchAddTab('library');
  rLibCats();rLibGrid();
  // Clear project form
  var pn=document.getElementById('proj-name');if(pn)pn.value='';
  var pnt=document.getElementById('proj-notes');if(pnt)pnt.value='';
  renderProjTaskInputs(['']);
  var pdl=document.getElementById('proj-deadline');if(pdl){pdl.value='';syncDeadlineField(pdl);}

  // Search wiring
  var si=document.getElementById('lib-search');si.value='';
  var _lsT=null;
  si.oninput=function(){
    libSearch=this.value.toLowerCase();
    if(_lsT)clearTimeout(_lsT);
    _lsT=setTimeout(function(){_lsT=null;_resizeSheet(document.querySelector('#add-ov .sh'),rLibGrid);},120);
  };

  // Tab buttons
  document.getElementById('tab-library').onclick=function(){switchAddTab('library');};
  document.getElementById('tab-custom').onclick=function(){switchAddTab('custom');};

  // Custom tab options
  var catWrap=document.getElementById('ac-opts');
  var acCustomWrap=document.getElementById('ac-custom-wrap');
  document.getElementById('ac-custom-name').value='';
  function renderCats(selected){
    renderCatPicker({wrap:catWrap,customWrap:acCustomWrap,inputId:'ac-custom-name',selected:selected,deletable:true});
  }
  _renderCats=renderCats;
  renderCats(null);
  document.getElementById('add-ov').classList.add('on');
}
function closeAdd(){document.getElementById('add-ov').classList.remove('on');}
function saveAdd(){
  var name=document.getElementById('an').value.trim();
  var catEl=document.querySelector('#ac-opts .pill.on');
  if(!name||!catEl)return;
  var cat,emoji;
  if(catEl.dataset.cat==='__new__'||catEl.dataset.cat==='__custom__'){
    cat=document.getElementById('ac-custom-name').value.trim()||'Other';
    emoji='🌱';
    if(cat&&!customCats.includes(cat))customCats.push(cat);
  }else{
    cat=catEl.dataset.cat;
    emoji=CEM[cat]||'🌱';
  }
  var _newAct={id:genUUID(),name:name,emoji:emoji,cat:cat,tags:[],kind:'skill'};
  _normalizeSeed(_newAct);
  myActs.push(_newAct);
  pushFeedEvent('plant',name,emoji,null);
  checkTrophies();sv();closeAdd();rMy();
}

// ── PROJECT ADD FLOW (Phase 2) ────────────────────────
function switchAddKind(kind){
  var s=kind==='skill';
  var sTab=document.getElementById('kind-tab-skill'), pTab=document.getElementById('kind-tab-project');
  sTab.style.background=s?'var(--gr)':'var(--bg2)';sTab.style.color=s?'#FFFBF3':'var(--tx2)';
  pTab.style.background=s?'var(--bg2)':'var(--gr)';pTab.style.color=s?'var(--tx2)':'#FFFBF3';
  document.getElementById('add-sheet-title').textContent=s?'Plant a new seed':'Plant a new tree';
  var addTabs=document.getElementById('add-tabs');
  var libP=document.getElementById('add-panel-library');
  var cusP=document.getElementById('add-panel-custom');
  var projP=document.getElementById('add-panel-project');
  var sh=document.querySelector('#add-ov .sh');
  _resizeSheet(sh,function(){
    if(s){
      projP.style.display='none';projP.style.opacity='';projP.style.transition='';
      addTabs.style.display='';addTabs.style.opacity='';addTabs.style.transition='';
      cusP.style.display='none';cusP.style.opacity='';cusP.style.transition='';
      _fadeInPanel(libP);
      document.getElementById('tab-library').style.background='var(--gr)';
      document.getElementById('tab-library').style.color='#fff';
      document.getElementById('tab-custom').style.background='var(--bg2)';
      document.getElementById('tab-custom').style.color='var(--tx2)';
    } else {
      addTabs.style.display='none';libP.style.display='none';cusP.style.display='none';
      _fadeInPanel(projP);
      renderProjectCats(CATS[0]||'Personal');
      var pn=document.getElementById('proj-name');if(pn)setTimeout(function(){pn.focus();},50);
    }
  });
}
function renderProjectCats(selected){
  renderCatPicker({wrap:document.getElementById('proj-cat-opts'),customWrap:document.getElementById('proj-custom-wrap'),inputId:'proj-custom-cat',selected:selected,deletable:false});
}
// Steps list in the new-project form: one input per step, + on the last
// row adds another, × removes a row.
function readProjTaskInputs(){
  return Array.prototype.map.call(document.querySelectorAll('#proj-task-inputs .proj-task-inp'),function(i){return i.value;});
}
function renderProjTaskInputs(vals,focusIdx){
  var wrap=document.getElementById('proj-task-inputs');if(!wrap)return;
  if(!vals.length)vals=[''];
  var btnCss='width:44px;flex-shrink:0;border-radius:var(--rsm);font-size:20px;font-weight:600;cursor:pointer;line-height:1;';
  wrap.innerHTML='';
  vals.forEach(function(v,i){
    var last=i===vals.length-1;
    var row=document.createElement('div');row.style.cssText='display:flex;gap:6px;align-items:stretch;'+(last?'':'margin-bottom:6px;');
    var inp=document.createElement('input');inp.className='sinp proj-task-inp';inp.maxLength=80;inp.value=v;inp.style.cssText='flex:1;min-width:0;';
    inp.placeholder=i===0?'e.g. Draft the onboarding copy':'Another step...';
    row.appendChild(inp);
    var btn=document.createElement('button');btn.type='button';
    if(last&&vals.length<MAX_TASKS_PER_PROJECT){
      btn.textContent='+';btn.setAttribute('aria-label','Add another step');
      btn.style.cssText=btnCss+'border:none;background:var(--gr);color:#FFFBF3;';
      btn.addEventListener('click',function(){var cur=readProjTaskInputs();cur.push('');renderProjTaskInputs(cur,cur.length-1);});
      inp.addEventListener('keydown',function(e){if(e.key==='Enter'&&this.value.trim()){e.preventDefault();btn.click();}});
    } else {
      btn.textContent='×';btn.setAttribute('aria-label','Remove step');
      btn.style.cssText=btnCss+'border:1.5px solid var(--bg3);background:var(--bg2);color:var(--tx3);';
      btn.addEventListener('click',function(){var cur=readProjTaskInputs();cur.splice(i,1);renderProjTaskInputs(cur);});
    }
    row.appendChild(btn);wrap.appendChild(row);
  });
  if(focusIdx!=null){var ins=wrap.querySelectorAll('.proj-task-inp');if(ins[focusIdx])ins[focusIdx].focus();}
}
function saveProject(){
  var name=document.getElementById('proj-name').value.trim();
  var catEl=document.querySelector('#proj-cat-opts .pill.on');
  if(!name){showToast('Give your tree a name',null);document.getElementById('proj-name').focus();return;}
  if(!catEl){showToast('Pick a category',null);return;}
  var cat;
  if(catEl.dataset.cat==='__new__'){
    cat=document.getElementById('proj-custom-cat').value.trim()||'Project';
    if(cat&&!customCats.includes(cat))customCats.push(cat);
  } else {
    cat=catEl.dataset.cat;
  }
  var notes=document.getElementById('proj-notes').value.trim();
  var tasks=[];
  readProjTaskInputs().forEach(function(t){
    t=t.trim();
    if(t&&tasks.length<MAX_TASKS_PER_PROJECT)tasks.push({id:genUUID(),text:t.slice(0,80),done:false,doneAt:null,createdAt:Date.now()});
  });
  var deadline=document.getElementById('proj-deadline').value;
  var newProj={id:genUUID(),name:name,emoji:'🌳',cat:cat,kind:'project',notes:'',tasks:tasks,tags:[]};
  if(notes)_addNoteBlock(newProj.id,'general',notes);
  if(deadline)newProj.deadline=deadline;
  _normalizeSeed(newProj);
  myActs.push(newProj);
  pushFeedEvent('plant',name,'🌳',null);
  checkTrophies();sv();closeAdd();
  // Clear form for next time
  document.getElementById('proj-name').value='';
  document.getElementById('proj-notes').value='';
  renderProjTaskInputs(['']);
  var _pdl=document.getElementById('proj-deadline');_pdl.value='';syncDeadlineField(_pdl);
  // Navigate to plot so user sees the new tree
  nav('my');
  showToast('🌳 Tree planted!',null);
  if(newProj.deadline)setTimeout(function(){offerDeadlineSchedule(newProj,null);},350);
}

// ── TODAY SECTION (Phase 5) ───────────────────────────
function _fmtHour12(h){
  var suf=h>=12?'pm':'am';
  var hr=h%12||12;
  return hr+suf;
}
function _getScheduledForDate(target){
  var mid=new Date(target);mid.setHours(0,0,0,0);
  var startMs=mid.getTime(),endMs=startMs+86400000;
  var dow=(mid.getDay()===0)?6:mid.getDay()-1; // Mon=0..Sun=6
  var items=[];
  _livePlanned().forEach(function(ev){
    if(ev.date>=startMs&&ev.date<endMs){
      items.push({kind:'planned',id:ev.id,actId:ev.actId,emoji:ev.actEmoji,name:ev.actName,hour:ev.hour,duration:ev.duration});
    }
  });
  _liveRoutines().forEach(function(r){
    if(_routineOnDay(r,mid)){
      items.push({kind:'routine',id:r.id,actId:r.actId,emoji:r.actEmoji,name:r.actName,hour:r.hour,duration:r.duration});
    }
  });
  items.sort(function(a,b){
    var ah=a.hour==null?9999:a.hour;
    var bh=b.hour==null?9999:b.hour;
    return ah-bh;
  });
  return items;
}
function _getTodayScheduled(){return _getScheduledForDate(new Date());}
function renderTodaySection(){
  var wrap=document.getElementById('today-section');
  if(!wrap)return;
  if(active){wrap.innerHTML='';return;}
  var focusActs=_focusedActs();
  var scheduled=_getTodayScheduled();
  var focusProjects=focusActs.filter(isProject);
  var openTasks=[];
  focusProjects.forEach(function(p){getProjectTasks(p).forEach(function(t){if(!t.done)openTasks.push({proj:p,task:t});});});
  if(!myActs.length){wrap.innerHTML='';return;}
  // Deadlines 3 days out or overdue join the list (unless already scheduled today)
  var schedIds={};scheduled.forEach(function(it){if(it.actId)schedIds[it.actId]=true;});
  var dueSoon=myActs.filter(function(a){var d=getDeadlineDays(a);return d!==null&&d<=3&&!schedIds[a.id];})
    .sort(function(x,y){return getDeadlineDays(x)-getDeadlineDays(y);});
  var html='<div class="today-sec">';
  // Scheduled items (planned events + routines) sit under On today's list
  if(scheduled.length||dueSoon.length){
    html+='<div class="sched-scroll" style="max-height:160px;overflow-y:auto;-webkit-overflow-scrolling:touch;scrollbar-width:thin;">';
    dueSoon.forEach(function(a){
      var du=dueShort(a);
      html+='<div class="sched-item" data-startid="'+a.id+'">'
          +'<div class="sched-time">Due</div>'
          +'<div style="flex:1;min-width:0;"><div class="sched-name">'+esc(a.name)+'</div><div class="sched-meta"'+(du.overdue?' style="color:var(--co2);opacity:1;font-weight:600;"':'')+'>'+du.text+'</div></div>'
          +'<button class="sched-start" data-startid="'+a.id+'">Start</button>'
          +'</div>';
    });
    scheduled.forEach(function(it){
      var du=dueShort(_actById(it.actId));
      html+='<div class="sched-item" data-startid="'+(it.actId||'')+'">'
          +'<div class="sched-time">'+(it.hour==null?'Any':_fmtHour12(it.hour))+'</div>'
          +'<div style="flex:1;min-width:0;"><div class="sched-name">'+(it.name||'Untitled')+'</div>'
          +(du?'<div class="sched-meta"'+(du.overdue?' style="color:var(--co2);opacity:1;font-weight:600;"':'')+'>'+du.text+'</div>':'')+'</div>'
          +'<button class="sched-start" data-startid="'+(it.actId||'')+'">Start</button>'
          +'</div>';
    });
    html+='</div>';
  } else {
    // No scheduled items — light-blue empty card
    html+='<div class="sched-empty">'
        +'<div class="sched-empty-text">Tap above to schedule or log a session.</div>'
        +'</div>';
  }
  html+='</div>';
  wrap.innerHTML=html;
  // Wire schedule Start buttons → confirm modal
  wrap.querySelectorAll('.sched-start').forEach(function(el){
    el.addEventListener('click',function(e){e.stopPropagation();var id=this.dataset.startid;if(id)openActInfo(id,'home');});
  });
  wrap.querySelectorAll('.sched-item').forEach(function(el){
    el.addEventListener('click',function(){var id=this.dataset.startid;if(id)openActInfo(id,'home');});
  });
}

function renderWeekFocus(){
  var wrap=document.getElementById('week-focus-wrap');
  if(!wrap)return;
  if(active){wrap.innerHTML='';return;}
  var focusActs=_focusedActs();
  var html='';
  html+='<div class="v2-sec-hdr v2-sec-hdr-clickable" data-action="open-focus"><span>This week’s focus<span class="v2-chev">›</span></span></div>';
  if(!hasFocusSet()){
    html+='<div class="v2-today-empty" style="margin:0 16px;">Tap the header to pick a few activities<br>to focus on.</div>';
  } else if(focusActs.length){
    html+='<div class="focus-row">';
    focusActs.forEach(function(a){
      var proj=isProject(a);
      html+='<div class="focus-chip'+(proj?' project':'')+'" data-startid="'+a.id+'">'
          +'<span>'+a.name+'</span>'
          +'</div>';
    });
    html+='</div>';
  } else {
    html+='<div class="v2-today-empty" style="margin:0 16px;">No focused activities right now. Tap the header to pick some.</div>';
  }
  wrap.innerHTML=html;
  wrap.querySelectorAll('.focus-chip').forEach(function(el){
    el.addEventListener('click',function(){openActInfo(this.dataset.startid,'home');});
  });
  var hdr=wrap.querySelector('.v2-sec-hdr-clickable');
  if(hdr)hdr.addEventListener('click',openFocus);
}

// ── PROJECT DETAIL SCREEN (Phase 3) ───────────────────
var TREE_STAGE_LABELS=['Seed','Sapling','Young tree','Mature tree','Fruiting'];
function getTreeStage(hrs){
  for(var i=TREE_HRS.length-1;i>=0;i--){if(hrs>=TREE_HRS[i])return i;}
  return 0;
}
function showProjectInfo(id){
  var a=myActs.find(function(x){return x.id===id;});
  if(!a)return;
  var tasks=getProjectTasks(a);
  var doneCount=tasks.filter(function(t){return t.done;}).length;
  var sh=document.getElementById('ed-sh');
  var html='';
  html+='<div style="text-align:center;margin-bottom:16px;">';
  html+='<div style="display:flex;align-items:center;justify-content:center;gap:6px;"><button id="proj-edit-btn" class="name-edit" title="Edit project"><span style="font-family:var(--serif);font-size:22px;font-weight:700;letter-spacing:-.01em;">'+esc(a.name)+'</span>'+EDIT_PEN_SVG+'</button></div>';
  if(isFinished(a)){
    html+='<div style="display:flex;justify-content:center;align-items:center;gap:8px;margin-top:6px;font-size:12px;font-weight:600;color:var(--gr);">🌳 Finished '+new Date(a.finishedAt).toLocaleDateString('en-US',{month:'short',day:'numeric'})
      +'<button id="proj-reopen" type="button" style="background:none;border:none;padding:0;font-family:inherit;font-size:12px;font-weight:600;color:var(--tx3);text-decoration:underline;cursor:pointer;">Reopen</button></div>';
  } else html+=deadlineLineHTML(a);
  html+='</div>';
  // Steps
  html+='<div style="margin-bottom:14px;">';
  if(tasks.length)html+='<div style="font-size:11px;font-weight:700;color:var(--tx3);text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;">Steps ('+doneCount+'/'+tasks.length+(tasks.length>=MAX_TASKS_PER_PROJECT?' · max':'')+')</div>';
  html+='<div id="proj-tasks-list" style="max-height:224px;overflow-y:auto;overscroll-behavior:contain;">'; // 5 steps visible, scroll for the rest
  tasks.forEach(function(t){
    var safeText=(t.text||'').replace(/</g,'&lt;');
    html+='<div class="task-row" data-tid="'+t.id+'" style="display:flex;align-items:center;gap:10px;padding:9px 10px;background:var(--bg2);border-radius:10px;margin-bottom:6px;">';
    html+='<button class="task-check" data-tid="'+t.id+'" aria-label="'+(t.done?'Uncheck':'Check')+' step" style="width:22px;height:22px;border-radius:6px;border:1.5px solid '+(t.done?'var(--gr)':'var(--bg3)')+';background:'+(t.done?'var(--gr)':'transparent')+';color:#FFFBF3;font-size:14px;flex-shrink:0;cursor:pointer;display:flex;align-items:center;justify-content:center;line-height:1;">'+(t.done?'✓':'')+'</button>';
    html+='<div style="flex:1;font-size:13px;color:'+(t.done?'var(--tx3)':'var(--tx)')+';'+(t.done?'text-decoration:line-through;':'')+'">'+safeText+'</div>';
    html+='<button class="task-del" data-tid="'+t.id+'" aria-label="Delete step" style="background:none;border:none;font-size:16px;color:var(--tx3);cursor:pointer;padding:2px 6px;line-height:1;">×</button>';
    html+='</div>';
  });
  html+='</div>';
  if(!isFinished(a)&&tasks.length<MAX_TASKS_PER_PROJECT){
    html+='<div style="display:flex;gap:6px;margin-top:6px;">';
    html+='<input type="text" id="proj-new-task" class="sinp" placeholder="Add a step..." maxlength="80" style="flex:1;">';
    html+='<button id="proj-add-task-btn" style="padding:0 14px;border:none;border-radius:var(--rsm);background:var(--gr);color:#FFFBF3;font-size:14px;font-weight:600;cursor:pointer;">Add</button>';
    html+='</div>';
  }
  html+='</div>';
  // Session stats compact
  var actSess=_sessFor(id);
  var totalMins=actSess.reduce(function(t,s){return t+(s.hours||0)*60+(s.mins||0);},0);
  // Same stat rows as the skill info sheet
  html+='<div style="background:var(--bg2);border-radius:14px;padding:0 14px;margin-bottom:16px;">';
  html+='<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:.5px solid var(--bg3);"><span style="font-size:13px;color:var(--tx3);">Sessions</span><span style="font-size:13px;font-weight:600;">'+actSess.length+'</span></div>';
  var _lastTs=lastSessionTs(actSess);
  html+='<div style="display:flex;justify-content:space-between;padding:10px 0;'+(_lastTs?'border-bottom:.5px solid var(--bg3);':'')+'"><span style="font-size:13px;color:var(--tx3);">Time spent</span><span style="font-size:13px;font-weight:600;">'+Math.floor(totalMins/60)+'h '+(totalMins%60)+'m</span></div>';
  if(_lastTs)html+='<div style="display:flex;justify-content:space-between;padding:10px 0;"><span style="font-size:13px;color:var(--tx3);">Last session</span>'+agoToggleHTML(_lastTs)+'</div>';
  html+='</div>';
  // Notes row — opens this project in the shared Notes screen
  migrateProjectNotes();
  var _nbSum=noteSummary(a.id),_nbPreview=_nbSum.preview,_nbCount=_nbSum.count;
  html+='<button id="proj-notebook-btn" type="button" style="width:100%;display:flex;align-items:center;gap:12px;background:var(--bg2);border:none;border-radius:12px;padding:12px 14px;margin-bottom:16px;cursor:pointer;text-align:left;font-family:inherit;color:var(--tx);">';
  html+='<span style="flex:1;min-width:0;"><span style="display:block;font-size:13px;font-weight:600;">Notes'+(_nbCount?' ('+_nbCount+')':'')+'</span>';
  html+='<span style="display:block;font-size:12px;color:var(--tx3);margin-top:2px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">'+(_nbPreview?esc(_nbPreview):'Nothing written yet')+'</span></span>';
  html+='<span style="font-size:18px;color:var(--tx3);line-height:1;">›</span></button>';
  sh.innerHTML=html;
  // Finish: a prominent button once every step is ticked, otherwise a quiet link under Start / Log
  var finish=function(){
    a.finishedAt=Date.now();sv();rMy();renderTodaySection();showProjectInfo(id);
    showToast('🌳 '+a.name+' finished',function(){delete a.finishedAt;sv();rMy();renderTodaySection();if(document.getElementById('ed-ov').classList.contains('on'))showProjectInfo(id);});
  };
  var allDone=tasks.length>0&&doneCount===tasks.length;
  if(!isFinished(a)){
    if(allDone){
      var finBtn=document.createElement('button');finBtn.className='btn btn-p';finBtn.style.marginBottom='8px';finBtn.textContent='🌳 Mark as finished';
      finBtn.addEventListener('click',finish);sh.appendChild(finBtn);
    }
    var startBtn=document.createElement('button');startBtn.className=allDone?'btn btn-s':'btn btn-p';startBtn.textContent='▶ Start';
    startBtn.addEventListener('click',function(){closeEd();startFrom(id);});sh.appendChild(startBtn);
    var logBtn=document.createElement('button');logBtn.className='btn btn-s';logBtn.style.marginTop='8px';logBtn.textContent='+ Log session';
    logBtn.addEventListener('click',function(){closeEd();openLogDirect(id,'my');});sh.appendChild(logBtn);
    if(!allDone){
      var finLink=document.createElement('button');finLink.type='button';finLink.textContent='Mark as finished';
      finLink.style.cssText='display:block;margin:14px auto 0;background:none;border:none;padding:0;font-family:inherit;font-size:12px;font-weight:600;color:var(--tx3);cursor:pointer;';
      finLink.addEventListener('click',finish);sh.appendChild(finLink);
    }
  } else {
    sh.querySelector('#proj-reopen').addEventListener('click',function(){delete a.finishedAt;sv();rMy();renderTodaySection();showProjectInfo(id);});
  }
  // Re-render without losing the steps list's scroll position (or jump to the end after adding)
  var rerender=function(toEnd){
    var l=sh.querySelector('#proj-tasks-list'),top=l?l.scrollTop:0,shTop=sh.scrollTop;
    showProjectInfo(id);
    var nl=sh.querySelector('#proj-tasks-list');if(nl)nl.scrollTop=toEnd?nl.scrollHeight:top;
    sh.scrollTop=shTop;
    if(toEnd){var ni=sh.querySelector('#proj-new-task');if(ni)ni.focus();}
  };
  // Wire tasks
  sh.querySelectorAll('.task-check').forEach(function(btn){
    btn.addEventListener('click',function(){
      var tid=this.dataset.tid;var task=a.tasks.find(function(t){return t.id===tid;});if(!task)return;
      task.done=!task.done;task.doneAt=task.done?Date.now():null;sv();rerender();
    });
  });
  sh.querySelectorAll('.task-del').forEach(function(btn){
    btn.addEventListener('click',function(){
      var tid=this.dataset.tid;
      if(!confirm('Delete this step?'))return;
      a.tasks=a.tasks.filter(function(t){return t.id!==tid;});sv();rerender();
    });
  });
  var addBtn=sh.querySelector('#proj-add-task-btn');
  if(addBtn){
    var addNew=function(){
      var inp=sh.querySelector('#proj-new-task');var text=inp.value.trim();
      if(!text)return;if(a.tasks.length>=MAX_TASKS_PER_PROJECT)return;
      a.tasks.push({id:genUUID(),text:text.slice(0,80),done:false,doneAt:null,createdAt:Date.now()});
      sv();rerender(true);
    };
    addBtn.addEventListener('click',addNew);
    sh.querySelector('#proj-new-task').addEventListener('keypress',function(e){if(e.key==='Enter'){e.preventDefault();addNew();}});
  }
  wireDeadlineLine(sh,a,function(){showProjectInfo(id);});
  wireAgoToggles(sh);
  sh.querySelector('#proj-notebook-btn').addEventListener('click',function(){closeEd();openNotes();rNoteEditor(a);});
  sh.querySelector('#proj-edit-btn').addEventListener('click',function(){openActInfoEdit(id,'my');});
  document.getElementById('ed-ov').classList.add('on');
}

// ── GARDEN ────────────────────────────────────────────
function getHours(actId){return _sessFor(actId).reduce(function(t,s){return t+(s.hours||0)+((s.mins||0)/60);},0);}
function getStage(hrs){if(hrs>=16)return 4;if(hrs>=8)return 3;if(hrs>=3)return 2;if(hrs>=0.5)return 1;return 0;}
var STAGE_LABELS=['Seed','Sprout','Seedling','Flowering','In full bloom'];
var NEXT_THRESH=[0.5,3,8,16,null];

function _plantHash(s){if(!s)return 0;var h=0;for(var i=0;i<s.length;i++)h=(31*h+s.charCodeAt(i))|0;return Math.abs(h);}

function drawPlantAt(cx,gy,h,stage,cat,ph){
  var s=Math.max(0,Math.min(stage|0,4));
  ph=ph|0;
  var cc=(CAT_COLORS[cat]||CAT_COLORS.Creative).split(',');
  var petalLite=cc[0], petalDark=cc[1];
  var STEM='#4C6641', LEAF='#6D8A5F', SOIL='#8A7256';
  var stemH=[0,h*0.18,h*0.32,h*0.46,h*0.56][s];
  var tipY=gy-stemH;
  var curveDir=(ph%3)-1;
  var out='<ellipse cx="'+cx+'" cy="'+(gy+h*0.02).toFixed(1)+'" rx="'+(h*0.22).toFixed(1)+'" ry="'+(h*0.05).toFixed(1)+'" fill="'+SOIL+'"/>';
  if(s===0){
    var sr=h*0.05;
    out+='<ellipse cx="'+cx+'" cy="'+(gy-sr*0.4).toFixed(1)+'" rx="'+(sr*1.2).toFixed(1)+'" ry="'+sr.toFixed(1)+'" fill="'+petalDark+'"/>';
    out+='<ellipse cx="'+(cx-sr*0.4).toFixed(1)+'" cy="'+(gy-sr*0.75).toFixed(1)+'" rx="'+(sr*0.35).toFixed(1)+'" ry="'+(sr*0.25).toFixed(1)+'" fill="#FFF6EA"/>';
    return out;
  }
  var swW=Math.max(1.4,h*0.028);
  var mx=cx+h*0.045*curveDir;
  out+='<path d="M '+cx+','+gy+' Q '+mx.toFixed(1)+','+(gy-stemH*0.5).toFixed(1)+' '+cx+','+tipY.toFixed(1)+'" fill="none" stroke="'+STEM+'" stroke-width="'+swW.toFixed(1)+'" stroke-linecap="round"/>';
  if(s===1){
    var lz=h*0.09;
    out+='<ellipse cx="'+(cx-lz*0.7).toFixed(1)+'" cy="'+(tipY+lz*0.3).toFixed(1)+'" rx="'+lz.toFixed(1)+'" ry="'+(lz*0.5).toFixed(1)+'" fill="'+LEAF+'" transform="rotate(-30 '+(cx-lz*0.7).toFixed(1)+' '+(tipY+lz*0.3).toFixed(1)+')"/>';
    out+='<ellipse cx="'+(cx+lz*0.7).toFixed(1)+'" cy="'+(tipY+lz*0.3).toFixed(1)+'" rx="'+lz.toFixed(1)+'" ry="'+(lz*0.5).toFixed(1)+'" fill="'+LEAF+'" transform="rotate(30 '+(cx+lz*0.7).toFixed(1)+' '+(tipY+lz*0.3).toFixed(1)+')"/>';
    return out;
  }
  var lz1=h*0.12, ly1=gy-stemH*0.42;
  out+='<ellipse cx="'+(cx-lz1*0.6).toFixed(1)+'" cy="'+ly1.toFixed(1)+'" rx="'+lz1.toFixed(1)+'" ry="'+(lz1*0.45).toFixed(1)+'" fill="'+LEAF+'" transform="rotate(-28 '+(cx-lz1*0.6).toFixed(1)+' '+ly1.toFixed(1)+')"/>';
  out+='<ellipse cx="'+(cx+lz1*0.6).toFixed(1)+'" cy="'+ly1.toFixed(1)+'" rx="'+lz1.toFixed(1)+'" ry="'+(lz1*0.45).toFixed(1)+'" fill="'+LEAF+'" transform="rotate(28 '+(cx+lz1*0.6).toFixed(1)+' '+ly1.toFixed(1)+')"/>';
  if(s>=3){
    var lz2=h*0.09, ly2=gy-stemH*0.72;
    out+='<ellipse cx="'+(cx-lz2*0.55).toFixed(1)+'" cy="'+ly2.toFixed(1)+'" rx="'+lz2.toFixed(1)+'" ry="'+(lz2*0.42).toFixed(1)+'" fill="'+LEAF+'" transform="rotate(-24 '+(cx-lz2*0.55).toFixed(1)+' '+ly2.toFixed(1)+')"/>';
    out+='<ellipse cx="'+(cx+lz2*0.55).toFixed(1)+'" cy="'+ly2.toFixed(1)+'" rx="'+lz2.toFixed(1)+'" ry="'+(lz2*0.42).toFixed(1)+'" fill="'+LEAF+'" transform="rotate(24 '+(cx+lz2*0.55).toFixed(1)+' '+ly2.toFixed(1)+')"/>';
  }
  if(s===2){
    var br=h*0.05;
    out+='<circle cx="'+cx+'" cy="'+(tipY+br*0.3).toFixed(1)+'" r="'+br.toFixed(1)+'" fill="'+petalLite+'"/>';
    return out;
  }
  var fY=tipY-h*0.06;
  if(s===3){
    var budType=(ph>>2)%3;
    if(budType===0){
      var bw=h*0.06, bh=h*0.09;
      out+='<ellipse cx="'+cx+'" cy="'+(fY+bh*0.2).toFixed(1)+'" rx="'+bw.toFixed(1)+'" ry="'+bh.toFixed(1)+'" fill="'+petalDark+'"/>';
      out+='<ellipse cx="'+(cx-bw*0.2).toFixed(1)+'" cy="'+(fY-bh*0.1).toFixed(1)+'" rx="'+(bw*0.55).toFixed(1)+'" ry="'+(bh*0.55).toFixed(1)+'" fill="'+petalLite+'"/>';
    } else if(budType===1){
      var pbw=h*0.055, pbh=h*0.11;
      out+='<path d="M '+cx+','+(fY-pbh).toFixed(1)+' Q '+(cx+pbw).toFixed(1)+','+(fY-pbh*0.3).toFixed(1)+' '+cx+','+(fY+pbh*0.3).toFixed(1)+' Q '+(cx-pbw).toFixed(1)+','+(fY-pbh*0.3).toFixed(1)+' '+cx+','+(fY-pbh).toFixed(1)+' Z" fill="'+petalDark+'"/>';
      out+='<path d="M '+cx+','+(fY-pbh*0.85).toFixed(1)+' Q '+(cx+pbw*0.55).toFixed(1)+','+(fY-pbh*0.35).toFixed(1)+' '+cx+','+(fY+pbh*0.1).toFixed(1)+'" fill="'+petalLite+'"/>';
    } else {
      var cbr=h*0.038;
      out+='<circle cx="'+cx+'" cy="'+(fY-cbr*0.6).toFixed(1)+'" r="'+cbr.toFixed(1)+'" fill="'+petalDark+'"/>';
      out+='<circle cx="'+(cx-cbr*1.4).toFixed(1)+'" cy="'+(fY+cbr*0.5).toFixed(1)+'" r="'+(cbr*0.78).toFixed(1)+'" fill="'+petalDark+'"/>';
      out+='<circle cx="'+(cx+cbr*1.4).toFixed(1)+'" cy="'+(fY+cbr*0.5).toFixed(1)+'" r="'+(cbr*0.78).toFixed(1)+'" fill="'+petalDark+'"/>';
      out+='<circle cx="'+(cx-cbr*0.2).toFixed(1)+'" cy="'+(fY-cbr*0.9).toFixed(1)+'" r="'+(cbr*0.35).toFixed(1)+'" fill="'+petalLite+'"/>';
    }
    return out;
  }
  var species=(ph>>3)%4;
  if(species===0){
    var petals=7, pr=h*0.10, pl=h*0.09, pw=h*0.055;
    for(var i=0;i<petals;i++){
      var ang=(i/petals)*360, rad=(ang-90)*Math.PI/180;
      var px=cx+Math.cos(rad)*pr, py=fY+Math.sin(rad)*pr;
      out+='<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="'+pl.toFixed(1)+'" ry="'+pw.toFixed(1)+'" fill="'+petalDark+'" transform="rotate('+ang.toFixed(1)+' '+px.toFixed(1)+' '+py.toFixed(1)+')"/>';
      out+='<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="'+(pl*0.7).toFixed(1)+'" ry="'+(pw*0.7).toFixed(1)+'" fill="'+petalLite+'" transform="rotate('+ang.toFixed(1)+' '+px.toFixed(1)+' '+py.toFixed(1)+')"/>';
    }
    out+='<circle cx="'+cx+'" cy="'+fY.toFixed(1)+'" r="'+(h*0.055).toFixed(1)+'" fill="#F4C97A"/>';
    out+='<circle cx="'+cx+'" cy="'+fY.toFixed(1)+'" r="'+(h*0.025).toFixed(1)+'" fill="#8B5A22"/>';
  } else if(species===1){
    var petals=8, pr=h*0.085, pl=h*0.11, pw=h*0.032;
    for(var i=0;i<petals;i++){
      var ang=(i/petals)*360, rad=(ang-90)*Math.PI/180;
      var px=cx+Math.cos(rad)*pr, py=fY+Math.sin(rad)*pr;
      out+='<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="'+pl.toFixed(1)+'" ry="'+pw.toFixed(1)+'" fill="'+petalDark+'" transform="rotate('+ang.toFixed(1)+' '+px.toFixed(1)+' '+py.toFixed(1)+')"/>';
      out+='<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="'+(pl*0.65).toFixed(1)+'" ry="'+(pw*0.55).toFixed(1)+'" fill="'+petalLite+'" transform="rotate('+ang.toFixed(1)+' '+px.toFixed(1)+' '+py.toFixed(1)+')"/>';
    }
    out+='<circle cx="'+cx+'" cy="'+fY.toFixed(1)+'" r="'+(h*0.04).toFixed(1)+'" fill="#F4C97A"/>';
  } else if(species===2){
    var petals=5, pr=h*0.075, pl=h*0.11, pw=h*0.085;
    for(var i=0;i<petals;i++){
      var ang=(i/petals)*360+18, rad=(ang-90)*Math.PI/180;
      var px=cx+Math.cos(rad)*pr, py=fY+Math.sin(rad)*pr;
      out+='<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="'+pl.toFixed(1)+'" ry="'+pw.toFixed(1)+'" fill="'+petalDark+'" transform="rotate('+ang.toFixed(1)+' '+px.toFixed(1)+' '+py.toFixed(1)+')"/>';
      out+='<ellipse cx="'+px.toFixed(1)+'" cy="'+py.toFixed(1)+'" rx="'+(pl*0.55).toFixed(1)+'" ry="'+(pw*0.6).toFixed(1)+'" fill="'+petalLite+'" transform="rotate('+ang.toFixed(1)+' '+px.toFixed(1)+' '+py.toFixed(1)+')"/>';
    }
    out+='<circle cx="'+cx+'" cy="'+fY.toFixed(1)+'" r="'+(h*0.045).toFixed(1)+'" fill="#4A3020"/>';
    out+='<circle cx="'+(cx-h*0.012).toFixed(1)+'" cy="'+(fY-h*0.012).toFixed(1)+'" r="'+(h*0.018).toFixed(1)+'" fill="#7B5A3A"/>';
  } else {
    var petals=5, pr=h*0.085;
    for(var i=0;i<petals;i++){
      var ang=(i/petals)*360-90, rad=ang*Math.PI/180;
      var px=cx+Math.cos(rad)*pr, py=fY+Math.sin(rad)*pr;
      var pl=h*0.11, pw=h*0.038;
      var sideAR=(ang+90)*Math.PI/180, sideBR=(ang-90)*Math.PI/180;
      var p1x=px+Math.cos(rad)*pl, p1y=py+Math.sin(rad)*pl;
      var p2x=px+Math.cos(sideAR)*pw, p2y=py+Math.sin(sideAR)*pw;
      var p3x=px+Math.cos(sideBR)*pw, p3y=py+Math.sin(sideBR)*pw;
      out+='<path d="M '+px.toFixed(1)+','+py.toFixed(1)+' L '+p2x.toFixed(1)+','+p2y.toFixed(1)+' L '+p1x.toFixed(1)+','+p1y.toFixed(1)+' L '+p3x.toFixed(1)+','+p3y.toFixed(1)+' Z" fill="'+petalDark+'"/>';
      out+='<path d="M '+px.toFixed(1)+','+py.toFixed(1)+' L '+((p2x+p1x)/2).toFixed(1)+','+((p2y+p1y)/2).toFixed(1)+' L '+p1x.toFixed(1)+','+p1y.toFixed(1)+' Z" fill="'+petalLite+'"/>';
    }
    out+='<circle cx="'+cx+'" cy="'+fY.toFixed(1)+'" r="'+(h*0.055).toFixed(1)+'" fill="'+petalLite+'"/>';
    out+='<circle cx="'+cx+'" cy="'+fY.toFixed(1)+'" r="'+(h*0.028).toFixed(1)+'" fill="'+petalDark+'"/>';
  }
  return out;
}

function drawPlant(stage,w,h,cat,ph){
  return drawPlantAt(w/2,h*0.82,h,stage,cat,ph||0);
}

function openGardenHelp(){
  var ov=document.getElementById('ed-ov');var sh=document.getElementById('ed-sh');
  ov.classList.add('on');
  var info=[
    {label:'Seed',range:'0 – 0.5 hours'},
    {label:'Sprout',range:'0.5 – 3 hours'},
    {label:'Seedling',range:'3 – 8 hours'},
    {label:'Flowering',range:'8 – 16 hours'},
    {label:'In full bloom',range:'16+ hours'}
  ];
  var rows=info.map(function(s,i){
    var svg='<svg width="56" height="64" viewBox="0 0 56 64" style="flex-shrink:0;">'+drawPlant(i,56,64,'Creative')+'</svg>';
    return '<div style="display:flex;align-items:center;gap:14px;padding:11px 0;'+(i<4?'border-bottom:1px solid var(--bg3);':'')+'">'+svg+'<div><div style="font-weight:600;font-size:14px;">'+s.label+'</div><div style="font-size:12px;color:var(--tx3);margin-top:2px;">'+s.range+'</div></div></div>';
  }).join('');
  sh.innerHTML='<div style="font-family:var(--serif);font-size:18px;font-weight:700;margin-bottom:14px;">Plant stages</div>'+rows;
}

function rGarden(){

  // Focus banner + tabs
  var gbw=document.getElementById('garden-focus-banner-wrap');
  var gtabs=document.getElementById('garden-tabs');
  if(gbw){
    gbw.innerHTML='';
    if(!hasFocusSet()){
      gardenTab='all';
      if(gtabs){gtabs.innerHTML='';gtabs.style.display='none';}
    } else {
      if(gtabs){
        gtabs.style.display='flex';
        if(!gtabs.children.length){
          [{id:'focus',label:'In focus'},{id:'all',label:'Full garden'}].forEach(function(t){
            var btn=document.createElement('div');
            btn.dataset.tabId=t.id;
            btn.className='my-seg-btn';
            btn.style.flex='0 0 auto';
            btn.style.padding='7px 14px';
            btn.textContent=t.label;
            btn.addEventListener('click',(function(tid){return function(){
              if(gardenTab===tid)return;
              var w2=document.getElementById('garden-svg-wrap');
              if(w2){w2.style.transition='none';w2.style.opacity='0';}
              gardenTab=tid;
              rGarden();
              requestAnimationFrame(function(){requestAnimationFrame(function(){requestAnimationFrame(function(){
                if(w2){w2.style.transition='opacity .2s ease';w2.style.opacity='1';}
              });});});
            };})(t.id));
            gtabs.appendChild(btn);
          });
        }
        gtabs.querySelectorAll('[data-tab-id]').forEach(function(btn){
          var isActive=btn.dataset.tabId===gardenTab;
          btn.className='my-seg-btn'+(isActive?' on':'');
        });
        requestAnimationFrame(function(){positionSegThumb(gtabs);});
      }
    }
  }


  var visibleActs=(gardenTab==='focus'&&hasFocusSet())?myActs.filter(function(a){return isFocused(a.id);}):myActs;

  // Stats
  var totalHrs=myActs.reduce(function(t,a){return t+getHours(a.id);},0);
  var bloomCount=myActs.filter(function(a){return getStage(getHours(a.id))>=4;}).length;
  var gc=document.getElementById('garden-count');
  if(gc){var gParts=[];if(bloomCount&&!hasFocusSet())gParts.push(bloomCount+' blooming');gParts.push(Math.round(totalHrs)+'h grown');gc.textContent=gParts.join(' · ');}

  if(!visibleActs.length){
    document.getElementById('garden-svg-wrap').innerHTML='';
    var ge=document.getElementById('garden-empty');ge.style.display='block';
    ge.textContent=myActs.length?'No activities in focus this week.':'Add activities and log hours to see your garden grow';
    return;
  }
  document.getElementById('garden-empty').style.display='none';

  var wrap=document.getElementById('garden-svg-wrap');

  var n=visibleActs.length;
  var COLS=Math.min(Math.max(n,1),3);
  var numRows=Math.ceil(n/COLS);

  var TW=118, PA=170, GH=58, RH=PA+GH, SH=110;
  var svgW=TW*COLS, svgH=SH+RH*numRows;

  // Time-of-day scene palette — the garden lives through the day
  var _gHour=new Date().getHours();
  var TOD=(_gHour>=20||_gHour<5)?'night':_gHour<12?'morning':_gHour<17?'afternoon':'evening';
  var PAL={
    morning:  {sky:['#A5D2EF','#CFE7ED','#F2E3CE'],cel:'#FFD98A',celGlow:'#FFEDC2',hillFar:'#C6D3C5',hillNear:'#9EB59E',groundTop:'#A3C083',groundBot:'#7C9C64',grassA:'#587A4C',grassB:'#42603A',label:'#2F3D26',dotOff:'rgba(47,61,38,.3)',cloudOp:0.5},
    afternoon:{sky:['#79BAEA','#AEDAEE','#E9DFC9'],cel:'#FFE9A8',celGlow:'#FFF4D6',hillFar:'#B7C6BD',hillNear:'#8FA898',groundTop:'#9CBC7C',groundBot:'#75965E',grassA:'#54764A',grassB:'#3F5C38',label:'#2F3D26',dotOff:'rgba(47,61,38,.3)',cloudOp:0.55},
    evening:  {sky:['#F2D8C0','#E5B3A8','#C393B2'],cel:'#FFB36B',celGlow:'#FFD9A8',hillFar:'#A9AFA8',hillNear:'#7E8B84',groundTop:'#8E9E6E',groundBot:'#687A55',grassA:'#4C6244',grassB:'#3A4C35',label:'#2C351F',dotOff:'rgba(44,53,31,.32)',cloudOp:0.35},
    night:    {sky:['#132849','#1E3D6E','#2A5490'],cel:'#F2E9CF',celGlow:'#DCE7F5',hillFar:'#23406A',hillNear:'#1B3255',groundTop:'#2C4A66',groundBot:'#1A2E44',grassA:'#3E5E62',grassB:'#2E4A50',label:'#F5E9D2',dotOff:'rgba(245,233,210,.28)',cloudOp:0}
  }[TOD];
  var HILL_FAR=PAL.hillFar, HILL_NEAR=PAL.hillNear;
  var GROUND_TOP=PAL.groundTop, GROUND_BOT=PAL.groundBot;
  var GRASS_A=PAL.grassA, GRASS_B=PAL.grassB;
  var LEAF_A='#6D8A5F';

  function phash(s,seed){var h=(seed|0);for(var i=0;i<s.length;i++)h=(31*h+s.charCodeAt(i))|0;return Math.abs(h);}

  // Painterly tree — trunk + canopy blobs + fruits
  function drawTree(cx,gy,stage,fruitCount,ph){
    var s='';
    if(stage===0){
      s+='<ellipse cx="'+cx+'" cy="'+(gy-1)+'" rx="16" ry="5" fill="'+GROUND_BOT+'"/>';
      s+='<path d="M '+(cx-3)+','+gy+' Q '+(cx-5)+','+(gy-11)+' '+(cx-1)+','+(gy-14)+' Q '+(cx+2)+','+(gy-11)+' '+(cx+3)+','+gy+' Z" fill="'+LEAF_A+'"/>';
      return s;
    }
    var trunkH=[0,36,66,96,120][stage];
    var trunkW=[0,3.2,5,7,9][stage];
    var canopyR=[0,11,22,32,40][stage];
    var sway=((ph%7)-3);
    var trunkX=cx+sway;
    var trunkTopY=gy-trunkH;
    var brown='#6B4A2A', brownDark='#4A3220', brownHi='#8B6540';
    // Trunk soft outer
    s+='<path d="M '+(cx-trunkW*0.85)+','+gy+' Q '+(trunkX-trunkW*0.5)+','+(gy-trunkH*0.5)+' '+(trunkX-trunkW*0.5)+','+trunkTopY+' L '+(trunkX+trunkW*0.5)+','+trunkTopY+' Q '+(trunkX+trunkW*0.5)+','+(gy-trunkH*0.5)+' '+(cx+trunkW*0.85)+','+gy+' Z" fill="'+brown+'"/>';
    // Trunk main
    s+='<path d="M '+(cx-trunkW*0.6)+','+gy+' Q '+(trunkX-trunkW*0.3)+','+(gy-trunkH*0.5)+' '+(trunkX-trunkW*0.35)+','+trunkTopY+' L '+(trunkX+trunkW*0.35)+','+trunkTopY+' Q '+(trunkX+trunkW*0.3)+','+(gy-trunkH*0.5)+' '+(cx+trunkW*0.6)+','+gy+' Z" fill="'+brown+'"/>';
    // Trunk shadow side
    s+='<path d="M '+(cx-trunkW*0.6)+','+gy+' Q '+(trunkX-trunkW*0.3)+','+(gy-trunkH*0.5)+' '+(trunkX-trunkW*0.35)+','+trunkTopY+' L '+(trunkX-trunkW*0.05)+','+trunkTopY+' Q '+(trunkX-trunkW*0.05)+','+(gy-trunkH*0.5)+' '+(cx-trunkW*0.2)+','+gy+' Z" fill="'+brownDark+'"/>';
    // Canopy at top of trunk
    var cx0=trunkX, cy0=trunkTopY-canopyR*0.35;
    var canopyCol='#5F8560', canopyLite='#83AF80', canopyDark='#4C6F4E';
    // Main blobs
    var offsets=[[0,0,1.0],[-canopyR*0.55,canopyR*0.15,0.78],[canopyR*0.55,canopyR*0.1,0.75],[-canopyR*0.3,-canopyR*0.4,0.7],[canopyR*0.32,-canopyR*0.32,0.68],[0,canopyR*0.35,0.62]];
    offsets.forEach(function(o,i){
      s+='<circle cx="'+(cx0+o[0]).toFixed(1)+'" cy="'+(cy0+o[1]).toFixed(1)+'" r="'+(canopyR*o[2]).toFixed(1)+'" fill="'+canopyCol+'"/>';
    });
    // Highlight
    s+='<circle cx="'+(cx0-canopyR*0.28).toFixed(1)+'" cy="'+(cy0-canopyR*0.42).toFixed(1)+'" r="'+(canopyR*0.32).toFixed(1)+'" fill="'+canopyLite+'"/>';
    // Shadow underside
    s+='<circle cx="'+(cx0+canopyR*0.15).toFixed(1)+'" cy="'+(cy0+canopyR*0.42).toFixed(1)+'" r="'+(canopyR*0.28).toFixed(1)+'" fill="'+canopyDark+'"/>';
    // Fruits — only after fruiting stage
    if(stage>=4&&fruitCount>0){
      var fruitCols=['#D5544A','#C97050','#F5C842','#8E4066','#D4855A','#B44A28'];
      var maxFruits=Math.min(fruitCount,26);
      for(var f=0;f<maxFruits;f++){
        var seed=Math.abs((ph*7+f*29+13)|0);
        var ang=(seed%360)*Math.PI/180;
        var rad=canopyR*0.35+((seed>>4)%Math.max(1,Math.floor(canopyR*0.5)));
        var fx=cx0+Math.cos(ang)*rad;
        var fy=cy0+Math.sin(ang)*rad;
        var col=fruitCols[f%fruitCols.length];
        s+='<circle cx="'+fx.toFixed(1)+'" cy="'+fy.toFixed(1)+'" r="3.2" fill="'+col+'"/>';
        s+='<circle cx="'+(fx-0.9).toFixed(1)+'" cy="'+(fy-0.9).toFixed(1)+'" r="1" fill="#FFF6EA"/>';
      }
    }
    return s;
  }

  function hillPath(baseY,amp,phase){
    var pts=[], steps=12;
    for(var i=0;i<=steps;i++){
      var px=(i/steps)*svgW;
      var py=baseY+Math.sin(i*0.85+phase)*amp+Math.cos(i*1.6+phase)*amp*0.35;
      pts.push(px.toFixed(1)+','+py.toFixed(1));
    }
    return 'M -2,'+svgH+' L -2,'+pts[0].split(',')[1]+' L '+pts.join(' L ')+' L '+(svgW+2)+','+svgH+' Z';
  }

  function grassTuft(x,y,ph){
    var s='', blades=3+(ph%3);
    for(var b=0;b<blades;b++){
      var bx=x+(b-blades/2)*2.4;
      var bh=7+((b*7+ph)%9);
      var lean=(((ph>>b)&3)-1)*1.6;
      var col=b%2?GRASS_B:GRASS_A;
      s+='<path d="M '+bx.toFixed(1)+','+y+' Q '+(bx+lean).toFixed(1)+','+(y-bh*0.55)+' '+(bx+lean*1.6).toFixed(1)+','+(y-bh)+'" fill="none" stroke="'+col+'" stroke-width="1.4" stroke-linecap="round" opacity="0.85"/>';
    }
    return s;
  }

  var horizonY=SH+PA-44; // just above the back row's planting line
  var svg='<svg viewBox="0 0 '+svgW+' '+svgH+'" xmlns="http://www.w3.org/2000/svg" style="width:100%;display:block;">';

  // ── Scene: sky, sun/moon, clouds or stars, hills, ground ──
  svg+='<defs>'
    +'<linearGradient id="g-sky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+PAL.sky[0]+'"/><stop offset="0.6" stop-color="'+PAL.sky[1]+'"/><stop offset="1" stop-color="'+PAL.sky[2]+'"/></linearGradient>'
    +'<linearGradient id="g-ground" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="'+GROUND_TOP+'"/><stop offset="1" stop-color="'+GROUND_BOT+'"/></linearGradient>'
    +'<radialGradient id="g-glow"><stop offset="0" stop-color="'+PAL.celGlow+'" stop-opacity="0.85"/><stop offset="1" stop-color="'+PAL.celGlow+'" stop-opacity="0"/></radialGradient>'
    +'</defs>';
  svg+='<rect x="0" y="0" width="'+svgW+'" height="'+svgH+'" fill="url(#g-sky)"/>';

  var celX=(svgW*0.8).toFixed(1), celY=46;
  svg+='<circle cx="'+celX+'" cy="'+celY+'" r="42" fill="url(#g-glow)"/>';
  if(TOD==='night'){
    // Crescent moon (bite cut out via mask so the glow shows through) + twinkling stars
    svg+='<mask id="m-moon"><rect x="0" y="0" width="'+svgW+'" height="'+svgH+'" fill="#fff"/><circle cx="'+(svgW*0.8+7).toFixed(1)+'" cy="'+(celY-5)+'" r="12.5" fill="#000"/></mask>';
    svg+='<circle cx="'+celX+'" cy="'+celY+'" r="15" fill="'+PAL.cel+'" mask="url(#m-moon)"/>';
    for(var st=0;st<16;st++){
      var sh1=phash('star'+st,st*17);
      var sx=sh1%svgW, sy=8+((sh1>>3)%Math.max(1,horizonY-48));
      svg+='<circle cx="'+sx+'" cy="'+sy+'" r="'+(0.8+((sh1>>7)%3)*0.35).toFixed(2)+'" fill="#EFE7CF" opacity="0.8">'
        +'<animate attributeName="opacity" values="0.25;0.9;0.25" dur="'+(2.4+((sh1>>5)%30)/10).toFixed(1)+'s" begin="'+(((sh1>>2)%20)/10).toFixed(1)+'s" repeatCount="indefinite"/>'
        +'</circle>';
    }
  } else {
    // Sun + slowly drifting clouds
    svg+='<circle cx="'+celX+'" cy="'+celY+'" r="16" fill="'+PAL.cel+'"/>';
    for(var cl=0;cl<3;cl++){
      var chh=phash('cloud'+cl,cl*31);
      var cxx=20+(chh%Math.max(1,svgW-70)), cyy=20+((chh>>4)%42), csc=(0.8+((chh>>6)%5)/10).toFixed(2);
      svg+='<g opacity="'+PAL.cloudOp+'">'
        +'<g transform="translate('+cxx+','+cyy+') scale('+csc+')">'
        +'<ellipse cx="0" cy="0" rx="24" ry="9" fill="#FFFFFF"/>'
        +'<ellipse cx="-14" cy="3" rx="14" ry="7" fill="#FFFFFF"/>'
        +'<ellipse cx="15" cy="3" rx="16" ry="7" fill="#FFFFFF"/>'
        +'</g>'
        +'<animateTransform attributeName="transform" type="translate" values="0 0;9 0;0 0" dur="'+(26+cl*7)+'s" repeatCount="indefinite"/>'
        +'</g>';
    }
  }

  // Rolling hills on the horizon, then the ground band
  svg+='<path d="'+hillPath(horizonY-18,9,1.3)+'" fill="'+HILL_FAR+'" opacity="0.85"/>';
  svg+='<path d="'+hillPath(horizonY-6,7,4.1)+'" fill="'+HILL_NEAR+'" opacity="0.95"/>';
  svg+='<rect x="0" y="'+horizonY+'" width="'+svgW+'" height="'+(svgH-horizonY)+'" fill="url(#g-ground)"/>';

  // Scattered ground detail so the earth between rows doesn't read as bare
  var scatter=10+numRows*8;
  for(var sc=0;sc<scatter;sc++){
    var sch=phash('scat'+sc,sc*11);
    var scx=6+(sch%Math.max(1,svgW-12));
    var scy=horizonY+14+((sch>>4)%Math.max(1,svgH-horizonY-26));
    var kind3=sch%5;
    if(kind3<2){
      svg+=grassTuft(scx,scy,sch);
    } else if(kind3===2){
      // tiny wildflower
      var wf=['#E5A5B4','#EBC98F','#C7A5D3','#EDB097'][(sch>>3)%4];
      svg+='<circle cx="'+scx+'" cy="'+(scy-4)+'" r="1.9" fill="'+wf+'" opacity="0.85"/>'
        +'<line x1="'+scx+'" y1="'+scy+'" x2="'+scx+'" y2="'+(scy-3)+'" stroke="'+GRASS_B+'" stroke-width="1" opacity="0.7"/>';
    } else if(kind3===3){
      // pebble
      svg+='<ellipse cx="'+scx+'" cy="'+scy+'" rx="'+(2+(sch>>5)%3)+'" ry="'+(1.2+((sch>>6)%2)*0.6).toFixed(1)+'" fill="'+GROUND_BOT+'" opacity="0.5"/>';
    } else {
      // soil fleck
      svg+='<ellipse cx="'+scx+'" cy="'+scy+'" rx="3.5" ry="1" fill="'+GROUND_TOP+'" opacity="0.35"/>';
    }
  }

  // Draw rows back-to-front so front row renders on top
  for(var ri=numRows-1;ri>=0;ri--){
    var rowActs=visibleActs.slice(ri*COLS,(ri+1)*COLS);
    var gy=svgH-GH-ri*RH;

    // Soft bed shading + grass tufts along the row
    svg+='<ellipse cx="'+(svgW/2)+'" cy="'+(gy+6)+'" rx="'+(svgW*0.55).toFixed(1)+'" ry="8" fill="'+GROUND_BOT+'" opacity="0.15"/>';
    var tufts=Math.max(5,COLS*3);
    for(var gt=0;gt<tufts;gt++){
      var ghh=phash('g'+ri+'-'+gt,gt*13+ri*7);
      svg+=grassTuft(8+(ghh%Math.max(1,svgW-16)),gy+3+((ghh>>5)%6),ghh);
    }

    rowActs.forEach(function(a,ci){
      var ph=phash(a.id,42+ri*7);
      var cx=ci*TW+TW/2;
      var pgy=gy;
      var _isProj=isProject(a);
      var hrs=getHours(a.id);
      var stage=_isProj?(isFinished(a)?4:getTreeStage(hrs)):getStage(hrs);
      var dormant=gardenTab==='all'&&hasFocusSet()&&!isFocused(a.id);
      var shortName=a.name.length>12?a.name.slice(0,11)+'.':a.name;

      svg+='<g data-pid="'+a.id+'" data-kind="'+(_isProj?'project':'skill')+'" style="cursor:pointer;"'+(dormant?' opacity="0.42"':'')+'>';
      if(_isProj)svg+=drawTree(cx,pgy,stage,getProjectDoneCount(a),ph);
      else svg+=drawPlantAt(cx,pgy,140,stage,a.cat,ph);
      svg+='<text x="'+cx+'" y="'+(gy+24)+'" text-anchor="middle" font-size="11" font-weight="600" fill="'+PAL.label+'" font-family="ui-serif,Georgia,serif">'+esc(shortName)+'</text>';
      var ds=6,startDX=cx-(4-1)*ds/2;
      for(var di=0;di<4;di++){
        svg+='<circle cx="'+(startDX+di*ds).toFixed(1)+'" cy="'+(gy+38)+'" r="2.3" fill="'+(di<stage?'var(--gr)':PAL.dotOff)+'"/>';
      }
      svg+='</g>';
    });
  }

  // Ambient life: fireflies at night, drifting pollen motes by day
  if(TOD==='night'){
    for(var ff=0;ff<6;ff++){
      var fh=phash('fly'+ff,ff*23);
      var fx=14+(fh%Math.max(1,svgW-28)), fy2=horizonY+10+((fh>>4)%Math.max(1,svgH-horizonY-30));
      svg+='<circle cx="'+fx+'" cy="'+fy2+'" r="1.7" fill="#FFE9A0" opacity="0">'
        +'<animate attributeName="opacity" values="0;0.9;0" dur="'+(2.6+(fh%20)/10).toFixed(1)+'s" begin="'+(((fh>>3)%25)/10).toFixed(1)+'s" repeatCount="indefinite"/>'
        +'<animateTransform attributeName="transform" type="translate" values="0 0;'+(((fh>>6)%9)-4)+' '+(-6-((fh>>2)%6))+';0 0" dur="'+(5+(fh%4))+'s" repeatCount="indefinite"/>'
        +'</circle>';
    }
  } else {
    for(var pm=0;pm<5;pm++){
      var mh=phash('mote'+pm,pm*19);
      var mx2=10+(mh%Math.max(1,svgW-20)), my2=Math.max(12,horizonY-60)+((mh>>4)%70);
      svg+='<circle cx="'+mx2+'" cy="'+my2+'" r="1.3" fill="#FFF6E0" opacity="0">'
        +'<animate attributeName="opacity" values="0;0.65;0" dur="'+(4+(mh%3))+'s" begin="'+(((mh>>3)%30)/10).toFixed(1)+'s" repeatCount="indefinite"/>'
        +'<animateTransform attributeName="transform" type="translate" values="0 0;'+(((mh>>5)%11)-5)+' -9;0 0" dur="'+(7+(mh%5))+'s" repeatCount="indefinite"/>'
        +'</circle>';
    }
  }

  svg+='</svg>';

  var container=document.createElement('div');
  container.style.cssText='margin:0 16px 20px;background:'+GROUND_BOT+';border-radius:22px;overflow:hidden;box-shadow:0 6px 20px rgba(40,50,60,.22);';
  container.innerHTML=svg;
  container.querySelectorAll('[data-pid]').forEach(function(el){
    el.addEventListener('click',function(){
      if(this.dataset.kind==='project')showProjectInfo(this.dataset.pid,'garden');
      else showPlantInfo(this.dataset.pid);
    });
  });

  wrap.innerHTML='';wrap.appendChild(container);
  var helpBtn=document.getElementById('garden-help-btn');
  if(helpBtn){helpBtn.onclick=null;helpBtn.addEventListener('click',openGardenHelp);}
  var addBtn=document.getElementById('garden-add-btn');
  if(addBtn){addBtn.onclick=openGardenFabMenu;}
}

function showPlantInfo(id){
  var a=myActs.find(function(x){return x.id===id;});if(!a)return;
  var hrs=getHours(a.id),stage=getStage(hrs);
  var next=NEXT_THRESH[stage],prev=stage>0?NEXT_THRESH[stage-1]:0;
  var pct=Math.round(next?Math.min((hrs-prev)/(next-prev),1)*100:100);
  var clrs=['#C8D8C8','#7EC8A8','#56AB74','#D4537E','#F5C842'];
  var sh=document.getElementById('ed-sh');
  sh.innerHTML='<div style="font-size:40px;text-align:center;margin-bottom:8px;">'+a.emoji+'</div>'
    +'<div class="pi-name">'+a.name+'</div>'
    +'<div class="pi-stage">Stage '+stage+'/4 - '+STAGE_LABELS[stage]+'</div>'
    +'<div class="pi-bar"><div class="pi-fill" style="width:'+pct+'%;background:'+clrs[stage]+'"></div></div>'
    +'<div class="pi-lbl"><span>'+Math.round(hrs*10)/10+'h logged</span><span>'+(next?'Next at '+next+'h':'Fully bloomed!')+'</span></div>'
    +'<div style="font-size:13px;color:var(--tx2);text-align:center;margin-bottom:14px;">'+a.cat+'</div>';
  var recent=_sessFor(id).slice().sort(function(a,b){return b.date-a.date;}).slice(0,3);
  if(recent.length){
    var FEELS=['😔','😐','🙂','😊','🌟'];
    var rHtml='<div style="font-size:12px;font-weight:600;color:var(--tx2);text-transform:uppercase;letter-spacing:.06em;margin-bottom:8px;">Recent sessions</div>';
    recent.forEach(function(s){
      var d=new Date(s.date);var now=new Date();
      var today=now.toDateString()===d.toDateString();
      var yest=new Date(now-86400000).toDateString()===d.toDateString();
      var lbl=today?'Today':yest?'Yesterday':d.toLocaleDateString('en-GB',{day:'numeric',month:'short'});
      var dur=s.hours?Math.round(s.hours*10)/10+'h':(s.mins?s.mins+'m':'—');
      var feel=s.feel!=null?FEELS[s.feel]:'';
      rHtml+='<div style="display:flex;justify-content:space-between;align-items:center;padding:7px 0;border-bottom:1px solid var(--bg3);">'
        +'<span style="color:var(--tx);font-size:13px;">'+lbl+'</span>'
        +'<span style="color:var(--tx2);font-size:13px;">'+dur+(feel?' '+feel:'')+'</span>'
        +'</div>';
    });
    sh.innerHTML+='<div style="margin-bottom:16px;">'+rHtml+'</div>';
  }
  var logBtn=document.createElement('button');logBtn.className='btn btn-p';logBtn.textContent='+ Log session';
  logBtn.addEventListener('click',function(){closeEd();openLogDirect(id,'garden');});sh.appendChild(logBtn);
  document.getElementById('ed-ov').classList.add('on');
}


// ── RIPPLE + HAPTIC ───────────────────────────────────
function haptic(ms){if(navigator.vibrate)navigator.vibrate(ms||8);}
var ripStyle=document.createElement('style');
ripStyle.textContent='@keyframes ripple{to{transform:scale(1);opacity:0;}}';
document.head.appendChild(ripStyle);
document.addEventListener('pointerdown',function(e){
  var btn=e.target.closest('.btn-p,.btn-co,.pc,.ip');
  if(btn){
    haptic(8);
    var rect=btn.getBoundingClientRect();
    var x=(e.clientX||rect.left+rect.width/2)-rect.left;
    var y=(e.clientY||rect.top+rect.height/2)-rect.top;
    var r=Math.sqrt(rect.width*rect.width+rect.height*rect.height);
    var rip=document.createElement('span');
    rip.style.cssText='position:absolute;border-radius:50%;background:rgba(255,255,255,.22);width:'+(r*2)+'px;height:'+(r*2)+'px;left:'+(x-r)+'px;top:'+(y-r)+'px;transform:scale(0);animation:ripple .5s cubic-bezier(0,0,.2,1) forwards;pointer-events:none;z-index:9;';
    var prev=btn.style.position;btn.style.position='relative';btn.style.overflow='hidden';
    btn.appendChild(rip);setTimeout(function(){rip.remove();if(!prev)btn.style.position='';},500);
  }
  var card=e.target.closest('.mc,.rc,.bp-card,.ac,.oc');
  if(card)haptic(6);
},true);

// ── SUPABASE SYNC ─────────────────────────────────────
var _syncInProgress=false;
var _syncPending=false;
// Debounce network sync: sv() persists to localStorage instantly, Supabase upload
// coalesces rapid actions into one request ~2.5s after the last change.
var _syncT=null;
function _scheduleSync(){if(_syncT)clearTimeout(_syncT);_syncT=setTimeout(function(){_syncT=null;syncToSupabase();},2500);}
function _flushSync(){if(_syncT){clearTimeout(_syncT);_syncT=null;syncToSupabase();}}
var _syncFailStreak=0;
// Tombstones: items the user removed. Filter them out of any remote load so
// silent RLS failures / racy background refreshes can't resurrect deleted
// projects/skills. Mirrored into user_state, so they outlive a cleared
// localStorage and reach the user's other devices.
//   {t:<ms>, k:'del'|'arch'|'live'}
//   del  — gone for good: never restore it anywhere
//   arch — only out of the packet; it still lives on in archivedActs
//   live — a revival, recorded so it out-votes an older tombstone on merge
// Newest timestamp per id wins, which makes merging order-independent.
var TOMB_TTL=365*86400000, TOMB_MAX=1000;
function _tombNorm(v,id){
  // Legacy entries were a bare timestamp with no kind. Still in the local
  // archive = it was archived; otherwise it was a delete.
  if(typeof v==='number')return {t:v,k:archivedActs.some(function(a){return a.id===id;})?'arch':'del'};
  if(v&&typeof v==='object'&&v.t)return {t:v.t,k:v.k||'del'};
  return null;
}
function _tombPrune(t){
  var cutoff=Date.now()-TOMB_TTL;
  Object.keys(t).forEach(function(k){if(!t[k]||t[k].t<cutoff)delete t[k];});
  var keys=Object.keys(t);
  if(keys.length>TOMB_MAX)keys.sort(function(a,b){return t[b].t-t[a].t;}).slice(TOMB_MAX).forEach(function(k){delete t[k];});
  return t;
}
var _tombstones=(function(){
  try{
    var raw=JSON.parse(localStorage.getItem('gs-tombstones')||'{}'),out={};
    Object.keys(raw).forEach(function(k){var e=_tombNorm(raw[k],k);if(e)out[k]=e;});
    return _tombPrune(out);
  }catch(e){return {};}
})();
function _saveTombstones(){try{localStorage.setItem('gs-tombstones',JSON.stringify(_tombstones));}catch(e){}}
function _tombstone(id,kind){if(!id)return;_tombstones[id]={t:Date.now(),k:kind||'del'};_saveTombstones();}
function _untombstone(id){if(!id)return;_tombstones[id]={t:Date.now(),k:'live'};_saveTombstones();}
function _isTombstoned(id){var e=_tombstones[id];return !!e&&e.k!=='live';} // not in the packet
function _isDeleted(id){var e=_tombstones[id];return !!e&&e.k==='del';}     // gone for good
function _mergeTombstones(remote){
  if(!remote||typeof remote!=='object')return;
  Object.keys(remote).forEach(function(k){
    var e=_tombNorm(remote[k],k);
    if(!e)return;
    var cur=_tombstones[k];
    if(!cur||e.t>cur.t)_tombstones[k]=e;
  });
  _tombPrune(_tombstones);
  _saveTombstones();
}
async function syncToSupabase(){
  if(!supaUser)return;
  if(_syncInProgress){_syncPending=true;return;}
  _syncInProgress=true;
  _syncPending=false;
  var uid=supaUser.id;
  var _syncHadError=false;
  try{
    // Assign stable IDs to any sessions that don't have one
    sessions.forEach(function(s){if(!s.id)s.id=genUUID();});

    var _r;
    _r=await _supa.from('user_state').upsert({
      user_id:uid,
      data:{onboarded:onboarded,weeklyFocus:weeklyFocus,collection:collection,activityNotes:activityNotes,colorPalette:colorPalette,customCats:customCats,profile:profile,archivedActs:archivedActs,active:active,calPlanned:calPlanned,calRoutines:calRoutines,tombstones:_tombstones},
      updated_at:new Date().toISOString()
    },{onConflict:'user_id'});
    if(_r&&_r.error){console.warn('Supabase sync: user_state',_r.error.message,_r.error.code);_syncHadError=true;}

    if(myActs.length){
      _r=await _supa.from('activities').upsert(
        myActs.map(function(a){return{id:a.id,user_id:uid,username:profile&&profile.username||null,name:a.name,emoji:a.emoji,cat:a.cat||'',type:a.type||'recreational',level:a.level||'beginner',data:a};}),
        {onConflict:'id,user_id'}
      );
      if(_r&&_r.error){console.warn('Supabase sync: activities',_r.error.message,_r.error.code);_syncHadError=true;}
    }
    // Remove activities deleted or archived locally (mirrors the sessions delete pass)
    var _remoteActIds=await _supa.from('activities').select('id').eq('user_id',uid);
    if(_remoteActIds.data&&_remoteActIds.data.length){
      var _localActSet=new Set(myActs.map(function(a){return a.id;}));
      // Only delete rows explicitly tombstoned on this device — "absent locally" alone
      // could just mean this device's data is stale (e.g. created on another device)
      var _toDeleteActs=_remoteActIds.data.filter(function(r){return _isTombstoned(r.id)&&!_localActSet.has(r.id);}).map(function(r){return r.id;});
      if(_toDeleteActs.length){
        var _dr=await _supa.from('activities').delete().eq('user_id',uid).in('id',_toDeleteActs);
        if(_dr&&_dr.error){console.warn('Supabase sync: activities delete',_dr.error.message,_dr.error.code);_syncHadError=true;}
      }
    }

    // Sessions: upsert by id, then delete any Supabase rows not present locally
    if(sessions.length){
      _r=await _supa.from('sessions').upsert(
        sessions.map(function(s){return{id:s.id,user_id:uid,username:profile&&profile.username||null,act_id:s.actId,date:new Date(s.date||Date.now()).toISOString(),hours:Math.floor(s.hours||0),mins:Math.round(s.mins||0),rating:s.rating?Math.round(s.rating):null,note:s.notes||'',feels:s.feel||[],momentum:s.momentum||'',data:s};}),
        {onConflict:'id'}
      );
      if(_r&&_r.error){console.warn('Supabase sync: sessions upsert',_r.error.message,_r.error.code);_syncHadError=true;}
    }
    // Remove sessions deleted locally
    var _remoteIds=await _supa.from('sessions').select('id').eq('user_id',uid);
    if(_remoteIds.data&&_remoteIds.data.length){
      var _localSet=new Set(sessions.map(function(s){return s.id;}));
      var _toDelete=_remoteIds.data.filter(function(r){return _isTombstoned(r.id)&&!_localSet.has(r.id);}).map(function(r){return r.id;});
      if(_toDelete.length)await _supa.from('sessions').delete().eq('user_id',uid).in('id',_toDelete);
    }
    if(_syncHadError){
      _syncFailStreak++;
      if(_syncFailStreak>=5)showToast("Sync isn't working — check your connection.",null);
    } else {
      _syncFailStreak=0;
    }
  }catch(e){
    console.warn('Supabase sync error:',e);
    _syncFailStreak++;
    if(_syncFailStreak>=5)showToast("Sync isn't working — check your connection.",null);
  }finally{_syncInProgress=false;if(_syncPending)syncToSupabase();}
}

async function loadFromSupabase(){
  if(!supaUser)return;
  var uid=supaUser.id;
  try{
    var gotData=false;

    var stateRes=await _tq(_supa.from('user_state').select('data').eq('user_id',uid).maybeSingle(),8000);
    if(stateRes&&stateRes.data&&stateRes.data.data){
      gotData=true;
      var d=stateRes.data.data;
      _mergeTombstones(d.tombstones); // before anything is filtered through them
      if(d.onboarded!==undefined)onboarded=d.onboarded;
      if(d.weeklyFocus)weeklyFocus=d.weeklyFocus;
      if(d.collection)collection=d.collection;
      if(d.activityNotes)activityNotes=d.activityNotes;
      if(d.colorPalette)colorPalette=d.colorPalette;
      if(d.customCats)customCats=d.customCats;
      if(d.profile)profile=d.profile;
      // Only a hard delete drops an archived seed — an 'arch' tombstone is what
      // put it in this list, and another device may not have seen it yet.
      if(d.archivedActs)archivedActs=d.archivedActs.filter(function(a){return !_isDeleted(a.id);}).map(_normalizeSeed);
      if(d.calPlanned)calPlanned=d.calPlanned.filter(function(ev){return !_isDeleted(ev.actId);});
      if(d.calRoutines)calRoutines=d.calRoutines.filter(function(r){return !_isDeleted(r.actId);});
      if(d.active!==undefined)active=d.active;
    }

    var actsRes=await _tq(_supa.from('activities').select('*').eq('user_id',uid),8000);
    if(actsRes&&actsRes.data&&actsRes.data.length){
      gotData=true;
      myActs.splice(0,myActs.length);
      actsRes.data.forEach(function(a){if(_isTombstoned(a.id))return;myActs.push(_normalizeSeed(Object.assign({},a.data||{},{id:a.id,name:a.name,emoji:a.emoji,cat:a.cat,type:a.type,level:a.level})));});
      onboarded=true; // if activities exist, they've definitely been onboarded
    }

    var sessRes=await _tq(_supa.from('sessions').select('*').eq('user_id',uid).order('date',{ascending:false}),8000);
    if(sessRes&&sessRes.data&&sessRes.data.length){
      gotData=true;
      var _supaIds=new Set(sessRes.data.map(function(s){return s.id;}));
      var _pending=sessions.filter(function(s){return s.id&&!_supaIds.has(s.id);}); // local sessions not yet in Supabase
      sessions.splice(0,sessions.length);
      sessRes.data.forEach(function(s){if(_isTombstoned(s.id))return;sessions.push(Object.assign({},s.data||{},{id:s.id,actId:s.act_id,date:new Date(s.date).getTime(),hours:s.hours||0,mins:s.mins||0,rating:s.rating,notes:s.note||'',feel:s.feels||[],momentum:s.momentum||''}));});
      _pending.forEach(function(s){sessions.push(s);}); // keep sessions pending their first sync
    }

    if(gotData){
      // Callers handle sv() after they've applied authoritative profile fields (e.g. username)
    } else {
      // Nothing in Supabase — restore from localStorage only if it belongs to this user
      var loc=ld();
      var locOwned=!loc.userId||loc.userId===uid; // treat old entries without userId as owned
      if(locOwned&&(loc.onboarded||(loc.myActs&&loc.myActs.length))){
        if(loc.onboarded!==undefined)onboarded=loc.onboarded;
        var _locActs=(loc.myActs||[]).filter(function(a){return !_isTombstoned(a.id);});
        if(_locActs.length){onboarded=true;myActs.splice(0);_locActs.forEach(function(a){myActs.push(_normalizeSeed(a));});}
        if(loc.sessions&&loc.sessions.length){sessions.splice(0);loc.sessions.forEach(function(s){if(!_isDeleted(s.id))sessions.push(s);});}
        if(loc.profile)profile=loc.profile;
        if(loc.weeklyFocus)weeklyFocus=loc.weeklyFocus;
        var _locArch=(loc.archivedActs||[]).filter(function(a){return !_isDeleted(a.id);});
        if(_locArch.length){archivedActs.splice(0);_locArch.forEach(function(a){archivedActs.push(_normalizeSeed(a));});}
        if(loc.calPlanned)calPlanned=loc.calPlanned.filter(function(ev){return !_isDeleted(ev.actId);});
        if(loc.calRoutines)calRoutines=loc.calRoutines.filter(function(r){return !_isDeleted(r.actId);});
        if(loc.activityNotes)activityNotes=loc.activityNotes;
        if(loc.collection)collection=loc.collection;
        if(loc.customCats)customCats=loc.customCats;
        if(loc.colorPalette)colorPalette=loc.colorPalette;
        syncToSupabase(); // Upload their local data to Supabase for next time
      }
    }
  }catch(e){console.warn('Supabase load error:',e);}
}

// ── BACKGROUND SYNC ───────────────────────────────────
var _bgSyncing=false;
async function _bgRefresh(){
  if(!supaUser||_guestMode)return;
  var cur=document.querySelector('.scr.on');
  if(!cur)return;
  if(['s-auth','s-ob1','s-ob2','s-ob3','s-log'].indexOf(cur.id)>-1)return;
  if(_bgSyncing)return;
  if(_syncT||_syncInProgress)return; // local changes not yet uploaded — don't overwrite them with remote state
  _bgSyncing=true;
  try{
    await loadFromSupabase();
    sv(); // Persist refreshed data to localStorage
    var id=cur.id;
    if(id==='s-home'){applyPalette();rHome();}
    else if(id==='s-my')rMy();
    else if(id==='s-garden')rGarden();
    else if(id==='s-hist')rHist();
  }catch(e){}
  finally{_bgSyncing=false;}
}
document.addEventListener('visibilitychange',function(){
  if(document.visibilityState==='visible'){_bgRefresh();checkCalPlanned();checkMondayFocus();}
  else if(document.visibilityState==='hidden'){if(_nbPendingCommit)_nbPendingCommit();_flushSync();}
});
// Commit the open notebook page before the sync flush, so backgrounding or
// killing the app can't drop whatever is still inside the 500ms debounce.
window.addEventListener('pagehide',function(){if(_nbPendingCommit)_nbPendingCommit();_flushSync();});
setInterval(function(){if(document.visibilityState==='visible')_bgRefresh();},120000);

async function checkProfile(){
  if(!supaUser){console.error('checkProfile called with no supaUser');return;}
  try{
    var res=await _tq(_supa.from('profiles').select('*').eq('id',supaUser.id).maybeSingle(),5000);
    if(res&&res.data){
      await loadFromSupabase();
      // Always override profile name/emoji/username from the authoritative profiles table
      if(res.data.display_name)profile.name=res.data.display_name;
      if(res.data.emoji)profile.emoji=res.data.emoji;
      if(res.data.username)profile.username=res.data.username;
      sv(); // Save with correct username before booting
      bootApp();
    } else {
      _needsProfile=true;
      // Profile row missing — still try to recover data from Supabase/localStorage
      // before deciding what to show; never wipe data without checking first
      await loadFromSupabase();
      if(myActs.length>0)onboarded=true;
      _hideLoading();
      document.body.classList.remove('auth-mode');
      applyPalette();
      if(onboarded){
        document.getElementById('main-nav').classList.add('on');
        document.getElementById('menu-btn').style.display='flex';
        openProfileStep();
      }else{
        document.body.classList.add('ob-mode');
        show('s-ob0');rObCats();rObGrid();
      }
    }
  }catch(e){
    console.error('checkProfile error:',e);
    // Supabase unavailable (timeout, paused project, network) — boot from localStorage
    var _loc=ld();
    if(_loc.onboarded||(_loc.myActs&&_loc.myActs.length)){
      var _lActs=(_loc.myActs||[]).filter(function(a){return !_isTombstoned(a.id);});
      if(_lActs.length){onboarded=true;myActs.splice(0);_lActs.forEach(function(a){myActs.push(_normalizeSeed(a));});}
      if(_loc.sessions&&_loc.sessions.length){sessions.splice(0);_loc.sessions.forEach(function(s){if(!_isDeleted(s.id))sessions.push(s);});}
      if(_loc.profile)profile=_loc.profile;
      if(_loc.weeklyFocus)weeklyFocus=_loc.weeklyFocus;
      var _lArch=(_loc.archivedActs||[]).filter(function(a){return !_isDeleted(a.id);});
      if(_lArch.length){archivedActs.splice(0);_lArch.forEach(function(a){archivedActs.push(_normalizeSeed(a));});}
      if(_loc.calPlanned)calPlanned=_loc.calPlanned.filter(function(ev){return !_isDeleted(ev.actId);});
      if(_loc.calRoutines)calRoutines=_loc.calRoutines.filter(function(r){return !_isDeleted(r.actId);});
      if(_loc.activityNotes)activityNotes=_loc.activityNotes;
      if(_loc.colorPalette)colorPalette=_loc.colorPalette;
      bootApp();
    } else {
      _hideLoading();
      if(!_guestMode)_showAuth();
    }
  }
}

function bootApp(){
  _hideLoading();
  document.body.classList.remove('auth-mode');
  applyPalette();
  if(onboarded){
    document.getElementById('main-nav').classList.add('on');
    document.getElementById('menu-btn').style.display='flex';
    launch();
    setTimeout(checkMondayFocus,900);
  }else{
    document.body.classList.add('ob-mode');
    show('s-ob0');rObCats();rObGrid();
  }
}

// ── AUTH SCREEN HANDLERS ──────────────────────────────
var _authIsSignup=false;

function showAuthPanel(panel){
  ['auth-form','auth-reset','auth-new-pw'].forEach(function(id){
    document.getElementById(id).style.display=id===panel?'block':'none';
  });
}

// Sign in / Create account tabs
document.getElementById('tab-signin').addEventListener('click',function(){
  _authIsSignup=false;
  this.style.background='var(--gr)';this.style.color='#fff';
  document.getElementById('tab-signup').style.background='var(--bg2)';document.getElementById('tab-signup').style.color='var(--tx2)';
  document.getElementById('btn-auth').textContent='Sign in';
  document.getElementById('btn-forgot').style.display='block';
  document.getElementById('auth-password').autocomplete='current-password';
});
document.getElementById('tab-signup').addEventListener('click',function(){
  _authIsSignup=true;
  this.style.background='var(--gr)';this.style.color='#fff';
  document.getElementById('tab-signin').style.background='var(--bg2)';document.getElementById('tab-signin').style.color='var(--tx2)';
  document.getElementById('btn-auth').textContent='Create account';
  document.getElementById('btn-forgot').style.display='none';
  document.getElementById('auth-password').autocomplete='new-password';
});

// Resolve email or username → email
async function resolveEmail(input){
  input=input.trim();
  if(input.includes('@')&&input.indexOf('@')!==0)return {email:input};
  var username=input.replace(/^@/,'').toLowerCase();
  var r;
  try{r=await _tq(_supa.rpc('get_email_by_username',{uname:username}),6000);}
  catch(e){return {error:'Username lookup timed out — try signing in with your email address instead.'};}
  if(r.error)return {error:'Username lookup failed: '+r.error.message};
  if(!r.data)return {error:'No account found for that username.'};
  return {email:r.data};
}

// Password sign in / sign up
document.getElementById('btn-auth').addEventListener('click',async function(){
  var input=document.getElementById('auth-email').value.trim();
  var password=document.getElementById('auth-password').value;
  if(!input){showAuthErr('Please enter your email or username.');return;}
  if(!password){showAuthErr('Please enter your password.');return;}
  if(_authIsSignup&&password.length<6){showAuthErr('Password must be at least 6 characters.');return;}
  this.disabled=true;this.textContent=_authIsSignup?'Creating…':'Signing in…';
  var email=input;
  if(!_authIsSignup){
    var resolved=await resolveEmail(input);
    if(resolved.error){showAuthErr(resolved.error);this.disabled=false;this.textContent='Sign in';return;}
    email=resolved.email;
  }
  // Set flags before the async call so onAuthStateChange SIGNED_IN doesn't race
  _authHandled=true;_guestMode=false;
  var res;
  try{
    res=_authIsSignup
      ?await _supa.auth.signUp({email:email,password:password})
      :await _supa.auth.signInWithPassword({email:email,password:password});
  }catch(e){
    _authHandled=false;
    showAuthErr('Connection error — your Supabase project may be paused. Visit supabase.com to resume it.');
    this.disabled=false;this.textContent=_authIsSignup?'Create account':'Sign in';return;
  }
  if(res.error){
    _authHandled=false;
    var msg=res.error.message;
    if(msg==='Load failed'||msg==='Failed to fetch'||msg==='NetworkError'||/network|load fail/i.test(msg)){
      msg='Safari is blocking the request ("'+res.error.message+'"). Try: Safari → Settings → Privacy → uncheck "Prevent cross-site tracking". Or use the ✉️ magic link below.';
    }
    showAuthErr(msg);
    this.disabled=false;this.textContent=_authIsSignup?'Create account':'Sign in';return;
  }
  supaUser=res.data.user;
  try{await checkProfile();}catch(e){showAuthErr('Sign in failed: '+e.message);console.error('checkProfile error:',e);}
  this.disabled=false;this.textContent=_authIsSignup?'Create account':'Sign in';
});
function showAuthErr(msg,isSuccess){
  var el=document.getElementById('auth-err');
  el.textContent=msg;el.style.display='block';
  el.style.background=isSuccess?'var(--grl)':'var(--col)';
  el.style.color=isSuccess?'var(--gr2)':'var(--co)';
}
document.getElementById('auth-password').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('btn-auth').click();});


// Sign out
async function doSignOut(){
  _guestMode=false;_authHandled=false;
  var load=document.getElementById('gs-load');
  if(load){load.style.display='flex';load.style.opacity='0';requestAnimationFrame(function(){load.style.opacity='1';});}
  if(_syncT){clearTimeout(_syncT);_syncT=null;try{await syncToSupabase();}catch(e){}}
  await _supa.auth.signOut();
  supaUser=null;
  try{localStorage.removeItem('gs-v3');}catch(e){}
  // Tombstones live in the signed-in account's user_state now, so drop the
  // local copy rather than carrying one account's ledger into the next.
  try{localStorage.removeItem('gs-tombstones');}catch(e){}
  _tombstones={};
  myActs.splice(0);sessions.splice(0);archivedActs.splice(0);
  onboarded=false;profile={};active=null;
  weeklyFocus={weekKey:'',actIds:[]};activityNotes={};calPlanned=[];calRoutines=[];
  collection={pending:[],counts:{drop:0,leaf:0,petal:0,bee:0},trophies:[],awarded:[]};
  setTimeout(function(){_hideLoading();_showAuth();},350);
}

// Forgot password
document.getElementById('btn-forgot').addEventListener('click',function(){
  document.getElementById('reset-email').value=document.getElementById('auth-email').value;
  showAuthPanel('auth-reset');
});
document.getElementById('btn-reset-back').addEventListener('click',function(){showAuthPanel('auth-form');});
document.getElementById('btn-send-reset').addEventListener('click',async function(){
  var email=document.getElementById('reset-email').value.trim();
  if(!email){return;}
  this.disabled=true;this.textContent='Sending…';
  // Supabase only honours a redirectTo that exactly matches an entry in the
  // dashboard's Redirect URLs allowlist — anything else silently falls back to
  // the project's Site URL. The directory root is what's allowlisted, and
  // index.html there forwards the recovery token on to this file.
  var res=await _supa.auth.resetPasswordForEmail(email,{redirectTo:location.origin+location.pathname.replace(/[^/]*$/,'')});
  var msg=document.getElementById('reset-msg');
  msg.style.display='block';
  if(res.error){msg.textContent=res.error.message;msg.style.color='var(--co)';}
  else{msg.textContent='Reset link sent — check your email.';msg.style.color='var(--gr)';}
  this.disabled=false;this.textContent='Send reset link';
});

document.getElementById('btn-set-pw').addEventListener('click',async function(){
  var pw=document.getElementById('new-pw').value;
  var pw2=document.getElementById('new-pw2').value;
  var err=document.getElementById('new-pw-err');
  err.style.display='none';
  if(pw.length<6){err.textContent='Password must be at least 6 characters.';err.style.display='block';return;}
  if(pw!==pw2){err.textContent='Passwords don\'t match.';err.style.display='block';return;}
  this.disabled=true;this.textContent='Saving…';
  var res=await _supa.auth.updateUser({password:pw});
  if(res.error){err.textContent=res.error.message;err.style.display='block';this.disabled=false;this.textContent='Save password';return;}
  this.disabled=false;this.textContent='Save password';
  _authHandled=false;
  await checkProfile();
});
document.getElementById('new-pw2').addEventListener('keydown',function(e){if(e.key==='Enter')document.getElementById('btn-set-pw').click();});

document.getElementById('btn-guest').addEventListener('click',function(){
  _authHandled=true;_guestMode=true;
  // Track guest in background — don't await, boot immediately
  try{
    var gid=localStorage.getItem('gs-guest-id');
    if(!gid){
      gid='xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g,function(c){var r=Math.random()*16|0;return(c==='x'?r:(r&0x3|0x8)).toString(16);});
      localStorage.setItem('gs-guest-id',gid);
    }
    _supa.from('guests').upsert({id:gid,last_seen:new Date().toISOString(),name:(profile&&profile.name)||null,emoji:(profile&&profile.emoji)||null},{onConflict:'id'})
      .then(function(res){if(res.error)console.warn('Guest upsert error:',res.error.message);else console.log('Guest tracked:',gid);})
      .catch(function(e){console.warn('Guest track exception:',e.message);});
  }catch(e){console.warn('Guest track exception:',e.message);}
  bootApp();
});


// ── BOOT ──────────────────────────────────────────────
var _authHandled=false;
var _guestMode=false;
function _hideLoading(){var el=document.getElementById('gs-load');if(!el||el.style.display==='none')return;el.style.opacity='0';setTimeout(function(){el.style.display='none';el.style.opacity='1';},280);}
// Supabase reports a bad/expired link in the URL (query or hash) rather than
// through the client, so an expired reset would otherwise show a blank sign-in
// screen with no reason given.
function _urlAuthError(){
  try{
    var out=null;
    [location.search,location.hash].forEach(function(part){
      if(!part||part.length<2)return;
      var q=new URLSearchParams(part.slice(1));
      var d=q.get('error_description')||q.get('error');
      if(d&&!out)out=d.replace(/\+/g,' ');
    });
    return out;
  }catch(e){return null;}
}
function _clearUrlAuthError(){
  try{history.replaceState(null,'',location.pathname);}catch(e){}
}
function _showAuth(){
  _hideLoading();
  document.body.classList.add('auth-mode');
  show('s-auth');
  showAuthPanel('auth-form');
  var _ue=_urlAuthError();
  if(_ue){
    // "code verifier" = the link was opened in a different browser than the one
    // that asked for it (a mail app's in-app browser is the usual culprit).
    showAuthErr(/code.?verifier/i.test(_ue)
      ? 'Open the reset link in the same browser you requested it from, then try again.'
      : /expired|invalid/i.test(_ue)
      ? 'That reset link has expired or was already used. Request a new one below.'
      : _ue, false);
    _clearUrlAuthError();
  }
  document.getElementById('main-nav').classList.remove('on');
  document.getElementById('menu-btn').style.display='none';
  // Quick connection test — only show banner on true network failure (not non-2xx)
  var banner=document.getElementById('auth-conn-banner');
  if(banner)banner.style.display='none';
  fetch('https://qeuhuvdyhqynsllfcgyn.supabase.co/auth/v1/health',{method:'GET'})
    .then(function(){/* server responded — reachable */})
    .catch(function(){if(banner)banner.style.display='block';});
}
_supa.auth.onAuthStateChange(async function(event,session){
  if(event==='INITIAL_SESSION'){
    // Fast path: if Supabase already has a fresh session, boot immediately
    if(session&&!_authHandled){
      supaUser=session.user;_authHandled=true;_guestMode=false;
      await checkProfile(); // checkProfile handles its own errors — won't throw
    }
    // null session here means token may just need refreshing — getSession() IIFE handles it
    return;
  }
  supaUser=session?session.user:null;
  if(event==='PASSWORD_RECOVERY'){
    _authHandled=true;_guestMode=false;
    document.body.classList.remove('auth-mode');
    show('s-auth');showAuthPanel('auth-new-pw');
    document.getElementById('new-pw').value='';
    document.getElementById('new-pw2').value='';
    document.getElementById('new-pw-err').style.display='none';
  } else if(event==='SIGNED_IN'&&session&&!_authHandled){
    _authHandled=true;_guestMode=false;
    await checkProfile(); // checkProfile handles its own errors — won't throw
  }
  // SIGNED_OUT: not handled here — doSignOut() calls _showAuth() directly after signOut().
  // Reacting to the event causes false logouts when token refresh temporarily fails.
});

// Primary boot: getSession() waits for token refresh to complete before deciding.
// This is the only place that calls _showAuth() on load.
(async function(){
  try{
    var r=await _supa.auth.getSession();
    var session=r&&r.data&&r.data.session;
    if(session&&!_authHandled){
      supaUser=session.user;_authHandled=true;_guestMode=false;
      await checkProfile();
    } else if(!session&&!_authHandled&&!_guestMode){
      _showAuth();
    }
  }catch(e){
    _hideLoading();
    if(!_guestMode)_showAuth();
  }
})();

// Hard fallback: if nothing has shown after 10s, something went wrong — show auth.
// Don't guard on _authHandled: a session can exist but profile load can still fail.
setTimeout(function(){
  _hideLoading();
  if(!document.querySelector('.scr.on')&&!_guestMode){_showAuth();}
},10000);

}); // DOMContentLoaded

if('serviceWorker' in navigator){
  window.addEventListener('load', function(){
    navigator.serviceWorker.register('./sw.js');
  });
  navigator.serviceWorker.addEventListener('message', function(e){
    if(e.data&&e.data.type==='SW_UPDATED'){
      // Show banner then reload — sv() already persisted all state to localStorage
      var banner=document.createElement('div');
      banner.style.cssText='position:fixed;top:0;left:0;right:0;z-index:9999;background:var(--gr);color:#fff;font-size:13px;font-weight:600;text-align:center;padding:10px 16px;box-shadow:0 2px 12px rgba(0,0,0,.2);';
      banner.textContent='✨ New update — refreshing…';
      document.body.appendChild(banner);
      setTimeout(function(){window.location.reload(true);},1400);
    }
  });
}
