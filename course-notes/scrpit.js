const BASE_URL = "https://YOUR_REPLIT_URL_HERE"; // e.g., https://campus-hub-course-notes.username.repl.co
const API_URL = `${BASE_URL}/notes`;

// Handle form submission
document.getElementById("noteForm").addEventListener("submit", async (e) => {
  e.preventDefault();
  const title = document.getElementById("title").value.trim();
  const content = document.getElementById("content").value.trim();

  if (!title || !content) return alert("Both fields are required!");

  try {
    const res = await fetch(API_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title, content })
    });

    const result = await res.json();
    if (res.ok) {
      alert("Note added!");
      document.getElementById("noteForm").reset();
      loadNotes();
    } else {
      alert("Error: " + result.error);
    }
  } catch (err) {
    alert("Network error: " + err.message);
  }
});

// Load notes and display them
async function loadNotes() {
  try {
    const res = await fetch(API_URL);
    const notes = await res.json();
    const list = document.getElementById("notesList");
    list.innerHTML = "";

    notes.forEach(note => {
      const li = document.createElement("li");
      li.textContent = `${note.title}: ${note.content}`;
      list.appendChild(li);
    });
  } catch (err) {
    console.error("Failed to load notes", err);
  }
}

// Load on page load
loadNotes();
