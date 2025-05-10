class EventDetail {
  constructor() {
    this.eventId = new URLSearchParams(window.location.search).get("id")
    this.init()
  }

  async init() {
    await this.fetchEvent()
  }

  async fetchEvent() {
    try {
      const response = await fetch(
        `https://eb271d14-4d77-4c13-bbca-3db15cca8b8e-00-3q195n9bhfwrf.janeway.replit.dev/calender-event.php?id=${this.eventId}`
      )
      if (!response.ok) throw new Error("Event not found")
      const event = await response.json()
      this.renderEvent(event)
    } catch (error) {
      this.showError(error.message)
    }
  }

  renderEvent(event) {
    const eventInfo = document.querySelector(".event-info")
    eventInfo.innerHTML = `
      <header>
        <h1>${event.title}</h1>
        <div class="grid">
          <button id="editEventBtn">Edit Event</button>
          <button class="secondary" id="deleteEventBtn">Delete Event</button>
        </div>
      </header>
      <p>📅 ${new Date(event.date).toLocaleDateString()} | 🕒 ${new Date(
      event.date
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>

      <p>📍 ${event.location}</p>
      <p>🔖 Organized By: ${event.organizer}</p>
      <p>🔖 Category: ${event.category}</p>
      <p>📝 Description: ${event.description}</p>
      <section>
        <form id="comments-form">
          <textarea placeholder="Add your comment..." rows="3"></textarea>
          <button type="submit">Post Comment</button>
        </form>
        <div id="comments-container"></div>
      </section>
    `
    this.renderComments(event.comments || [])

    document
      .getElementById("editEventBtn")
      .addEventListener("click", () => this.editEvent())
    document
      .getElementById("deleteEventBtn")
      .addEventListener("click", () => this.deleteEvent())

    document
      .getElementById("comments-form")
      .addEventListener("submit", async (e) => {
        e.preventDefault()
        const text = document.querySelector("textarea").value.trim()
        if (!text) return

        try {
          await fetch(
            `https://eb271d14-4d77-4c13-bbca-3db15cca8b8e-00-3q195n9bhfwrf.janeway.replit.dev/comments.php?event_id=${this.eventId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ event_id: this.eventId, text }),
            }
          )
          document.querySelector("textarea").value = ""
          this.fetchEvent()
        } catch (error) {
          console.error("Comment error:", error)
        }
      })
  }

  renderComments(comments) {
    const commentsContainer = document.querySelector("#comments-container")
    commentsContainer.innerHTML = comments
      .map(
        (comment) => `
          <article class="card">
              <div class="card-content">
                  <p>${comment.text}</p>
                  <button class="delete-comment" data-id="${comment.id}">Delete</button>
              </div>
          </article>
      `
      )
      .join("")

    document.querySelectorAll(".delete-comment").forEach((btn) => {
      btn.addEventListener("click", () => this.deleteComment(btn.dataset.id))
    })
  }

  async deleteComment(commentId) {
    try {
      await fetch(
        `https://eb271d14-4d77-4c13-bbca-3db15cca8b8e-00-3q195n9bhfwrf.janeway.replit.dev/comments.php?event_id=${this.eventId}`,
        {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ commentId }),
        }
      )
      this.fetchEvent()
    } catch (error) {
      console.error("Delete error:", error)
    }
  }

  async deleteEvent() {
    const modal = new CustomModal("Delete this event permanently?")
    const confirm = await modal.show()
    if (!confirm) return
    try {
      await fetch(
        `https://eb271d14-4d77-4c13-bbca-3db15cca8b8e-00-3q195n9bhfwrf.janeway.replit.dev/calender-event.php?id=${this.eventId}`,
        { method: "DELETE" }
      )
      window.location.href = "events-calendar.html"
    } catch (e) {
      console.error(e)
    }
  }

  async submitEditEvent(e) {
    e.preventDefault()

    const form = e.target
    const formData = new FormData(form)

    const updatedEvent = {
      title: formData.get("title"),
      date: formData.get("date"),
      time: formData.get("time"),
      location: formData.get("location"),
      organizer: formData.get("organizer"),
      category: formData.get("category"),
      description: formData.get("description"),
    }

    try {
      await fetch(
        `https://eb271d14-4d77-4c13-bbca-3db15cca8b8e-00-3q195n9bhfwrf.janeway.replit.dev/calender-event.php?id=${this.eventId}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(updatedEvent),
        }
      )
      alert("Event updated successfully!")
      this.fetchEvent()
    } catch (error) {
      console.error("Edit error:", error)
      alert("Failed to update event.")
    }
  }

  async editEvent() {
    try {
      const response = await fetch(
        `https://eb271d14-4d77-4c13-bbca-3db15cca8b8e-00-3q195n9bhfwrf.janeway.replit.dev/calender-event.php?id=${this.eventId}`
      )
      if (!response.ok) throw new Error("Event not found")
      const event = await response.json()

      const eventInfo = document.querySelector(".event-info")
      eventInfo.innerHTML = `
      <form id="editEventForm">
          <header class="form-header">
              <h1>Edit Event</h1>
          </header>
          
          <div class="form-grid">
              <label>
                  Title
                  <input type="text" name="title" value="${
                    event.title
                  }" required>
              </label>
              
              <label>
                  Date
                  <input type="date" name="date" value="${event.date}" required>
              </label>
              
              <label>
                  Time
                  <input type="time" name="time" value="${event.time}" required>
              </label>
              
              <label>
                  Location
                  <input type="text" name="location" value="${
                    event.location
                  }" required>
              </label>
              
              <label>
                  Organizer
                  <input type="text" name="organizer" value="${
                    event.organizer
                  }" required>
              </label>
              
              <label>
                  Category
                  <select name="category" required>
                      <option ${
                        event.category === "Academic" ? "selected" : ""
                      }>Academic</option>
                      <option ${
                        event.category === "Social" ? "selected" : ""
                      }>Social</option>
                      <option ${
                        event.category === "Sports" ? "selected" : ""
                      }>Sports</option>
                  </select>
              </label>
              
              <label class="full-width">
                  Description
                  <textarea name="description" rows="4" required>${
                    event.description
                  }</textarea>
              </label>
          </div>

          <div class="form-actions">
              <button type="submit">Save Changes</button>
              <button type="button" class="secondary" id="cancelEditBtn">Cancel</button>
          </div>
      </form>
  `
      document
        .getElementById("editEventForm")
        .addEventListener("submit", this.submitEditEvent.bind(this))

      document
        .getElementById("cancelEditBtn")
        .addEventListener("click", () => this.fetchEvent())
    } catch (error) {
      this.showError(error.message)
    }
  }
}

class CustomModal {
  constructor(message, confirmText = "Confirm", cancelText = "Cancel") {
    this.modal = document.createElement("div")
    this.modal.className = "custom-modal"
    this.modal.innerHTML = `
          <div class="modal-content">
              <p>${message}</p>
              <div class="modal-actions">
                  <button class="confirm">${confirmText}</button>
                  <button class="secondary cancel">${cancelText}</button>
              </div>
          </div>
      `
    document.body.appendChild(this.modal)
  }

  show() {
    return new Promise((resolve) => {
      this.modal.style.display = "flex"
      this.modal.querySelector(".confirm").addEventListener("click", () => {
        resolve(true)
        this.hide()
      })
      this.modal.querySelector(".cancel").addEventListener("click", () => {
        resolve(false)
        this.hide()
      })
    })
  }

  hide() {
    this.modal.style.display = "none"
  }
}

document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".event-detail")) {
    new EventDetail()
  }
})
