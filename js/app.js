// ===== MARIAM KHALED - ENGLISH LEARNING PLATFORM =====
// Full Application Controller with Points System, Profile, Timers, OTP, and Question Navigation

const APP = {
  user: null,
  activeLevel: null,
  quizState: null,
  timerInterval: null,
  supabaseAvailable: false,

  async init() {
    this.checkSupabase();
    await this.initAuth();
    this.setupRoutes();
  },

  checkSupabase() {
    this.supabaseAvailable = !!(typeof supabaseClient !== 'undefined' && supabaseClient);
    console.log('Supabase status:', this.supabaseAvailable ? 'Connected' : 'Local mode');
  },

  async initAuth() {
    if (this.supabaseAvailable) {
      try {
        const { data: { session }, error } = await supabaseClient.auth.getSession();
        if (session && session.user) {
          const userMeta = session.user.user_metadata || {};
          this.user = {
            id: session.user.id,
            email: session.user.email,
            name: userMeta.full_name || userMeta.name || session.user.email.split('@')[0],
            avatar: userMeta.avatar_url || null,
            provider: session.user.app_metadata?.provider || 'supabase',
            points: await this.loadUserPoints(session.user.id)
          };
          this.saveLocalUser(this.user);
        }

        supabaseClient.auth.onAuthStateChange(async (event, session) => {
          if (session && session.user) {
            const userMeta = session.user.user_metadata || {};
            this.user = {
              id: session.user.id,
              email: session.user.email,
              name: userMeta.full_name || userMeta.name || session.user.email.split('@')[0],
              avatar: userMeta.avatar_url || null,
              provider: session.user.app_metadata?.provider || 'supabase',
              points: await this.loadUserPoints(session.user.id)
            };
            this.saveLocalUser(this.user);
            this.showPage('dashboard');
          } else if (event === 'SIGNED_OUT') {
            this.user = null;
            sessionStorage.removeItem('msq_current');
            this.showPage('login');
          }
        });
      } catch (err) {
        console.warn('Auth check error:', err);
      }
    }

    if (!this.user) {
      this.user = this.getLocalUser();
    }
  },

  async loadUserPoints(userId) {
    if (this.supabaseAvailable && userId && !userId.startsWith('usr_')) {
      try {
        const { data, error } = await supabaseClient
          .from('profiles')
          .select('points')
          .eq('id', userId)
          .maybeSingle();
        if (data && data.points !== undefined) return data.points;
      } catch (e) { console.warn(e); }
    }
    // Calculate from local history
    const history = this.getUserExamHistory();
    return history.reduce((sum, h) => sum + (h.points_earned || 0), 0);
  },

  getLocalUser() {
    try {
      return JSON.parse(sessionStorage.getItem('msq_current') || 'null');
    } catch { return null; }
  },

  saveLocalUser(u) {
    try {
      sessionStorage.setItem('msq_current', JSON.stringify(u));
    } catch (e) { console.error(e); }
  },

  setupRoutes() {
    if (this.user) {
      this.showPage('dashboard');
    } else {
      this.showPage('login');
    }
  },

  showPage(page, data = {}) {
    // Clear any running quiz timer
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    document.querySelectorAll('.page').forEach(p => p.classList.add('hidden'));
    const target = document.getElementById('page-' + page);
    if (target) target.classList.remove('hidden');

    switch (page) {
      case 'login': this.renderLogin(); break;
      case 'signup': this.renderSignup(); break;
      case 'otp': this.renderOtp(data); break;
      case 'dashboard': this.renderDashboard(); break;
      case 'profile': this.renderProfile(); break;
      case 'exam-setup': this.renderExamSetup(data); break;
      case 'quiz': this.renderQuiz(data); break;
      case 'result': this.renderResult(data); break;
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  // ===== AUTH METHODS =====
  async signInWithGoogle() {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) errorEl.classList.add('hidden');

    if (this.supabaseAvailable) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin + window.location.pathname
          }
        });
        if (error) throw error;
      } catch (err) {
        console.error('Google Sign-in error:', err);
        if (errorEl) {
          errorEl.textContent = 'Google Auth Error: ' + (err.message || 'Check Google Provider in Supabase.');
          errorEl.classList.remove('hidden');
        }
      }
    } else {
      this.user = {
        id: 'google_user_' + Date.now(),
        name: 'Google Student',
        email: 'student@google.com',
        provider: 'google',
        points: 0
      };
      this.saveLocalUser(this.user);
      this.showPage('dashboard');
    }
  },

  async handleSignIn(email, pass) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) errorEl.classList.add('hidden');

    if (this.supabaseAvailable) {
      try {
        const { data, error } = await supabaseClient.auth.signInWithPassword({
          email: email.trim(),
          password: pass
        });
        if (error) throw error;

        this.user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          provider: 'supabase',
          points: await this.loadUserPoints(data.user.id)
        };
        this.saveLocalUser(this.user);
        this.showPage('dashboard');
        return;
      } catch (err) {
        console.warn('Supabase sign-in fallback:', err.message);
      }
    }

    // Local authentication
    const users = JSON.parse(localStorage.getItem('msq_users') || '[]');
    const found = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.pass === pass);
    if (found) {
      this.user = {
        id: found.id || 'loc_' + Date.now(),
        name: found.name,
        email: found.email,
        provider: 'local',
        points: await this.loadUserPoints(found.id)
      };
      this.saveLocalUser(this.user);
      this.showPage('dashboard');
    } else {
      if (errorEl) {
        errorEl.textContent = 'Invalid email or password. Please verify your credentials or register.';
        errorEl.classList.remove('hidden');
      }
    }
  },

  async handleSignUp(name, email, pass, confirmPass) {
    const errorEl = document.getElementById('auth-error');
    if (errorEl) errorEl.classList.add('hidden');

    if (pass !== confirmPass) {
      if (errorEl) {
        errorEl.textContent = 'Passwords do not match. Please re-type your password.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    if (pass.length < 6) {
      if (errorEl) {
        errorEl.textContent = 'Password must be at least 6 characters long.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    if (this.supabaseAvailable) {
      try {
        const { data, error } = await supabaseClient.auth.signUp({
          email: email.trim(),
          password: pass,
          options: {
            data: { full_name: name.trim() }
          }
        });
        if (error) throw error;

        // If email confirmation is required, route to OTP verification screen
        this.showPage('otp', { email: email.trim(), name: name.trim(), pass });
        return;
      } catch (err) {
        console.warn('Supabase signup fallback:', err.message);
      }
    }

    // Local registration
    const users = JSON.parse(localStorage.getItem('msq_users') || '[]');
    if (users.find(u => u.email.toLowerCase() === email.toLowerCase())) {
      if (errorEl) {
        errorEl.textContent = 'This email is already registered. Please sign in.';
        errorEl.classList.remove('hidden');
      }
      return;
    }

    const newUser = { id: 'usr_' + Date.now(), name: name.trim(), email: email.trim(), pass: pass };
    users.push(newUser);
    localStorage.setItem('msq_users', JSON.stringify(users));

    // Show confirmation screen before login
    this.showPage('otp', { email: email.trim(), name: name.trim(), pass });
  },

  async verifyOtpCode(email, token, pass) {
    const errorEl = document.getElementById('otp-error');
    if (errorEl) errorEl.classList.add('hidden');

    if (this.supabaseAvailable && token.length === 6) {
      try {
        const { data, error } = await supabaseClient.auth.verifyOtp({
          email: email,
          token: token,
          type: 'signup'
        });
        if (error) throw error;
        
        this.user = {
          id: data.user.id,
          email: data.user.email,
          name: data.user.user_metadata?.full_name || email.split('@')[0],
          provider: 'supabase',
          points: 0
        };
        this.saveLocalUser(this.user);
        this.showPage('dashboard');
        return;
      } catch (err) {
        console.warn('OTP verify error:', err);
      }
    }

    // Local / direct completion fallback
    if (token.length >= 4 || token === '123456' || token === '') {
      await this.handleSignIn(email, pass);
    } else {
      if (errorEl) {
        errorEl.textContent = 'Invalid verification code. Please check your email inbox.';
        errorEl.classList.remove('hidden');
      }
    }
  },

  async logout() {
    if (this.supabaseAvailable) {
      try { await supabaseClient.auth.signOut(); } catch (e) { console.error(e); }
    }
    this.user = null;
    sessionStorage.removeItem('msq_current');
    this.showPage('login');
  },

  // ===== EXAM HISTORY & POINTS PERSISTENCE =====
  getUserExamHistory() {
    if (!this.user?.email) return [];
    try {
      return JSON.parse(localStorage.getItem('msq_history_' + this.user.email) || '[]');
    } catch { return []; }
  },

  async saveExamResult(resultData) {
    // 1. Calculate points (+10 points if score >= 80%)
    const pointsAwarded = resultData.percentage >= 80 ? 10 : 0;
    resultData.points_earned = pointsAwarded;

    // 2. Save to Local History
    if (this.user?.email) {
      const history = this.getUserExamHistory();
      history.unshift({
        id: 'res_' + Date.now(),
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }),
        level_id: resultData.levelId,
        level_name: resultData.levelName,
        total_questions: resultData.total,
        correct_answers: resultData.correct,
        percentage: resultData.percentage,
        passed: resultData.passed,
        points_earned: pointsAwarded,
        timer_mode: resultData.timerMode
      });
      localStorage.setItem('msq_history_' + this.user.email, JSON.stringify(history));

      // Update current user points
      this.user.points = (this.user.points || 0) + pointsAwarded;
      this.saveLocalUser(this.user);
    }

    // 3. Save to Supabase Database
    if (this.supabaseAvailable) {
      try {
        await supabaseClient.from('quiz_results').insert({
          user_id: this.user.id.startsWith('usr_') || this.user.id.startsWith('loc_') ? null : this.user.id,
          user_email: this.user.email,
          level_id: resultData.levelId,
          level_name: resultData.levelName,
          total_questions: resultData.total,
          correct_answers: resultData.correct,
          score_percentage: resultData.percentage,
          passed: resultData.passed,
          points_earned: pointsAwarded,
          question_type: resultData.type,
          timer_mode: resultData.timerMode
        });

        // Update profiles table points
        if (pointsAwarded > 0 && !this.user.id.startsWith('usr_') && !this.user.id.startsWith('loc_')) {
          await supabaseClient.rpc('increment_points', { user_id: this.user.id, pts: pointsAwarded }).catch(async () => {
            await supabaseClient.from('profiles').update({ points: this.user.points }).eq('id', this.user.id);
          });
        }
      } catch (err) {
        console.warn('Could not save to Supabase:', err);
      }
    }
  },

  // ===== UI RENDERERS =====

  renderLogin() {
    const c = document.getElementById('page-login');
    c.innerHTML = `
      <div class="auth-page">
        <div class="blob" style="width:450px;height:450px;background:rgba(46,117,182,0.18);top:10%;right:5%;"></div>
        <div class="blob" style="width:380px;height:380px;background:rgba(230,126,34,0.14);bottom:5%;left:5%;animation-delay:2s;"></div>
        
        <div class="auth-card glass">
          <div class="auth-instructor-profile">
            <img src="public/mariam.png" alt="Instructor Mariam Khaled" class="instructor-avatar-img">
            <div class="verified-badge">✓</div>
          </div>
          <h1 class="auth-title">Welcome Back</h1>
          <p class="auth-subtitle">Instructor Mariam Khaled – English Platform</p>
          
          <button type="button" class="btn btn-google btn-block" onclick="APP.signInWithGoogle()">
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Continue with Google
          </button>

          <div class="auth-divider">
            <span>or sign in with email</span>
          </div>

          <div id="auth-error" class="hidden auth-alert"></div>

          <form id="login-form">
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" class="form-input" id="login-email" placeholder="student@example.com" required>
            </div>
            <div class="form-group">
              <label>Password</label>
              <input type="password" class="form-input" id="login-pass" placeholder="••••••••" required>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block shine">
              Sign In to Platform
            </button>
          </form>

          <p class="auth-toggle">
            Don't have an account? <a onclick="APP.showPage('signup')">Create one now</a>
          </p>
        </div>
      </div>`;

    document.getElementById('login-form').onsubmit = (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const pass = document.getElementById('login-pass').value;
      this.handleSignIn(email, pass);
    };
  },

  renderSignup() {
    const c = document.getElementById('page-signup');
    c.innerHTML = `
      <div class="auth-page">
        <div class="blob" style="width:450px;height:450px;background:rgba(46,117,182,0.18);top:10%;left:5%;"></div>
        <div class="blob" style="width:380px;height:380px;background:rgba(230,126,34,0.14);bottom:5%;right:5%;animation-delay:2s;"></div>
        
        <div class="auth-card glass">
          <div class="auth-instructor-profile">
            <img src="public/mariam.png" alt="Instructor Mariam Khaled" class="instructor-avatar-img">
            <div class="verified-badge">✓</div>
          </div>
          <h1 class="auth-title">Create Account</h1>
          <p class="auth-subtitle">Join Instructor Mariam Khaled's Course</p>
          
          <button type="button" class="btn btn-google btn-block" onclick="APP.signInWithGoogle()">
            <svg class="google-icon" viewBox="0 0 24 24" width="20" height="20">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            Sign up with Google
          </button>

          <div class="auth-divider">
            <span>or sign up with email</span>
          </div>

          <div id="auth-error" class="hidden auth-alert"></div>

          <form id="signup-form">
            <div class="form-group">
              <label>Full Name</label>
              <input type="text" class="form-input" id="signup-name" placeholder="e.g. Ahmed Ali" required>
            </div>
            <div class="form-group">
              <label>Email Address</label>
              <input type="email" class="form-input" id="signup-email" placeholder="student@example.com" required>
            </div>
            <div class="form-group">
              <label>Password (min 6 characters)</label>
              <input type="password" class="form-input" id="signup-pass" placeholder="••••••••" minlength="6" required>
            </div>
            <div class="form-group">
              <label>Confirm Password</label>
              <input type="password" class="form-input" id="signup-pass-confirm" placeholder="••••••••" minlength="6" required>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block shine">
              Create Account & Verify
            </button>
          </form>

          <p class="auth-toggle">
            Already have an account? <a onclick="APP.showPage('login')">Sign In</a>
          </p>
        </div>
      </div>`;

    document.getElementById('signup-form').onsubmit = (e) => {
      e.preventDefault();
      const name = document.getElementById('signup-name').value;
      const email = document.getElementById('signup-email').value;
      const pass = document.getElementById('signup-pass').value;
      const confirmPass = document.getElementById('signup-pass-confirm').value;
      this.handleSignUp(name, email, pass, confirmPass);
    };
  },

  renderOtp(data) {
    const email = data.email || '';
    const pass = data.pass || '';
    const c = document.getElementById('page-otp');
    c.innerHTML = `
      <div class="auth-page">
        <div class="blob" style="width:400px;height:400px;background:rgba(46,117,182,0.18);top:10%;right:5%;"></div>
        <div class="auth-card glass">
          <div class="auth-logo" style="font-size:2.4rem;">📬</div>
          <h1 class="auth-title">Verify Your Email</h1>
          <p class="auth-subtitle">
            We sent a verification code to <strong>${email}</strong>. Enter it below to activate your account.
          </p>

          <div id="otp-error" class="hidden auth-alert"></div>

          <form id="otp-form">
            <div class="form-group">
              <label style="text-align:center;">6-Digit Verification Code</label>
              <input type="text" class="form-input otp-input" id="otp-code" placeholder="123456" maxlength="6" autofocus>
            </div>
            <button type="submit" class="btn btn-primary btn-lg btn-block shine">
              Confirm & Continue to Dashboard →
            </button>
          </form>

          <div style="text-align:center;margin-top:1.5rem;">
            <p style="font-size:0.85rem;color:var(--text-muted);">
              Didn't receive the email? Check spam or 
              <a onclick="APP.verifyOtpCode('${email}', '', '${pass}')" style="color:var(--primary);font-weight:700;cursor:pointer;">Click here to Proceed</a>
            </p>
            <p class="auth-toggle" style="margin-top:1rem;">
              <a onclick="APP.showPage('login')">← Back to Sign In</a>
            </p>
          </div>
        </div>
      </div>`;

    document.getElementById('otp-form').onsubmit = (e) => {
      e.preventDefault();
      const code = document.getElementById('otp-code').value.trim();
      this.verifyOtpCode(email, code, pass);
    };
  },

  renderDashboard() {
    if (!this.user) return this.showPage('login');
    const c = document.getElementById('page-dashboard');
    c.innerHTML = `
      <nav class="navbar glass">
        <div class="navbar-inner">
          <div class="navbar-brand" onclick="APP.showPage('dashboard')">
            <img src="public/mariam.png" alt="Mariam Khaled" class="brand-avatar-img">
            <div>
              <div style="font-size:1.05rem;font-weight:800;color:var(--primary);">Mariam Khaled</div>
              <div style="font-size:0.75rem;color:var(--text-muted);font-weight:500;">English Learning Platform</div>
            </div>
          </div>
          <div class="navbar-user">
            <div class="points-pill" title="Earn +10 points for each test >= 80%">
              ⭐ ${this.user.points || 0} Pts
            </div>
            <div class="user-chip" onclick="APP.showPage('profile')">
              <span class="user-avatar">${(this.user.name || 'S')[0].toUpperCase()}</span>
              <span class="user-name">${this.user.name}</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="APP.logout()">Sign Out</button>
          </div>
        </div>
      </nav>

      <div class="dashboard">
        <!-- Instructor Hero Card -->
        <div class="instructor-hero-banner glass">
          <div class="instructor-banner-content">
            <img src="public/mariam.png" alt="Instructor Mariam Khaled" class="instructor-banner-photo">
            <div class="instructor-banner-text">
              <div class="instructor-tag">👩‍🏫 Course Instructor</div>
              <h2>Instructor Mariam Khaled</h2>
              <p>Welcome to our English interactive testing system. Select <strong>Beginner 2</strong> to practice 100 questions covering grammar rules and vocabulary from Units 7, 8, and 9. <strong>Score 80%+ to earn +10 Points!</strong></p>
            </div>
          </div>
        </div>

        <div class="dashboard-header">
          <h1>Course Proficiency Levels</h1>
          <p>Select your level to access questions and interactive practice exams</p>
        </div>

        <div class="levels-grid" id="levels-grid"></div>
      </div>`;

    const grid = document.getElementById('levels-grid');
    LEVELS.forEach((lv, idx) => {
      const card = document.createElement('div');
      card.className = 'level-card glass' + (lv.locked ? ' locked' : ' active-card');
      card.style.animationDelay = `${0.05 * (idx + 1)}s`;
      card.innerHTML = `
        <div class="level-top">
          <div class="level-icon" style="background:${lv.color}15;color:${lv.color};">${lv.icon}</div>
          <span class="level-badge ${lv.locked ? 'locked-badge' : 'active'}">
            ${lv.locked ? '🔒 Locked' : '⭐ Available Now'}
          </span>
        </div>
        <h3>${lv.name}</h3>
        <p>${lv.desc}</p>
        <div class="level-footer">
          <span class="level-q-count">${lv.locked ? 'Coming soon' : '100 Questions (70 MCQ + 30 Article)'}</span>
          ${!lv.locked ? '<span class="level-arrow">Start Exam →</span>' : ''}
        </div>`;
      
      if (!lv.locked) {
        card.onclick = () => {
          this.activeLevel = lv;
          this.showPage('exam-setup', { level: lv });
        };
      }
      grid.appendChild(card);
    });
  },

  renderProfile() {
    if (!this.user) return this.showPage('login');
    const history = this.getUserExamHistory();
    const totalExams = history.length;
    const passedExams = history.filter(h => h.passed).length;
    const avgScore = totalExams ? Math.round(history.reduce((a, b) => a + b.percentage, 0) / totalExams) : 0;
    const totalPoints = this.user.points || 0;

    const c = document.getElementById('page-profile');
    c.innerHTML = `
      <nav class="navbar glass">
        <div class="navbar-inner">
          <div class="navbar-brand" onclick="APP.showPage('dashboard')">
            <img src="public/mariam.png" alt="Mariam Khaled" class="brand-avatar-img">
            <span>Mariam Khaled</span>
          </div>
          <div class="navbar-user">
            <button class="btn btn-outline btn-sm" onclick="APP.showPage('dashboard')">🏠 Dashboard</button>
            <button class="btn btn-outline btn-sm" onclick="APP.logout()">Sign Out</button>
          </div>
        </div>
      </nav>

      <div class="profile-container">
        <div class="profile-hero glass">
          <div style="display:flex;align-items:center;gap:1.5rem;">
            <div class="profile-avatar-large">
              ${(this.user.name || 'S')[0].toUpperCase()}
            </div>
            <div class="profile-details">
              <h2>${this.user.name}</h2>
              <p>📧 ${this.user.email}</p>
              <div style="margin-top:6px;">
                <span class="badge-pass" style="font-size:0.75rem;">Verified Student</span>
              </div>
            </div>
          </div>

          <div class="profile-points-box">
            <div class="profile-points-num">⭐ ${totalPoints}</div>
            <div class="profile-points-label">TOTAL EARNED POINTS</div>
            <div style="font-size:0.72rem;color:var(--text-muted);margin-top:2px;">(+10 pts for each test ≥ 80%)</div>
          </div>
        </div>

        <div class="stats-cards-grid">
          <div class="stat-card glass">
            <div class="val">${totalExams}</div>
            <div class="lbl">Tests Completed</div>
          </div>
          <div class="stat-card glass">
            <div class="val" style="color:var(--success);">${passedExams}</div>
            <div class="lbl">Tests Passed</div>
          </div>
          <div class="stat-card glass">
            <div class="val" style="color:var(--accent);">${avgScore}%</div>
            <div class="lbl">Average Score</div>
          </div>
          <div class="stat-card glass">
            <div class="val" style="color:#d97706;">${history.filter(h => h.percentage >= 80).length}</div>
            <div class="lbl">80%+ Distinctions</div>
          </div>
        </div>

        <div class="history-card glass">
          <h3 style="font-size:1.2rem;font-weight:800;margin-bottom:0.5rem;display:flex;align-items:center;gap:8px;">
            📊 Exam History & Grades
          </h3>
          <p style="color:var(--text-muted);font-size:0.88rem;margin-bottom:1.5rem;">
            All completed practice sessions and their scores are recorded here.
          </p>

          ${history.length === 0 ? `
            <div style="text-align:center;padding:2rem;color:var(--text-muted);">
              <p style="font-size:1.1rem;margin-bottom:1rem;">No exams taken yet.</p>
              <button class="btn btn-primary btn-sm" onclick="APP.showPage('exam-setup')">Take Your First Exam →</button>
            </div>
          ` : `
            <div style="overflow-x:auto;">
              <table class="history-table">
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Level</th>
                    <th>Score</th>
                    <th>Result</th>
                    <th>Points</th>
                    <th>Timer</th>
                  </tr>
                </thead>
                <tbody>
                  ${history.map(h => `
                    <tr>
                      <td style="font-size:0.85rem;color:var(--text-muted);">${h.date}</td>
                      <td><strong>${h.level_name || 'Beginner 2'}</strong></td>
                      <td><strong>${h.score_percentage}%</strong> (${h.correct_answers}/${h.total_questions})</td>
                      <td>
                        <span class="${h.passed ? 'badge-pass' : 'badge-fail'}">
                          ${h.passed ? 'PASS' : 'STUDY'}
                        </span>
                      </td>
                      <td>
                        ${h.points_earned > 0 
                          ? `<span class="badge-points">⭐ +${h.points_earned} Pts</span>` 
                          : '<span style="color:var(--text-muted);font-size:0.8rem;">0 Pts</span>'}
                      </td>
                      <td style="font-size:0.85rem;color:var(--text-muted);">
                        ${h.timer_mode === '30' ? '30s' : (h.timer_mode === '60' ? '60s' : 'No timer')}
                      </td>
                    </tr>`).join('')}
                </tbody>
              </table>
            </div>
          `}
        </div>
      </div>`;
  },

  renderExamSetup(data) {
    if (!this.user) return this.showPage('login');
    const lv = data?.level || this.activeLevel || LEVELS.find(l => !l.locked);
    this.activeLevel = lv;

    const c = document.getElementById('page-exam-setup');
    c.innerHTML = `
      <nav class="navbar glass">
        <div class="navbar-inner">
          <a class="navbar-brand" onclick="APP.showPage('dashboard')">
            <img src="public/mariam.png" alt="Mariam Khaled" class="brand-avatar-img">
            <span>Mariam Khaled</span>
          </a>
          <div class="navbar-user">
            <div class="points-pill">⭐ ${this.user.points || 0} Pts</div>
            <span style="font-weight:600;font-size:0.9rem;">${this.user.name}</span>
          </div>
        </div>
      </nav>

      <div class="exam-setup">
        <div class="exam-hero gradient-primary">
          <a onclick="APP.showPage('dashboard')" class="back-link">← Back to All Levels</a>
          <div style="display:flex;align-items:center;gap:12px;margin-top:0.75rem;">
            <span style="font-size:2.2rem;">${lv.icon}</span>
            <div>
              <h1 style="font-size:1.8rem;font-weight:800;margin:0;">${lv.name}</h1>
              <p style="opacity:0.9;margin-top:4px;font-size:0.95rem;">${lv.desc}</p>
            </div>
          </div>
        </div>

        <div class="setup-card glass">
          <h2 style="font-weight:700;font-size:1.2rem;margin-bottom:0.4rem;display:flex;align-items:center;gap:8px;">
            ⚙️ Exam Customization
          </h2>
          <p style="color:var(--text-muted);font-size:0.9rem;margin-bottom:1.5rem;">
            Configure your practice test from the 100 questions. Score <strong>≥ 80%</strong> to earn <strong>+10 Points</strong>!
          </p>

          <div class="setup-grid">
            <div class="setup-stat">
              <div class="num">70</div>
              <div class="label">Multiple Choice (MCQ)</div>
            </div>
            <div class="setup-stat">
              <div class="num">30</div>
              <div class="label">Article Questions (a/an/the)</div>
            </div>
          </div>

          <div class="form-group" style="margin-top:1.5rem;">
            <label>Select Question Category</label>
            <select id="q-type" class="form-input" onchange="APP.updateAvailableCount()">
              <option value="all">Mixed (70 MCQ + 30 Article)</option>
              <option value="mcq">Multiple Choice Only (70 Questions)</option>
              <option value="article">Article Questions Only (30 Questions)</option>
            </select>
          </div>

          <div class="form-group">
            <label>⏱️ Question Timer Mode (MCQs Only)</label>
            <div class="timer-options">
              <div class="timer-opt-card selected" data-timer="none" onclick="APP.selectTimerMode('none', this)">
                <div class="timer-opt-icon">♾️</div>
                <div class="timer-opt-title">No Timer</div>
              </div>
              <div class="timer-opt-card" data-timer="30" onclick="APP.selectTimerMode('30', this)">
                <div class="timer-opt-icon">⚡ 30s</div>
                <div class="timer-opt-title">30s / MCQ</div>
              </div>
              <div class="timer-opt-card" data-timer="60" onclick="APP.selectTimerMode('60', this)">
                <div class="timer-opt-icon">⏳ 60s</div>
                <div class="timer-opt-title">60s / MCQ</div>
              </div>
            </div>
            <p style="font-size:0.75rem;color:var(--text-muted);margin-top:4px;">
              * Note: Timers apply to MCQs only. Article questions have unlimited time.
            </p>
          </div>

          <div class="form-group">
            <label>Number of Questions to Practice</label>
            <input type="number" id="q-count" class="form-input" min="5" max="100" value="20" style="text-align:center;font-weight:700;font-size:1.1rem;">
          </div>

          <div class="quick-presets">
            <button class="btn btn-outline btn-sm" onclick="APP.setQuickCount(10)">Quick (10)</button>
            <button class="btn btn-outline btn-sm" onclick="APP.setQuickCount(25)">Standard (25)</button>
            <button class="btn btn-outline btn-sm" onclick="APP.setQuickCount(50)">Half Exam (50)</button>
            <button class="btn btn-outline btn-sm" onclick="APP.setQuickCount('all')">Full Exam (All 100)</button>
          </div>

          <button class="btn btn-primary btn-lg btn-block shine" style="margin-top:1.5rem;" onclick="APP.startExam()">
            🚀 Start Test Now
          </button>
        </div>
      </div>`;
  },

  selectedTimerMode: 'none',

  selectTimerMode(mode, el) {
    this.selectedTimerMode = mode;
    document.querySelectorAll('.timer-opt-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  },

  updateAvailableCount() {
    const type = document.getElementById('q-type').value;
    const countInput = document.getElementById('q-count');
    if (type === 'mcq') countInput.max = 70;
    else if (type === 'article') countInput.max = 30;
    else countInput.max = 100;
  },

  setQuickCount(val) {
    const type = document.getElementById('q-type').value;
    const max = type === 'mcq' ? 70 : (type === 'article' ? 30 : 100);
    const countInput = document.getElementById('q-count');
    if (val === 'all') countInput.value = max;
    else countInput.value = Math.min(val, max);
  },

  startExam() {
    const type = document.getElementById('q-type').value;
    let count = parseInt(document.getElementById('q-count').value) || 20;
    let pool = [];

    if (type === 'mcq') pool = [...BEGINNER2_MCQ];
    else if (type === 'article') pool = [...BEGINNER2_ARTICLE];
    else pool = [...BEGINNER2_MCQ, ...BEGINNER2_ARTICLE];

    // Shuffle pool
    for (let i = pool.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }

    count = Math.min(count, pool.length);
    const questions = pool.slice(0, count);

    this.showPage('quiz', {
      questions,
      levelId: this.activeLevel?.id || 'beginner2',
      levelName: this.activeLevel?.name || 'Beginner 2',
      type,
      timerMode: this.selectedTimerMode || 'none'
    });
  },

  // ===== QUIZ ENGINE =====
  renderQuiz(data) {
    if (!this.user) return this.showPage('login');
    this.quizState = {
      questions: data.questions,
      idx: 0,
      answers: [],
      answered: false,
      levelId: data.levelId || 'beginner2',
      levelName: data.levelName || 'Beginner 2',
      type: data.type || 'all',
      timerMode: data.timerMode || 'none',
      timeLeft: 0
    };
    this._renderCurrentQuestion();
  },

  _renderCurrentQuestion() {
    // Clear any previous countdown
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const s = this.quizState;
    const q = s.questions[s.idx];
    const isMcq = !!q.d;
    const pct = ((s.idx + 1) / s.questions.length * 100).toFixed(1);

    // Setup timer if enabled and question is MCQ
    const hasTimer = (s.timerMode === '30' || s.timerMode === '60') && isMcq;
    if (hasTimer) {
      s.timeLeft = parseInt(s.timerMode);
    } else {
      s.timeLeft = 0;
    }

    const c = document.getElementById('page-quiz');
    c.innerHTML = `
      <div class="quiz-container animated-slide">
        <div class="quiz-card glass">
          <div class="quiz-header">
            <a class="quiz-back" onclick="APP.confirmExit()" style="cursor:pointer;">← Exit Test</a>
            
            <div class="quiz-nav-tools">
              <!-- Navigation buttons -->
              <button class="btn-nav" title="Previous Question" onclick="APP.jumpQuestion(${s.idx - 1})" ${s.idx === 0 ? 'disabled' : ''}>◀</button>
              <button class="btn-nav" title="Next Question" onclick="APP.jumpQuestion(${s.idx + 1})" ${s.idx >= s.questions.length - 1 ? 'disabled' : ''}>▶</button>
              <button class="btn-nav" style="width:auto;padding:0 10px;font-size:0.8rem;font-weight:700;" title="Jump to Last Question" onclick="APP.jumpQuestion(${s.questions.length - 1})">Last ⏭</button>

              ${hasTimer ? `<span class="quiz-timer-badge" id="quiz-timer">⏱️ ${s.timeLeft}s</span>` : ''}
              
              <span class="quiz-unit-tag">Unit ${q.unit}</span>
              <span class="quiz-counter">${s.idx + 1} / ${s.questions.length}</span>
            </div>
          </div>

          <div class="quiz-progress"><div class="quiz-progress-bar" style="width:${pct}%"></div></div>
          
          <div class="quiz-body">
            <span class="quiz-type-badge ${isMcq ? 'mcq' : 'article'}">
              ${isMcq ? 'Multiple Choice (MCQ)' : 'Article (a / an / the)'}
            </span>
            ${q.topic ? `<span class="topic-tag">${q.topic}</span>` : ''}

            <p class="quiz-question">${q.q}</p>
            <div id="quiz-options"></div>
            <div id="quiz-feedback"></div>
            <div id="quiz-next"></div>
          </div>
        </div>
      </div>`;

    s.answered = false;
    const optsEl = document.getElementById('quiz-options');

    if (isMcq) {
      const letters = ['A', 'B', 'C', 'D'];
      const opts = [q.a, q.b, q.c, q.d];
      optsEl.innerHTML = '<div class="options-list">' +
        opts.map((o, i) => `
          <button class="option-btn" data-idx="${i}" onclick="APP.selectOption(${i})">
            <span class="option-letter">${letters[i]}</span>
            <span class="option-text">${o}</span>
            <span class="option-icon"></span>
          </button>`).join('') +
        '</div>';
    } else {
      const letters = ['A', 'B', 'C'];
      const opts = [q.a, q.b, q.c];
      optsEl.innerHTML = '<div class="options-list">' +
        opts.map((o, i) => `
          <button class="option-btn" data-idx="${i}" onclick="APP.selectOption(${i})">
            <span class="option-letter">${letters[i]}</span>
            <span class="option-text">${o}</span>
            <span class="option-icon"></span>
          </button>`).join('') +
        '</div>';
    }

    // Render Skip Question & Actions
    document.getElementById('quiz-next').innerHTML = `
      <div class="quiz-actions-row">
        <button class="btn btn-skip btn-sm" onclick="APP.skipQuestion()">
          ⏭ Skip Question
        </button>
      </div>`;

    // Start timer countdown if active
    if (hasTimer) {
      this.timerInterval = setInterval(() => {
        if (s.answered) {
          clearInterval(this.timerInterval);
          return;
        }
        s.timeLeft--;
        const timerEl = document.getElementById('quiz-timer');
        if (timerEl) {
          timerEl.textContent = `⏱️ ${s.timeLeft}s`;
          if (s.timeLeft <= 5) timerEl.classList.add('warning');
        }
        if (s.timeLeft <= 0) {
          clearInterval(this.timerInterval);
          this.handleTimeout();
        }
      }, 1000);
    }
  },

  handleTimeout() {
    if (this.quizState.answered) return;
    this.quizState.answered = true;

    const s = this.quizState;
    const q = s.questions[s.idx];
    const isMcq = !!q.d;
    const letters = isMcq ? ['A','B','C','D'] : ['A','B','C'];
    const opts = isMcq ? [q.a, q.b, q.c, q.d] : [q.a, q.b, q.c];
    const correctIdx = letters.indexOf(q.ans);

    s.answers.push({
      question: q,
      selectedIndex: null,
      selectedText: '(Time Out)',
      correctIndex: correctIdx,
      correctText: opts[correctIdx],
      isCorrect: false
    });

    const btns = document.querySelectorAll('.option-btn');
    btns.forEach((btn, i) => {
      btn.disabled = true;
      if (i === correctIdx) {
        btn.classList.add('correct');
        btn.querySelector('.option-icon').textContent = '✓';
      } else {
        btn.classList.add('dimmed');
      }
    });

    const fb = document.getElementById('quiz-feedback');
    fb.innerHTML = `
      <div class="feedback-box wrong-feedback">
        <span>⏰ <strong>Time Out!</strong> The correct answer is: <strong>${opts[correctIdx]}</strong></span>
      </div>`;

    const isLast = s.idx >= s.questions.length - 1;
    document.getElementById('quiz-next').innerHTML = `
      <div class="next-btn-wrap">
        <button class="btn ${isLast ? 'btn-accent' : 'btn-primary'} btn-lg btn-block shine" onclick="APP.advanceQuestion()">
          ${isLast ? '🏆 Complete Exam & View Results' : 'Next Question →'}
        </button>
      </div>`;
  },

  selectOption(idx) {
    if (this.quizState.answered) return;
    this.quizState.answered = true;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const s = this.quizState;
    const q = s.questions[s.idx];
    const isMcq = !!q.d;
    const letters = isMcq ? ['A','B','C','D'] : ['A','B','C'];
    const opts = isMcq ? [q.a, q.b, q.c, q.d] : [q.a, q.b, q.c];
    const correctIdx = letters.indexOf(q.ans);
    const isCorrect = (idx === correctIdx);

    s.answers.push({
      question: q,
      selectedIndex: idx,
      selectedText: opts[idx],
      correctIndex: correctIdx,
      correctText: opts[correctIdx],
      isCorrect
    });

    const btns = document.querySelectorAll('.option-btn');
    btns.forEach((btn, i) => {
      btn.disabled = true;
      if (i === correctIdx) {
        btn.classList.add('correct');
        btn.querySelector('.option-icon').textContent = '✓';
      } else if (i === idx && !isCorrect) {
        btn.classList.add('wrong');
        btn.querySelector('.option-icon').textContent = '✗';
      } else {
        btn.classList.add('dimmed');
      }
    });

    const fb = document.getElementById('quiz-feedback');
    fb.innerHTML = `
      <div class="feedback-box ${isCorrect ? 'correct-feedback' : 'wrong-feedback'}">
        ${isCorrect 
          ? '<span>🎉 <strong>Excellent!</strong> Correct answer.</span>' 
          : `<span>⚠️ <strong>Incorrect.</strong> Correct answer is: <strong>${opts[correctIdx]}</strong></span>`}
      </div>`;

    const isLast = s.idx >= s.questions.length - 1;
    document.getElementById('quiz-next').innerHTML = `
      <div class="next-btn-wrap">
        <button class="btn ${isLast ? 'btn-accent' : 'btn-primary'} btn-lg btn-block shine" onclick="APP.advanceQuestion()">
          ${isLast ? '🏆 Complete Exam & View Results' : 'Next Question →'}
        </button>
      </div>`;
  },

  skipQuestion() {
    if (this.quizState.answered) return;
    this.quizState.answered = true;

    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const s = this.quizState;
    const q = s.questions[s.idx];
    const isMcq = !!q.d;
    const letters = isMcq ? ['A','B','C','D'] : ['A','B','C'];
    const opts = isMcq ? [q.a, q.b, q.c, q.d] : [q.a, q.b, q.c];
    const correctIdx = letters.indexOf(q.ans);

    s.answers.push({
      question: q,
      selectedIndex: null,
      selectedText: '(Skipped)',
      correctIndex: correctIdx,
      correctText: opts[correctIdx],
      isCorrect: false
    });

    this.advanceQuestion();
  },

  jumpQuestion(targetIdx) {
    if (targetIdx < 0 || targetIdx >= this.quizState.questions.length) return;
    this.quizState.idx = targetIdx;
    this._renderCurrentQuestion();
  },

  advanceQuestion() {
    const s = this.quizState;
    if (s.idx >= s.questions.length - 1) {
      this.finishExam();
    } else {
      s.idx++;
      this._renderCurrentQuestion();
    }
  },

  confirmExit() {
    if (confirm('Are you sure you want to exit the current test? Your progress will be lost.')) {
      if (this.timerInterval) clearInterval(this.timerInterval);
      this.showPage('exam-setup');
    }
  },

  async finishExam() {
    if (this.timerInterval) {
      clearInterval(this.timerInterval);
      this.timerInterval = null;
    }

    const s = this.quizState;
    const correctCount = s.answers.filter(a => a.isCorrect).length;
    const totalCount = s.questions.length;
    const percentage = Math.round((correctCount / totalCount) * 100);
    const passed = percentage >= 60;

    await this.saveExamResult({
      levelId: s.levelId,
      levelName: s.levelName,
      total: totalCount,
      correct: correctCount,
      percentage,
      passed,
      type: s.type,
      timerMode: s.timerMode
    });

    this.showPage('result', {
      answers: s.answers,
      total: totalCount,
      correct: correctCount,
      percentage,
      passed,
      levelId: s.levelId,
      levelName: s.levelName,
      earnedPoints: percentage >= 80 ? 10 : 0
    });
  },

  // ===== RESULT PAGE =====
  renderResult(data) {
    if (!this.user) return this.showPage('login');
    const { answers, total, correct, percentage, passed, earnedPoints } = data;

    const c = document.getElementById('page-result');
    c.innerHTML = `
      <nav class="navbar glass">
        <div class="navbar-inner">
          <div class="navbar-brand" onclick="APP.showPage('dashboard')">
            <img src="public/mariam.png" alt="Mariam Khaled" class="brand-avatar-img">
            <span>Mariam Khaled</span>
          </div>
          <div class="navbar-user">
            <div class="points-pill">⭐ ${this.user.points || 0} Pts</div>
            <button class="btn btn-outline btn-sm" onclick="APP.showPage('profile')">👤 Profile</button>
          </div>
        </div>
      </nav>

      <div class="result-container">
        <div class="result-card glass">
          <div class="result-circle ${passed ? 'pass' : 'fail'}">
            <span class="icon">${passed ? '🎉' : '📖'}</span>
          </div>
          
          <h2 style="font-size:2rem;font-weight:800;margin-bottom:0.25rem;">
            ${passed ? 'Congratulations!' : 'Keep Practicing!'}
          </h2>
          <p style="color:var(--text-muted);font-size:0.95rem;">
            ${passed ? 'You have passed the exam.' : 'Review your mistakes below and try again to improve.'}
          </p>

          <div class="result-score ${passed ? 'pass-score' : 'fail-score'}">
            ${percentage}<span>%</span>
          </div>

          ${earnedPoints > 0 ? `
            <div class="points-reward-badge">
              ⭐ Distinction Reward: +10 Points Added to Profile!
            </div>
          ` : ''}

          <p class="result-text">
            Score: <b>${correct}</b> out of <b>${total}</b> questions correct
          </p>

          <div class="result-actions">
            <button class="btn btn-outline" onclick="APP.showPage('exam-setup')">
              🔄 Retake Test
            </button>
            <button class="btn btn-outline" onclick="APP.showPage('profile')">
              👤 View in Profile
            </button>
            <button class="btn btn-primary shine" onclick="APP.showPage('dashboard')">
              🏠 Back to Levels
            </button>
          </div>

          <div class="result-review">
            <h3 style="font-size:1.1rem;font-weight:700;margin-bottom:1rem;display:flex;align-items:center;gap:6px;">
              📝 Detailed Answer Breakdown
            </h3>
            ${answers.map((a, i) => `
              <div class="review-item ${a.isCorrect ? 'correct-review' : 'wrong-review'}">
                <div style="display:flex;justify-content:space-between;margin-bottom:4px;">
                  <span style="font-weight:700;">Question ${i + 1} (Unit ${a.question.unit})</span>
                  <span style="font-weight:700;font-size:0.85rem;">${a.isCorrect ? '✅ Correct' : '❌ Incorrect'}</span>
                </div>
                <div class="q-text">${a.question.q}</div>
                <div style="margin-top:6px;font-size:0.85rem;">
                  <span>Your answer: <strong>${a.selectedText}</strong></span>
                  ${!a.isCorrect ? `<br><span class="correct-ans">Correct answer: <strong>${a.correctText}</strong></span>` : ''}
                </div>
              </div>`).join('')}
          </div>
        </div>
      </div>`;
  }
};

document.addEventListener('DOMContentLoaded', () => APP.init());
