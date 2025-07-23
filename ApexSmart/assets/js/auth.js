document.addEventListener('DOMContentLoaded', function() {
  initAuth();
  initLoginForm();
  initSignupForm();
  initPasswordReset();
  initSocialAuth();
  initAuthState();
});

// Initialize authentication
function initAuth() {
  console.log('Auth module initialized');
  
  // Handle auth state changes
  firebase.auth().onAuthStateChanged(user => {
    handleAuthStateChange(user);
  });
  
  // Initialize theme based on user preference
  initThemeFromAuth();
}

// Handle authentication state changes
function handleAuthStateChange(user) {
  const loginLink = document.querySelector('a[href="login.html"]');
  const createPostLink = document.querySelector('a[href="create.html"]');
  const dashboardLink = document.querySelector('a[href="admin.html"]');
  
  if (user) {
    // User is signed in
    console.log('User signed in:', user.email);
    
    // Update UI for authenticated user
    if (loginLink) {
      loginLink.textContent = 'Dashboard';
      loginLink.href = 'admin.html';
    }
    
    if (createPostLink) {
      createPostLink.classList.remove('hidden');
    }
    
    // Set up user data in Firestore if it doesn't exist
    setupUserData(user);
    
    // Track sign-in event
    trackAuthEvent('sign_in', user.email);
  } else {
    // User is signed out
    console.log('User signed out');
    
    // Update UI for unauthenticated user
    if (loginLink) {
      loginLink.textContent = 'Login';
      loginLink.href = 'login.html';
    }
    
    if (createPostLink) {
      createPostLink.classList.add('hidden');
    }
    
    // Redirect from protected pages
    const protectedPages = ['create.html', 'admin.html', 'profile.html'];
    const currentPage = window.location.pathname.split('/').pop();
    
    if (protectedPages.includes(currentPage)) {
      window.location.href = 'login.html';
    }
  }
}

