
console.log('javascript.js loaded');

function handleSubmit(event) {
    event.preventDefault();
    console.log('Form submission handled');

    
    const formData = {
        name: document.getElementById('group-name').value,
        subject: document.getElementById('subject').value,
        meetingTime: formatMeetingTime(document.getElementById('meeting-time').value),
        location: document.getElementById('location').value
    };

    console.log('Form data:', formData);
    alert('Group created successfully!');
    window.location.href = 'study-finder.html';
}

function formatMeetingTime(dateTimeString) {
    if (!dateTimeString) return 'Not specified';
    
    const date = new Date(dateTimeString);
    return date.toLocaleString('en-US', {
        weekday: 'short',
        hour: '2-digit',
        minute: '2-digit'
    });
}


document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM fully loaded');
    initDetailViews();
});

function initDetailViews() {
    // Handle detail view navigation
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('show-detail')) {
            e.preventDefault();
            const targetId = e.target.dataset.target;
            
            // Hide all detail views
            document.querySelectorAll('.event-detail').forEach(detail => {
                detail.style.display = 'none';
            });
            
            // Show the selected detail view
            const targetDetail = document.getElementById(targetId);
            if (targetDetail) {
                targetDetail.style.display = 'block';
                
                // Scroll to the detail view
                targetDetail.scrollIntoView({ behavior: 'smooth' });
                
                // Load comments if needed
                loadCommentsForDetail(targetDetail);
            }
        }

        // Handle back button
        if (e.target.classList.contains('back-to-groups')) {
            e.preventDefault();
            
            // Hide all detail views
            document.querySelectorAll('.event-detail').forEach(detail => {
                detail.style.display = 'none';
            });
            
            // Scroll back to the top of the groups list
            document.querySelector('.groups').scrollIntoView({ behavior: 'smooth' });
        }
    });

    // Handle comment submission
    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('post-comment')) {
            e.preventDefault();
            const commentForm = e.target.closest('.comment-form');
            const textarea = commentForm.querySelector('textarea');
            const commentText = textarea.value.trim();
            
            if (commentText) {
                const commentsSection = commentForm.closest('.comments-section');
                const groupId = commentsSection.dataset.groupId;
                
                submitComment(groupId, commentText).then(commentId => {
                    if (commentId) {
                        addCommentToDiscussion(commentsSection, commentText);
                        textarea.value = '';
                        updateCommentCount(commentsSection);
                    }
                });
            }
        }
    });
}

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('back-to-groups')) {
            e.preventDefault();
            document.querySelectorAll('.event-detail').forEach(detail => {
                detail.style.display = 'none';
            });
        }
    });

    document.addEventListener('click', function(e) {
        if (e.target.classList.contains('post-comment')) {
            const commentForm = e.target.closest('.comment-form');
            const textarea = commentForm.querySelector('textarea');
            const commentText = textarea.value.trim();
            
            if (commentText) {
                const commentsSection = commentForm.closest('.comments-section');
                const groupId = commentsSection.dataset.groupId;
                
                submitComment(groupId, commentText).then(commentId => {
                    if (commentId) {
                        addCommentToDiscussion(commentsSection, commentText);
                        textarea.value = '';
                        updateCommentCount(commentsSection);
                    }
                });
            }
        }
    });


async function loadCommentsForDetail(detailElement) {
    const commentsSection = detailElement.querySelector('.comments-section');
    if (!commentsSection) return;

    const groupId = commentsSection.dataset.groupId;
    const commentsList = commentsSection.querySelector('.comments-list');
    
    try {
        const comments = await loadComments(groupId);
        commentsList.innerHTML = '';
        
        comments.forEach(comment => {
            const commentElement = document.createElement('div');
            commentElement.className = 'comment-card';
            commentElement.innerHTML = `
                <p class="comment-text">${comment.text}</p>
                <p class="comment-meta">- ${comment.username}, ${formatCommentDate(comment.created_at)}</p>
            `;
            commentsList.appendChild(commentElement);
        });
        
        updateCommentCount(commentsSection);
    } catch (error) {
        console.error('Error loading comments:', error);
    }
}

function formatCommentDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

function addCommentToDiscussion(commentsSection, commentText) {
    const commentCard = document.createElement('div');
    commentCard.classList.add('comment-card');
    commentCard.innerHTML = `
        <p class="comment-text">${commentText}</p>
        <p class="comment-meta">- You, Just Now</p>
    `;

    const commentsList = commentsSection.querySelector('.comments-list');
    if (commentsList) {
        commentsList.appendChild(commentCard);
        updateCommentCount(commentsSection);
    }
}

function updateCommentCount(commentsSection) {
    const commentCountElement = commentsSection.querySelector('.comment-count');
    const commentsList = commentsSection.querySelector('.comments-list');
    
    if (commentCountElement && commentsList) {
        const count = commentsList.querySelectorAll('.comment-card').length;
        commentCountElement.textContent = count;
    }
}

async function callAPI(action, data = {}, method = 'POST') {
    try {
        const url = `htdocs/api.php?action=${action}`;
        const options = {
            method,
            headers: { 'Content-Type': 'application/json' }
        };

        if (method !== 'GET') options.body = JSON.stringify(data);

        const response = await fetch(url, options);
        return await response.json();
    } catch (error) {
        console.error('API Error:', error);
        return { status: 'error', message: 'Network error' };
    }
}

document.addEventListener('click', async (e) => {
    if (e.target.classList.contains('join-btn')) {
        const groupId = e.target.dataset.id;
        const result = await callAPI('join_group', { group_id: groupId });
        
        if (result.status === 'success') {
            e.target.textContent = 'Joined';
            e.target.disabled = true;
        }
    }
});