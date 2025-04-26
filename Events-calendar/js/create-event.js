class EventCreator {
  constructor() {
    this.apiUrl =
      "https://680bd3072ea307e081d2723c.mockapi.io/campus/event/event"
    this.form = document.querySelector("form")
    this.init()
  }

  init() {
    this.setupEventListeners()
  }

  setupEventListeners() {
    this.form.addEventListener("submit", (e) => this.handleSubmit(e))
  }

  async handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(this.form)

    if (!this.validateForm(formData)) return

    try {
      this.showLoading()

      const newEvent = {
        title: formData.get("title"),
        date: formData.get("date"),
        time: formData.get("time"),
        location: formData.get("location"),
        organizer: formData.get("organizer"),
        description: formData.get("description"),
        category: formData.get("category"),
        status: "upcoming",
      }
      console.log(newEvent)

      const response = await fetch(this.apiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newEvent),
      })

      if (!response.ok) throw new Error("Failed to create event")

      window.location.href = "events-calendar.html"
    } catch (error) {
      this.showError(error.message)
    } finally {
      this.hideLoading()
    }
  }

  validateForm(formData) {
    let isValid = true
    const requiredFields = [
      "title",
      "date",
      "time",
      "location",
      "category",
      "organizer",
    ]

    requiredFields.forEach((field) => {
      const input = this.form.querySelector(`[name="${field}"]`)
      const value = formData.get(field)

      if (!value.trim()) {
        input.classList.add("invalid")
        this.showFieldError(input, "This field is required")
        isValid = false
      } else {
        input.classList.remove("invalid")
        this.clearFieldError(input)
      }
    })

    // Additional validation for date
    const dateInput = this.form.querySelector('[name="date"]')
    if (new Date(dateInput.value) < new Date()) {
      this.showFieldError(dateInput, "Event date must be in the future")
      isValid = false
    }

    return isValid
  }

  showFieldError(input, message) {
    let errorElement = input.parentElement.querySelector(".error-message")
    if (!errorElement) {
      errorElement = document.createElement("div")
      errorElement.className = "error-message"
      input.parentElement.appendChild(errorElement)
    }
    errorElement.textContent = message
  }

  clearFieldError(input) {
    const errorElement = input.parentElement.querySelector(".error-message")
    if (errorElement) errorElement.remove()
  }

  showLoading() {
    const submitButton = this.form.querySelector('button[type="submit"]')
    submitButton.disabled = true
    submitButton.innerHTML = '<div class="spinner"></div> Creating...'
  }

  hideLoading() {
    const submitButton = this.form.querySelector('button[type="submit"]')
    submitButton.disabled = false
    submitButton.textContent = "Create Event"
  }

  showError(message) {
    const errorDiv = document.createElement("div")
    errorDiv.className = "global-error"
    errorDiv.textContent = message
    this.form.prepend(errorDiv)
    setTimeout(() => errorDiv.remove(), 5000)
  }
}

// Initialize when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  if (document.querySelector("form")) {
    new EventCreator()
  }
})
// Add input focus/blur effects
document.querySelectorAll("input, textarea, select").forEach((input) => {
  const parent = input.parentElement

  input.addEventListener("focus", () => {
    parent.style.transform = "translateX(10px)"
    parent.style.boxShadow = "0 0 15px rgba(18, 52, 88, 0.3)"
  })

  input.addEventListener("blur", () => {
    parent.style.transform = "translateX(0)"
    parent.style.boxShadow = "none"
  })
})

// Add validation success indicators
document.querySelectorAll("[required]").forEach((input) => {
  input.addEventListener("input", () => {
    if (input.checkValidity()) {
      input.parentElement.classList.add("valid")
    } else {
      input.parentElement.classList.remove("valid")
    }
  })
})
