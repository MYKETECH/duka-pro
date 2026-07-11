// Firebase auth state, login/signup/Google/logout, password reset, profile load/save, password change
auth.onAuthStateChanged(function(user){
  hideSplash(); // always hide splash when Firebase responds
  if(user){
    currentUser=user;
    shopName=user.displayName||'My Shop';
    showApp();
    // Load full shop profile in background
    db.collection('shops').doc(user.uid).get()
      .then(function(snap){
        if(snap.exists&&snap.data().shopName){
          shopName=snap.data().shopName;
          var el=document.getElementById('sb-shop-name');
          var av=document.getElementById('sb-avatar');
          if(el)el.textContent=shopName;
          if(av)av.textContent=(shopName[0]||'S').toUpperCase();
        }
      }).catch(function(){});
  } else {
    showAuth();
  }
});

//  AUTH FUNCTIONS
function showAuthTab(tab){
  document.querySelectorAll('.auth-tab').forEach(function(t,i){t.classList.toggle('active',(i===0&&tab==='login')||(i===1&&tab==='signup'));});
  document.getElementById('auth-login').classList.toggle('active',tab==='login');
  document.getElementById('auth-signup').classList.toggle('active',tab==='signup');
}
function doLogin(){
  var email=document.getElementById('login-email').value.trim();
  var pass=document.getElementById('login-pass').value;
  var errEl=document.getElementById('login-err');
  var btn=document.getElementById('login-btn');
  if(!email||!pass){showErr(errEl,'Please fill in all fields');return;}
  btn.innerHTML='<div class="spinner"></div> Signing in…';btn.disabled=true;
  auth.signInWithEmailAndPassword(email,pass)
    .catch(function(e){showErr(errEl,friendlyErr(e.code));btn.innerHTML='<i class="fas fa-sign-in-alt"></i> Sign In to My Shop';btn.disabled=false;});
}
function doSignup(){
  var shop=document.getElementById('signup-shop').value.trim();
  var email=document.getElementById('signup-email').value.trim();
  var pass=document.getElementById('signup-pass').value;
  var phone=document.getElementById('signup-phone').value.trim();
  var errEl=document.getElementById('signup-err');
  var btn=document.getElementById('signup-btn');
  if(!shop||!email||!pass){showErr(errEl,'Shop name, email and password are required');return;}
  if(pass.length<6){showErr(errEl,'Password must be at least 6 characters');return;}
  btn.innerHTML='<div class="spinner"></div> Creating account…';btn.disabled=true;
  auth.createUserWithEmailAndPassword(email,pass)
    .then(function(cred){
      shopName=shop;
      // Update display name — this is fast
      cred.user.updateProfile({displayName:shop});
      // Save shop profile to Firestore in background — don't await
      db.collection('shops').doc(cred.user.uid).set({
        shopName:shop,email:email,phone:phone,
        createdAt:firebase.firestore.FieldValue.serverTimestamp()
      }).catch(function(e){console.warn('Profile save err:',e);});
      // onAuthStateChanged fires automatically and shows app
    })
    .catch(function(e){showErr(errEl,friendlyErr(e.code));btn.innerHTML='<i class="fas fa-rocket"></i> Create My Shop Account';btn.disabled=false;});
}
function doGoogleSignIn(){
  var provider=new firebase.auth.GoogleAuthProvider();
  auth.signInWithPopup(provider)
    .then(function(result){
      var user=result.user;
      db.collection('shops').doc(user.uid).get().then(function(snap){
        if(!snap.exists){db.collection('shops').doc(user.uid).set({shopName:user.displayName||'My Shop',email:user.email,phone:'',createdAt:firebase.firestore.FieldValue.serverTimestamp()});}
      });
    })
    .catch(function(e){toast('Google sign-in failed: '+friendlyErr(e.code),'error');});
}
function doLogout(){auth.signOut();}

function loadProfile(){
  var u=currentUser;
  if(!u)return;
  document.getElementById('profile-avatar').textContent=(shopName[0]||'S').toUpperCase();
  document.getElementById('profile-name').textContent=shopName;
  document.getElementById('profile-email').textContent=u.email||'';
  document.getElementById('prof-shop').value=shopName||'';
  // Load from Firestore
  db.collection('shops').doc(u.uid).get().then(function(snap){
    if(snap.exists){
      var d=snap.data();
      if(d.phone)document.getElementById('prof-phone').value=d.phone;
      if(d.location)document.getElementById('prof-location').value=d.location;
      if(d.type){var sel=document.getElementById('prof-type');for(var i=0;i<sel.options.length;i++){if(sel.options[i].value===d.type){sel.selectedIndex=i;break;}}}
    }
  });
}

