/* SonoMedic motion layer: smooth inertial scroll + scroll-scrubbed scenes. */
(function(){
'use strict';
var root=document.documentElement;
var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce)return;                       // static, fully readable page
root.classList.add('motion-ready');

/* 1. Viscous scroll on wheel and on touch, so a finger coast matches the desktop. */
var lenis=null;
if(window.Lenis){
 lenis=new window.Lenis({lerp:.075,wheelMultiplier:.9,smoothWheel:true,syncTouch:true,syncTouchLerp:.06,touchMultiplier:1.05,anchors:{offset:-84}});
 window.__sonoLenis=lenis;
}
function clamp(v,a,b){return v<a?a:v>b?b:v}
var vh=window.innerHeight;

/* 2. Scenes: each maps scroll position → 0..1 progress written to a CSS variable. */
var heroTrack=document.querySelector('.hero-track');
var about=document.querySelector('.about');
var fills=[].slice.call(document.querySelectorAll('.fill-text'));
var solution=document.querySelector('.solution');
var stepsBar=document.querySelector('.steps-progress');
var roadmap=document.querySelector('.roadmap');
var contactH=document.querySelector('.contact h2');
var tabs=[].slice.call(document.querySelectorAll('.workflow-tab'));
var pinQuery=window.matchMedia('(min-width:901px) and (min-height:740px), (max-width:900px)');
var geo={};
function top(el){var t=0;while(el){t+=el.offsetTop;el=el.offsetParent}return t}
function measure(){
 vh=window.innerHeight;
 root.classList.toggle('steps-pinned',pinQuery.matches&&!!solution);
 var heroPinned=heroTrack&&heroTrack.offsetHeight>vh*1.5;
 geo.hero=heroTrack?{s:top(heroTrack),r:heroPinned?heroTrack.offsetHeight-vh:Math.max(1,heroTrack.offsetHeight)}:null;
 geo.about=about?{s:top(about)-vh,r:vh}:null;
 geo.fills=fills.map(function(f){return{s:top(f)-vh*.88,r:vh*.5}});
 geo.sol=solution?{s:top(solution),r:Math.max(1,solution.offsetHeight-vh)}:null;
 geo.road=roadmap?{s:top(roadmap)-vh*.9,r:vh*.55}:null;
 geo.contact=contactH?{s:top(contactH)-vh,r:vh*.55}:null;
 geo.doc=Math.max(1,document.documentElement.scrollHeight-vh);
}
function prog(g,y){return g?clamp((y-g.s)/g.r,0,1):1}

var current=-1,programmatic=false;
function setStep(i){
 if(i===current)return;current=i;
 tabs.forEach(function(t,k){var on=k===i;t.setAttribute('aria-selected',String(on));t.tabIndex=on?0:-1;
  var panel=document.getElementById(t.getAttribute('aria-controls'));if(panel)panel.hidden=!on});
}
function stepTarget(i){return geo.sol.s+geo.sol.r*((i+.5)/tabs.length)}
tabs.forEach(function(t,i){
 t.addEventListener('click',function(){
  if(!root.classList.contains('steps-pinned')||!geo.sol)return;
  programmatic=true;current=i;
  if(lenis)lenis.scrollTo(stepTarget(i),{duration:1.2,onComplete:function(){programmatic=false}});
  else{window.scrollTo({top:stepTarget(i),behavior:'smooth'});setTimeout(function(){programmatic=false},900)}
 });
});

var lastY=-1;
function frame(){
 var y=window.scrollY;
 if(y!==lastY){
  lastY=y;
  root.style.setProperty('--scroll',(y/geo.doc).toFixed(4));
  if(heroTrack)heroTrack.style.setProperty('--p',prog(geo.hero,y).toFixed(4));
  if(about)about.style.setProperty('--a',prog(geo.about,y).toFixed(4));
  fills.forEach(function(f,k){f.style.setProperty('--fill',prog(geo.fills[k],y).toFixed(4))});
  if(roadmap)roadmap.style.setProperty('--line',prog(geo.road,y).toFixed(4));
  if(contactH)contactH.style.setProperty('--c',prog(geo.contact,y).toFixed(4));
  if(root.classList.contains('steps-pinned')&&geo.sol){
   var sp=prog(geo.sol,y);
   if(stepsBar)stepsBar.style.setProperty('--sp',sp.toFixed(4));
   if(!programmatic)setStep(Math.min(tabs.length-1,Math.floor(sp*tabs.length)));
  }
 }
}
function loop(time){if(lenis)lenis.raf(time);frame();requestAnimationFrame(loop)}

/* 3. Reveal-on-enter with stagger. */
var groups=['.solution .section-heading','.validation .section-heading','.roadmap article','.evidence-note','.team .section-heading','.team-list article','.brand-section .section-heading','.brand-preview','.download-list>div','.brand-foot','.faq-layout>div:first-child','.faq-list details','.contact-inner>.eyebrow','.contact-inner>p','.partnership-grid article','.about-copy>.eyebrow','.visual-values>div','.footer-top'];
var seen=[];
groups.forEach(function(sel){[].slice.call(document.querySelectorAll(sel)).forEach(function(el,i){
 if(seen.indexOf(el)>-1)return;seen.push(el);el.setAttribute('data-reveal','');el.style.setProperty('--i',i%6)})});
if('IntersectionObserver' in window){
 var io=new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting){e.target.classList.add('is-in');io.unobserve(e.target)}})},{rootMargin:'0px 0px -12% 0px',threshold:.08});
 seen.forEach(function(el){io.observe(el)});
}else seen.forEach(function(el){el.classList.add('is-in')});

measure();
window.addEventListener('resize',function(){measure();lastY=-1;if(lenis)lenis.resize()});
window.addEventListener('load',function(){measure();lastY=-1});
if(document.fonts&&document.fonts.ready)document.fonts.ready.then(function(){measure();lastY=-1});
pinQuery.addEventListener&&pinQuery.addEventListener('change',function(){measure();lastY=-1});
requestAnimationFrame(loop);
})();
