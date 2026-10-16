const {chromium}=require('playwright');
const fs=require('fs');
(async()=>{
const browser=await chromium.launch({executablePath:'/home/shun/.cache/ms-playwright/chromium-1234/chrome-linux64/chrome',args:['--no-sandbox']});
let failures=0;const results=[];
for(const width of [1440,390]){
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'});
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
 const report=await page.evaluate(()=>{
  const sections=[...document.querySelectorAll('main>section')];
  const global=document.querySelector('.journey-route');
  function pt(path,len){const p=path.getPointAtLength(len);return new DOMPoint(p.x,p.y).matrixTransform(path.getScreenCTM());}
  if(global){
   const bounds=global.getBoundingClientRect();
   const first=pt(global,0),last=pt(global,global.getTotalLength());
   const route=global.closest('svg');
   return {shared:true,pathCount:route.querySelectorAll('path[data-route]').length,first:{x:first.x,y:first.y},last:{x:last.x,y:last.y},pageBottom:document.querySelector('#contact').getBoundingClientRect().bottom,crossings:sections.slice(1).map(section=>{const y=section.getBoundingClientRect().top;let lo=0,hi=global.getTotalLength();for(let i=0;i<30;i++){const m=(lo+hi)/2;if(pt(global,m).y<y)lo=m;else hi=m;}const p=pt(global,(lo+hi)/2);return {section:section.id,y,x:p.x,gap:Math.abs(p.y-y)}}),transformed:!!global.closest('[data-depth]'),viewportWidth:innerWidth};
  }
  const routes=sections.map(section=>{
   const svg=[...section.querySelectorAll('.scene-svg')].find(e=>getComputedStyle(e).display!=='none');
   const path=svg&&[...svg.querySelectorAll('path')].find(e=>['#f9faf1','#ecece0','#d5e0d9'].includes(e.getAttribute('stroke')));
   if(!path)return {section:section.id||section.className,missing:true};
   let a=pt(path,0),b=pt(path,path.getTotalLength());if(a.y>b.y)[a,b]=[b,a];return {section:section.id||section.className,start:{x:a.x,y:a.y},end:{x:b.x,y:b.y}};
  });
  return {shared:false,routes,gaps:routes.slice(0,-1).map((r,i)=>{const n=routes[i+1];return r.missing||n.missing?{at:n.section,missing:true}:{at:n.section,gap:Math.hypot(r.end.x-n.start.x,r.end.y-n.start.y)}})};
 });
 let bad;
 if(report.shared){bad=report.crossings.some(x=>x.gap>1||x.x<0||x.x>width)||report.last.y<report.pageBottom-3||report.transformed;}
 else bad=report.gaps.some(x=>x.missing||x.gap>8);
 results.push({width,pass:!bad,...report});if(bad)failures++;
 if(process.env.CAPTURE_BEFORE || process.env.CAPTURE_AFTER){
  for(const id of ['skills','project_header','about','contact']){await page.locator('#'+id).evaluate(e=>scrollTo({top:e.offsetTop-350,behavior:'instant'}));await page.screenshot({path:`/home/shun/Desktop/ZShunRen.github.io/.impeccable/review/route-${process.env.CAPTURE_AFTER?'after':'before'}-${width}-${id}.png`});}
 }
 await page.close();
}
console.log(JSON.stringify(results,null,2));fs.writeFileSync('/home/shun/Desktop/ZShunRen.github.io/.impeccable/review/route-checks.json',JSON.stringify(results,null,2));await browser.close();process.exit(failures?1:0);
})().catch(e=>{console.error(e);process.exit(1)});
