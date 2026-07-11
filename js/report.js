// Daily report view, PDF export, and day-data deletion
function renderReport(){
  var d=rptDate;
  document.getElementById('rpt-date-label').textContent=fmtDate(d);
  Promise.all([dbGetAll('sales'),dbGetAll('expenses'),dbGetAll('stock')]).then(function(res){
    var sales=res[0],expenses=res[1],stock=res[2];
    var dS=sales.filter(function(s){return s.date===d;}),dE=expenses.filter(function(e){return e.date===d;});
    var total=dS.reduce(function(a,s){return a+s.total;},0);
    var mpSales=dS.filter(function(s){return s.payment==='M-Pesa';}).reduce(function(a,s){return a+s.total;},0);
    var cashSales=dS.filter(function(s){return s.payment==='Cash';}).reduce(function(a,s){return a+s.total;},0);
    var totalExp=dE.reduce(function(a,e){return a+e.amount;},0);
    var profit=total-totalExp;
    document.getElementById('rpt-net').textContent='KSh '+fmt(profit);
    document.getElementById('rpt-total').textContent='KSh '+fmt(total);
    document.getElementById('rpt-mpesa').textContent='KSh '+fmt(mpSales);
    document.getElementById('rpt-cash').textContent='KSh '+fmt(cashSales);
    document.getElementById('rpt-exp').textContent='KSh '+fmt(totalExp);
    document.getElementById('rpt-profit').textContent='KSh '+fmt(profit);
    var soldMap={};sales.forEach(function(s){soldMap[s.item]=(soldMap[s.item]||0)+s.qty;});
    var rptStock=document.getElementById('rpt-stock');
    if(!stock.length){rptStock.innerHTML='<div class="empty-state"><div class="empty-img">📦</div><div class="empty-title">No stock data</div></div>';return;}
    rptStock.innerHTML=stock.map(function(s){return '<div class="sum-row"><div class="sum-key"><i class="fas fa-box"></i> '+s.name+'</div><div class="sum-val">'+s.remaining+' <span style="color:var(--text3);font-size:11px;font-weight:500">left (sold '+(soldMap[s.name]||0)+')</span></div></div>';}).join('');
  });
}

