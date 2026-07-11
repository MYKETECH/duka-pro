// Sale recording, item select, payment toggle, sales history
function populateItemSelect(){
  dbGetAll('stock').then(function(items){
    var sel=document.getElementById('sl-item');
    var cur=sel.value;
    sel.innerHTML='<option value="">— Choose item from stock —</option>'+
      items.filter(function(s){return s.remaining>0;}).map(function(s){return '<option value="'+s.id+'" data-name="'+s.name+'" data-sell="'+s.sell+'" data-cost="'+s.cost+'">'+s.name+' ('+s.remaining+' left) — KSh '+fmt(s.sell)+'</option>';}).join('');
    sel.value=cur;
  });
}
function fillSellPrice(){
  var opt=document.getElementById('sl-item').selectedOptions[0];
  if(opt&&opt.dataset.sell){document.getElementById('sl-price').value=opt.dataset.sell;calcTotal();}
}
function calcTotal(){
  var qty=parseFloat(document.getElementById('sl-qty').value)||0;
  var price=parseFloat(document.getElementById('sl-price').value)||0;
  document.getElementById('sl-total').textContent='KSh '+fmt(qty*price);
}
document.addEventListener('input',function(e){if(e.target.id==='sl-qty'||e.target.id==='sl-price')calcTotal();});

function setPayment(p){
  slPayment=p;
  document.getElementById('pay-mpesa').classList.toggle('active',p==='M-Pesa');
  document.getElementById('pay-cash').classList.toggle('active',p==='Cash');
}
var salesFilter='all';
function setFilter(f){
  salesFilter=f;
  document.querySelectorAll('.chip').forEach(function(c){c.classList.remove('active');});
  document.getElementById('chip-'+(f==='M-Pesa'?'mpesa':f==='Cash'?'cash':'all')).classList.add('active');
  renderSales();
}
function addSale(){
  var sel=document.getElementById('sl-item');
  var stockId=sel.value;
  var itemName=sel.selectedOptions[0]?sel.selectedOptions[0].dataset.name:'';
  var itemCost=parseFloat(sel.selectedOptions[0]?sel.selectedOptions[0].dataset.cost:0)||0;
  var qty=parseInt(document.getElementById('sl-qty').value);
  var price=parseFloat(document.getElementById('sl-price').value);
  var time=document.getElementById('sl-time').value||new Date().toTimeString().slice(0,5);
  var phone=document.getElementById('sl-phone').value.trim();
  if(!stockId)return toast('Select an item','error');
  if(!qty||qty<1)return toast('Enter quantity','error');
  if(!price||price<1)return toast('Enter price','error');
  dbGetAll('stock').then(function(stocks){
    var stock=stocks.find(function(s){return s.id===stockId;});
    if(!stock)return toast('Item not found in stock','error');
    if(stock.remaining<qty)return toast('Only '+stock.remaining+' units left!','error');
    var total=qty*price;
    var profit=(price-itemCost)*qty;
    dbAdd('sales',{item:itemName,stockId:stockId,qty:qty,price:price,total:total,profit:profit,payment:slPayment,time:time,phone:phone,date:today()})
      .then(function(){
        dbUpdate('stock',stockId,{remaining:stock.remaining-qty});
        ['sl-qty','sl-phone'].forEach(function(id){document.getElementById(id).value='';});
        document.getElementById('sl-item').value='';
        document.getElementById('sl-total').textContent='KSh 0.00';
        prefillTimes();populateItemSelect();
        toast('✅ '+qty+'× '+itemName+' — KSh '+fmt(total));
        renderSales();renderDashboard();updateBadges();
      });
  });
}
function renderSales(){
  var el=document.getElementById('sales-list');
  var q=(document.getElementById('sales-search')?document.getElementById('sales-search').value:'').toLowerCase();
  dbGetAll('sales').then(function(items){
    items.sort(function(a,b){return (b.createdAt?b.createdAt.seconds:0)-(a.createdAt?a.createdAt.seconds:0);});
    if(salesFilter!=='all')items=items.filter(function(s){return s.payment===salesFilter;});
    if(q)items=items.filter(function(s){return s.item.toLowerCase().includes(q)||(s.phone&&s.phone.includes(q));});
    if(!items.length){el.innerHTML='<div class="empty-state"><div class="empty-img">🧾</div><div class="empty-title">No sales found</div><div class="empty-sub">Record your first sale above</div></div>';return;}
    el.innerHTML=items.map(function(s){
      return '<div class="record-item"><div class="rec-badge '+(s.payment==='M-Pesa'?'bg-p':'bg-a')+'"><i class="fas '+(s.payment==='M-Pesa'?'fa-mobile-alt':'fa-coins')+'" style="color:'+(s.payment==='M-Pesa'?'var(--p1)':'var(--acc2)')+'"></i></div><div class="rec-info"><div class="rec-name">'+s.item+' <span class="pill '+(s.payment==='M-Pesa'?'pill-p':'pill-a')+'">'+s.payment+'</span></div><div class="rec-sub">'+s.qty+' unit'+(s.qty>1?'s':'')+' @ KSh '+fmt(s.price)+(s.phone?' · '+s.phone:'')+' · '+s.date+'</div></div><div class="rec-right"><div class="rec-amount col-g">KSh '+fmt(s.total)+'</div><div class="rec-time">'+s.time+'</div></div></div>';
    }).join('');
  });
}
