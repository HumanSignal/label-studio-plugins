async function fetchUserInfo() {
    const whoamiUrl = "https://app.humansignal.com/api/current-user/whoami";
    try {
        const response = await fetch(whoamiUrl, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                // Include authorization if needed
                // 'Authorization': 'Bearer YOUR_ACCESS_TOKEN'
            }
        });

        if (!response.ok) {
            throw new Error(`Error: ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        return data;

    } catch (error) {
        console.error('Failed to fetch user information:', error);
    }
}

function displayEl(sel) {
    const els = document.querySelectorAll(sel);
    if (els) {
        els.forEach(function (el, idx) {
            el.style.display = "block";
        });
    }
}

async function replacePII() {
    const userInfo = await fetchUserInfo();
    const user = userInfo.username || 'Unknown';
    const role = userInfo.org_membership[0].role || 'Unknown';

    if (!user) {
        console.warn("Did not find a username and it was not 'Unknown'");
        return;
    }

    if (role == 'AD') {
        console.log("Role is admin; displaying PII");
        // If admin, remove the nulled Style tag
        const firstChild = document.getElementById('noPII').firstChild;
        if (firstChild.tagName === 'STYLE') {
            firstChild.remove();
        }
    }

}

(async () => {
    await replacePII();
})();
