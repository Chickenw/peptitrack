/* ================================
   Clerk Auth Bootstrap
================================ */

window.addEventListener("load", async () => {
  if (!window.Clerk) {
    console.error("Clerk failed to load");
    return;
  }

  await Clerk.load();

  const authRoot = document.getElementById("auth-root");
  const appRoot = document.getElementById("app-root");

  if (Clerk.user) {
    authRoot.innerHTML = "";
    appRoot.style.display = "block";
    onSignedIn();
  } else {
    appRoot.style.display = "none";
    Clerk.mountSignIn(authRoot, {
      afterSignInUrl: window.location.href,
      afterSignUpUrl: window.location.href,
    });
  }
});

function onSignedIn() {
  console.log("Signed in as:", Clerk.user.id);

  // Replace auth UI with user button
  const authRoot = document.getElementById("auth-root");
  authRoot.innerHTML = "";
  Clerk.mountUserButton(authRoot);

  initApp();
}

/* ================================
   App Init (your existing logic)
================================ */

function initApp() {
  console.log("Initializing PeptiTrack app…");

  // TODO: put your existing startup code here
  // - tab setup
  // - fetch meds
  // - render UI
}

/* ================================
   Auth Header Helper
================================ */

async function getAuthHeaders() {
  const token = await Clerk.session?.getToken();
  if (!token) throw new Error("No auth token");

  return {
    "Authorization": `Bearer ${token}`,
    "Content-Type": "application/json",
  };
}

/* ================================
   Example API Call
================================ */

async function apiGet(url) {
  const headers = await getAuthHeaders();
  const res = await fetch(url, { headers });

  if (!res.ok) {
    throw new Error(`API error ${res.status}`);
  }

  return res.json();
}

/* ================================
   Sign Out
================================ */

document.getElementById("signOutBtn")?.addEventListener("click", async () => {
  await Clerk.signOut();
  window.location.reload();
});
