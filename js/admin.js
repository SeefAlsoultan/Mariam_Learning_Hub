// ===== ADMIN PORTAL CONTROLLER =====
// Authorized Admins: seefalsoultan@gmail.com (Super Admin), mk6806168@gmail.com (Admin)

const ADMIN_PORTAL = {
  serviceKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdGtiaGFrZmxpbGxtcndjZWV2Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODE2MTYyMywiZXhwIjoyMTAzNzM3NjIzfQ.ZwC9slmzC6aZlHkoSImi_wo3-Dl48g9arT8gfzTENVo',
  url: 'https://jatkbhakflillmrwceev.supabase.co',
  cachedUsers: [],
  cachedResults: [],
  activeFilter: 'all',
  searchQuery: '',

  isAdmin(user) {
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    return email === 'seefalsoultan@gmail.com' || email === 'mk6806168@gmail.com' || user.role === 'super_admin' || user.role === 'admin';
  },

  isSuperAdmin(user) {
    if (!user?.email) return false;
    const email = user.email.toLowerCase();
    return email === 'seefalsoultan@gmail.com' || user.role === 'super_admin';
  },

  async fetchAllData() {
    try {
      // 1. Fetch all users from Supabase Auth Admin
      const resUsers = await fetch(`${this.url}/auth/v1/admin/users`, {
        headers: { 'apikey': this.serviceKey, 'Authorization': `Bearer ${this.serviceKey}` }
      });
      const usersJson = await resUsers.json();
      const rawUsers = usersJson.users || [];

      // 2. Fetch all quiz results
      const resResults = await fetch(`${this.url}/rest/v1/quiz_results?select=*`, {
        headers: { 'apikey': this.serviceKey, 'Authorization': `Bearer ${this.serviceKey}` }
      });
      this.cachedResults = await resResults.json();
      if (!Array.isArray(this.cachedResults)) this.cachedResults = [];

      // 3. Fetch all profiles
      let profilesMap = {};
      try {
        const resProfiles = await fetch(`${this.url}/rest/v1/profiles?select=*`, {
          headers: { 'apikey': this.serviceKey, 'Authorization': `Bearer ${this.serviceKey}` }
        });
        const profilesList = await resProfiles.json();
        if (Array.isArray(profilesList)) {
          profilesList.forEach(p => { profilesMap[p.id] = p; profilesMap[p.email] = p; });
        }
      } catch (e) { console.warn(e); }

      // 4. Map & calculate statistics per user
      this.cachedUsers = rawUsers.map(u => {
        const meta = u.user_metadata || {};
        const profile = profilesMap[u.id] || profilesMap[u.email] || {};
        const userResults = this.cachedResults.filter(r => r.user_id === u.id || r.user_email === u.email);
        
        const totalTests = userResults.length;
        const passedTests = userResults.filter(r => r.passed).length;
        const avgScore = totalTests > 0 ? Math.round(userResults.reduce((s, r) => s + (r.score_percentage || 0), 0) / totalTests) : 0;
        const totalPoints = userResults.reduce((s, r) => s + (r.points_earned || 0), 0);

        let role = meta.role || (u.email === 'seefalsoultan@gmail.com' ? 'super_admin' : (u.email === 'mk6806168@gmail.com' ? 'admin' : 'student'));
        if (u.email === 'seefalsoultan@gmail.com') role = 'super_admin';
        if (u.email === 'mk6806168@gmail.com' && role !== 'super_admin') role = 'admin';

        const assignedClasses = meta.assigned_classes || ['beginner2', 'advanced1'];

        return {
          id: u.id,
          email: u.email,
          name: meta.full_name || meta.name || profile.full_name || u.email.split('@')[0],
          avatar: meta.avatar_url || profile.avatar_url || null,
          role: role,
          assignedClasses: assignedClasses,
          createdAt: u.created_at ? new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A',
          lastSignIn: u.last_sign_in_at ? new Date(u.last_sign_in_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Never',
          totalTests,
          passedTests,
          avgScore,
          totalPoints,
          results: userResults
        };
      });

      return this.cachedUsers;
    } catch (err) {
      console.error('Error fetching admin data:', err);
      return [];
    }
  },

  async render() {
    if (!APP.user || !this.isAdmin(APP.user)) {
      APP.showToast('Access denied: Admins only', 'danger');
      return APP.showPage('dashboard');
    }

    const c = document.getElementById('page-admin');
    c.innerHTML = `
      <nav class="navbar glass">
        <div class="navbar-inner">
          <div style="display:flex;align-items:center;gap:10px;">
            <button class="btn btn-outline btn-sm" onclick="APP.showPage('dashboard')" style="display:inline-flex;align-items:center;gap:6px;">
              ← Back to Dashboard
            </button>
            <button class="btn btn-outline btn-sm" onclick="APP.showPage('profile')" style="display:inline-flex;align-items:center;gap:6px;">
              👤 My Profile
            </button>
          </div>
          <div class="navbar-user">
            <span class="${this.isSuperAdmin(APP.user) ? 'badge-role-super' : 'badge-role-admin'}">
              ${this.isSuperAdmin(APP.user) ? '👑 Super Admin' : '🛡️ Admin'}
            </span>
            <div class="user-chip" onclick="APP.showPage('profile')">
              ${APP.getUserAvatarHtml(32)}
              <span class="user-name">${APP.user.name}</span>
            </div>
            <button class="btn btn-outline btn-sm" onclick="APP.logout()">Sign Out</button>
          </div>
        </div>
      </nav>

      <div class="admin-container">
        <div class="admin-hero-card glass">
          <div class="admin-hero-text">
            <div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;">
              <span style="font-size:1.6rem;">🛡️</span>
              <span class="${this.isSuperAdmin(APP.user) ? 'badge-role-super' : 'badge-role-admin'}">
                ${this.isSuperAdmin(APP.user) ? 'Super Admin Portal' : 'Admin Management Portal'}
              </span>
            </div>
            <h1>Student & Class Administration</h1>
            <p>Manage students, assign courses, update photos/names/passwords, and monitor completion rates.</p>
          </div>
          <div>
            <button class="btn btn-primary btn-md shine" onclick="ADMIN_PORTAL.openUserModal()">
              ➕ Create New Student
            </button>
          </div>
        </div>

        <div id="admin-stats-container" class="admin-stats-row">
          <div class="admin-stat-card"><div class="val">...</div><div class="lbl">Loading Stats</div></div>
        </div>

        <div class="admin-card">
          <div class="admin-toolbar">
            <div class="admin-search-box">
              <input type="text" id="admin-search-input" class="form-input" placeholder="🔍 Search students by name or email..." oninput="ADMIN_PORTAL.handleSearch(this.value)">
              <select id="admin-class-filter" class="form-input" style="width:180px;" onchange="ADMIN_PORTAL.handleFilter(this.value)">
                <option value="all">All Classes</option>
                <option value="beginner2">Beginner 2</option>
                <option value="advanced1">Advanced 1</option>
                <option value="beginner1">Beginner 1</option>
                <option value="elementary1">Elementary 1</option>
                <option value="elementary2">Elementary 2</option>
                <option value="preintermediate">Pre-Intermediate</option>
                <option value="intermediate">Intermediate</option>
              </select>
            </div>
            <button class="btn btn-outline btn-sm" onclick="ADMIN_PORTAL.refreshData()">
              🔄 Refresh List
            </button>
          </div>

          <div id="admin-table-container" style="overflow-x:auto;">
            <p style="text-align:center;padding:2rem;color:var(--text-muted);">Loading student data from database...</p>
          </div>
        </div>
      </div>
    `;

    await this.refreshData();
  },

  async refreshData() {
    const users = await this.fetchAllData();
    this.renderStats();
    this.renderTable();
  },

  renderStats() {
    const total = this.cachedUsers.length;
    const students = this.cachedUsers.filter(u => u.role === 'student').length;
    const totalExams = this.cachedResults.length;
    const avgScore = totalExams > 0 ? Math.round(this.cachedResults.reduce((s, r) => s + (r.score_percentage || 0), 0) / totalExams) : 0;
    const totalPoints = this.cachedUsers.reduce((s, u) => s + u.totalPoints, 0);

    const container = document.getElementById('admin-stats-container');
    if (!container) return;

    container.innerHTML = `
      <div class="admin-stat-card">
        <div class="val">${total}</div>
        <div class="lbl">Total Registered Users</div>
      </div>
      <div class="admin-stat-card">
        <div class="val" style="color:var(--primary);">${students}</div>
        <div class="lbl">Active Students</div>
      </div>
      <div class="admin-stat-card">
        <div class="val" style="color:var(--success);">${totalExams}</div>
        <div class="lbl">Exams Completed</div>
      </div>
      <div class="admin-stat-card">
        <div class="val" style="color:var(--accent);">${avgScore}%</div>
        <div class="lbl">Platform Avg Score</div>
      </div>
      <div class="admin-stat-card">
        <div class="val" style="color:#d97706;">⭐ ${totalPoints}</div>
        <div class="lbl">Total Reward Points</div>
      </div>
    `;
  },

  handleSearch(val) {
    this.searchQuery = (val || '').toLowerCase().trim();
    this.renderTable();
  },

  handleFilter(val) {
    this.activeFilter = val || 'all';
    this.renderTable();
  },

  renderTable() {
    const container = document.getElementById('admin-table-container');
    if (!container) return;

    let filtered = this.cachedUsers.filter(u => {
      const matchSearch = !this.searchQuery || u.name.toLowerCase().includes(this.searchQuery) || u.email.toLowerCase().includes(this.searchQuery);
      const matchFilter = this.activeFilter === 'all' || (u.assignedClasses && u.assignedClasses.includes(this.activeFilter));
      return matchSearch && matchFilter;
    });

    if (filtered.length === 0) {
      container.innerHTML = `
        <div style="text-align:center;padding:3rem 1rem;color:var(--text-muted);">
          <div style="font-size:2.5rem;margin-bottom:0.5rem;">🔍</div>
          <p style="font-size:1.1rem;font-weight:700;">No students found matching your filter</p>
          <p style="font-size:0.9rem;">Try searching a different name or clearing filters.</p>
        </div>
      `;
      return;
    }

    const classNamesMap = {
      'beginner1': 'Beginner 1',
      'beginner2': 'Beginner 2',
      'elementary1': 'Elementary 1',
      'elementary2': 'Elementary 2',
      'advanced1': 'Advanced 1',
      'preintermediate': 'Pre-Int',
      'intermediate': 'Intermediate'
    };

    container.innerHTML = `
      <table class="admin-table">
        <thead>
          <tr>
            <th>Student</th>
            <th>Role</th>
            <th>Assigned Classes</th>
            <th>Exams Taken</th>
            <th>Avg Score / Pass Rate</th>
            <th>Points</th>
            <th>Joined Date</th>
            <th style="text-align:right;">Actions</th>
          </tr>
        </thead>
        <tbody>
          ${filtered.map(u => {
            const isSuper = u.role === 'super_admin';
            const isAdminUser = u.role === 'admin';
            const roleBadge = isSuper 
              ? `<span class="badge-role-super">👑 Super Admin</span>` 
              : (isAdminUser ? `<span class="badge-role-admin">🛡️ Admin</span>` : `<span class="badge-role-student">Student</span>`);

            const passRate = u.totalTests > 0 ? Math.round((u.passedTests / u.totalTests) * 100) : 0;
            const avatarHtml = u.avatar 
              ? `<img src="${u.avatar}" style="width:38px;height:38px;border-radius:50%;object-fit:cover;border:1.5px solid var(--border);">` 
              : `<span class="user-avatar" style="width:38px;height:38px;font-size:1rem;">${(u.name || 'S')[0].toUpperCase()}</span>`;

            const classesPills = (u.assignedClasses || []).map(c => `<span class="class-pill">${classNamesMap[c] || c}</span>`).join('') || '<span style="color:var(--text-muted);font-size:0.78rem;">None</span>';

            const canDelete = this.isSuperAdmin(APP.user) || (!isSuper && !isAdminUser);

            return `
              <tr>
                <td>
                  <div style="display:flex;align-items:center;gap:10px;">
                    ${avatarHtml}
                    <div>
                      <div style="font-weight:700;color:var(--text);">${u.name}</div>
                      <div style="font-size:0.8rem;color:var(--text-muted);">${u.email}</div>
                    </div>
                  </div>
                </td>
                <td>${roleBadge}</td>
                <td style="max-width:200px;">${classesPills}</td>
                <td>
                  <strong>${u.totalTests}</strong> <span style="color:var(--text-muted);font-size:0.8rem;">tests</span>
                </td>
                <td>
                  ${u.totalTests > 0 ? `
                    <strong>${u.avgScore}%</strong> avg
                    <div style="font-size:0.75rem;color:var(--success);font-weight:600;">${passRate}% pass rate (${u.passedTests}/${u.totalTests})</div>
                  ` : '<span style="color:var(--text-muted);font-size:0.8rem;">No tests yet</span>'}
                </td>
                <td>
                  <span class="badge-points">⭐ ${u.totalPoints} Pts</span>
                </td>
                <td style="font-size:0.82rem;color:var(--text-muted);">${u.createdAt}</td>
                <td style="text-align:right;">
                  <div class="table-actions" style="justify-content:flex-end;">
                    <button class="btn btn-outline btn-sm" title="Edit Student & Classes" onclick="ADMIN_PORTAL.openUserModal('${u.id}')">
                      ✏️ Edit
                    </button>
                    <button class="btn btn-outline btn-sm" title="View Grades & Exam History" onclick="ADMIN_PORTAL.openHistoryModal('${u.id}')">
                      📊 History
                    </button>
                    ${canDelete && u.email !== APP.user.email ? `
                      <button class="btn btn-outline btn-sm" style="color:var(--danger);border-color:var(--danger);" title="Delete Student" onclick="ADMIN_PORTAL.confirmDeleteUser('${u.id}', '${u.name || u.email}')">
                        🗑️
                      </button>
                    ` : ''}
                  </div>
                </td>
              </tr>
            `;
          }).join('')}
        </tbody>
      </table>
    `;
  },

  // ===== CREATE / EDIT USER MODAL =====
  openUserModal(userId = null) {
    const isEdit = !!userId;
    const user = isEdit ? this.cachedUsers.find(u => u.id === userId) : null;
    const isSuper = this.isSuperAdmin(APP.user);

    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();

    const assigned = user?.assignedClasses || ['beginner2', 'advanced1'];
    const currentRole = user?.role || 'student';

    const modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.className = 'app-modal-backdrop';
    modal.innerHTML = `
      <div class="app-modal-card" style="max-width:540px;text-align:left;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
          <h2 style="font-size:1.35rem;font-weight:800;margin:0;">
            ${isEdit ? '✏️ Edit Student Account' : '➕ Create New Student'}
          </h2>
          <button onclick="document.getElementById('app-modal').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-muted);">✕</button>
        </div>

        <form id="admin-user-form">
          <div class="form-group">
            <label>Full Name</label>
            <input type="text" id="modal-user-name" class="form-input" required value="${user ? user.name : ''}" placeholder="e.g. Sarah Connor">
          </div>

          <div class="form-group">
            <label>Email Address</label>
            <input type="email" id="modal-user-email" class="form-input" required value="${user ? user.email : ''}" ${isEdit ? 'disabled style="background:#f1f5f9;"' : ''} placeholder="student@example.com">
          </div>

          <div class="form-group">
            <label>${isEdit ? 'Set New Password (leave blank to keep current)' : 'Password'}</label>
            <input type="password" id="modal-user-password" class="form-input" ${isEdit ? '' : 'required minlength="6"'} placeholder="${isEdit ? 'Enter new password or leave blank' : 'Minimum 6 characters'}">
          </div>

          <div class="form-group">
            <label>Account Role</label>
            <select id="modal-user-role" class="form-input" ${!isSuper && user?.role === 'super_admin' ? 'disabled' : ''}>
              <option value="student" ${currentRole === 'student' ? 'selected' : ''}>Student</option>
              <option value="admin" ${currentRole === 'admin' ? 'selected' : ''} ${!isSuper ? 'disabled' : ''}>Admin</option>
              ${isSuper ? `<option value="super_admin" ${currentRole === 'super_admin' ? 'selected' : ''}>👑 Super Admin</option>` : ''}
            </select>
          </div>

          <div class="form-group">
            <label>Profile Avatar URL / Photo</label>
            <div style="display:flex;gap:8px;align-items:center;">
              <input type="text" id="modal-user-avatar" class="form-input" value="${user?.avatar || ''}" placeholder="https://... or upload below">
              <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('modal-avatar-file').click()">📷 Upload</button>
              <input type="file" id="modal-avatar-file" accept="image/*" style="display:none;" onchange="ADMIN_PORTAL.handleModalPhotoUpload(event)">
            </div>
            <div id="modal-avatar-preview" style="margin-top:6px;">
              ${user?.avatar ? `<img src="${user.avatar}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">` : ''}
            </div>
          </div>

          <div class="form-group">
            <label>Assign Course Levels to Student</label>
            <div class="class-checkbox-grid">
              <label class="class-checkbox-item"><input type="checkbox" name="assign_class" value="beginner1" ${assigned.includes('beginner1') ? 'checked' : ''}> 🌱 Beginner 1</label>
              <label class="class-checkbox-item"><input type="checkbox" name="assign_class" value="beginner2" ${assigned.includes('beginner2') ? 'checked' : ''}> 📘 Beginner 2</label>
              <label class="class-checkbox-item"><input type="checkbox" name="assign_class" value="elementary1" ${assigned.includes('elementary1') ? 'checked' : ''}> 📗 Elementary 1</label>
              <label class="class-checkbox-item"><input type="checkbox" name="assign_class" value="elementary2" ${assigned.includes('elementary2') ? 'checked' : ''}> 📙 Elementary 2</label>
              <label class="class-checkbox-item"><input type="checkbox" name="assign_class" value="advanced1" ${assigned.includes('advanced1') ? 'checked' : ''}> 🔥 Advanced 1</label>
              <label class="class-checkbox-item"><input type="checkbox" name="assign_class" value="preintermediate" ${assigned.includes('preintermediate') ? 'checked' : ''}> 📕 Pre-Intermediate</label>
              <label class="class-checkbox-item"><input type="checkbox" name="assign_class" value="intermediate" ${assigned.includes('intermediate') ? 'checked' : ''}> 🎓 Intermediate</label>
            </div>
          </div>

          <div class="app-modal-actions" style="margin-top:1.5rem;">
            <button type="button" class="btn btn-outline" onclick="document.getElementById('app-modal').remove()">Cancel</button>
            <button type="submit" class="btn btn-primary" id="modal-submit-btn">
              ${isEdit ? '💾 Save Changes' : '➕ Create Account'}
            </button>
          </div>
        </form>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('admin-user-form').onsubmit = async (e) => {
      e.preventDefault();
      await this.handleSaveUserForm(userId);
    };
  },

  handleModalPhotoUpload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawData = e.target.result;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 256;
        let w = img.width, h = img.height;
        if (w > h) { if (w > maxDim) { h = Math.round((h * maxDim) / w); w = maxDim; } }
        else { if (h > maxDim) { w = Math.round((w * maxDim) / h); h = maxDim; } }
        canvas.width = w; canvas.height = h;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

        document.getElementById('modal-user-avatar').value = dataUrl;
        document.getElementById('modal-avatar-preview').innerHTML = `<img src="${dataUrl}" style="width:40px;height:40px;border-radius:50%;object-fit:cover;">`;
      };
      img.src = rawData;
    };
    reader.readAsDataURL(file);
  },

  async handleSaveUserForm(userId) {
    const submitBtn = document.getElementById('modal-submit-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Saving...';

    const name = document.getElementById('modal-user-name').value.trim();
    const email = document.getElementById('modal-user-email').value.trim().toLowerCase();
    const password = document.getElementById('modal-user-password').value;
    const role = document.getElementById('modal-user-role').value;
    const avatar = document.getElementById('modal-user-avatar').value.trim() || null;

    const assignedCheckboxes = document.querySelectorAll('input[name="assign_class"]:checked');
    const assignedClasses = Array.from(assignedCheckboxes).map(cb => cb.value);

    try {
      if (userId) {
        // EDIT EXISTING USER
        const body = {
          user_metadata: {
            full_name: name,
            name: name,
            role: role,
            avatar_url: avatar,
            assigned_classes: assignedClasses
          }
        };
        if (password && password.length >= 6) {
          body.password = password;
        }

        const res = await fetch(`${this.url}/auth/v1/admin/users/${userId}`, {
          method: 'PUT',
          headers: {
            'apikey': this.serviceKey,
            'Authorization': `Bearer ${this.serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(body)
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to update user');
        }

        // Update profiles table if present
        await fetch(`${this.url}/rest/v1/profiles?id=eq.${userId}`, {
          method: 'PATCH',
          headers: {
            'apikey': this.serviceKey,
            'Authorization': `Bearer ${this.serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ full_name: name, avatar_url: avatar })
        }).catch(() => {});

        APP.showToast('Student account updated successfully!', 'success');
      } else {
        // CREATE NEW USER
        if (!password || password.length < 6) {
          throw new Error('Password must be at least 6 characters');
        }

        const res = await fetch(`${this.url}/auth/v1/admin/users`, {
          method: 'POST',
          headers: {
            'apikey': this.serviceKey,
            'Authorization': `Bearer ${this.serviceKey}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: email,
            password: password,
            email_confirm: true,
            user_metadata: {
              full_name: name,
              name: name,
              role: role,
              avatar_url: avatar,
              assigned_classes: assignedClasses
            }
          })
        });

        if (!res.ok) {
          const errData = await res.json();
          throw new Error(errData.message || 'Failed to create user');
        }

        const newUser = await res.json();
        // Insert into profiles table
        if (newUser?.id) {
          await fetch(`${this.url}/rest/v1/profiles`, {
            method: 'POST',
            headers: {
              'apikey': this.serviceKey,
              'Authorization': `Bearer ${this.serviceKey}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              id: newUser.id,
              email: email,
              full_name: name,
              avatar_url: avatar
            })
          }).catch(() => {});
        }

        APP.showToast(`Student ${name} created successfully!`, 'success');
      }

      document.getElementById('app-modal')?.remove();
      await this.refreshData();
    } catch (err) {
      console.error(err);
      APP.showToast(err.message || 'Operation failed', 'danger');
      submitBtn.disabled = false;
      submitBtn.innerText = userId ? '💾 Save Changes' : '➕ Create Account';
    }
  },

  // ===== STUDENT EXAM HISTORY MODAL =====
  openHistoryModal(userId) {
    const user = this.cachedUsers.find(u => u.id === userId);
    if (!user) return;

    const results = user.results || [];

    const existing = document.getElementById('app-modal');
    if (existing) existing.remove();

    const modal = document.createElement('div');
    modal.id = 'app-modal';
    modal.className = 'app-modal-backdrop';
    modal.innerHTML = `
      <div class="app-modal-card" style="max-width:680px;text-align:left;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:1.25rem;">
          <div>
            <h2 style="font-size:1.3rem;font-weight:800;margin:0;">
              📊 ${user.name} - Exam & Completion History
            </h2>
            <p style="color:var(--text-muted);font-size:0.85rem;margin:2px 0 0;">${user.email} • Total Points: ⭐ ${user.totalPoints}</p>
          </div>
          <button onclick="document.getElementById('app-modal').remove()" style="background:none;border:none;font-size:1.4rem;cursor:pointer;color:var(--text-muted);">✕</button>
        </div>

        ${results.length === 0 ? `
          <div style="text-align:center;padding:2.5rem;color:var(--text-muted);">
            <div style="font-size:2rem;margin-bottom:0.5rem;">📝</div>
            <p style="font-weight:700;">No exams taken yet by this student.</p>
          </div>
        ` : `
          <div style="max-height:380px;overflow-y:auto;">
            <table class="admin-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Level</th>
                  <th>Score</th>
                  <th>Result</th>
                  <th>Reward</th>
                  <th>Timer</th>
                </tr>
              </thead>
              <tbody>
                ${results.map(r => `
                  <tr>
                    <td style="font-size:0.82rem;color:var(--text-muted);">${r.created_at ? new Date(r.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}</td>
                    <td><strong>${r.level_name || r.level_id || 'Level'}</strong></td>
                    <td><strong>${r.score_percentage}%</strong> (${r.correct_answers}/${r.total_questions})</td>
                    <td>
                      <span class="${r.passed ? 'badge-pass' : 'badge-fail'}">
                        ${r.passed ? 'PASS' : 'STUDY'}
                      </span>
                    </td>
                    <td>
                      ${(r.points_earned || 0) > 0 ? `<span class="badge-points">⭐ +${r.points_earned} Pts</span>` : '0 Pts'}
                    </td>
                    <td style="font-size:0.8rem;color:var(--text-muted);">${r.timer_mode === '30' ? '30s' : (r.timer_mode === '60' ? '60s' : 'No timer')}</td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `}

        <div style="margin-top:1.5rem;text-align:right;">
          <button class="btn btn-outline" onclick="document.getElementById('app-modal').remove()">Close</button>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
  },

  // ===== DELETE USER =====
  confirmDeleteUser(userId, userName) {
    APP.showModal({
      title: 'Delete Student Account?',
      icon: '🗑️',
      message: `Are you sure you want to delete <strong>${userName}</strong>? This action is permanent and will delete their login credentials and associated data.`,
      confirmText: 'Yes, Delete Account',
      cancelText: 'Cancel',
      isDanger: true,
      onConfirm: async () => {
        try {
          const res = await fetch(`${this.url}/auth/v1/admin/users/${userId}`, {
            method: 'DELETE',
            headers: {
              'apikey': this.serviceKey,
              'Authorization': `Bearer ${this.serviceKey}`
            }
          });

          if (!res.ok) {
            const errData = await res.json();
            throw new Error(errData.message || 'Failed to delete user');
          }

          // Delete from profiles
          await fetch(`${this.url}/rest/v1/profiles?id=eq.${userId}`, {
            method: 'DELETE',
            headers: {
              'apikey': this.serviceKey,
              'Authorization': `Bearer ${this.serviceKey}`
            }
          }).catch(() => {});

          APP.showToast(`Account for ${userName} deleted successfully.`, 'success');
          await this.refreshData();
        } catch (err) {
          console.error(err);
          APP.showToast(err.message || 'Could not delete user', 'danger');
        }
      }
    });
  }
};
