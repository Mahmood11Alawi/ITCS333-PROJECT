document.addEventListener('DOMContentLoaded', function() {
  console.log('Groups.js loaded');

  const sampleGroups = [{
   id: 1,
   title: "ITCS214 - Data Structures",
   subject: "Computer Science",
   meetingTime: "Wed 12-2pm",
   location: "Library Study Room A",
   members: 20,
   description: "Weekly study sessions for ITCS214 Data Structures course.",
   instructor: "Dr. Ali Mohammed",
   currentTopic: "Binary Search Trees"
  }, {
   id: 2,
   title: "MATHS122 - Calculus II",
   subject: "Mathematics",
   meetingTime: "Mon 4-6pm",
   location: "Room 204, Math Building",
   members: 15,
   description: "Study group for Calculus II course.",
   instructor: "Dr. Ahmed Mahmoud",
   currentTopic: "Integration Techniques"
  }, {
   id: 3,
   title: "ENGL126 - English for Science II",
   subject: "English",
   meetingTime: "Fri 1-3pm",
   location: "Online (Zoom)",
   members: 40,
   description: "This group helps science students improve their academic English skills.",
   instructor: "Prof. Sarah Johnson",
   currentTopic: "Scientific Paper Writing"
  }, {
   id: 7,
   title: "MATHS231 - Linear Algebra",
   subject: "Mathematics",
   meetingTime: "Tue 2-4pm",
   location: "Room 208, Math Building",
   members: 18,
   description: "Collaborative learning for the Linear Algebra course.",
   instructor: "Dr. Layla Ibrahim",
   currentTopic: "Eigenvalues and Eigenvectors"
  }, {
   id: 8,
   title: "ITCS251 - Web Development",
   subject: "Computer Science",
   meetingTime: "Thu 10-12pm",
   location: "IT Lab 1",
   members: 22,
   description: "A group to practice and discuss web development technologies.",
   instructor: "Eng. Mohammed Yusuf",
   currentTopic: "React Fundamentals"
  }, {
   id: 9,
   title: "ENGL215 - Technical Writing",
   subject: "English",
   meetingTime: "Sun 2-4pm",
   location: "Library Seminar Room",
   members: 16,
   description: "Improving technical writing skills for academic and professional purposes.",
   instructor: "Dr. Nadia Abbas",
   currentTopic: "Writing Effective Reports"
  }, {
   id: 10,
   title: "MATHS101 - Calculus I",
   subject: "Mathematics",
   meetingTime: "Wed 4-6pm",
   location: "Room 203, Math Building",
   members: 28,
   description: "A study group for students taking Calculus I.",
   instructor: "Dr. Jamal Hassan",
   currentTopic: "Limits and Continuity"
  }, {
   id: 11,
   title: "ITCS312 - Operating Systems",
   subject: "Computer Science",
   meetingTime: "Mon 1-3pm",
   location: "IT Lab 2",
   members: 14,
   description: "Discussions and problem-solving related to Operating Systems concepts.",
   instructor: "Dr. Amina Khalil",
   currentTopic: "Process Management"
  }, {
   id: 12,
   title: "ENGL121 - Academic Reading and Writing I",
   subject: "English",
   meetingTime: "Tue 1-3pm",
   location: "Online (Google Meet)",
   members: 35,
   description: "A supportive group for enhancing academic reading and writing skills.",
   instructor: "Prof. Susan Baker",
   currentTopic: "Essay Structure"
  }];

  if (document.querySelector('.groups')) {
   initStudyFinder(sampleGroups);
  }

  if (document.querySelector('.create-form')) {
   initFormValidation();
  }

  // Store groups in a way that's accessible to other functions
  window.studyGroups = sampleGroups;
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
   renderGroupDetails(groupsData); // ADDED: Render details
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
                <button class="show-detail" data-target="detail-${group.id}">Details</button>  
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

   if (e.target.classList.contains('show-detail')) {
    const targetId = e.target.dataset.target;
    showGroupDetail(targetId);
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

 async function submitComment(groupId, commentText) {
  try {
   const response = await callAPI('add_comment', {
    group_id: groupId,
    text: commentText
   });

   if (response.status === 'success') {
    //  Update description here
    addCommentToDiscussion(document.querySelector(`.comments-section[data-group-id="${groupId}"]`), commentText);
    return response.comment_id;
   } else {
    console.error('Failed to add comment:', response.message);
    return null;
   }
  } catch (error) {
   console.error('Error submitting comment:', error);
   return null;
  }
 }

 async function loadComments(groupId) {
  try {
   const response = await callAPI('get_comments', {
    group_id: groupId
   }, 'GET');

   if (response.status === 'success') {
    return response.comments;
   } else {
    console.error('Failed to load comments:', response.message);
    return [];
   }
  } catch (error) {
   console.error('Error loading comments:', error);
   return [];
  }
 }

 function renderGroupDetails(groups) {
  const detailsContainer = document.querySelector('.container'); // Assuming details are within the main container

  groups.forEach(group => {
   const detailElement = document.createElement('section');
   detailElement.className = 'event-detail';
   detailElement.id = `detail-${group.id}`;
   detailElement.innerHTML = `
            <a href="#" class="button-secondary back-to-groups">← Back to Groups</a>
            <div class="event-header">
                <span class="subject-badge ${getSubjectClass(group.subject)} large">${group.subject.substring(0, 3)}</span>
                <h2>${group.title}</h2>
            </div>
            
            <div class="event-info">
                <p><strong>When:</strong> ${group.meetingTime}</p>
                <p><strong>Where:</strong> ${group.location}</p>
                <p><strong>Members:</strong> ${group.members} students</p>
                <p><strong>Instructor:</strong> ${group.instructor}</p>
                <p><strong>Current Topic:</strong> ${group.currentTopic}</p>
            </div>
            
            <div class="event-description">
                <h3>Description</h3>
                <p>${group.description}</p>
            </div>
            
            <div class="comments-section" data-group-id="${group.id}">
                <h3>Discussion (<span class="comment-count">0</span>)</h3>
                <div class="comments-list">
                    </div>
                
                <div class="comment-form">
                    <textarea placeholder="Add to the discussion..."></textarea>
                    <button class="button-primary post-comment">Post Comment</button>
                </div>
            </div>
        `;

   detailsContainer.appendChild(detailElement);
   detailElement.style.display = 'none'; // Initially hide all detail sections
  });
 }

 function showGroupDetail(detailId) {
  // Hide all detail views
  document.querySelectorAll('.event-detail').forEach(detail => {
   detail.style.display = 'none';
  });

  // Show the selected detail view
  const targetDetail = document.getElementById(detailId);
  if (targetDetail) {
   targetDetail.style.display = 'block';

   // Scroll to the detail view
   targetDetail.scrollIntoView({
    behavior: 'smooth'
   });

   // Load comments if needed
   loadCommentsForDetail(targetDetail);
  }
 }