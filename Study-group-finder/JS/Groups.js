
document.addEventListener('DOMContentLoaded', function() {
    console.log('Groups.js loaded');
    

    const sampleGroups = [
        {
            id: 1,
            title: "ITCS214 - Data Structures",
            subject: "Computer Science",
            meetingTime: "Wed 12-2pm",
            location: "Library Study Room A",
            members: 20,
            description: "Weekly study sessions for ITCS214 Data Structures course.",
            instructor: "Dr. Ali Mohammed",
            currentTopic: "Binary Search Trees"
        },
        {
            id: 2,
            title: "MATHS122 - Calculus II",
            subject: "Mathematics",
            meetingTime: "Mon 4-6pm",
            location: "Room 204, Math Building",
            members: 15,
            description: "Study group for Calculus II course.",
            instructor: "Dr. Ahmed Mahmoud",
            currentTopic: "Integration Techniques"
        },
        {
            id: 3,
            title: "ENGL126 - English for Science II",
            subject: "English",
            meetingTime: "Fri 1-3pm",
            location: "Online (Zoom)",
            members: 40,
            description: "This group helps science students improve their academic English skills.",
            instructor: "Prof. Sarah Johnson",
            currentTopic: "Scientific Paper Writing"
        }
    ];

    
    if (document.querySelector('.groups')) {
        initStudyFinder(sampleGroups);
    }
    
    if (document.querySelector('.create-form')) {
        initFormValidation();
    }
});

function initStudyFinder(groupsData) {
    console.log('Initializing Study Finder');
    const groupsContainer = document.querySelector('.groups');
    
    if (!groupsContainer) {
        console.error('Groups container not found');
        return;
    }

    
    const loadingIndicator = document.createElement('div');
    loadingIndicator.className = 'loading';
    loadingIndicator.innerHTML = '<p>Loading groups...</p>';
    groupsContainer.appendChild(loadingIndicator);

   
    setTimeout(() => {
        groupsContainer.removeChild(loadingIndicator);
        renderGroups(groupsData);
        setupEventListeners(groupsData);
    }, 1000);
}

function renderGroups(groups) {
    const groupsContainer = document.querySelector('.groups');
    groupsContainer.innerHTML = '';

    if (!groups || groups.length === 0) {
        groupsContainer.innerHTML = '<p class="no-results">No groups found matching your criteria.</p>';
        return;
    }

    groups.forEach(group => {
        const subjectClass = getSubjectClass(group.subject);
        const groupElement = document.createElement('div');
        groupElement.className = 'event-card';
        groupElement.id = `group-${group.id}`;
        
        groupElement.innerHTML = `
            <span class="subject-badge ${subjectClass}">${group.subject.substring(0, 3)}</span>
            <h3>${group.title}</h3>
            <p class="event-time">${group.meetingTime}</p>
            <p class="event-location">${group.location}</p>
            <div class="event-meta">
                <span>${group.members} members</span>
                <a href="#detail-${group.id}" class="button-secondary">Details</a>
            </div>
            <div class="event-actions">
                <button class="join-button" data-id="${group.id}">Join Group</button>
            </div>
        `;
        
        groupsContainer.appendChild(groupElement);
    });
}

function getSubjectClass(subject) {
    const subjectMap = {
        'Computer Science': 'cs',
        'Mathematics': 'math',
        'English': 'eng'
    };
    return subjectMap[subject] || '';
}

function setupEventListeners(groups) {
   
    const searchInput = document.querySelector('.search input');
    const subjectFilter = document.querySelector('.search select');
    
    if (searchInput && subjectFilter) {
        searchInput.addEventListener('input', () => filterGroups(groups));
        subjectFilter.addEventListener('change', () => filterGroups(groups));
    }

    
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('join-button')) {
            const groupId = parseInt(e.target.dataset.id);
            joinGroup(groupId, groups);
        }
    });
}

function filterGroups(allGroups) {
    const searchInput = document.querySelector('.search input');
    const subjectFilter = document.querySelector('.search select');
    const searchTerm = searchInput.value.toLowerCase();
    const subject = subjectFilter.value;

    const filtered = allGroups.filter(group => {
        const matchesSearch = group.title.toLowerCase().includes(searchTerm) || 
                            group.description.toLowerCase().includes(searchTerm);
        const matchesSubject = subject === 'All Subjects' || group.subject === subject;
        return matchesSearch && matchesSubject;
    });

    renderGroups(filtered);
}

function joinGroup(groupId, groups) {
    const group = groups.find(g => g.id === groupId);
    if (!group) return;

    alert(`You have joined ${group.title}!`);
    const joinButton = document.querySelector(`.join-button[data-id="${groupId}"]`);
    if (joinButton) {
        joinButton.textContent = 'Joined';
        joinButton.disabled = true;
    }
}

function initFormValidation() {
    const form = document.querySelector('.create-form');
    if (!form) return;

    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const isValid = validateGroupForm();
        if (isValid) {
            alert('Group created successfully!');
            form.reset();
            window.location.href = 'study-finder.html';
        }
    });
}

function validateGroupForm() {
    let isValid = true;
    const form = document.querySelector('.create-form');
    
  
    form.querySelectorAll('.error').forEach(el => el.classList.remove('error'));
    form.querySelectorAll('.error-message').forEach(el => el.remove());

   
    isValid = validateField('group-name', 'Group name is required') && isValid;
    isValid = validateField('subject', 'Please select a subject') && isValid;
    isValid = validateField('meeting-time', 'Please select a meeting time') && isValid;
    isValid = validateField('location', 'Location is required') && isValid;

    return isValid;
}

function validateField(fieldId, errorMessage) {
    const field = document.getElementById(fieldId);
    if (!field) return false;

    if (!field.value.trim()) {
        field.classList.add('error');
        const errorElement = document.createElement('div');
        errorElement.className = 'error-message';
        errorElement.textContent = errorMessage;
        errorElement.style.color = 'red';
        field.parentNode.appendChild(errorElement);
        return false;
    }
    return true;
}