// Stock intake, filtering, and rendering
function addStock(){
  var name=document.getElementById('st-name').value.trim();
  var qty=parseInt(document.getElementById('st-qty').value);
  var cat=document.getElementById('st-cat').value;
  var cost=parseFloat(document.getElementById('st-cost').value)||0;
  var sell=parseFloat(document.getElementById('st-sell').value)||0;
  var date=document.getElementById('st-date').value||today();
  if(!name)return toast('Enter item name','error');
  if(!qty||qty<=0)return toast('Enter valid quantity','error');
  dbGetAll('stock').then(function(items){
    var ex=items.find(function(s){return s.name.toLowerCase()===name.toLowerCase();});
    if(ex){
      dbUpdate('stock',ex.id,{qty:ex.qty+qty,remaining:ex.remaining+qty,sell:sell||ex.sell,cost:cost||ex.cost});
      toast('✅ '+name+' quantity updated');
    } else {
      dbAdd('stock',{name:name,qty:qty,remaining:qty,cost:cost,sell:sell,cat:cat,date:date}).then(function(){toast('✅ '+name+' added to inventory');});
    }
    ['st-name','st-qty','st-cost','st-sell'].forEach(function(id){document.getElementById(id).value='';});
    setTimeout(renderStock,500);
  });
}
var stFilter='';
function filterStock(q){stFilter=q.toLowerCase();renderStock();}
function renderStock(){
  var el=document.getElementById('stock-list');
  dbGetAll('stock').then(function(items){
    if(stFilter)items=items.filter(function(s){return s.name.toLowerCase().includes(stFilter);});
    if(!items.length){el.innerHTML='<div class="empty-state"><div class="empty-img">📦</div><div class="empty-title">No stock yet</div><div class="empty-sub">Add your first item above</div></div>';return;}
    el.innerHTML=items.map(function(s){
      var margin=s.cost>0?Math.round(((s.sell-s.cost)/s.cost)*100):0;
      var pct=s.qty>0?Math.round((s.remaining/s.qty)*100):0;
      var progClass=pct>50?'prog-green':pct>20?'prog-amber':'prog-red';
      var lvlColor=s.remaining<=5?'col-r':s.remaining<=15?'col-a':'col-g';
      return '<div class="record-item"><div class="rec-badge bg-p"><i class="fas fa-box" style="color:var(--p1)"></i></div><div class="rec-info"><div class="rec-name">'+s.name+'</div><div class="rec-sub"><span class="pill pill-p">'+s.cat+'</span> &nbsp;Sell: KSh '+fmt(s.sell)+' &nbsp;Margin: '+margin+'%</div><div class="stock-progress"><div class="stock-progress-fill '+progClass+'" style="width:'+pct+'%"></div></div></div><div class="rec-right"><div class="rec-amount '+lvlColor+'">'+s.remaining+'</div><div class="rec-time">of '+s.qty+'</div></div></div>';
    }).join('');
  });
}
