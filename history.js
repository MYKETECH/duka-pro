// Day-by-day history list
function renderHistory(){
  var el=document.getElementById('history-list');
  Promise.all([dbGetAll('sales'),dbGetAll('expenses')]).then(function(res){
    var sales=res[0],expenses=res[1];
    var allDates=sales.map(function(s){return s.date;}).concat(expenses.map(function(e){return e.date;}));
    var days=[...new Set(allDates)].sort().reverse();
    if(!days.length){el.innerHTML='<div class="empty-state"><div class="empty-img">🗓️</div><div class="empty-title">No history yet</div><div class="empty-sub">Each day you record sales will appear here</div></div>';return;}
    el.innerHTML=days.map(function(d){
      var dS=sales.filter(function(s){return s.date===d;}),dE=expenses.filter(function(e){return e.date===d;});
      var ts=dS.reduce(function(a,s){return a+s.total;},0),te=dE.reduce(function(a,e){return a+e.amount;},0);
      var isT=d===today();
      return '<div class="history-day" id="hday-'+d+'"><div class="history-head" onclick="toggleHistory(\''+d+'\')"><div class="history-ico">'+(isT?'⭐':'📅')+'</div><div><div class="history-date">'+fmtDate(d)+(isT?' <span class="pill pill-g">Today</span>':'')+'</div><div class="history-meta">'+dS.length+' sale'+(dS.length!==1?'s':'')+' · '+dE.length+' expense'+(dE.length!==1?'s':'')+'</div></div><div class="history-sales">KSh '+fmt(ts)+'</div><div class="history-arrow"><i class="fas fa-chevron-down"></i></div></div><div class="history-body"><div class="hstat-row"><div class="hstat"><div class="hstat-l"><i class="fas fa-shopping-bag"></i> Sales</div><div class="hstat-v col-g">KSh '+fmt(ts)+'</div></div><div class="hstat"><div class="hstat-l"><i class="fas fa-receipt"></i> Expenses</div><div class="hstat-v col-r">KSh '+fmt(te)+'</div></div><div class="hstat"><div class="hstat-l"><i class="fas fa-chart-line"></i> Profit</div><div class="hstat-v col-p">KSh '+fmt(ts-te)+'</div></div></div><div class="hbody-actions"><button class="btn btn-primary btn-sm" onclick="viewDay(\''+d+'\')"><i class="fas fa-chart-bar"></i> View Day</button><button class="btn btn-outline btn-sm" onclick="exportDayPDF(\''+d+'\')"><i class="fas fa-download"></i> PDF</button></div></div></div>';
    }).join('');
  });
}
function toggleHistory(d){var el=document.getElementById('hday-'+d);if(el)el.classList.toggle('open');}
function viewDay(d){dashDate=d;document.getElementById('dash-date').value=d;navigate('dashboard');}
