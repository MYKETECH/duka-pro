// Closing stock count vs expected stock discrepancy check
function renderClosingStock(){
  var wrap=document.getElementById('closing-table-wrap'),btnWrap=document.getElementById('closing-btn-wrap');
  Promise.all([dbGetAll('stock'),dbGetAll('sales')]).then(function(res){
    var stock=res[0],sales=res[1];
    if(!stock.length){wrap.innerHTML='<div class="empty-state"><div class="empty-img">📦</div><div class="empty-title">No stock items yet</div></div>';btnWrap.innerHTML='';return;}
    var soldMap={};sales.forEach(function(s){soldMap[s.item]=(soldMap[s.item]||0)+s.qty;});
    wrap.innerHTML='<div class="stbl-wrap"><table class="stbl"><thead><tr><th>Item</th><th>Open</th><th>Sold</th><th>Expected</th><th>Actual</th><th>Status</th></tr></thead><tbody>'+
      stock.map(function(s){var sold=soldMap[s.name]||0,exp=s.qty-sold;return '<tr><td><strong>'+s.name+'</strong></td><td>'+s.qty+'</td><td>'+sold+'</td><td>'+exp+'</td><td><input class="actual-in" type="number" id="act-'+s.id+'" placeholder="'+exp+'" min="0"></td><td id="disc-'+s.id+'">—</td></tr>';}).join('')+
      '</tbody></table></div>';
    btnWrap.innerHTML='<button class="btn btn-primary" onclick="checkDiscrepancy()"><i class="fas fa-search"></i> Check Discrepancies</button>';
  });
}
function checkDiscrepancy(){
  Promise.all([dbGetAll('stock'),dbGetAll('sales')]).then(function(res){
    var stock=res[0],sales=res[1],soldMap={},allOk=true;
    sales.forEach(function(s){soldMap[s.name]=(soldMap[s.name]||0)+s.qty;});
    stock.forEach(function(s){
      var exp=s.qty-(soldMap[s.name]||0);
      var aEl=document.getElementById('act-'+s.id),dEl=document.getElementById('disc-'+s.id);
      if(!aEl||aEl.value==='')return;
      var diff=parseInt(aEl.value)-exp;
      if(diff===0)dEl.innerHTML='<span class="disc-ok"><i class="fas fa-check-circle"></i> OK</span>';
      else{allOk=false;dEl.innerHTML='<span class="disc-bad"><i class="fas fa-exclamation-triangle"></i> '+(diff>0?'+':'')+diff+'</span>';}
    });
    toast(allOk?'✅ All stock matches perfectly!':'⚠️ Discrepancies found — check highlighted items',allOk?'success':'warn');
  });
        }
