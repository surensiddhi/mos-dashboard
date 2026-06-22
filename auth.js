/* =====================================================================
   MOS Dashboard — Login configuration
   ---------------------------------------------------------------------
   This is the ONLY file you edit to manage who can sign in.
   index.html reads this file; you never need to touch index.html for users.

   HOW TO ADD / CHANGE / REMOVE A USER
     1. Open hash-tool.html in your browser.
     2. Make sure its Salt matches the SALT below.
     3. Type each user ID + password, click Generate.
     4. Copy the produced "const USERS={...}" block and paste it over
        the USERS block below.
     5. Re-upload ONLY this auth.js to GitHub. Done.

   NOTE ON SECURITY (please read once):
     This file is publicly readable on GitHub Pages, like the dashboard.
     The passwords are stored as salted SHA-256 hashes, not plain text,
     so they are not directly visible — but this is a DETERRENT for
     internal use, not strong security. For real protection, move to
     Supabase authentication later (the dashboard is built to allow it).

   SESSION_HOURS = how long a sign-in stays valid before re-login.
   SALT          = must stay identical to the salt used in hash-tool.html.
   ===================================================================== */

window.SALT = 'MOS-2026-board-x7q';
window.SESSION_HOURS = 12;

window.USERS = {
  "suren":"0597b250015c0f0078423cd2c8c56bdfbf134c46bf4c0bfabaa725976ffacb53",
  "sanjib":"5382f868f56e8878b85ffd143d7b0dd903302e3c1f2fd23193864729d89a788b",
  "suresh":"10a279ee6b638612c345de267d7e2a04999839f69e38173f58eaec843bf1e35a",
  "esha":"3bffe1ec4486df0aa13dcabafb1ac99179806fcec1b3e7bc7830a4f9cf59f0af"
};

window.ADMINS = ["suren"];