//  PDF EXPORT
function buildPDF(d){
  Promise.all([dbGetAll('sales'),dbGetAll('expenses'),dbGetAll('stock')]).then(function(res){
    var sales=res[0],expenses=res[1],stock=res[2];
    var dS=sales.filter(function(s){return s.date===d;}),dE=expenses.filter(function(e){return e.date===d;});
    var total=dS.reduce(function(a,s){return a+s.total;},0),totalExp=dE.reduce(function(a,e){return a+e.amount;},0);
    var soldMap={};sales.forEach(function(s){soldMap[s.item]=(soldMap[s.item]||0)+s.qty;});
    var sRows=dS.length?dS.map(function(s){return '<tr><td>'+s.item+'</td><td>'+s.qty+'</td><td>'+fmt(s.price)+'</td><td>'+s.payment+'</td><td>'+s.time+'</td><td style="color:#10B981;font-weight:700">'+fmt(s.total)+'</td></tr>';}).join(''):'<tr><td colspan="6" style="color:#9CA3AF;text-align:center;padding:16px">No sales recorded</td></tr>';
    var stRows=stock.length?stock.map(function(s){return '<tr><td>'+s.name+'</td><td>'+s.qty+'</td><td>'+(soldMap[s.name]||0)+'</td><td>'+s.remaining+'</td></tr>';}).join(''):'<tr><td colspan="4" style="color:#9CA3AF;text-align:center;padding:16px">No stock data</td></tr>';
    var eRows=dE.length?dE.map(function(e){return '<tr><td>'+e.name+'</td><td>'+e.cat+'</td><td style="color:#EF4444;font-weight:700">'+fmt(e.amount)+'</td></tr>';}).join(''):'<tr><td colspan="3" style="color:#9CA3AF;text-align:center;padding:16px">No expenses</td></tr>';
    var html='<!DOCTYPE html><html><head><title>DukaPro Report</title><meta charset="UTF-8"><style>*{box-sizing:border-box;}body{font-family:Arial,sans-serif;padding:32px;color:#1A1A3E;max-width:700px;margin:0 auto;font-size:13px;background:#fff;}h1{font-size:24px;font-weight:900;color:#6C3CE1;margin-bottom:2px;}.brand{display:flex;align-items:center;gap:10px;margin-bottom:6px;}.sub{color:#6B7280;font-size:11px;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #6C3CE1;}.section{margin-bottom:20px;}h3{font-size:13px;font-weight:800;color:#1A1A3E;border-bottom:1px solid #E5E7EB;padding-bottom:6px;margin-bottom:10px;text-transform:uppercase;letter-spacing:.5px;}table{width:100%;border-collapse:collapse;margin-bottom:4px;}th{background:#6C3CE1;color:#fff;padding:8px 10px;text-align:left;font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:.5px;}td{padding:8px 10px;border-bottom:1px solid #F3F4F6;font-size:12px;}.summary-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:20px;}.sum-box{padding:14px;border-radius:10px;border:1px solid #E5E7EB;}.sum-box-label{font-size:10px;color:#6B7280;font-weight:700;text-transform:uppercase;}.sum-box-val{font-size:20px;font-weight:900;margin-top:4px;}.net-box{grid-column:1/-1;background:#F5F3FF;border-color:#6C3CE1;}.net-val{color:#6C3CE1;font-size:28px !important;}@media print{body{padding:20px;}}</style></head><body>';
    html+='<div class="brand"><div style="width:40px;height:40px;background:#6C3CE1;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:20px">🛒</div><div><div class="brand" style="gap:0"><h1>DukaPro</h1></div><div style="font-size:11px;color:#6B7280;">Smart Shop Platform · Kenya</div></div></div>';
    html+='<div class="sub">Shop: <strong>'+shopName+'</strong> &nbsp;|&nbsp; Date: <strong>'+fmtDate(d)+'</strong> &nbsp;|&nbsp; Generated: '+new Date().toLocaleString('en-KE')+'</div>';
    html+='<div class="summary-grid"><div class="sum-box"><div class="sum-box-label">Total Sales</div><div class="sum-box-val" style="color:#10B981">KSh '+fmt(total)+'</div></div><div class="sum-box"><div class="sum-box-label">Total Expenses</div><div class="sum-box-val" style="color:#EF4444">KSh '+fmt(totalExp)+'</div></div><div class="sum-box net-box"><div class="sum-box-label">Net Balance</div><div class="sum-box-val net-val">KSh '+fmt(total-totalExp)+'</div></div></div>';
    html+='<div class="section"><h3>Sales ('+dS.length+')</h3><table><tr><th>Item</th><th>Qty</th><th>Price</th><th>Payment</th><th>Time</th><th>Total</th></tr>'+sRows+'</table></div>';
    html+='<div class="section"><h3>Stock</h3><table><tr><th>Item</th><th>Opening</th><th>Sold</th><th>Remaining</th></tr>'+stRows+'</table></div>';
    html+='<div class="section"><h3>Expenses ('+dE.length+')</h3><table><tr><th>Description</th><th>Category</th><th>Amount</th></tr>'+eRows+'</table></div>';
    html+='<script>window.onload=function(){window.print();};<\/script></body></html>';
    var w=window.open('','_blank');
    if(w){w.document.write(html);w.document.close();}
    else toast('Allow popups to export PDF','warn');
  });
}
function exportPDF(){buildPDF(rptDate||today());}
function exportDayPDF(d){buildPDF(d);}

function clearDayData(){
  if(!confirm('Clear ALL data for '+fmtDate(rptDate)+'? This cannot be undone.'))return;
  var d=rptDate;
  toast('Deleting data...','warn');
  var toDelete=[];
  (_data.sales||[]).filter(function(s){return s.date===d;}).forEach(function(s){toDelete.push(db.collection('sales').doc(s.id).delete());});
  (_data.expenses||[]).filter(function(e){return e.date===d;}).forEach(function(e){toDelete.push(db.collection('expenses').doc(e.id).delete());});
  Promise.all(toDelete).then(function(){
    toast('✅ All data for '+fmtDate(d)+' deleted!','success');
    renderReport();renderDashboard();
  }).catch(function(e){toast('Delete failed. Try again.','error');console.error(e);});
      }
