import React, { useEffect, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { createPortal } from 'react-dom';
import { menu, sections } from './content';
import './style.css';
import WanderingElements from './WanderingElements';
const labels = {menu:'menu','om-os':'om os',gallery:'gallery',events:'events',jobs:'jobs'};
const readSection = () => Object.hasOwn(labels, location.hash.slice(1)) ? location.hash.slice(1) : 'home';
function Awning(){
 return <div className="awning" aria-hidden="true">
  <div className="awning-canopy"/><div className="awning-valance"/>
  <svg className="awning-lights" viewBox="0 0 1440 100" preserveAspectRatio="none">
   <path className="light-cable" d="M0 10 Q720 105 1440 10"/>
   {[90,270,450,630,810,990,1170,1350].map(x=>{
    const y=10+190*(x/1440)*(1-x/1440);
    return <g key={x} transform={`translate(${x} ${y})`}><path className="light-drop" d="M0 0V12"/><rect className="light-socket" x="-5" y="10" width="10" height="10" rx="2"/><ellipse className="light-bulb" cx="0" cy="27" rx="7" ry="10"/></g>
   })}
  </svg>
 </div>
}
function App(){
 const [section,setSection] = useState(readSection);
 const [mobile,setMobile] = useState(()=>window.matchMedia('(max-width:700px)').matches);
 useEffect(()=>{const query=window.matchMedia('(max-width:700px)');const update=()=>setMobile(query.matches);query.addEventListener('change',update);return()=>query.removeEventListener('change',update)},[]);
 const [phase,setPhase] = useState('enter');
 const target = useRef(section);
 const frame = useRef(null);
 useEffect(()=>{
   let timer;
   const update=()=>{
     target.current=readSection();
     if(target.current===section){clearTimeout(timer);setPhase('enter');return;}
     setPhase('exit');
     clearTimeout(timer);
     timer=setTimeout(()=>{
       setSection(target.current);
       if(frame.current) frame.current.scrollTop=0;
       setPhase('enter');
     },window.matchMedia('(prefers-reduced-motion: reduce)').matches?0:260);
   };
   window.addEventListener('hashchange',update);
   return()=>{clearTimeout(timer);window.removeEventListener('hashchange',update)};
 },[section]);
 const nav = keys => <nav aria-label={keys[0]==='menu'?'Café':'Arrangementer'}>{keys.map(key=><a key={key} href={`#${key}`} aria-current={section===key?'page':undefined}>{labels[key]}</a>)}</nav>;
 return <div className={`site ${section==='home'?'home':'inside'}`}>
 <header><a className="logo" href="#" aria-label="Ipsen & Co – forsiden"><img src="/assets/logo.webp" alt="Café Ipsen & Co · God dag & god smag"/></a>
 <div className="primary">{nav(['menu','om-os','gallery'])}</div>
 {section==='home'&&<div className="mobile-awning"><Awning/></div>}
 <div className="hours"><p>åbningstider</p><p>ma - sø<br/>8 - 17.30</p><a href="https://www.google.com/maps?ll=55.676071,12.543777&z=14&t=m&hl=de-DE&gl=US&mapclient=embed&q=Gl.+Kongevej+108+1850+Frederiksberg+D%C3%A4nemark" target="_blank" rel="noreferrer">find vej</a></div>
 <div className="contact"><p>kontakt</p><p>ipsen & co<br/>gammel kongevej 108<br/>1850 frederiksberg.</p><a className="plain" href="mailto:cafe@ipsenogco.dk">cafe@ipsenogco.dk</a></div>
 </header>
 <main id="content" className={section==='home'?'home-frame':undefined} ref={frame} tabIndex={0} aria-label="Café indhold"><div key={section} className={`page page-${section} ${phase}`}>
 {section==='home'&&<><Awning/>{mobile&&createPortal(<div className="home-info"> <div className="hours"><p>åbningstider</p><p>ma - sø<br/>8 - 17.30</p><a href="https://www.google.com/maps?ll=55.676071,12.543777&z=14&t=m&hl=de-DE&gl=US&mapclient=embed&q=Gl.+Kongevej+108+1850+Frederiksberg+D%C3%A4nemark" target="_blank" rel="noreferrer">find vej</a></div>
 <div className="contact"><p>kontakt</p><p>ipsen & co<br/>gammel kongevej 108<br/>1850 frederiksberg.</p><a className="plain" href="mailto:cafe@ipsenogco.dk">cafe@ipsenogco.dk</a></div></div>,document.body)}<WanderingElements elementCount={mobile?7:14} fadeEdge={0} images={[1,2,3,4].map(n=>`/assets/pastry-${n}.png`)} /></>}
 {section==='menu'&&<section className="menu-card" aria-labelledby="menu-title"><h1 id="menu-title">Menu</h1>{menu.map(([name,price,description])=><article className="menu-item" key={name}><div className="menu-item-heading"><h2>{name}</h2><p className="menu-price">{price}</p></div>{description&&<p className="menu-description">{description}</p>}</article>)}</section>}
 {sections[section]&&<div className="copy">{sections[section].map((text,i)=>i===0&&section!=='events'?<h1 key={text}>{text}</h1>:<p key={text}>{text}</p>)}{section==='jobs'&&<><ul><li>Kort ansøgning</li><li>Evt Billede</li><li>Relevant erfaring / CV</li><li>Info om deltid/fuldtid</li></ul><p>Sendes til <a href="mailto:cafe@ipsenogco.dk">Cafe@ipsenogco.dk</a></p></>}</div>}
 {section==='gallery'&&<div className="gallery">{[1,2,3,4,5,6].map(n=><img key={n} src={`/assets/gallery-${n}.${n===2?'jpg':'png'}`} alt={['Detaljer fra caféens indretning','Morgenmad på Ipsen & Co','Caféens udeservering','En hyggelig krog i caféen','Lys og stemning i caféen','Ipsen & Co på Gammel Kongevej'][n-1]} loading="lazy"/>)}</div>}
 </div></main>
 <footer><a href="#events" aria-current={section==='events'?'page':undefined}>events</a><a href="#jobs" aria-current={section==='jobs'?'page':undefined}>jobs</a><a href="https://www.findsmiley.dk/app/552825" target="_blank" rel="noopener noreferrer">smiley</a><a href="mailto:cafe@ipsenogco.dk">cafe@ipsenogco.dk</a><a href="https://www.instagram.com/ipsenogco/" target="_blank" rel="noopener noreferrer">instagram</a></footer>
 </div>
}
const root = import.meta.hot?.data.root ?? createRoot(document.getElementById('root'));
if (import.meta.hot) import.meta.hot.data.root = root;
root.render(<App/>);
