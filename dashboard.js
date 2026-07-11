// Daily dashboard summary, weekly chart, low-stock alerts, date navigation
function renderDashboard(){
  var d=dashDate;
  document.getElementById('hero-date-label').textContent=fmtDate(d);
  // Show skeleton on recent sales while loading
  var recentEl=document.getElementById('dash-recent');
  recentEl.innerHTML='<div style="display:flex;flex-direction:column;gap:8px">'+
    [1,2,3].map(function(){return '<div style="background:#fff;border-radius:14px;padding:13px;display:flex;gap:12px;border:1px solid var(--border)"><div style="width:40px;height:40px;border-radius:12px;background:linear-gradient(90deg,#f0eeff 25%,#e8e4ff 50%,#f0eeff 75%);background-size:200% 100%;animation:shimmer 1.4s infinite"></div><div style="flex:1"><div style="height:12px;border-radius:6px;background:linear-gradient(90deg,#f0eeff 25%,#e8e4ff 50%,#f0eeff 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;margin-bottom:8px"></div><div style="height:10px;width:60%;border-radius:6px;background:linear-gradient(90deg,#f0eeff 25%,#e8e4ff 50%,#f0eeff 75%);background-size:200% 100%;animation:shimmer 1.4s infinite"></div></div></div>';}).join('')+
  '</div>';
  Promise.all([dbGetAll('sales'),dbGetAll('expenses'),dbGetAll('stock')]).then(function(res){
    var sales=res[0],expenses=res[1],stock=res[2];
    var dS=sales.filter(function(s){return s.date===d;}),dE=expenses.filter(function(e){return e.date===d;});
    var totalSales=dS.reduce(function(a,s){return a+s.total;},0);
    var mpSales=dS.filter(function(s){return s.payment==='M-Pesa';}).reduce(function(a,s){return a+s.total;},0);
    var cashSales=dS.filter(function(s){return s.payment==='Cash';}).reduce(function(a,s){return a+s.total;},0);
    var totalExp=dE.reduce(function(a,e){return a+e.amount;},0);
    var profit=totalSales-totalExp;
    var stockCount=stock.reduce(function(a,s){return a+s.remaining;},0);

    document.getElementById('h-sales').textContent=fmt(totalSales);
    document.getElementById('h-mpesa').textContent=fmt(mpSales);
    document.getElementById('h-cash').textContent=fmt(cashSales);
    document.getElementById('h-exp').textContent=fmt(totalExp);
    document.getElementById('h-profit-pill').innerHTML='<i class="fas fa-arrow-up"></i> Profit: KSh '+fmt(profit);
    document.getElementById('d-count').textContent=dS.length;
    document.getElementById('d-stock').textContent=stockCount;
    document.getElementById('d-profit').textContent=fmt(profit);
    document.getElementById('d-exp-count').textContent=dE.length;

    // Weekly chart
    renderWeeklyChart(sales);

    // Low stock alerts
    var lowItems=stock.filter(function(s){return s.remaining<=5&&s.remaining>0;});
    var lowEl=document.getElementById('low-stock-section');
    if(lowItems.length){
      lowEl.innerHTML='<div class="sec-title"><i class="fas fa-exclamation-triangle" style="color:var(--danger)"></i> Low Stock Alert</div>'+
        lowItems.map(function(s){return '<div class="low-stock-item"><div class="low-stock-icon"><i class="fas fa-box" style="color:var(--danger)"></i></div><div class="low-stock-name">'+s.name+'</div><div class="low-stock-count">'+s.remaining+' left</div></div>';}).join('');
    } else {lowEl.innerHTML='';}

    // Recent sales
    var el=document.getElementById('dash-recent');
    var recent=dS.slice(-6).reverse();
    if(!recent.length){el.innerHTML='<div class="empty-state"><div class="empty-img">🛍️</div><div class="empty-title">No sales for this day</div><div class="empty-sub">Tap ➕ to record your first sale</div></div>';return;}
    el.innerHTML=recent.map(function(s){return '<div class="record-item"><div class="rec-badge '+(s.payment==='M-Pesa'?'bg-p':'bg-a')+'"><i class="fas '+(s.payment==='M-Pesa'?'fa-mobile-alt':'fa-coins')+'" style="color:'+(s.payment==='M-Pesa'?'var(--p1)':'var(--acc2)')+'"></i></div><div class="rec-info"><div class="rec-name">'+s.item+'</div><div class="rec-sub">'+s.qty+' unit'+(s.qty>1?'s':'')+' · '+s.payment+'</div></div><div class="rec-right"><div class="rec-amount col-g">KSh '+fmt(s.total)+'</div><div class="rec-time">'+s.time+'</div></div></div>';}).join('');
  });
}

function renderWeeklyChart(sales){
  var chartEl=document.getElementById('weekly-chart');
  var labelsEl=document.getElementById('weekly-labels');
  var days=[];
  for(var i=6;i>=0;i--){var dt=new Date();dt.setDate(dt.getDate()-i);days.push(dt.toISOString().split('T')[0]);}
  var totals=days.map(function(d){return sales.filter(function(s){return s.date===d;}).reduce(function(a,s){return a+s.total;},0);});
  var max=Math.max.apply(null,totals)||1;
  chartEl.innerHTML=days.map(function(d,i){
    var h=Math.max(Math.round((totals[i]/max)*72),4);
    var isT=d===today();
    return '<div class="bar-wrap"><div class="bar'+(isT?' today':'')+'" style="height:'+h+'px" title="KSh '+fmt(totals[i])+'"></div></div>';
  }).join('');
  labelsEl.innerHTML=days.map(function(d){return '<div style="flex:1;text-align:center;font-size:9px;color:var(--text3);font-weight:600;font-family:var(--mono)">'+fmtShort(d).slice(0,2)+'</div>';}).join('');
}

function changeDay(d){var dt=new Date(dashDate+'T12:00:00');dt.setDate(dt.getDate()+d);dashDate=dt.toISOString().split('T')[0];document.getElementById('dash-date').value=dashDate;renderDashboard();}
function onDashDateChange(){dashDate=document.getElementById('dash-date').value;renderDashboard();}
function goToday(){dashDate=today();document.getElementById('dash-date').value=dashDate;renderDashboard();}
function changeReportDay(d){var dt=new Date(rptDate+'T12:00:00');dt.setDate(dt.getDate()+d);rptDate=dt.toISOString().split('T')[0];document.getElementById('rpt-date').value=rptDate;renderReport();}
function goReportToday(){rptDate=today();document.getElementById('rpt-date').value=rptDate;renderReport();}
