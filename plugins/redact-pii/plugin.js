/*
  Hide annotator personal information (PII) if the logged user is not an Admin
*/

/**
 * Fetch currently logged user via the HumanSignal API
 */
async function fetchUserInfo() {
  const whoamiUrl = "https://app.humansignal.com/api/current-user/whoami";

  const response = await fetch(whoamiUrl, {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      // No Auth `credentials` needed for `same-origin` given Session-Based Authentication is used in the API
    }
  });

  if (!response.ok) {
      throw new Error(`Error: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data;
}

/**
 * Give visibility to the given selector
 */
function displayEl(sel) {
  const els = document.querySelectorAll(sel);
  if (els) {
    els.forEach(function (el, idx) {
      el.style.display = "block";
    });
  }
}

/**
 * If the logged in user is an Admin, remove the styling added to the view that hides
 * the annotator identity
 */
async function hidePII() {
  let user, role
  try {
    const userInfo = await fetchUserInfo();
    user = userInfo.username || 'Unknown';
    role = userInfo.org_membership[0].role || 'Unknown';
  } catch (error) {
    Htx.showModal(`Error fetching user information: ${error.message}`);
  }

  if (!user) {
      console.warn("Did not find a username and it was not 'Unknown'");
      return;
  }

  if (role === 'AD') {
    // console.log("Role is admin; displaying PII");

    // If admin, remove the nulled Style tag
    const firstChild = document.getElementById('noPII').firstChild;
    if (firstChild.tagName === 'STYLE') {
        firstChild.remove();
    }
  }
}

(async () => {
  await hidePII();
})();
