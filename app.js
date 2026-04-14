// Dividi & Conquista - single-file app logic
// Sections are organized by feature: audio, storage, profiles, questions, game flow, init.
// Keep behavior changes small and test after each refactor step.

// === AUDIO ===
var AudioCtx=window.AudioContext||window.webkitAudioContext;var audioCtx;
function ensureAudio(){try{if(!audioCtx)audioCtx=new AudioCtx()}catch(e){}}
function playTone(f,d,t,v){try{ensureAudio();if(!audioCtx)return;var o=audioCtx.createOscillator(),g=audioCtx.createGain();o.type=t||'sine';o.frequency.value=f;g.gain.setValueAtTime(v||0.1,audioCtx.currentTime);g.gain.exponentialRampToValueAtTime(0.001,audioCtx.currentTime+d);o.connect(g);g.connect(audioCtx.destination);o.start();o.stop(audioCtx.currentTime+d)}catch(e){}}
function sfxCorrect(){playTone(784,0.12,'triangle',0.1);setTimeout(function(){playTone(988,0.12,'triangle',0.1)},100);setTimeout(function(){playTone(1175,0.18,'triangle',0.08)},200)}
function sfxWrong(){playTone(392,0.2,'sine',0.07);setTimeout(function(){playTone(349,0.25,'sine',0.06)},150)}
function sfxLevelUp(){var fs=[784,988,1175,1568];for(var i=0;i<fs.length;i++)(function(f,d){setTimeout(function(){playTone(f,0.18,'triangle',0.08)},d)})(fs[i],i*120)}
function sfxBossHit(){playTone(523,0.12,'triangle',0.08);setTimeout(function(){playTone(659,0.1,'triangle',0.07)},80)}
function sfxBossDefeat(){var fs=[784,988,1175,1319,1480,1568];for(var i=0;i<fs.length;i++)(function(f,d){setTimeout(function(){playTone(f,0.15,'triangle',0.07)},d)})(fs[i],i*100)}
function sfxTick(){playTone(1047,0.04,'sine',0.04)}

// === DECORATIONS ===
try{(function(){var c=document.getElementById('stars');if(!c)return;var shapes=['✿','❀','♡','☆','✧','🌸','🦋','·','◦'];for(var i=0;i<40;i++){var s=document.createElement('div');s.className='star';s.textContent=shapes[Math.floor(Math.random()*shapes.length)];s.style.cssText='left:'+Math.random()*100+'%;top:'+Math.random()*100+'%;--d:'+(2+Math.random()*4)+'s;--sz:'+(10+Math.random()*16)+'px;animation-delay:'+Math.random()*3+'s';c.appendChild(s)}})()}catch(e){}

function burstParticles(x,y,color,count){count=count||12;for(var i=0;i<count;i++){var p=document.createElement('div');p.className='particle';var a=Math.random()*Math.PI*2,dist=40+Math.random()*60;p.style.cssText='left:'+x+'px;top:'+y+'px;width:'+(4+Math.random()*6)+'px;height:'+(4+Math.random()*6)+'px;background:'+color+';--dx:'+Math.cos(a)*dist+'px;--dy:'+Math.sin(a)*dist+'px';document.body.appendChild(p);setTimeout(function(el){return function(){el.remove()}}(p),800)}}
function confettiBurst(count){var colors=['#F48FB1','#CE93D8','#FFB347','#80CBC4','#F8BBD0','#B39DDB','#FFCC80','#A5D6A7'];for(var i=0;i<(count||40);i++){var p=document.createElement('div');p.className='particle';p.style.cssText='left:'+Math.random()*window.innerWidth+'px;top:-10px;width:'+(5+Math.random()*8)+'px;height:'+(5+Math.random()*8)+'px;background:'+colors[Math.floor(Math.random()*colors.length)]+';--dx:'+(Math.random()-0.5)*200+'px;--dy:'+(window.innerHeight*0.6+Math.random()*200)+'px;border-radius:'+(Math.random()>0.5?'50%':'2px')+';animation-duration:'+(1+Math.random()*1.5)+'s;animation-delay:'+Math.random()*0.4+'s';document.body.appendChild(p);setTimeout(function(el){return function(){el.remove()}}(p),2500)}}

// === STORAGE ===
function storeGet(k){try{if(typeof localStorage==='undefined')return null;var v=localStorage.getItem(k);return v?JSON.parse(v):null}catch(e){return null}}
function storeSet(k,v){try{if(typeof localStorage!=='undefined')localStorage.setItem(k,JSON.stringify(v))}catch(e){}}
function createEl(tag,cls,text){var el=document.createElement(tag);if(cls)el.className=cls;if(typeof text!=='undefined')el.textContent=text;return el}
function appendChildren(parent,children){for(var i=0;i<children.length;i++)parent.appendChild(children[i]);return parent}

// === PROFILES ===
var AVATAR_LIST=['🌷','🌸','🦋','🌺','🦄','🌈','👸','🐱','🐰','🌻','🍓','🎀','💖','🐬','🦊','🐝'];
var currentProfile=null;

function getProfiles(){return storeGet('dc_profiles')||[]}
function saveProfiles(p){storeSet('dc_profiles',p)}

function showScreen(id){var screens=['profileScreen','createScreen','modeScreen','lbScreen','trophyScreen','gameArea','endScreen'];for(var i=0;i<screens.length;i++)document.getElementById(screens[i]).classList.add('hidden');document.getElementById(id).classList.remove('hidden');var tb=document.getElementById('topbar');if(id==='gameArea'||id==='endScreen')tb.classList.remove('hidden');else tb.classList.add('hidden')}

function renderProfiles(){
  var list=document.getElementById('profilesList');list.innerHTML='';
  var profiles=getProfiles();
  for(var i=0;i<profiles.length;i++){(function(p,idx){
    var row=document.createElement('button');row.className='profile-row';
    var avatar=document.createElement('span');avatar.className='p-avatar';avatar.textContent=p.avatar;
    var info=document.createElement('div');info.className='p-info';
    var name=document.createElement('div');name.className='p-name';name.textContent=p.name;
    var stats=document.createElement('div');stats.className='p-stats';stats.textContent='Lv.'+p.level+' · ⭐ '+p.totalCorrect;
    info.appendChild(name);info.appendChild(stats);
    var del=document.createElement('span');del.className='p-delete';del.textContent='✕';
    row.appendChild(avatar);row.appendChild(info);row.appendChild(del);
    var deleteMode=false;
    row.addEventListener('click',function(e){
      if(e.target.classList.contains('p-delete')){
        if(!deleteMode){
          deleteMode=true;
          e.target.textContent='Elimina?';
          e.target.classList.add('p-delete-confirm');
          setTimeout(function(){if(deleteMode){deleteMode=false;e.target.textContent='✕';e.target.classList.remove('p-delete-confirm')}},3000);
        }else{
          var ps=getProfiles();ps.splice(idx,1);saveProfiles(ps);renderProfiles();
        }
        return;
      }
      selectProfile(idx);
    });
    list.appendChild(row);
  })(profiles[i],i)}
  if(profiles.length===0){
    var empty=createEl('div','empty-state empty-state-profiles');
    empty.appendChild(document.createTextNode('Nessun giocatore ancora!'));
    empty.appendChild(document.createElement('br'));
    empty.appendChild(document.createTextNode('Crea il tuo profilo 🌟'));
    list.appendChild(empty);
  }
}

function selectProfile(idx){
  var profiles=getProfiles();
  currentProfile=profiles[idx];
  currentProfile._idx=idx;
  document.getElementById('welcomeName').textContent=currentProfile.name;
  updateTopbar();
  showScreen('modeScreen');
}

// === CREATE PROFILE ===
var selectedAvatar='';
function renderAvatarPicker(){
  var picker=document.getElementById('avatarPicker');picker.innerHTML='';
  for(var i=0;i<AVATAR_LIST.length;i++){(function(av){
    var btn=document.createElement('button');btn.className='avatar-option';btn.textContent=av;
    btn.addEventListener('click',function(){
      var all=picker.querySelectorAll('.avatar-option');for(var j=0;j<all.length;j++)all[j].classList.remove('selected');
      btn.classList.add('selected');selectedAvatar=av;checkCreateReady();
    });
    picker.appendChild(btn);
  })(AVATAR_LIST[i])}
}
function checkCreateReady(){
  var name=document.getElementById('nameInput').value.trim();
  document.getElementById('createBtn').disabled=!(name.length>0&&selectedAvatar);
}
function createProfile(){
  var name=document.getElementById('nameInput').value.trim();
  if(!name||!selectedAvatar)return;
  var profiles=getProfiles();
  profiles.push({name:name,avatar:selectedAvatar,xp:0,level:1,totalCorrect:0,bestStreak:0,gamesPlayed:0,trophies:[]});
  saveProfiles(profiles);
  document.getElementById('nameInput').value='';selectedAvatar='';
  renderProfiles();selectProfile(profiles.length-1);
}