// Set up user data in Firestore
async function setupUserData(user) {
  try {
    const userRef = firebase.firestore().collection('users').doc(user.uid);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      // Create new user document
      await userRef.set({
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || user.email.split('@')[0],
        photoURL: user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || user.email.split('@')[0])}&background=6366f1&color=fff`,
        createdAt: firebase.firestore.FieldValue.serverTimestamp(),
        updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
        role: 'member', // default role
        settings: {
          theme: 'system',
          notifications: {
            email: true,
            push: false
          },
          bio: '',
          location: '',
          website: '',
          socialLinks: {
            twitter: '',
            instagram: '',
            linkedin: ''
          }
        },
        stats: {
          posts: 0,
          comments: 0,
          likesGiven: 0,
          likesReceived: 0
        }
      });
      
      console.log('User data created successfully');
    }
  } catch (error) {
    console.error('Error setting up user data:', error);
  }
}

// Initialize login form
function initLoginForm() {
  const loginForm = document.querySelector('form.login-form');
  
  if (loginForm) {
    loginForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = this.email.value.trim();
      const password = this.password.value.trim();
      const rememberMe = this['remember-me'].checked;
      
      // Basic validation
      if (!email || !password) {
        showAuthError('Please fill in all fields');
        return;
      }
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i> Signing in...';
      submitBtn.disabled = true;
      
      try {
        // Sign in with email and password
        const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
        
        // Remember me functionality
        if (rememberMe) {
          localStorage.setItem('rememberedUser', email);
        } else {
          localStorage.removeItem('rememberedUser');
        }
        
        // Track successful login
        trackAuthEvent('login_success', email);
        
        // Redirect based on user role
        const user = userCredential.user;
        const userDoc = await firebase.firestore().collection('users').doc(user.uid).get();
        
        if (userDoc.exists) {
          const userData = userDoc.data();
          if (userData.role === 'admin') {
            window.location.href = 'admin.html';
          } else {
            window.location.href = 'index.html';
          }
        } else {
          window.location.href = 'index.html';
        }
      } catch (error) {
        console.error('Login error:', error);
        
        // Handle specific error messages
        let errorMessage = 'Invalid email or password';
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email address';
        } else if (error.code === 'auth/wrong-password') {
          errorMessage = 'Incorrect password';
        } else if (error.code === 'auth/too-many-requests') {
          errorMessage = 'Too many failed attempts. Please try again later';
        }
        
        showAuthError(errorMessage);
        trackAuthEvent('login_error', email, error.code);
      } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Initialize signup form
function initSignupForm() {
  const signupForm = document.querySelector('form.signup-form');
  
  if (signupForm) {
    signupForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const name = this.name.value.trim();
      const email = this.email.value.trim();
      const password = this.password.value.trim();
      const confirmPassword = this['confirm-password'].value.trim();
      
      // Validation
      if (!name || !email || !password || !confirmPassword) {
        showAuthError('Please fill in all fields');
        return;
      }
      
      if (password !== confirmPassword) {
        showAuthError('Passwords do not match');
        return;
      }
      
      if (password.length < 8) {
        showAuthError('Password must be at least 8 characters long');
        return;
      }
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i> Creating account...';
      submitBtn.disabled = true;
      
      try {
        // Create user with email and password
        const userCredential = await firebase.auth().createUserWithEmailAndPassword(email, password);
        const user = userCredential.user;
        
        // Update profile with display name
        await user.updateProfile({
          displayName: name,
          photoURL: `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=6366f1&color=fff`
        });
        
        // Send email verification
        await user.sendEmailVerification();
        
        // Track successful signup
        trackAuthEvent('signup_success', email);
        
        // Show success message
        showAuthSuccess('Account created successfully! Please check your email to verify your account.');
        
        // Redirect to login after 3 seconds
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 3000);
      } catch (error) {
        console.error('Signup error:', error);
        
        // Handle specific error messages
        let errorMessage = 'Failed to create account. Please try again.';
        if (error.code === 'auth/email-already-in-use') {
          errorMessage = 'An account with this email already exists';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address format';
        } else if (error.code === 'auth/operation-not-allowed') {
          errorMessage = 'Email/password accounts are not enabled';
        }
        
        showAuthError(errorMessage);
        trackAuthEvent('signup_error', email, error.code);
      } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Initialize password reset
function initPasswordReset() {
  const resetForm = document.querySelector('form.reset-form');
  
  if (resetForm) {
    resetForm.addEventListener('submit', async function(e) {
      e.preventDefault();
      
      const email = this.email.value.trim();
      
      if (!email) {
        showAuthError('Please enter your email address');
        return;
      }
      
      // Show loading state
      const submitBtn = this.querySelector('button[type="submit"]');
      const originalText = submitBtn.innerHTML;
      submitBtn.innerHTML = '<i class="fas fa-spinner animate-spin mr-2"></i> Sending reset link...';
      submitBtn.disabled = true;
      
      try {
        // Send password reset email
        await firebase.auth().sendPasswordResetEmail(email);
        
        // Track successful reset request
        trackAuthEvent('password_reset_request', email);
        
        // Show success message
        showAuthSuccess('Password reset link sent! Check your email for instructions.');
      } catch (error) {
        console.error('Password reset error:', error);
        
        // Handle specific error messages
        let errorMessage = 'Failed to send reset link. Please try again.';
        if (error.code === 'auth/user-not-found') {
          errorMessage = 'No account found with this email address';
        } else if (error.code === 'auth/invalid-email') {
          errorMessage = 'Invalid email address format';
        }
        
        showAuthError(errorMessage);
        trackAuthEvent('password_reset_error', email, error.code);
      } finally {
        // Restore button state
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      }
    });
  }
}

// Initialize social authentication
function initSocialAuth() {
  // Google Sign-In
  const googleBtn = document.querySelector('button[data-provider="google"]');
  if (googleBtn) {
    googleBtn.addEventListener('click', async function() {
      try {
        const provider = new firebase.auth.GoogleAuthProvider();
        provider.addScope('profile');
        provider.addScope('email');
        
        await firebase.auth().signInWithPopup(provider);
        
        // Track successful social login
        trackAuthEvent('social_login_success', 'google');
      } catch (error) {
        console.error('Google sign-in error:', error);
        showAuthError('Failed to sign in with Google. Please try again.');
        trackAuthEvent('social_login_error', 'google', error.code);
      }
    });
  }
  
  // Apple Sign-In
  const appleBtn = document.querySelector('button[data-provider="apple"]');
  if (appleBtn) {
    appleBtn.addEventListener('click', async function() {
      try {
        const provider = new firebase.auth.OAuthProvider('apple.com');
        provider.addScope('email');
        provider.addScope('name');
        
        await firebase.auth().signInWithPopup(provider);
        
        // Track successful social login
        trackAuthEvent('social_login_success', 'apple');
      } catch (error) {
        console.error('Apple sign-in error:', error);
        showAuthError('Failed to sign in with Apple. Please try again.');
        trackAuthEvent('social_login_error', 'apple', error.code);
      }
    });
  }
}

// Initialize authentication state
function initAuthState() {
  // Check for remembered user
  const rememberedUser = localStorage.getItem('rememberedUser');
  if (rememberedUser && document.querySelector('input[name="email"]')) {
    document.querySelector('input[name="email"]').value = rememberedUser;
    document.querySelector('input[name="remember-me"]').checked = true;
  }
  
  // Handle logout
  const logoutBtn = document.querySelector('button[data-action="logout"]');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', async function() {
      try {
        await firebase.auth().signOut();
        
        // Track logout event
        trackAuthEvent('logout');
        
        // Redirect to home page
        window.location.href = 'index.html';
      } catch (error) {
        console.error('Logout error:', error);
        showAuthError('Failed to log out. Please try again.');
      }
    });
  }
}

// Show authentication error
function showAuthError(message) {
  let errorElement = document.getElementById('auth-error');
  
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'auth-error';
    errorElement.className = 'mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 rounded-lg border border-red-200 dark:border-red-800 text-sm';
    
    const form = document.querySelector('form');
    if (form) {
      form.insertBefore(errorElement, form.firstChild);
    }
  }
  
  errorElement.textContent = message;
  errorElement.style.opacity = '0';
  errorElement.style.transition = 'opacity 0.3s ease';
  
  setTimeout(() => {
    errorElement.style.opacity = '1';
  }, 100);
  
  // Hide error after 5 seconds
  setTimeout(() => {
    errorElement.style.opacity = '0';
    setTimeout(() => {
      if (errorElement.parentNode) {
        errorElement.parentNode.removeChild(errorElement);
      }
    }, 300);
  }, 5000);
}

// Show authentication success
function showAuthSuccess(message) {
  let successElement = document.getElementById('auth-success');
  
  if (!successElement) {
    successElement = document.createElement('div');
    successElement.id = 'auth-success';
    successElement.className = 'mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg border border-green-200 dark:border-green-800 text-sm';
    
    const form = document.querySelector('form');
    if (form) {
      form.insertBefore(successElement, form.firstChild);
    }
  }
  
  successElement.textContent = message;
  successElement.style.opacity = '0';
  successElement.style.transition = 'opacity 0.3s ease';
  
  setTimeout(() => {
    successElement.style.opacity = '1';
  }, 100);
  
  // Hide success after 5 seconds
  setTimeout(() => {
    successElement.style.opacity = '0';
    setTimeout(() => {
      if (successElement.parentNode) {
        successElement.parentNode.removeChild(successElement);
      }
    }, 300);
  }, 5000);
}

// Track authentication events
function trackAuthEvent(action, email = null, errorCode = null) {
  const event = {
    action: action,
    timestamp: new Date().toISOString(),
    userEmail: email ? email.substring(0, 3) + '***@' + email.split('@')[1] : null,
    errorCode: errorCode
  };
  
  console.log('Auth event tracked:', event);
  
  // In a real app, you would send this to your analytics service
  // For now, we'll just log it to the console
  
  // Send to Google Analytics if available
  if (typeof gtag === 'function') {
    gtag('event', action, {
      event_category: 'authentication',
      event_label: email ? email.split('@')[1] : null,
      value: errorCode ? 0 : 1
    });
  }
}

// Initialize theme from authentication state
function initThemeFromAuth() {
  firebase.auth().onAuthStateChanged(user => {
    if (user) {
      // Get user's theme preference
      firebase.firestore().collection('users').doc(user.uid).get()
        .then(doc => {
          if (doc.exists) {
            const userData = doc.data();
            const theme = userData.settings?.theme || 'system';
            
            // Apply theme preference
            if (theme !== 'system') {
              if (theme === 'dark') {
                document.documentElement.classList.add('dark');
              } else {
                document.documentElement.classList.remove('dark');
              }
              
              // Update theme toggle button
              const themeToggle = document.getElementById('theme-toggle');
              if (themeToggle) {
                themeToggle.innerHTML = theme === 'dark' ? 
                  '<i class="fas fa-sun"></i>' : 
                  '<i class="fas fa-moon"></i>';
              }
            }
          }
        })
        .catch(error => {
          console.error('Error getting user theme preference:', error);
        });
    }
  });
}

// Export functions for use in other scripts
window.handleAuthStateChange = handleAuthStateChange;
window.showAuthError = showAuthError;
window.showAuthSuccess = showAuthSuccess;
window.trackAuthEvent = trackAuthEvent;

console.log('Auth JavaScript module loaded and initialized');
