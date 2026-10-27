'use strict';
let language='zh';
const languageNodes=[...document.querySelectorAll('[data-en]')];
languageNodes.forEach(el=>el.dataset.zh=el.innerHTML);
function setLanguage(lang){
 language=lang;document.documentElement.lang=lang==='zh'?'zh-Hant':'en';
 languageNodes.forEach(el=>el.innerHTML=el.dataset[lang]);
 document.querySelector('#lang-zh').setAttribute('aria-pressed',String(lang==='zh'));
 document.querySelector('#lang-en').setAttribute('aria-pressed',String(lang==='en'));
 document.title=lang==='zh'?'SonoMedic 聲援｜醫療科技與臨床創新':'SonoMedic | Medical Technology & Clinical Innovation';
 updateMenuLabel();
 const status=document.querySelector('#download-status');if(status)status.textContent='';
}
document.querySelector('#lang-zh').addEventListener('click',()=>setLanguage('zh'));
document.querySelector('#lang-en').addEventListener('click',()=>setLanguage('en'));
const header=document.querySelector('#site-header'),menu=document.querySelector('#menu-toggle'),nav=document.querySelector('#primary-nav');
function updateMenuLabel(){const open=menu.getAttribute('aria-expanded')==='true';menu.setAttribute('aria-label',language==='zh'?(open?'關閉選單':'開啟選單'):(open?'Close menu':'Open menu'))}
function closeMenu(){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');updateMenuLabel()}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';nav.classList.toggle('open',open);menu.setAttribute('aria-expanded',String(open));updateMenuLabel()});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMenu();menu.focus()}});
window.addEventListener('resize',()=>{if(window.innerWidth>900)closeMenu()});
function onScroll(){const about=document.querySelector('#about');const y=window.scrollY;const end=about?about.getBoundingClientRect().top+y-header.offsetHeight:40;header.classList.toggle('glass',y>40);header.classList.toggle('scrolled',y>Math.max(40,end))}window.addEventListener('scroll',onScroll,{passive:true});window.addEventListener('resize',onScroll);onScroll();
const tabs=[...document.querySelectorAll('.workflow-tab')];
function activateTab(tab){
 tabs.forEach(t=>{const active=t===tab;t.setAttribute('aria-selected',String(active));t.tabIndex=active?0:-1;document.getElementById(t.getAttribute('aria-controls')).hidden=!active});
}
tabs.forEach((tab,index)=>{
 tab.addEventListener('click',()=>activateTab(tab));
 tab.addEventListener('keydown',e=>{
  let next=index;if(e.key==='ArrowDown'||e.key==='ArrowRight')next=(index+1)%tabs.length;
  else if(e.key==='ArrowUp'||e.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
  else if(e.key==='Home')next=0;else if(e.key==='End')next=tabs.length-1;else return;
  e.preventDefault();activateTab(tabs[next]);tabs[next].focus();
 });
});
const sectionLinks=[...nav.querySelectorAll('a')];
const observer=new IntersectionObserver(entries=>{entries.forEach(entry=>{if(entry.isIntersecting){sectionLinks.forEach(a=>a.classList.toggle('active',a.hash==='#'+entry.target.id))}})},{rootMargin:'-15% 0px -55% 0px',threshold:0});
document.querySelectorAll('main>section[id]').forEach(section=>observer.observe(section));
// Native file links preserve the user's click gesture and work without client-side exports.
document.querySelectorAll('[data-download],#download-kit').forEach(link=>{
 link.target='_blank';link.rel='noopener noreferrer';
 link.addEventListener('click',()=>{
  document.querySelector('#download-status').textContent=language==='zh'
   ?'已請求開啟原始檔案。若未自動下載，請在新分頁另存；也可使用下方原圖入口。'
   :'Original file requested. If it does not download automatically, save it from the new tab or use the original-image links below.';
 });
});
