// ============================================================
// LIFE OS — AUTH GUARD
// auth-guard.js
//
// Include this script in any tool that requires sign-in.
// Place BEFORE ui.js and app.js in your HTML.
//
// What it does:
// 1. Checks for an existing Supabase session on page load
// 2. If no session → redirects to nextus.world/login?redirect=[current-url]
// 3. If session exists → sets window.LIFEOS_USER and continues
//
// Usage in index.html (after Supabase SDK):
//   <script src="/auth-guard.js"></script>
// ============================================================

(async function() {
  const SUPABASE_URL      = window.SUPABASE_URL;
  const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY;
  const LOGIN_URL         = "https://nextus.world/login";

  // Can't check auth without credentials — fail open for local dev
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY || SUPABASE_URL.includes("YOUR_")) {
    console.warn("[AuthGuard] Supabase not configured — skipping auth check.");
    return;
  }

  let sb;
  try {
    sb = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  } catch (e) {
    console.warn("[AuthGuard] Could not initialise Supabase:", e);
    return;
  }

  try {
    const { data: { session }, error } = await sb.auth.getSession();

    if (error) {
      console.warn("[AuthGuard] Session check error:", error.message);
      // Fail open — don't block the tool on a network error
      return;
    }

    if (!session || !session.user) {
      // No session — redirect to login with return URL
      const returnUrl = encodeURIComponent(window.location.href);
      window.location.href = `${LOGIN_URL}?redirect=${returnUrl}`;
      return;
    }

    // Session exists — expose user globally for app.js to use
    window.LIFEOS_USER    = session.user;
    window.LIFEOS_USER_ID = session.user.id;
    console.log("[AuthGuard] Session active:", session.user.id);

  } catch (e) {
    console.warn("[AuthGuard] Unexpected error:", e);
    // Fail open
  }
})();