function saveProfile(){
  var newName=document.getElementById('prof-shop').value.trim();
  var phone=document.getElementById('prof-phone').value.trim();
  var location=document.getElementById('prof-location').value.trim();
  var type=document.getElementById('prof-type').value;
  if(!newName)return toast('Enter shop name','error');
  var u=currentUser;
  Promise.all([
    u.updateProfile({displayName:newName}),
    db.collection('shops').doc(u.uid).set({shopName:newName,email:u.email,phone:phone,location:location,type:type,updatedAt:firebase.firestore.FieldValue.serverTimestamp()},{merge:true})
  ]).then(function(){
    shopName=newName;
    document.getElementById('sb-shop-name').textContent=newName;
    document.getElementById('sb-avatar').textContent=(newName[0]||'S').toUpperCase();
    document.getElementById('profile-avatar').textContent=(newName[0]||'S').toUpperCase();
    document.getElementById('profile-name').textContent=newName;
    toast('✅ Profile updated successfully!','success');
  }).catch(function(e){toast('Update failed: '+e.message,'error');});
}

function changePassword(){
  var np=document.getElementById('new-pass').value;
  var cp=document.getElementById('confirm-pass').value;
  var msgEl=document.getElementById('pass-msg');
  if(!np||np.length<6){
    msgEl.style.display='block';msgEl.style.background='#FEF2F2';msgEl.style.color='#DC2626';msgEl.style.border='1px solid #FECACA';
    msgEl.textContent='Password must be at least 6 characters';return;
  }
  if(np!==cp){
    msgEl.style.display='block';msgEl.style.background='#FEF2F2';msgEl.style.color='#DC2626';msgEl.style.border='1px solid #FECACA';
    msgEl.textContent='Passwords do not match';return;
  }
  currentUser.updatePassword(np).then(function(){
    msgEl.style.display='block';msgEl.style.background='#ECFDF5';msgEl.style.color='#065F46';msgEl.style.border='1px solid #6EE7B7';
    msgEl.textContent='✅ Password updated successfully!';
    document.getElementById('new-pass').value='';
    document.getElementById('confirm-pass').value='';
    setTimeout(function(){msgEl.style.display='none';},4000);
  }).catch(function(e){
    msgEl.style.display='block';msgEl.style.background='#FEF2F2';msgEl.style.color='#DC2626';msgEl.style.border='1px solid #FECACA';
    msgEl.textContent=e.code==='auth/requires-recent-login'?'Please sign out and sign in again before changing password.':e.message;
  });
}

function doForgotPassword(){
  var email=document.getElementById('login-email').value.trim();
  var errEl=document.getElementById('login-err');
  var successEl=document.getElementById('login-success');
  
  // Hide any previous messages
  errEl.classList.remove('show');
  successEl.style.display='none';

  if(!email){
    showErr(errEl,'Please enter your email address above first, then click Forgot Password.');
    return;
  }

  // Show sending state
  successEl.innerHTML='<i class="fas fa-spinner fa-spin"></i> Sending reset email to <strong>'+email+'</strong>...';
  successEl.style.display='block';
  successEl.style.background='#EFF6FF';
  successEl.style.borderColor='#93C5FD';
  successEl.style.color='#1D4ED8';

  auth.sendPasswordResetEmail(email)
    .then(function(){
      successEl.innerHTML='<i class="fas fa-check-circle" style="color:#10B981"></i> <strong>Reset email sent!</strong><br>We sent a password reset link to <strong>'+email+'</strong>.<br><span style="font-size:11px;opacity:.8">Check your inbox and spam folder. Link expires in 1 hour.</span>';
      successEl.style.background='#ECFDF5';
      successEl.style.borderColor='#6EE7B7';
      successEl.style.color='#065F46';
      successEl.style.display='block';
    })
    .catch(function(e){
      successEl.style.display='none';
      showErr(errEl,friendlyErr(e.code));
    });
}

function togglePass(inputId, iconId){
  var input=document.getElementById(inputId);
  var icon=document.getElementById(iconId);
  if(input.type==='password'){
    input.type='text';
    icon.className='fas fa-eye-slash';
    icon.style.color='var(--p1)';
  } else {
    input.type='password';
    icon.className='fas fa-eye';
    icon.style.color='var(--text3)';
  }
}
function showErr(el,msg){el.textContent=msg;el.classList.add('show');setTimeout(function(){el.classList.remove('show');},4000);}
function friendlyErr(code){
  var m={'auth/user-not-found':'No account found with this email.','auth/wrong-password':'Incorrect password. Try again.','auth/email-already-in-use':'Email already registered. Sign in instead.','auth/invalid-email':'Please enter a valid email address.','auth/network-request-failed':'Network error. Check your connection.','auth/too-many-requests':'Too many attempts. Please wait a moment.'};
  return m[code]||'Something went wrong. Please try again.';
}
