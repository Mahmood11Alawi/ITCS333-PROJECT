// events-calendar.js
class EventsCalendar {
  constructor() {
    this.apiUrl =
      "https://eb271d14-4d77-4c13-bbca-3db15cca8b8e-00-3q195n9bhfwrf.janeway.replit.dev/calender-event.php"
    this.events = []
    this.currentPage = 1
    this.itemsPerPage = 6
    this.init()
  }

  async init() {
    await this.fetchEvents()
    this.setupEventListeners()
    this.renderEvents()
  }

  async fetchEvents() {
    try {
      this.showLoading()
      const response = await fetch(this.apiUrl)
      if (!response.ok) throw new Error("Failed to fetch events")
      let data = await response.json()
      this.events = data
      this.hideLoading()
    } catch (error) {
      this.showError(error.message)
    }
  }

  setupEventListeners() {
    document
      .getElementById("search")
      .addEventListener("input", (e) => this.handleSearch(e.target.value))

    document
      .getElementById("category-filter")
      .addEventListener("change", (e) => this.handleFilter(e.target.value))

    document
      .getElementById("sort")
      .addEventListener("change", (e) => this.handleSort(e.target.value))

    document
      .querySelector(".pagination")
      .addEventListener("click", (e) => this.handlePagination(e))

    document
      .querySelector("form")
      ?.addEventListener("submit", (e) => this.handleFormSubmit(e))
  }

  async renderEvents() {
    const container = document.querySelector(".event-grid")
    container.style.opacity = "0"
    container.style.transform = "translateY(20px)"

    await new Promise((resolve) => setTimeout(resolve, 300))
    container.innerHTML = ""

    this.getPaginatedData().forEach((event) => {
      const card = this.createEventCard(event)
      container.appendChild(card)
    })

    this.renderPagination()
    container.style.opacity = "1"
    container.style.transform = "translateY(0)"
    container.style.transition = "all 0.3s ease-out"
  }

  createEventCard(event) {
    const card = document.createElement("article")
    card.style.transformOrigin = "center center"
    applyCardEffects(card)
    card.className = "event-card card"
    card.innerHTML = `
        <h3>${event.title}</h3>
        <p>📅 ${new Date(event.date).toLocaleDateString()} | 🕒 ${new Date(
      event.date
    ).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</p>

        <p>📍 ${event.location}</p>
        <a href="event-detail.html?id=${
          event.id
        }" class="button">View Details</a>
      `
    return card
  }

  // Pagination and filtering methods
  getPaginatedData() {
    const start = (this.currentPage - 1) * this.itemsPerPage
    const end = start + this.itemsPerPage
    return this.filteredEvents().slice(start, end)
  }

  filteredEvents() {
    const searchTerm = document.getElementById("search").value.toLowerCase()
    const category = document.getElementById("category-filter").value

    return this.events.filter((event) => {
      const matchesSearch =
        event.title.toLowerCase().includes(searchTerm) ||
        event.description.toLowerCase().includes(searchTerm)
      const matchesCategory =
        category === "All Categories" || event.category === category
      return matchesSearch && matchesCategory
    })
  }

  renderPagination() {
    const pageCount = Math.ceil(
      this.filteredEvents().length / this.itemsPerPage
    )
    const pagination = document.querySelector(".pagination")
    pagination.innerHTML = ""

    for (let i = 1; i <= pageCount; i++) {
      const button = document.createElement("button")
      button.textContent = i
      button.className = i === this.currentPage ? "active" : ""
      pagination.appendChild(button)
    }
  }

  // Event handlers
  handleSearch(query) {
    this.currentPage = 1
    this.renderEvents()
  }

  handleFilter(category) {
    this.currentPage = 1
    this.renderEvents()
  }

  handleSort(order) {
    this.events.sort((a, b) =>
      order === "Date: Ascending"
        ? new Date(a.date) - new Date(b.date)
        : new Date(b.date) - new Date(a.date)
    )
    this.renderEvents()
  }

  handlePagination(e) {
    if (e.target.tagName === "BUTTON") {
      this.currentPage = parseInt(e.target.textContent)
      this.renderEvents()
    }
  }

  async handleFormSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)

    if (!this.validateForm(formData)) return

    try {
      const newEvent = {
        title: formData.get("title"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        description: formData.get("description"),
        category: formData.get("category"),
      }

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })

      if (!response.ok) throw new Error("Failed to create event")
      window.location.href = "events-calendar.html"
    } catch (error) {
      this.showError(error.message)
    }
  }

  validateForm(formData) {
    let isValid = true
    const requiredFields = ["title", "date", "time", "location", "category"]

    requiredFields.forEach((field) => {
      const input = document.querySelector(`[name="${field}"]`)
      if (!formData.get(field)) {
        input.classList.add("invalid")
        isValid = false
      } else {
        input.classList.remove("invalid")
      }
    })

    return isValid
  }

  // UI Helpers
  showLoading() {
    document.getElementById("loading").style.display = "block"
  }

  hideLoading() {
    document.getElementById("loading").style.display = "none"
  }

  showError(message) {
    const errorDiv = document.getElementById("error")
    errorDiv.textContent = message
    errorDiv.style.display = "block"
    setTimeout(() => (errorDiv.style.display = "none"), 3000)
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector(".event-grid")) {
    new EventsCalendar()
  }
})
// Add mouse parallax effect to event cards
const applyCardEffects = (card) => {
  card.style.transition = "transform 0.3s ease-out"

  card.addEventListener("mousemove", (e) => {
    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    card.style.transform = `
          perspective(1000px)
          rotateX(${(y - rect.height / 2) / -90}deg)
          rotateY(${(x - rect.width / 2) / 90}deg)
          scale(1.02)
      `
  })

  card.addEventListener("mouseleave", () => {
    card.style.transform = "none"
  })
}