// === TROPHIES SYSTEM ===
var ALL_TROPHIES=[
  {id:'first_game',emoji:'🎯',name:'Prima partita',desc:'Completa una partita'},
  {id:'streak_3',emoji:'🔥',name:'Combo!',desc:'3 risposte giuste di fila'},
  {id:'streak_7',emoji:'🔥🔥',name:'Super combo!',desc:'7 risposte giuste di fila'},
  {id:'streak_10',emoji:'💥',name:'Inarrestabile!',desc:'10 risposte giuste di fila'},
  {id:'perfect',emoji:'💎',name:'Perfetto!',desc:'15/15 in modalità Classica'},
  {id:'boss_win',emoji:'🧚',name:'Cacciatrice di streghe',desc:'Sconfiggi la strega'},
  {id:'blitz_10',emoji:'⚡',name:'Fulmine!',desc:'10+ risposte giuste nel Blitz'},
  {id:'blitz_20',emoji:'⚡⚡',name:'Saetta!',desc:'20+ risposte giuste nel Blitz'},
  {id:'games_5',emoji:'📚',name:'Studentessa',desc:'Gioca 5 partite'},
  {id:'games_20',emoji:'🎓',name:'Professoressa',desc:'Gioca 20 partite'},
  {id:'total_100',emoji:'💯',name:'Centenaria!',desc:'100 risposte giuste in totale'},
  {id:'level_5',emoji:'👸',name:'Principessa',desc:'Raggiungi il livello 5'},
];

function awardTrophy(id){
  if(!currentProfile)return false;
  if(currentProfile.trophies.indexOf(id)>=0)return false;
  currentProfile.trophies.push(id);
  saveCurrentProfile();return true;
}
function checkTrophies(){
  var p=currentProfile,newOnes=[];
  if(p.gamesPlayed>=1&&awardTrophy('first_game'))newOnes.push('🎯 Prima partita!');
  if(p.bestStreak>=3&&awardTrophy('streak_3'))newOnes.push('🔥 Combo!');
  if(p.bestStreak>=7&&awardTrophy('streak_7'))newOnes.push('🔥🔥 Super combo!');
  if(p.bestStreak>=10&&awardTrophy('streak_10'))newOnes.push('💥 Inarrestabile!');
  if(p.gamesPlayed>=5&&awardTrophy('games_5'))newOnes.push('📚 Studentessa!');
  if(p.gamesPlayed>=20&&awardTrophy('games_20'))newOnes.push('🎓 Professoressa!');
  if(p.totalCorrect>=100&&awardTrophy('total_100'))newOnes.push('💯 Centenaria!');
  if(p.level>=5&&awardTrophy('level_5'))newOnes.push('👸 Principessa!');
  return newOnes;
}
function renderTrophies(){
  var grid=document.getElementById('trophiesGrid');grid.innerHTML='';
  var has=currentProfile?currentProfile.trophies:[];
  for(var i=0;i<ALL_TROPHIES.length;i++){var t=ALL_TROPHIES[i];var unlocked=has.indexOf(t.id)>=0;
    var card=createEl('div','trophy-card'+(unlocked?'':' locked'));
    card.appendChild(createEl('div','trophy-emoji',t.emoji));
    card.appendChild(createEl('div','trophy-name',t.name));
    card.appendChild(createEl('div','trophy-desc',t.desc));
    grid.appendChild(card);
  }
}

// === LEADERBOARD ===
function renderLeaderboard(){
  var list=document.getElementById('lbList');list.innerHTML='';
  var profiles=getProfiles().slice().sort(function(a,b){return b.totalCorrect-a.totalCorrect});
  var medals=['gold','silver','bronze'];
  for(var i=0;i<profiles.length;i++){var p=profiles[i];
    var row=document.createElement('div');row.className='lb-row';
    var rank=document.createElement('div');rank.className='lb-rank '+(i<3?medals[i]:'');rank.textContent=(['🥇','🥈','🥉'][i]||(i+1));
    var avatar=document.createElement('div');avatar.className='lb-avatar';avatar.textContent=p.avatar;
    var info=document.createElement('div');info.className='lb-info';
    var name=document.createElement('div');name.className='lb-name';name.textContent=p.name;
    var score=document.createElement('div');score.className='lb-score';score.textContent='Lv.'+p.level+' · ⭐ '+p.totalCorrect+' · 🔥 '+p.bestStreak;
    info.appendChild(name);info.appendChild(score);
    row.appendChild(rank);row.appendChild(avatar);row.appendChild(info);
    list.appendChild(row);
  }
  if(profiles.length===0)list.appendChild(createEl('div','empty-state','Nessun giocatore ancora!'));
}

// === GAME STATE ===
var G={mode:'',score:0,streak:0,bestStreak:0,current:0,questions:[],answered:false,total:15,timer:0,timerInterval:null,bossHp:0,bossMaxHp:0,blitzCount:0};
var LEVEL_NAMES=['Fiorellino','Farfallina','Stellina','Esploratrice','Fatina','Principessa','Regina','Leggenda'];
var XP_PER_LEVEL=100;

function xpForLevel(l){return l*XP_PER_LEVEL}
function getLevelName(){if(!currentProfile)return'';return LEVEL_NAMES[Math.min(currentProfile.level-1,LEVEL_NAMES.length-1)]}
function saveCurrentProfile(){if(!currentProfile)return;var ps=getProfiles();ps[currentProfile._idx]=currentProfile;saveProfiles(ps)}
function addXP(amount){
  if(!currentProfile)return;currentProfile.xp+=amount;var leveled=false;
  while(currentProfile.xp>=xpForLevel(currentProfile.level)){currentProfile.xp-=xpForLevel(currentProfile.level);currentProfile.level++;leveled=true}
  if(leveled){sfxLevelUp();document.getElementById('avatar').classList.add('levelup');setTimeout(function(){document.getElementById('avatar').classList.remove('levelup')},700);showStreakToast('⬆️ Livello '+currentProfile.level+'!')}
  updateTopbar();saveCurrentProfile();
}
function updateTopbar(){
  if(!currentProfile)return;
  document.getElementById('avatar').textContent=currentProfile.avatar;
  document.getElementById('playerNameDisp').textContent=currentProfile.name;
  document.getElementById('levelLabel').textContent='Lv.'+currentProfile.level+' '+getLevelName();
  document.getElementById('xpBar').style.width=(currentProfile.xp/xpForLevel(currentProfile.level))*100+'%';
  document.getElementById('totalScore').textContent=G.score;
  document.getElementById('streakDisp').textContent=G.streak;
}

// === QUESTION GENERATORS ===
function ri(a,b){return Math.floor(Math.random()*(b-a+1))+a}
function shuffle(a){var b=a.slice();for(var i=b.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=b[i];b[i]=b[j];b[j]=t}return b}
function wrongAnswers(c,n,min,max){var w={};var arr=[-2,-1,1,2,-3,3];for(var i=0;i<arr.length;i++){var v=c+arr[i];if(v>0&&v!==c&&v>=min&&v<=max)w[v]=true}var t=0;while(Object.keys(w).length<n&&t<50){var v2=ri(min,max);if(v2!==c)w[v2]=true;t++}return shuffle(Object.keys(w).map(Number)).slice(0,n)}

function qNumericDiv(){var d=ri(2,10),q=ri(1,10),dd=d*q;var opts=shuffle([q].concat(wrongAnswers(q,3,1,12)));var templates=['<span class="num">'+dd+'</span> <span class="op">÷</span> <span class="num">'+d+'</span> <span class="op">=</span> <span class="num">?</span>','Quanto fa <span class="num">'+dd+'</span> <span class="op">÷</span> <span class="num">'+d+'</span>?','Calcola: <span class="num">'+dd+'</span> diviso <span class="num">'+d+'</span>'];return{type:'calc',badge:'🔢 Calcolo',cls:'badge-calc',html:templates[ri(0,2)],options:opts.map(String),correct:String(q),explain:dd+' ÷ '+d+' = '+q+', perché '+d+' × '+q+' = '+dd}}

function qQuanteVolte(){var d=ri(2,10),q=ri(1,10),dd=d*q;var opts=shuffle([q].concat(wrongAnswers(q,3,1,12)));var art=([8].indexOf(d)>=0)?("L'"+d):('il '+d);var Art=([8].indexOf(d)>=0)?("L'"+d):('Il '+d);var templates=[Art+' <span class="num">'+d+'</span> sta nel <span class="num">'+dd+'</span> quante volte?','Quante volte entra '+art+' <span class="num">'+d+'</span> nel <span class="num">'+dd+'</span>?','Se conti a salti di <span class="num">'+d+'</span>, quanti salti servono per arrivare a <span class="num">'+dd+'</span>?'];return{type:'calc',badge:'🔢 Calcolo',cls:'badge-calc',html:templates[ri(0,2)],options:opts.map(String),correct:String(q),explain:Art+' '+d+' sta nel '+dd+' esattamente '+q+(q===1?' volta':' volte')}}

