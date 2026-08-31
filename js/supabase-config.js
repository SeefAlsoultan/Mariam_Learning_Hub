// ===== SUPABASE CLIENT CONFIGURATION =====
const SUPABASE_CONFIG = {
  url: 'https://jatkbhakflillmrwceev.supabase.co',
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImphdGtiaGFrZmxpbGxtcndjZWV2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgxNjE2MjMsImV4cCI6MjEwMzczNzYyM30.j9uyC9UiNJRVMocAD47u6bUCwYbZqU5qUC8Fbx81uaM',
  publishableKey: 'sb_publishable_2nTUVrkeDmZBx63x7PB0eA_ixFMiKR6'
};

// Initialize Supabase JS Client using global supabase from CDN
let supabaseClient = null;
try {
  if (typeof supabase !== 'undefined' && supabase.createClient) {
    supabaseClient = supabase.createClient(SUPABASE_CONFIG.url, SUPABASE_CONFIG.anonKey);
    console.log('Supabase client initialized successfully.');
  }
} catch (err) {
  console.warn('Supabase initialization warning:', err);
}
