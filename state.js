// Shared app state, date/number formatters, splash screen, screen switches
var currentUser=null, shopName='My Shop';
var dashDate=today(), rptDate=today();
var slPayment='M-Pesa';

function today(){return new Date().toISOString().split('T')[0];}
function fmt(n){return Number(n||0).toLocaleString('en-KE',{minimumFractionDigits:2,maximumFractionDigits:2});}
function fmtDate(d){return new Date(d+'T12:00:00').toLocaleDateString('en-KE',{weekday:'short',day:'numeric',month:'short',year:'numeric'});}
function fmtShort(d){return new Date(d+'T12:00:00').toLocaleDateString('en-KE',{weekday:'short'});}

//  SPLASH + SCREEN MANAGEMENT
// Keep splash visible until Firebase restores session
// This prevents the flash of auth screen on refresh
var splashDone=false;
function hideSplash(){
  if(splashDone)return;
  splashDone=true;
  var s=document.getElementById('splash');
  s.classList.add('hidden');
  setTimeout(function(){s.style.display='none';},600);
}
// Fallback — hide splash after 4s no matter what
setTimeout(hideSplash, 4000);

function showAuth(){
  document.getElementById('auth-screen').style.display='flex';
  document.getElementById('app-screen').style.display='none';
}
function showApp(){
  document.getElementById('auth-screen').style.display='none';
  document.getElementById('app-screen').style.display='block';
  startListeners(); // start real-time listeners
  initApp();
}
