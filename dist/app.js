const views=document.querySelectorAll('.view');
const nav=document.querySelectorAll('.nav-link');
nav.forEach(button=>button.addEventListener('click',()=>{nav.forEach(x=>x.classList.remove('active'));button.classList.add('active');views.forEach(x=>x.classList.remove('active-view'));document.getElementById(button.dataset.view).classList.add('active-view');window.scrollTo({top:0,behavior:'smooth'});}));
const question=document.getElementById('question');
const count=document.getElementById('count');
question.addEventListener('input',()=>count.textContent=`${question.value.length} / 500`);
document.querySelectorAll('.chip:not(.add)').forEach(chip=>chip.addEventListener('click',()=>chip.classList.toggle('selected')));
const dialog=document.getElementById('answerDialog');
document.getElementById('askBtn').addEventListener('click',()=>{const text=question.value.trim();document.getElementById('echoQuestion').textContent=text||'How can I make progress on a difficult problem with the resources I have?';dialog.showModal();});
document.querySelector('.close').addEventListener('click',()=>dialog.close());
document.querySelectorAll('[data-rate]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-rate]').forEach(x=>x.classList.remove('chosen'));button.classList.add('chosen');if(button.dataset.rate==='yes'){document.getElementById('feedback').classList.add('hidden');document.getElementById('thanks').classList.remove('hidden')}else{document.getElementById('thanks').classList.add('hidden');document.getElementById('feedback').classList.remove('hidden')}}));
document.getElementById('submitFeedback').addEventListener('click',()=>{document.getElementById('feedback').classList.add('hidden');document.getElementById('thanks').classList.remove('hidden')});
function cappedTags(containerId,countId){const box=document.getElementById(containerId),label=document.getElementById(countId);if(!box)return()=>[];const buttons=[...box.querySelectorAll('button')];const selected=()=>buttons.filter(x=>x.classList.contains('selected')).map(x=>x.dataset.tag);buttons.forEach(button=>button.addEventListener('click',()=>{if(button.classList.contains('selected'))button.classList.remove('selected');else if(selected().length<5)button.classList.add('selected');const n=selected().length;label.textContent=containerId==='filterTags'?`${n} / 5`:`${n} of 5 selected`;buttons.forEach(x=>x.disabled=n>=5&&!x.classList.contains('selected'));if(containerId==='filterTags')filterQuestions()}));return selected}
const getAskTags=cappedTags('askTags','tagCount');
const getFilterTags=cappedTags('filterTags','filterCount');
const search=document.getElementById('searchQuestions');
function filterQuestions(){const query=(search?.value||'').toLowerCase().trim(),tags=getFilterTags();let visible=0;document.querySelectorAll('#questionList article').forEach(card=>{const cardTags=card.dataset.tags.split(','),matchesText=!query||card.dataset.title.includes(query),matchesTags=!tags.length||tags.every(tag=>cardTags.includes(tag));card.classList.toggle('hidden',!(matchesText&&matchesTags));if(matchesText&&matchesTags)visible++});document.getElementById('resultCount').textContent=`${visible} question${visible===1?'':'s'}`;document.getElementById('emptyState').classList.toggle('hidden',visible!==0)}
search?.addEventListener('input',filterQuestions);
document.getElementById('clearSearch')?.addEventListener('click',()=>{search.value='';document.querySelectorAll('#filterTags button.selected').forEach(x=>x.click());filterQuestions()});
document.querySelectorAll('.leaf,.seed').forEach(node=>node.addEventListener('click',()=>document.getElementById('treeNote').textContent=`${node.textContent} — ${node.dataset.note}`));
