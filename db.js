// Real-time Firestore listeners + CRUD helpers + sidebar badge counts
var _data={stock:[],sales:[],expenses:[]};
var _listeners=[];

function startListeners(){
  // Stop any existing listeners
  _listeners.forEach(function(u){u();});
  _listeners=[];

  ['stock','sales','expenses'].forEach(function(col){
    var unsub=db.collection(col)
      .where('uid','==',currentUser.uid)
      .onSnapshot(function(snap){
        _data[col]=snap.docs.map(function(d){return Object.assign({id:d.id},d.data());});
        // Auto-refresh current page when data changes
        var active=document.querySelector('.page.active');
        if(active){
          var page=active.id.replace('page-','');
          if(page==='dashboard')renderDashboard();
          if(page==='stock')renderStock();
          if(page==='sales')renderSales();
          if(page==='expenses')renderExpenses();
          if(page==='closing')renderClosingStock();
  if(page==='profile')loadProfile();
          if(page==='report')renderReport();
          if(page==='history')renderHistory();
        }
        updateBadges();
      },function(e){console.warn('Listener err:',col,e);});
    _listeners.push(unsub);
  });
}

function dbGetAll(col){
  return Promise.resolve(_data[col]||[]);
}

function dbAdd(col,data){
  var rec=Object.assign({},data,{uid:currentUser.uid,createdAt:firebase.firestore.FieldValue.serverTimestamp()});
  return db.collection(col).add(rec)
    .then(function(r){return r.id;})
    .catch(function(e){toast('Save failed. Check your connection.','error');console.error(e);return null;});
}

function dbUpdate(col,id,data){
  return db.collection(col).doc(id).update(data)
    .catch(function(e){console.warn('Update err:',e);});
}

function dbDelete(col,id){
  return db.collection(col).doc(id).delete()
    .catch(function(e){console.warn('Delete err:',e);});
}

//  BADGES
function updateBadges(){
  dbGetAll('sales').then(function(s){
    document.getElementById('nb-sales').textContent=s.filter(function(x){return x.date===today();}).length;
    var days=[...new Set(s.map(function(x){return x.date;}))].length;
    document.getElementById('nb-days').textContent=days;
  });
}
