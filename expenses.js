// Expense recording and history
function addExpense(){
  var name=document.getElementById('ex-name').value.trim();
  var cat=document.getElementById('ex-cat').value;
  var amount=parseFloat(document.getElementById('ex-amount').value);
  var date=document.getElementById('ex-date').value||today();
  if(!name)return toast('Enter expense description','error');
  if(!amount||amount<=0)return toast('Enter valid amount','error');
  dbAdd('expenses',{name:name,cat:cat,amount:amount,date:date})
    .then(function(){['ex-name','ex-amount'].forEach(function(id){document.getElementById(id).value='';});toast('✅ Expense recorded: '+name);renderExpenses();renderDashboard();});
}
function renderExpenses(){
  var el=document.getElementById('expense-list');
  dbGetAll('expenses').then(function(items){
    items.sort(function(a,b){return (b.createdAt?b.createdAt.seconds:0)-(a.createdAt?a.createdAt.seconds:0);});
    if(!items.length){el.innerHTML='<div class="empty-state"><div class="empty-img">💸</div><div class="empty-title">No expenses yet</div></div>';return;}
    el.innerHTML=items.map(function(e){
      return '<div class="record-item"><div class="rec-badge bg-r"><i class="fas fa-receipt" style="color:var(--danger)"></i></div><div class="rec-info"><div class="rec-name">'+e.name+'</div><div class="rec-sub"><span class="pill pill-r">'+e.cat+'</span> · '+fmtDate(e.date)+'</div></div><div class="rec-right"><div class="rec-amount col-r">-KSh '+fmt(e.amount)+'</div></div></div>';
    }).join('');
  });
}
