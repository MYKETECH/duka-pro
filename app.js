// App init, sidebar nav, page routing, toast notifications
function initApp(){
  document.getElementById('sb-shop-name').textContent=shopName;
  document.getElementById('sb-shop-email').textContent=currentUser?currentUser.email:'';
  document.getElementById('sb-avatar').textContent=(shopName[0]||'S').toUpperCase();
  document.getElementById('hdr-sub').textContent=fmtDate(today());
  dashDate=today();rptDate=today();
  document.getElementById('dash-date').value=dashDate;
  document.getElementById('rpt-date').value=rptDate;
  var d=today();
  ['st-date','ex-date'].forEach(function(id){var el=document.getElementById(id);if(el)el.value=d;});
  prefillTimes();
  renderDashboard();
  updateBadges();
}
function prefillTimes(){var t=new Date().toTimeString().slice(0,5);['sl-time'].forEach(function(id){var el=document.getElementById(id);if(el)el.value=t;});}

//  SIDEBAR / NAV
function openSidebar(){document.getElementById('sidebar').classList.add('open');document.getElementById('overlay').classList.add('show');}
function closeSidebar(){document.getElementById('sidebar').classList.remove('open');document.getElementById('overlay').classList.remove('show');}
var PAGE_TITLES={dashboard:'Dashboard',history:'History',stock:'Opening Stock',sales:'Record Sale',expenses:'Expenses',closing:'Closing Stock',report:'Daily Report',profile:'My Profile'};
function navigate(page){
  document.querySelectorAll('.page').forEach(function(p){p.classList.remove('active');});
  document.querySelectorAll('.nav-item').forEach(function(n){n.classList.remove('active');});
  document.getElementById('page-'+page).classList.add('active');
  var nav=document.getElementById('nav-'+page);if(nav)nav.classList.add('active');
  document.getElementById('hdr-title').textContent=PAGE_TITLES[page]||page;
  closeSidebar();
  if(page==='dashboard')renderDashboard();
  if(page==='history')renderHistory();
  if(page==='stock'){renderStock();}
  if(page==='sales'){populateItemSelect();renderSales();}
  if(page==='expenses')renderExpenses();
  if(page==='closing')renderClosingStock();
  if(page==='profile')loadProfile();
  if(page==='report')renderReport();
  updateBadges();
}

//  TOAST
function toast(msg,type){
  type=type||'success';
  var t=document.getElementById('toast');
  t.textContent=msg;t.className='toast show '+type;
  setTimeout(function(){t.className='toast';},2800);
}
