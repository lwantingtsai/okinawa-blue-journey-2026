const tabs=[...document.querySelectorAll('.day-tab')];
const panels=[...document.querySelectorAll('.day-panel')];

function selectDay(tab,moveFocus=false){
  tabs.forEach(item=>{const active=item===tab;item.classList.toggle('active',active);item.setAttribute('aria-selected',String(active));item.tabIndex=active?0:-1});
  panels.forEach(panel=>{const active=panel.id===tab.dataset.day;panel.classList.toggle('active',active);panel.hidden=!active});
  if(moveFocus)tab.focus();
}

tabs.forEach((tab,index)=>{
  tab.addEventListener('click',()=>selectDay(tab));
  tab.addEventListener('keydown',event=>{
    if(!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();
    let next=index;
    if(event.key==='ArrowLeft')next=(index-1+tabs.length)%tabs.length;
    if(event.key==='ArrowRight')next=(index+1)%tabs.length;
    if(event.key==='Home')next=0;
    if(event.key==='End')next=tabs.length-1;
    selectDay(tabs[next],true);
  });
});

document.querySelectorAll('.check').forEach(button=>button.addEventListener('click',()=>button.setAttribute('aria-pressed',String(button.getAttribute('aria-pressed')!=='true'))));

document.querySelectorAll('.mapcode').forEach(button=>button.addEventListener('click',async()=>{
  const label=button.querySelector('b');
  try{
    await navigator.clipboard.writeText(button.dataset.code);
    button.classList.add('copied');
    label.textContent='已複製';
    window.setTimeout(()=>{button.classList.remove('copied');label.textContent='複製'},1400);
  }catch{
    label.textContent='請長按';
  }
}));