function qGruppi(){var g=ri(2,8),p=ri(2,10),tot=g*p;var items=[{o:'caramelle',t:['Hai <span class="num">%t</span> caramelle da dividere in <span class="num">%g</span> sacchetti uguali. Quante per sacchetto?','Distribuisci <span class="num">%t</span> caramelle tra <span class="num">%g</span> bambini. Quante a testa?']},{o:'figurine',t:['Hai <span class="num">%t</span> figurine da dividere tra <span class="num">%g</span> amici. Quante a testa?']},{o:'matite',t:['Hai <span class="num">%t</span> matite da mettere in <span class="num">%g</span> astucci uguali. Quante per astuccio?']},{o:'biscotti',t:['Hai sfornato <span class="num">%t</span> biscotti e li metti in <span class="num">%g</span> piatti uguali. Quanti per piatto?']},{o:'biglie',t:['Hai <span class="num">%t</span> biglie da dividere in <span class="num">%g</span> sacchetti. Quante per sacchetto?']},{o:'libri',t:['La biblioteca ha <span class="num">%t</span> libri da mettere in <span class="num">%g</span> scaffali uguali. Quanti per scaffale?']},{o:'fiori',t:['Il fioraio ha <span class="num">%t</span> fiori da mettere in <span class="num">%g</span> vasi uguali. Quanti per vaso?']},{o:'perline',t:['Hai <span class="num">%t</span> perline per fare <span class="num">%g</span> braccialetti uguali. Quante per braccialetto?']},{o:'cioccolatini',t:['Ci sono <span class="num">%t</span> cioccolatini da dividere tra <span class="num">%g</span> persone. Quanti a testa?']},{o:'monete',t:['Dividi <span class="num">%t</span> monete in <span class="num">%g</span> pile uguali. Quante per pila?']},{o:'palloncini',t:['Per la festa ci sono <span class="num">%t</span> palloncini da dividere in <span class="num">%g</span> mazzi uguali. Quanti per mazzo?']},{o:'stelle',t:['La maestra ha <span class="num">%t</span> stelle da dare a <span class="num">%g</span> bambini in parti uguali. Quante a testa?']}];var it=items[ri(0,items.length-1)];var txt=it.t[ri(0,it.t.length-1)].replace(/%t/g,tot).replace(/%g/g,g);var opts=shuffle([p].concat(wrongAnswers(p,3,1,12)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:txt,options:opts.map(String),correct:String(p),explain:tot+' ÷ '+g+' = '+p+' '+it.o+' per gruppo'}}

function qInversa(){var d=ri(2,10),q=ri(2,10),dd=d*q;var v=ri(0,1);var html,correct,explain;if(v===0){correct=dd;html='Quale numero diviso <span class="num">'+d+'</span> dà <span class="num">'+q+'</span>?';explain='? = '+d+' × '+q+' = '+dd}else{correct=d;html='Per quale numero devi dividere <span class="num">'+dd+'</span> per ottenere <span class="num">'+q+'</span>?';explain='? = '+dd+' ÷ '+q+' = '+d}var opts=shuffle([correct].concat(wrongAnswers(correct,3,2,Math.max(correct+5,15))));return{type:'calc',badge:'🔢 Calcolo',cls:'badge-calc',html:html,options:opts.map(String),correct:String(correct),explain:explain}}

function qCatena(){var x=ri(2,6),y=ri(2,6),z=ri(2,4);var num=x*y*z;var mid=num/x;var opts=shuffle([z].concat(wrongAnswers(z,3,1,12)));return{type:'calc',badge:'🔢 Calcolo',cls:'badge-calc',html:'<span class="num">'+num+'</span> <span class="op">÷</span> <span class="num">'+x+'</span> <span class="op">÷</span> <span class="num">'+y+'</span> <span class="op">=</span> <span class="num">?</span>',options:opts.map(String),correct:String(z),explain:'Prima: '+num+' ÷ '+x+' = '+mid+', poi: '+mid+' ÷ '+y+' = '+z}}

function qQualeCorretta(){var d=ri(2,10),q=ri(2,10),dd=d*q;var correct=dd+' ÷ '+d+' = '+q;var fakes=[];fakes.push(dd+' ÷ '+d+' = '+(q+ri(1,3)));fakes.push(dd+' ÷ '+d+' = '+(q*2));var d2=d;while(d2===d)d2=ri(2,10);var q2=ri(2,10);fakes.push((d2*q2)+' ÷ '+d2+' = '+(q2+ri(1,2)));fakes=shuffle(fakes).slice(0,3);var opts=shuffle([correct].concat(fakes));return{type:'trap',badge:'⚡ Trappola!',cls:'badge-trap',html:'Quale di queste divisioni è <strong>corretta</strong>?',options:opts,correct:correct,explain:dd+' ÷ '+d+' = '+q+' perché '+d+' × '+q+' = '+dd,isText:true}}

function qQuantiGruppi(){var pg=ri(2,10),gr=ri(2,8),tot=pg*gr;var cp=[{s:'fila',p:'file',q:'e'},{s:'squadra',p:'squadre',q:'e'},{s:'scatola',p:'scatole',q:'e'},{s:'gruppo',p:'gruppi',q:'i'},{s:'tavolo',p:'tavoli',q:'i'},{s:'sacchetto',p:'sacchetti',q:'i'}];var objs=['bambini','sedie','mele','biscotti','palline','carte','mattoncini'];var obj=objs[ri(0,objs.length-1)];var c=cp[ri(0,cp.length-1)];var templates=['Hai <span class="num">'+tot+'</span> '+obj+'. Se ne metti <span class="num">'+pg+'</span> in ogni '+c.s+', quant'+c.q+' '+c.p+' ti servono?','Ci sono <span class="num">'+tot+'</span> '+obj+' da mettere in '+c.p+' da <span class="num">'+pg+'</span>. Quant'+c.q+' '+c.p+' servono?'];var opts=shuffle([gr].concat(wrongAnswers(gr,3,1,12)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:templates[ri(0,1)],options:opts.map(String),correct:String(gr),explain:tot+' ÷ '+pg+' = '+gr+' '+c.p}}

function qConfronto(){var d1=ri(2,10),q1=ri(2,10),dd1=d1*q1;var d2,q2,dd2;do{d2=ri(2,10);q2=ri(2,10);dd2=d2*q2}while(q1===q2);var bigger=q1>q2?dd1+' ÷ '+d1:dd2+' ÷ '+d2;var smaller=q1>q2?dd2+' ÷ '+d2:dd1+' ÷ '+d1;var fd=ri(2,8),fq=ri(2,8);var opts=shuffle([bigger,smaller,'Sono uguali',(fd*fq)+' ÷ '+fd]);return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Quale di queste divisioni dà il numero più grande?',options:opts,correct:bigger,explain:dd1+' ÷ '+d1+' = '+q1+' e '+dd2+' ÷ '+d2+' = '+q2+'. Quindi '+Math.max(q1,q2)+' è il risultato più grande!',isText:true}}

// This replaces everything from qQuantiRestano through buildBoss

function qQuantiRestano(){var d=ri(2,8),q=ri(3,8),tot=d*q;var taken=ri(1,q-1);var rem=(q-taken)*d;var items=[{n:'mele',g:'f'},{n:'caramelle',g:'f'},{n:'figurine',g:'f'},{n:'matite',g:'f'},{n:'palline',g:'f'},{n:'perline',g:'f'},{n:'stelle',g:'f'},{n:'biscotti',g:'m'},{n:'cioccolatini',g:'m'},{n:'palloncini',g:'m'},{n:'pennarelli',g:'m'},{n:'bottoni',g:'m'},{n:'adesivi',g:'m'}];var it=items[ri(0,items.length-1)];var dv=it.g==='f'?'divise':'divisi';var qw=it.g==='f'?'quante':'quanti';var templates=['Hai <span class="num">'+tot+'</span> '+it.n+' '+dv+' in <span class="num">'+q+'</span> gruppi uguali. Se togli <span class="num">'+taken+'</span> gruppi, '+qw+' '+it.n+' rimangono?','Ci sono <span class="num">'+tot+'</span> '+it.n+' '+dv+' in <span class="num">'+q+'</span> parti uguali. Se usi <span class="num">'+taken+'</span> parti, '+qw+' '+it.n+' restano?','Hai <span class="num">'+q+'</span> scatole con lo stesso numero di '+it.n+', per un totale di <span class="num">'+tot+'</span>. Se regali <span class="num">'+taken+'</span> scatole, '+qw+' '+it.n+' ti rimangono?'];var opts=shuffle([rem].concat(wrongAnswers(rem,3,1,tot)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:templates[ri(0,templates.length-1)],options:opts.map(String),correct:String(rem),explain:'Ogni gruppo ha '+tot+' ÷ '+q+' = '+d+' '+it.n+'. Togli '+taken+' gruppi: rimangono '+(q-taken)+' × '+d+' = '+rem}}

// NEW: "Divisione al contrario" — dato il risultato e il divisore, trova il dividendo
function qDivisoreNascosto(){var d=ri(2,10),q=ri(2,10),dd=d*q;var scenarios=['Se dividi un numero per <span class="num">'+d+'</span> ottieni <span class="num">'+q+'</span>. Qual è il numero?','Ho pensato un numero. Lo divido per <span class="num">'+d+'</span> e ottengo <span class="num">'+q+'</span>. Qual è il mio numero?','Il risultato di ? ÷ '+d+' è '+q+'. Quanto vale il numero misterioso?','Un numero diviso <span class="num">'+d+'</span> fa <span class="num">'+q+'</span>. Che numero è?'];var opts=shuffle([dd].concat(wrongAnswers(dd,3,Math.max(dd-10,2),dd+10)));return{type:'calc',badge:'🔢 Calcolo',cls:'badge-calc',html:scenarios[ri(0,scenarios.length-1)],options:opts.map(String),correct:String(dd),explain:'Se ? ÷ '+d+' = '+q+', allora ? = '+d+' × '+q+' = '+dd}}

// NEW: "Metà, terzo, quarto..." — divisione con frazioni semplici
function qFrazione(){var frazioni=[{nome:'la metà',div:2},{nome:'un terzo',div:3},{nome:'un quarto',div:4},{nome:'un quinto',div:5},{nome:'un sesto',div:6},{nome:'un settimo',div:7},{nome:'un ottavo',div:8},{nome:'un nono',div:9},{nome:'un decimo',div:10}];var f=frazioni[ri(0,frazioni.length-1)];var result=ri(2,10);var tot=f.div*result;var objs=['di '+tot+' caramelle','di '+tot+' figurine','di <span class="num">'+tot+'</span>','di '+tot+' punti','di '+tot+' monete','di '+tot+' mele','di '+tot+' stelle'];var obj=objs[ri(0,objs.length-1)];var templates=["Quanto è "+f.nome+' '+obj+'?',"Calcola "+f.nome+' '+obj+'.',"Se prendi "+f.nome+' '+obj+', quante ne hai?'];var opts=shuffle([result].concat(wrongAnswers(result,3,1,12)));return{type:'calc',badge:'🔢 Calcolo',cls:'badge-calc',html:templates[ri(0,templates.length-1)],options:opts.map(String),correct:String(result),explain:f.nome.charAt(0).toUpperCase()+f.nome.slice(1)+' di '+tot+' = '+tot+' ÷ '+f.div+' = '+result}}

// NEW: "Problema a due passi" — moltiplicazione + divisione
function qDuePassi(){var style=ri(0,3);
if(style===0){var people=ri(2,5),each=ri(2,8),tot=people*each;var n=ri(2,5);var price=ri(2,8);tot=n*price;each=tot/people;if(each!==Math.floor(each)){people=n;each=price}var opts=shuffle([each].concat(wrongAnswers(each,3,1,30)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Compri <span class="num">'+n+'</span> gelati da <span class="num">'+price+'</span> euro ciascuno. Poi dividi il conto tra <span class="num">'+people+'</span> amici. Quanto paga ognuno?',options:opts.map(String),correct:String(each),explain:'Totale: '+n+' × '+price+' = '+tot+' euro. Diviso '+people+': '+tot+' ÷ '+people+' = '+each+' euro a testa'}}
else if(style===1){var groups=ri(2,4),each2=ri(2,8),tot2=groups*each2;var boxes=ri(2,4);var perBox=each2;if(boxes*perBox!==tot2){perBox=tot2/boxes;if(perBox!==Math.floor(perBox)){boxes=groups;perBox=each2}}var opts2=shuffle([each2].concat(wrongAnswers(each2,3,1,30)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Hai <span class="num">'+boxes+'</span> scatole con <span class="num">'+perBox+'</span> biscotti ciascuna. Dividi tutti i biscotti tra <span class="num">'+groups+'</span> amici. Quanti biscotti prende ognuno?',options:opts2.map(String),correct:String(each2),explain:'Totale: '+boxes+' × '+perBox+' = '+tot2+'. Diviso '+groups+': '+tot2+' ÷ '+groups+' = '+each2}}
else if(style===2){var albums=ri(2,4),perAlbum=ri(2,6),totS=albums*perAlbum;var days=ri(2,5);var perDay=totS/days;if(perDay!==Math.floor(perDay)){days=albums;perDay=perAlbum}var opts3=shuffle([perAlbum].concat(wrongAnswers(perAlbum,3,1,30)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'In <span class="num">'+days+'</span> giorni raccogli <span class="num">'+perDay+'</span> figurine al giorno. Poi le metti in <span class="num">'+albums+'</span> album uguali. Quante per album?',options:opts3.map(String),correct:String(perAlbum),explain:'Totale: '+days+' × '+perDay+' = '+totS+'. Diviso '+albums+': '+totS+' ÷ '+albums+' = '+perAlbum}}
else{var tables=ri(2,4),perTable=ri(2,6),totK=tables*perTable;var teams=ri(2,4);var perTeam=totK/teams;if(perTeam!==Math.floor(perTeam)){teams=tables;perTeam=perTable}var opts4=shuffle([perTable].concat(wrongAnswers(perTable,3,1,30)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Ci sono <span class="num">'+teams+'</span> squadre da <span class="num">'+perTeam+'</span> bambini. Tutti si siedono a <span class="num">'+tables+'</span> tavoli uguali. Quanti bambini per tavolo?',options:opts4.map(String),correct:String(perTable),explain:'Totale: '+teams+' × '+perTeam+' = '+totK+'. Diviso '+tables+': '+totK+' ÷ '+tables+' = '+perTable}}}

function qTempo(){var style=ri(0,4);
if(style===0){var perH=ri(3,10),hours=ri(2,8),tot=perH*hours;var opts=shuffle([hours].concat(wrongAnswers(hours,3,1,12)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Devi leggere <span class="num">'+tot+'</span> pagine. Se leggi <span class="num">'+perH+'</span> pagine al giorno, quanti giorni ti servono?',options:opts.map(String),correct:String(hours),explain:tot+' ÷ '+perH+' = '+hours+' giorni'}}
else if(style===1){var interval=ri(3,6),times=ri(3,10),totMin=interval*times;var opts2=shuffle([times].concat(wrongAnswers(times,3,1,15)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Un autobus passa ogni <span class="num">'+interval+'</span> minuti. Quanti autobus passano in <span class="num">'+totMin+'</span> minuti?',options:opts2.map(String),correct:String(times),explain:totMin+' ÷ '+interval+' = '+times+' autobus'}}
else if(style===2){var speed=ri(2,5),time=ri(2,8),totKm=speed*time;var opts3=shuffle([time].concat(wrongAnswers(time,3,1,15)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Una lumaca percorre <span class="num">'+totKm+'</span> metri. Se fa <span class="num">'+speed+'</span> metri ogni ora, quante ore ci mette?',options:opts3.map(String),correct:String(time),explain:totKm+' ÷ '+speed+' = '+time+' ore'}}
else if(style===3){var perMin=ri(2,5),mins=ri(3,10),totSteps=perMin*mins;var opts4=shuffle([mins].concat(wrongAnswers(mins,3,1,15)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Fai <span class="num">'+totSteps+'</span> passi in totale. Se fai <span class="num">'+perMin+'</span> passi al minuto, quanti minuti ci metti?',options:opts4.map(String),correct:String(mins),explain:totSteps+' ÷ '+perMin+' = '+mins+' minuti'}}
else{var glasses=ri(2,6),perGlass=ri(2,5),totL=glasses*perGlass;var opts5=shuffle([perGlass].concat(wrongAnswers(perGlass,3,1,15)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Hai <span class="num">'+totL+'</span> litri di succo da versare in <span class="num">'+glasses+'</span> bottiglie uguali. Quanti litri per bottiglia?',options:opts5.map(String),correct:String(perGlass),explain:totL+' ÷ '+glasses+' = '+perGlass+' litri per bottiglia'}}}

function qSoldi(){var style=ri(0,3);
if(style===0){var kids=ri(2,5),each=ri(2,10),tot=kids*each;var opts=shuffle([each].concat(wrongAnswers(each,3,1,30)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Hai <span class="num">'+tot+'</span> euro da dividere equamente tra <span class="num">'+kids+'</span> bambini. Quanti euro riceve ognuno?',options:opts.map(String),correct:String(each),explain:tot+' ÷ '+kids+' = '+each+' euro a testa'}}
else if(style===1){var price=ri(2,8),items=ri(2,10),totM=price*items;var opts2=shuffle([items].concat(wrongAnswers(items,3,1,15)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Hai <span class="num">'+totM+'</span> euro. Ogni giocattolo costa <span class="num">'+price+'</span> euro. Quanti giocattoli puoi comprare?',options:opts2.map(String),correct:String(items),explain:totM+' ÷ '+price+' = '+items+' giocattoli'}}
else if(style===2){var weeks=ri(3,8),perWeek=ri(2,6),saved=weeks*perWeek;var opts3=shuffle([perWeek].concat(wrongAnswers(perWeek,3,1,20)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Risparmi <span class="num">'+saved+'</span> euro in <span class="num">'+weeks+'</span> settimane. Quanti euro risparmi ogni settimana?',options:opts3.map(String),correct:String(perWeek),explain:saved+' ÷ '+weeks+' = '+perWeek+' euro a settimana'}}
else{var nFriends=ri(2,5),share=ri(2,8),costTot=nFriends*share;var opts4=shuffle([share].concat(wrongAnswers(share,3,1,25)));return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:'Una pizza costa <span class="num">'+costTot+'</span> euro. La dividete in <span class="num">'+nFriends+'</span>. Quanto paga ognuno?',options:opts4.map(String),correct:String(share),explain:costTot+' ÷ '+nFriends+' = '+share+' euro a testa'}}}
function qProprieta(){var d=ri(2,10),q=ri(2,10),dd=d*q;var style=ri(0,3);if(style===0){var correct=dd+' ÷ '+d;var wrongs=[dd+' × '+d,d+' × '+q,dd+' + '+d];var opts=shuffle([correct].concat(wrongs));return{type:'trap',badge:'⚡ Trappola!',cls:'badge-trap',html:'Se <span class="num">'+d+'</span> × <span class="num">'+q+'</span> = <span class="num">'+dd+'</span>, quale operazione dà come risultato <span class="num">'+q+'</span>?',options:opts,correct:correct,explain:'Se '+d+' × '+q+' = '+dd+', allora '+dd+' ÷ '+d+' = '+q+'. Divisione e moltiplicazione sono inverse!',isText:true}}
else if(style===1){var opts2=shuffle([String(dd),String(d),String(q),String(d+q)]);return{type:'trap',badge:'⚡ Trappola!',cls:'badge-trap',html:'Se <span class="num">'+dd+'</span> ÷ <span class="num">'+d+'</span> = <span class="num">'+q+'</span>, quanto fa <span class="num">'+d+'</span> × <span class="num">'+q+'</span>?',options:opts2,correct:String(dd),explain:'Se '+dd+' ÷ '+d+' = '+q+', allora '+d+' × '+q+' = '+dd+'. Sono operazioni inverse!'}}
else if(style===2){var d2=ri(2,10),q2=ri(2,10),dd2=d2*q2;var correct3=dd===dd2?'Sì, sono uguali':'No, sono diversi';var wrong3=dd===dd2?'No, sono diversi':'Sì, sono uguali';var opts3=shuffle([correct3,wrong3,dd+' ÷ '+d+' è più grande','Non si può sapere']);return{type:'trap',badge:'⚡ Trappola!',cls:'badge-trap',html:dd+' ÷ '+d+' e '+dd2+' ÷ '+d2+' danno lo stesso risultato?',options:opts3,correct:correct3,explain:dd+' ÷ '+d+' = '+q+' e '+dd2+' ÷ '+d2+' = '+q2+'. '+(q===q2?'Sì, entrambi danno '+q+'!':'No, danno risultati diversi!'),isText:true}}
else{var wrong4a=ri(1,3),wrong4b=ri(1,3);var opts4=shuffle([String(q),String(q+wrong4a),String(d),String(dd)]);return{type:'calc',badge:'🔢 Calcolo',cls:'badge-calc',html:'<span class="num">'+d+'</span> × <span class="num">?</span> = <span class="num">'+dd+'</span>. Quanto vale?',options:opts4,correct:String(q),explain:d+' × ? = '+dd+', quindi ? = '+dd+' ÷ '+d+' = '+q}}}

function qMoltODiv(){var pool=[
{text:'Hai 24 biscotti e li dividi tra 6 amici. Che operazione fai?',correct:'Divisione: 24 ÷ 6',wrong:['Moltiplicazione: 24 × 6','Divisione: 24 ÷ 6','Addizione: 24 + 6'],explain:'Dividi in parti uguali → DIVISIONE! 24 ÷ 6 = 4'},
{text:'Ci sono 30 matite da mettere in scatole da 5. Quante scatole servono?',correct:'Divisione: 30 ÷ 5',wrong:['Moltiplicazione: 30 × 5','Divisione: 30 ÷ 5','Addizione: 30 + 5'],explain:'Dividi in gruppi → DIVISIONE! 30 ÷ 5 = 6'},
{text:'Ci sono 40 posti da distribuire in 8 file uguali. Quanti posti per fila?',correct:'Divisione: 40 ÷ 8',wrong:['Moltiplicazione: 40 × 8','Divisione: 40 ÷ 8','Addizione: 40 + 8'],explain:'Distribuisci → DIVISIONE! 40 ÷ 8 = 5'},
{text:'Ci sono 56 bambini da dividere in 7 squadre uguali. Quanti per squadra?',correct:'Divisione: 56 ÷ 7',wrong:['Moltiplicazione: 56 × 7','Divisione: 56 ÷ 7','Addizione: 56 + 7'],explain:'Distribuisci → DIVISIONE! 56 ÷ 7 = 8'},
{text:'Hai 36 fragole da dividere tra 4 bambini. Che operazione fai?',correct:'Divisione: 36 ÷ 4',wrong:['Moltiplicazione: 36 × 4','Divisione: 36 ÷ 4','Addizione: 36 + 4'],explain:'Dividi equamente → DIVISIONE! 36 ÷ 4 = 9'},
{text:'La maestra divide 32 fogli tra 8 studenti. Che operazione fa?',correct:'Divisione: 32 ÷ 8',wrong:['Moltiplicazione: 32 × 8','Divisione: 32 ÷ 8','Addizione: 32 + 8'],explain:'Divide in parti uguali → DIVISIONE! 32 ÷ 8 = 4'},
{text:'Il nonno divide 28 noci tra 7 nipoti. Che operazione fa?',correct:'Divisione: 28 ÷ 7',wrong:['Moltiplicazione: 28 × 7','Divisione: 28 ÷ 7','Addizione: 28 + 7'],explain:'Divide → DIVISIONE! 28 ÷ 7 = 4'},
{text:'Una torta ha 18 fette da dividere tra 3 tavoli. Quante fette per tavolo?',correct:'Divisione: 18 ÷ 3',wrong:['Moltiplicazione: 18 × 3','Divisione: 18 ÷ 3','Addizione: 18 + 3'],explain:'Distribuisci → DIVISIONE! 18 ÷ 3 = 6'},
{text:'Un treno parte ogni 6 minuti. Quanti treni passano in 60 minuti?',correct:'Divisione: 60 ÷ 6',wrong:['Moltiplicazione: 60 × 6','Divisione: 60 ÷ 6','Sottrazione: 60 - 6'],explain:'Dividi il tempo → DIVISIONE! 60 ÷ 6 = 10'},
{text:'Hai 45 adesivi da mettere in 9 pagine uguali. Che operazione fai?',correct:'Divisione: 45 ÷ 9',wrong:['Moltiplicazione: 45 × 9','Divisione: 45 ÷ 9','Addizione: 45 + 9'],explain:'Distribuisci → DIVISIONE! 45 ÷ 9 = 5'},
{text:'Ci sono 72 pezzi di puzzle da dividere tra 8 bambini. Che operazione fai?',correct:'Divisione: 72 ÷ 8',wrong:['Moltiplicazione: 72 × 8','Divisione: 72 ÷ 8','Addizione: 72 + 8'],explain:'Distribuisci → DIVISIONE! 72 ÷ 8 = 9'},
{text:'Un nastro lungo 54 cm va tagliato in 6 pezzi uguali. Che operazione fai?',correct:'Divisione: 54 ÷ 6',wrong:['Moltiplicazione: 54 × 6','Divisione: 54 ÷ 6','Sottrazione: 54 - 6'],explain:'Tagli in parti uguali → DIVISIONE! 54 ÷ 6 = 9 cm'},
{text:'La nonna ha 42 biscotti da dividere tra 7 nipoti. Che operazione fa?',correct:'Divisione: 42 ÷ 7',wrong:['Moltiplicazione: 42 × 7','Divisione: 42 ÷ 7','Addizione: 42 + 7'],explain:'Divide equamente → DIVISIONE! 42 ÷ 7 = 6'},
{text:'Ci sono 35 sedie da mettere in 5 file uguali. Che operazione fai?',correct:'Divisione: 35 ÷ 5',wrong:['Moltiplicazione: 35 × 5','Divisione: 35 ÷ 5','Addizione: 35 + 5'],explain:'Distribuisci → DIVISIONE! 35 ÷ 5 = 7'},
{text:'Ogni bambino ha 5 figurine, ci sono 4 bambini. Quante figurine in totale?',correct:'Moltiplicazione: 5 × 4',wrong:['Divisione: 4 ÷ 4','Divisione: 20 ÷ 4','Sottrazione: 5 - 4'],explain:'Ripeti la stessa quantità → MOLTIPLICAZIONE! 5 × 4 = 20'},
{text:'Leggi 3 pagine al giorno per 7 giorni. Quante pagine?',correct:'Moltiplicazione: 3 × 7',wrong:['Divisione: 21 ÷ 3','Divisione: 21 ÷ 7','Sottrazione: 7 - 3'],explain:'Ripeti per più giorni → MOLTIPLICAZIONE! 3 × 7 = 21'},
{text:'Ci sono 6 sacchetti con 9 caramelle ciascuno. Quante caramelle in totale?',correct:'Moltiplicazione: 6 × 9',wrong:['Divisione: 54 ÷ 6','Divisione: 6 ÷ 6','Sottrazione: 9 - 6'],explain:'Ripeti per ogni sacchetto → MOLTIPLICAZIONE! 6 × 9 = 54'},
{text:'Un treno ha 9 vagoni con 8 posti ciascuno. Quanti posti in totale?',correct:'Moltiplicazione: 9 × 8',wrong:['Divisione: 72 ÷ 9','Divisione: 8 ÷ 8','Addizione: 9 + 8'],explain:'Ripeti per ogni vagone → MOLTIPLICAZIONE! 9 × 8 = 72'},
{text:'Ci sono 7 amici e ognuno porta 4 libri. Quanti libri in totale?',correct:'Moltiplicazione: 7 × 4',wrong:['Divisione: 28 ÷ 7','Divisione: 4 ÷ 4','Sottrazione: 7 - 4'],explain:'Ripeti per ogni amico → MOLTIPLICAZIONE! 7 × 4 = 28'},
{text:'Ci sono 8 file di sedie con 6 sedie per fila. Quante sedie?',correct:'Moltiplicazione: 8 × 6',wrong:['Divisione: 48 ÷ 8','Divisione: 6 ÷ 6','Addizione: 8 + 6'],explain:'Ripeti per ogni fila → MOLTIPLICAZIONE! 8 × 6 = 48'},
{text:'Un ragno ha 8 zampe. Quante zampe hanno 5 ragni?',correct:'Moltiplicazione: 8 × 5',wrong:['Divisione: 40 ÷ 8','Divisione: 5 ÷ 5','Addizione: 8 + 5'],explain:'Ripeti per ogni ragno → MOLTIPLICAZIONE! 8 × 5 = 40'},
{text:'Mangi 2 mele al giorno per 9 giorni. Quante mele?',correct:'Moltiplicazione: 2 × 9',wrong:['Divisione: 18 ÷ 2','Divisione: 8 ÷ 2','Addizione: 2 + 9'],explain:'Ripeti per più giorni → MOLTIPLICAZIONE! 2 × 9 = 18'},
{text:'Guadagni 3 punti per ogni stella. Hai raccolto 9 stelle. Quanti punti?',correct:'Moltiplicazione: 3 × 9',wrong:['Divisione: 27 ÷ 3','Divisione: 9 ÷ 3','Addizione: 3 + 9'],explain:'Ripeti per ogni stella → MOLTIPLICAZIONE! 3 × 9 = 27'},
{text:'Hai 4 mazzi di fiori con 8 fiori ciascuno. Quanti fiori in totale?',correct:'Moltiplicazione: 4 × 8',wrong:['Divisione: 32 ÷ 4','Divisione: 8 ÷ 4','Addizione: 4 + 8'],explain:'Ripeti per ogni mazzo → MOLTIPLICAZIONE! 4 × 8 = 32'},
{text:'Una gallina fa 1 uovo al giorno. Quante uova fanno 6 galline in 5 giorni?',correct:'Moltiplicazione: 6 × 5',wrong:['Divisione: 30 ÷ 6','Divisione: 5 ÷ 5','Addizione: 6 + 5'],explain:'6 galline × 5 giorni → MOLTIPLICAZIONE! 6 × 5 = 30'},
{text:'Hai 3 scatole con 10 pastelli ciascuna. Quanti pastelli in totale?',correct:'Moltiplicazione: 3 × 10',wrong:['Divisione: 30 ÷ 3','Divisione: 9 ÷ 3','Addizione: 3 + 10'],explain:'Ripeti per ogni scatola → MOLTIPLICAZIONE! 3 × 10 = 30'},
{text:'In classe ci sono 5 banchi da 2 posti. Quanti posti in totale?',correct:'Moltiplicazione: 5 × 2',wrong:['Divisione: 10 ÷ 5','Divisione: 4 ÷ 2','Addizione: 5 + 2'],explain:'Ripeti per ogni banco → MOLTIPLICAZIONE! 5 × 2 = 10'},
{text:'Ci sono 90 figurine da dividere tra 9 bambini. Che operazione fai?',correct:'Divisione: 90 ÷ 9',wrong:['Moltiplicazione: 90 × 9','Divisione: 90 ÷ 9','Addizione: 90 + 9'],explain:'Distribuisci → DIVISIONE! 90 ÷ 9 = 10'},
{text:'Ogni scaffale ha 9 libri. Ci sono 7 scaffali. Quanti libri in totale?',correct:'Moltiplicazione: 9 × 7',wrong:['Divisione: 63 ÷ 9','Divisione: 7 ÷ 7','Addizione: 9 + 7'],explain:'Ripeti per ogni scaffale → MOLTIPLICAZIONE! 9 × 7 = 63'},
{text:'Hai 80 perline da mettere in 10 collane uguali. Che operazione fai?',correct:'Divisione: 80 ÷ 10',wrong:['Moltiplicazione: 80 × 10','Divisione: 80 ÷ 10','Addizione: 80 + 10'],explain:'Distribuisci → DIVISIONE! 80 ÷ 10 = 8'},
];var s=pool[ri(0,pool.length-1)];var wrongOpts=s.wrong.filter(function(o){return o!==s.correct});var opts=shuffle([s.correct].concat(wrongOpts)).slice(0,4);return{type:'brain',badge:'🧠 Ragionamento',cls:'badge-brain',html:s.text,options:opts,correct:s.correct,explain:s.explain,isText:true}}

function qTrappola(){var style=ri(0,1);if(style===0){var d=ri(3,10),q=ri(2,10),dd=d*q;var correct=dd+' ÷ '+d;var wrongs=shuffle([dd+' × '+d,d+' × '+q,(d*(q+ri(1,3)))+' ÷ '+d]);var opts=shuffle([correct].concat(wrongs));return{type:'trap',badge:'⚡ Trappola!',cls:'badge-trap',html:'Quale operazione dà come risultato <span class="num">'+q+'</span>?',options:opts,correct:correct,explain:dd+' ÷ '+d+' = '+q+'. Attenzione: '+d+' × '+q+' = '+dd+', non '+q+'!',isText:true}}
else{var d2=ri(2,10),q2=ri(2,10),dd2=d2*q2;var answers=[{t:dd2+' ÷ '+d2+' = '+q2,c:true},{t:dd2+' ÷ '+d2+' = '+(q2+ri(1,3)),c:false},{t:(d2*(q2+ri(1,3)))+' ÷ '+d2+' = '+q2,c:false},{t:dd2+' ÷ '+d2+' = '+(q2*2),c:false}];var right=answers[0];var wrongs2=shuffle(answers.slice(1)).slice(0,3);var opts2=shuffle([right].concat(wrongs2));var correctText='';for(var i=0;i<opts2.length;i++)if(opts2[i].c)correctText=opts2[i].t;var optTexts=opts2.map(function(o){return o.t});return{type:'trap',badge:'⚡ Trappola!',cls:'badge-trap',html:'Quale di queste divisioni è <strong>corretta</strong>?',options:optTexts,correct:correctText,explain:dd2+' ÷ '+d2+' = '+q2+' perché '+d2+' × '+q2+' = '+dd2,isText:true}}}

function qTrueFalse(){var style=ri(0,5);if(style<=1){var d=ri(2,10),q=ri(1,10),dd=d*q;var isTrue=ri(0,1)===1;var shown,correct;if(isTrue){shown=q;correct=true}else{var fake=q+ri(1,3)*(ri(0,1)?1:-1);if(fake<=0)fake=q+ri(1,3);if(fake===q)fake=q+1;shown=fake;correct=false}return{type:'tf',html:'<span class="num">'+dd+'</span> <span class="op">÷</span> <span class="num">'+d+'</span> <span class="op">=</span> <span class="num">'+shown+'</span>',correct:correct,explain:correct?'Esatto! '+dd+' ÷ '+d+' = '+shown:'No! '+dd+' ÷ '+d+' = '+q+', non '+shown+'!'}}
else if(style===2){var d1=ri(2,10),q1=ri(2,10),dd1=d1*q1;var d2=ri(2,10),q2=ri(2,10),dd2=d2*q2;if(q1===q2)return qTrueFalse();var claim=ri(0,1)===0;var correct2=claim===(q1>q2);return{type:'tf',html:'<span class="num">'+dd1+'</span> <span class="op">÷</span> <span class="num">'+d1+'</span> è più grande di <span class="num">'+dd2+'</span> <span class="op">÷</span> <span class="num">'+d2+'</span>',correct:correct2,explain:dd1+' ÷ '+d1+' = '+q1+' e '+dd2+' ÷ '+d2+' = '+q2+'. '+(q1>q2?'Il primo':'Il secondo')+' è più grande!'}}
else if(style===3){var d3=ri(2,10),q3=ri(2,10),dd3=d3*q3;var isTrue3=ri(0,1)===1;if(isTrue3){return{type:'tf',html:d3+' × '+q3+' = '+dd3,correct:true,explain:'Esatto! '+d3+' × '+q3+' = '+dd3}}else{var fakeResult=dd3+ri(1,3)*(ri(0,1)?1:-1);if(fakeResult===dd3)fakeResult=dd3+2;return{type:'tf',html:d3+' × '+q3+' = '+fakeResult,correct:false,explain:'No! '+d3+' × '+q3+' = '+dd3+', non '+fakeResult+'!'}}}
else if(style===4){var ds=[{t:'Dividere 20 mele tra 5 bambini è una divisione',c:true,e:'Dividere in parti uguali → divisione!'},{t:'Se hai 36 biscotti e fai 4 gruppi uguali, stai dividendo',c:true,e:'Fare gruppi uguali = divisione!'},{t:'Se hai 42 figurine e le dai a 7 amici in parti uguali, fai una divisione',c:true,e:'Parti uguali tra amici = divisione!'},{t:'Per sapere quante sedie ci sono per fila, dividi il totale per il numero di file',c:true,e:'Distribuire in file uguali = divisione!'},{t:'Per scoprire quanti bambini in ogni squadra, dividi il totale per le squadre',c:true,e:'Dal totale ai gruppi = divisione!'},{t:'Se dividi 48 figurine tra 6 amici, fai una moltiplicazione',c:false,e:'Distribuire in parti uguali → DIVISIONE, non moltiplicazione!'},{t:'Per trovare il totale di 5 scatole da 8 biscotti devi dividere',c:false,e:'Per il totale → MOLTIPLICHI, non dividi!'},{t:'Per contare le zampe di 6 gatti fai una divisione',c:false,e:'Ogni gatto ha 4 zampe, ripeti per 6 → MOLTIPLICAZIONE!'},{t:'Se hai 8 amici e ognuno porta 3 dolci, per trovare il totale devi dividere',c:false,e:'Ripeti 3 per 8 volte → MOLTIPLICAZIONE!'},{t:'Per sapere quante ruote hanno 7 biciclette fai una divisione',c:false,e:'Ogni bici ha 2 ruote, ripeti per 7 → MOLTIPLICAZIONE!'}];var s=ds[ri(0,ds.length-1)];return{type:'tf',html:s.t,correct:s.c,explain:s.e}}
else{var d4=ri(2,10),q4=ri(2,10),dd4=d4*q4;var isT=ri(0,1)===1;if(isT){return{type:'tf',html:'Se '+d4+' × '+q4+' = '+dd4+', allora '+dd4+' ÷ '+d4+' = '+q4,correct:true,explain:'Esatto! Moltiplicazione e divisione sono operazioni inverse!'}}
else{var fakeQ=q4+ri(1,3);return{type:'tf',html:'Se '+d4+' × '+q4+' = '+dd4+', allora '+dd4+' ÷ '+d4+' = '+fakeQ,correct:false,explain:'No! '+dd4+' ÷ '+d4+' = '+q4+', non '+fakeQ+'!'}}}}

// BUILD SETS
function buildClassica(){var qs=[];for(var i=0;i<2;i++)qs.push(qNumericDiv());qs.push(qQuanteVolte());qs.push(qGruppi());qs.push(qMoltODiv());qs.push(qTrappola());qs.push(qInversa());qs.push(qCatena());qs.push(qQualeCorretta());qs.push(qQuantiGruppi());qs.push(qConfronto());qs.push(qQuantiRestano());qs.push(qDivisoreNascosto());qs.push(qFrazione());qs.push(qDuePassi());var extra=[qTempo,qSoldi,qProprieta];qs.push(extra[ri(0,2)]());return shuffle(qs).slice(0,15)}
function buildBlitz(){var qs=[];var gens=[qNumericDiv,qQuanteVolte,qInversa,qTrappola,qCatena,qQualeCorretta,qQuantiGruppi,qDivisoreNascosto,qFrazione,qProprieta];for(var i=0;i<50;i++)qs.push(gens[ri(0,gens.length-1)]());return qs}
function buildVeroFalso(){var qs=[];for(var i=0;i<40;i++)qs.push(qTrueFalse());return qs}
function buildBoss(){var qs=[];var gens=[qNumericDiv,qGruppi,qMoltODiv,qTrappola,qInversa,qCatena,qQualeCorretta,qQuantiGruppi,qConfronto,qQuantiRestano,qDivisoreNascosto,qFrazione,qDuePassi,qTempo,qSoldi,qProprieta];for(var i=0;i<15;i++)qs.push(gens[ri(0,gens.length-1)]());return shuffle(qs)}

// === GAME FLOW ===
var cheers=['Fantastico! 🎉','Bravissima! ⭐','Perfetto! 💪','Esatto! 🌟','Super! 🚀','Grande! 🎯','Mitica! 💥','Wow! 🔥'];
var encouragements=['Quasi! 💪','Ci sei vicina! 🌈','Riprova! 😊','Non mollare! 💫','Dai che ce la fai! 🌟'];

function goToMenu(){clearInterval(G.timerInterval);showScreen('modeScreen');updateTopbar()}
function goToProfiles(){clearInterval(G.timerInterval);renderProfiles();showScreen('profileScreen')}

function startMode(mode){
  ensureAudio();G.mode=mode;G.score=0;G.streak=0;G.bestStreak=0;G.current=0;G.answered=false;G.blitzCount=0;
  clearInterval(G.timerInterval);showScreen('gameArea');
  var timer=document.getElementById('gameTimer');var bossE=document.getElementById('bossEmoji');var bossBar=document.getElementById('bossHpBar');
  timer.classList.add('hidden');bossE.classList.add('hidden');bossBar.classList.add('hidden');
  if(mode==='classica'){G.questions=buildClassica();G.total=15;document.getElementById('gameModeLabel').innerHTML='📚 Classica'}
  else if(mode==='blitz'){G.questions=buildBlitz();G.total=G.questions.length;G.timer=60;document.getElementById('gameModeLabel').innerHTML='⚡ Blitz';timer.classList.remove('hidden');timer.textContent='60';timer.classList.remove('danger');G.timerInterval=setInterval(function(){G.timer--;timer.textContent=G.timer;if(G.timer<=10)timer.classList.add('danger');if(G.timer<=5)sfxTick();if(G.timer<=0){clearInterval(G.timerInterval);endGame()}},1000)}
  else if(mode==='verofalso'){G.questions=buildVeroFalso();G.total=G.questions.length;G.timer=45;document.getElementById('gameModeLabel').innerHTML='🎯 Vero o Falso';timer.classList.remove('hidden');timer.textContent='45';timer.classList.remove('danger');G.timerInterval=setInterval(function(){G.timer--;timer.textContent=G.timer;if(G.timer<=10)timer.classList.add('danger');if(G.timer<=5)sfxTick();if(G.timer<=0){clearInterval(G.timerInterval);endGame()}},1000)}
  else if(mode==='boss'){G.questions=buildBoss();G.total=G.questions.length;G.bossMaxHp=10;G.bossHp=10;document.getElementById('gameModeLabel').innerHTML='🧚 Sfida Magica';bossE.classList.remove('hidden');bossBar.classList.remove('hidden');bossE.className='boss-emoji';updateBossHp()}
  updateTopbar();renderQ();
}

function renderQ(){
  G.answered=false;if(G.current>=G.questions.length){endGame();return}
  var q=G.questions[G.current];var card=document.getElementById('qCard');card.style.animation='none';card.offsetHeight;card.style.animation='';
  var badge=document.getElementById('qBadge');var grid=document.getElementById('answersGrid');var fb=document.getElementById('fbArea');fb.classList.add('hidden');fb.innerHTML='';
  var combo=document.getElementById('comboDisp');if(G.streak>=3){combo.classList.remove('hidden');combo.textContent='x'+getMultiplier()}else combo.classList.add('hidden');
  if(G.mode==='classica')document.getElementById('progressBar').style.width=(G.current/G.total)*100+'%';
  else if(G.mode==='boss')document.getElementById('progressBar').style.width=((G.bossMaxHp-G.bossHp)/G.bossMaxHp)*100+'%';
  else document.getElementById('progressBar').style.width=Math.min((G.blitzCount/20)*100,100)+'%';
  if(q.type==='tf'){badge.className='q-badge badge-calc';badge.innerHTML='🎯 Vero o Falso';document.getElementById('qText').innerHTML=q.html;grid.innerHTML='';grid.className='tf-grid';
    var btnT=document.createElement('button');btnT.className='tf-btn tf-true';btnT.textContent='✅ VERO';
    var btnF=document.createElement('button');btnF.className='tf-btn tf-false';btnF.textContent='❌ FALSO';
    btnT.addEventListener('click',function(){checkTF(true,btnT,btnF,q)});btnF.addEventListener('click',function(){checkTF(false,btnF,btnT,q)});
    grid.appendChild(btnT);grid.appendChild(btnF);
  }else{grid.className='answers-grid';badge.className='q-badge '+q.cls;badge.innerHTML=q.badge;document.getElementById('qText').innerHTML=q.html;grid.innerHTML='';
    q.options.forEach(function(opt){var b=document.createElement('button');b.className='ans-btn'+(q.isText?' textual':'');b.textContent=opt;b.addEventListener('click',function(){checkAns(opt,b,q)});grid.appendChild(b)});
  }
}

function getMultiplier(){if(G.streak>=10)return 4;if(G.streak>=7)return 3;if(G.streak>=3)return 2;return 1}
function showXpToast(a){var t=document.createElement('div');t.className='xp-toast';t.textContent='+'+a+' XP';document.body.appendChild(t);setTimeout(function(){t.remove()},1000)}
function showStreakToast(text){var t=document.createElement('div');t.className='streak-toast';t.textContent=text;t.style.color='hsl('+ri(300,360)+',80%,65%)';document.body.appendChild(t);setTimeout(function(){t.remove()},1200)}

function handleCorrect(btn){
  sfxCorrect();btn.classList.add('correct');G.score++;G.streak++;if(currentProfile)currentProfile.totalCorrect++;
  if(G.streak>G.bestStreak)G.bestStreak=G.streak;
  var mult=getMultiplier();var xp=10*mult;addXP(xp);
  var rect=btn.getBoundingClientRect();burstParticles(rect.left+rect.width/2,rect.top+rect.height/2,'#A5D6A7',8);
  if(G.streak===3)showStreakToast('🔥 Combo x2!');if(G.streak===7)showStreakToast('🔥🔥 Combo x3!');if(G.streak===10){showStreakToast('💥 COMBO x4!');confettiBurst(30)}
  showXpToast(xp);
  if(G.mode==='boss'){G.bossHp--;updateBossHp();var be=document.getElementById('bossEmoji');be.className='boss-emoji hit';setTimeout(function(){if(G.bossHp>0)be.className='boss-emoji'},400);sfxBossHit();if(G.bossHp<=0)bossDefeated()}
  return cheers[ri(0,cheers.length-1)];
}
function handleWrong(btn){sfxWrong();btn.classList.add('wrong');G.streak=0;var rect=btn.getBoundingClientRect();burstParticles(rect.left+rect.width/2,rect.top+rect.height/2,'#EF9A9A',6);return encouragements[ri(0,encouragements.length-1)]}

function checkAns(selected,btn,q){
  if(G.answered)return;G.answered=true;
  var all=document.querySelectorAll('.ans-btn');for(var i=0;i<all.length;i++){if(all[i].textContent===q.correct)all[i].classList.add('correct');all[i].style.pointerEvents='none'}
  var ok=selected===q.correct;var msg=ok?handleCorrect(btn):handleWrong(btn);updateTopbar();G.blitzCount++;
  if(G.mode==='boss'&&G.bossHp<=0)return;
  showFeedback(ok,msg,q.explain);
  if(G.mode!=='classica')setTimeout(function(){G.current++;renderQ()},ok?700:1600);
}
function checkTF(val,btn,otherBtn,q){
  if(G.answered)return;G.answered=true;btn.style.pointerEvents='none';otherBtn.style.pointerEvents='none';
  var ok=val===q.correct;if(ok){btn.classList.add('correct');handleCorrect(btn)}else{btn.classList.add('wrong');otherBtn.classList.add('correct');handleWrong(btn)}
  showFeedback(ok,ok?cheers[ri(0,cheers.length-1)]:encouragements[ri(0,encouragements.length-1)],q.explain);updateTopbar();G.blitzCount++;
  setTimeout(function(){G.current++;renderQ()},ok?600:1500);
}
function showFeedback(ok,msg,explain){
  var fb=document.getElementById('fbArea');fb.classList.remove('hidden');
  fb.innerHTML='';
  var parts=[createEl('div','fb-msg '+(ok?'ok':'ko'),msg)];
  if(!ok)parts.push(createEl('div','fb-explain','💡 '+explain));
  if(G.mode==='classica'){
    var nBtn=createEl('button','next-btn',G.current<G.total-1?'Avanti ➡️':'Risultato! 🏆');
    nBtn.id='nextQBtn';
    nBtn.addEventListener('click',function(){nextQ()});
    parts.push(nBtn);
  }
  appendChildren(fb,parts);
}
function nextQ(){G.current++;if(G.current>=G.total)endGame();else renderQ()}
function updateBossHp(){document.getElementById('bossHpFill').style.width=(G.bossHp/G.bossMaxHp)*100+'%';document.getElementById('bossHpLabel').textContent=Math.max(G.bossHp,0)+' / '+G.bossMaxHp}
function bossDefeated(){sfxBossDefeat();document.getElementById('bossEmoji').className='boss-emoji defeated';confettiBurst(60);addXP(50);showXpToast(50);setTimeout(function(){endGame()},1200)}

function endGame(){
  clearInterval(G.timerInterval);
  var newTrophies=[];
  if(currentProfile){currentProfile.gamesPlayed++;if(G.bestStreak>currentProfile.bestStreak)currentProfile.bestStreak=G.bestStreak;
    if(G.mode==='boss'&&G.bossHp<=0)awardTrophy('boss_win');
    if(G.mode==='classica'&&G.score===G.total)awardTrophy('perfect');
    if(G.mode==='blitz'&&G.score>=10)awardTrophy('blitz_10');
    if(G.mode==='blitz'&&G.score>=20)awardTrophy('blitz_20');
    newTrophies=checkTrophies();saveCurrentProfile();
  }
  showScreen('endScreen');
  var total,pct,title,detail;
  if(G.mode==='blitz'||G.mode==='verofalso'){total=G.blitzCount;pct=total>0?G.score/total:0;document.getElementById('endScore').textContent=G.score+' ✓';detail=G.score+' risposte corrette su '+total+'!'}
  else if(G.mode==='boss'){total=G.total;pct=G.bossHp<=0?1:G.score/total;document.getElementById('endScore').textContent=G.bossHp<=0?'🧙‍♀️✨':'😢';detail=G.bossHp<=0?'Strega sconfitta con '+G.score+' risposte giuste!':'La strega ha vinto... riprova!'}
  else{total=G.total;pct=G.score/total;document.getElementById('endScore').textContent=G.score+'/'+total;detail='Miglior serie: '+G.bestStreak+' di fila!'}
  var stars=pct>=0.9?3:pct>=0.7?2:pct>=0.5?1:0;
  if(pct>=0.9)title='Sei un genio! 🧠✨';else if(pct>=0.7)title='Bravissima! 💪';else if(pct>=0.5)title='Buon lavoro! 👍';else title='Non mollare! 🌟';
  document.getElementById('endTitle').textContent=title;
  document.getElementById('endStars').textContent='⭐'.repeat(stars)+'☆'.repeat(3-stars);
  document.getElementById('endDetail').textContent=detail;
  document.getElementById('endXp').textContent='+'+G.score*10+' XP guadagnati!';
  document.getElementById('endTrophy').textContent=G.mode==='boss'?(G.bossHp<=0?'🧚':'😢'):'🏆';
  document.getElementById('endNewTrophies').textContent=newTrophies&&newTrophies.length>0?'Nuovo trofeo: '+newTrophies.join(', '):'';
  if(pct>=0.7)confettiBurst(40);
}

// === INIT ===
renderAvatarPicker();renderProfiles();
document.getElementById('newProfileBtn').addEventListener('click',function(){showScreen('createScreen')});
var resetPending=false;
document.getElementById('resetAllBtn').addEventListener('click',function(){
  var btn=document.getElementById('resetAllBtn');
  if(!resetPending){
    resetPending=true;btn.textContent='⚠️ Tocca di nuovo per confermare';btn.classList.add('reset-pending');
    setTimeout(function(){resetPending=false;btn.textContent='🗑️ Cancella tutti i dati';btn.classList.remove('reset-pending')},3000);
  }else{
    try{if(typeof localStorage!=='undefined')localStorage.removeItem('dc_profiles')}catch(e){}
    currentProfile=null;
    resetPending=false;btn.textContent='✅ Dati cancellati!';btn.classList.remove('reset-pending');
    setTimeout(function(){btn.textContent='🗑️ Cancella tutti i dati';renderProfiles()},1500);
  }
});
document.getElementById('backToProfiles').addEventListener('click',function(){renderProfiles();showScreen('profileScreen')});
document.getElementById('nameInput').addEventListener('input',function(){checkCreateReady()});
document.getElementById('createBtn').addEventListener('click',function(){createProfile()});
document.getElementById('modeClassica').addEventListener('click',function(){startMode('classica')});
document.getElementById('modeBlitz').addEventListener('click',function(){startMode('blitz')});
document.getElementById('modeVeroFalso').addEventListener('click',function(){startMode('verofalso')});
document.getElementById('modeBoss').addEventListener('click',function(){startMode('boss')});
document.getElementById('playAgainBtn').addEventListener('click',function(){goToMenu()});
document.getElementById('backMenuBtn').addEventListener('click',function(){
  var fb=document.getElementById('fbArea');
  if(fb.querySelector('.confirm-exit')){goToMenu();return}
  fb.classList.remove('hidden');
  fb.innerHTML='';
  var box=createEl('div','confirm-exit confirm-exit-box');
  box.appendChild(createEl('div','confirm-exit-title','Vuoi tornare al menù?'));
  var actions=createEl('div','confirm-exit-actions');
  var yesBtn=createEl('button','next-btn confirm-yes-btn','Sì, esci');yesBtn.id='confirmYes';
  var noBtn=createEl('button','next-btn confirm-no-btn','No, continuo!');noBtn.id='confirmNo';
  actions.appendChild(yesBtn);actions.appendChild(noBtn);box.appendChild(actions);fb.appendChild(box);
  document.getElementById('confirmYes').addEventListener('click',function(){goToMenu()});
  document.getElementById('confirmNo').addEventListener('click',function(){fb.classList.add('hidden');fb.innerHTML=''});
});
document.getElementById('showLeaderboard').addEventListener('click',function(){renderLeaderboard();showScreen('lbScreen')});
document.getElementById('showTrophies').addEventListener('click',function(){renderTrophies();showScreen('trophyScreen')});
document.getElementById('switchProfile').addEventListener('click',function(){goToProfiles()});
document.getElementById('lbBack').addEventListener('click',function(){showScreen('modeScreen')});
document.getElementById('trophyBack').addEventListener('click',function(){showScreen('modeScreen')});
