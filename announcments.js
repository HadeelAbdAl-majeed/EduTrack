const DATABASE_API_URL = "http://localhost:3000/instructors";
const CURRENT_INSTRUCTOR_ID = "inst_01";

async function fetchInstructorAnnouncements(instructorId) {
    try {
        const response = await fetch(`${DATABASE_API_URL}/${instructorId}`);
        if (!response.ok) throw new Error(); 
        const instructorData = await response.json();
        return instructorData.announcements || [];
    } catch (error) {
        return [];
    }
}

function renderAnnouncementsBoard(announcements) {
    const container = document.getElementById("announcements-container");
    container.innerHTML = "";

    if (announcements.length === 0) {
        container.innerHTML = `<p class="text-xs text-slate-400 text-center py-4">No announcements posted yet.</p>`;
        return;
    }

    announcements.forEach(ann => {
        const div = document.createElement("div");
        div.className = "bg-amber-50 border border-amber-200 rounded-lg p-3 shadow-sm mb-3";
        div.innerHTML = `
            <div class="flex justify-between items-start mb-1">
                <h4 class="text-sm font-bold text-slate-800">${ann.title}</h4>
                <span class="text-[10px] text-slate-400 font-medium">${ann.timestamp}</span>
            </div>
            <p class="text-xs text-slate-600 leading-relaxed">${ann.body}</p>
        `;
        container.appendChild(div);
    });
}

async function handleBroadcastAnnouncement() {
    try {
        const titleInput = document.getElementById("announcement-title");
        const bodyInput = document.getElementById("announcement-body");
        
        const title = titleInput.value.trim();
        const body = bodyInput.value.trim();
        
        if (!title || !body) {
            alert("Error: Both fields are required.");
            return;
        }

        const newAnnouncement = {
            id: `ann_${Date.now()}`,
            title: title,
            body: body,
            timestamp: new Date().toLocaleString("en-US", { hour12: true })
        };

        const getRes = await fetch(`${DATABASE_API_URL}/${CURRENT_INSTRUCTOR_ID}`);
        if (!getRes.ok) throw new Error();
        const instData = await getRes.json();

        instData.announcements.unshift(newAnnouncement);

        await fetch(`${DATABASE_API_URL}/${CURRENT_INSTRUCTOR_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(instData)
        });

        titleInput.value = "";
        bodyInput.value = "";

        const updatedAnnouncements = await fetchInstructorAnnouncements(CURRENT_INSTRUCTOR_ID);
        renderAnnouncementsBoard(updatedAnnouncements);

        alert("Announcement broadcasted and saved into db.json successfully!");

    } catch (error) {
        return;
    }
}

document.getElementById("broadcast-ann-btn").addEventListener("click", handleBroadcastAnnouncement);

document.addEventListener("DOMContentLoaded", async () => {
    const initialAnnouncements = await fetchInstructorAnnouncements(CURRENT_INSTRUCTOR_ID);
    renderAnnouncementsBoard(initialAnnouncements);
});
