
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

    document.querySelectorAll('.back-button').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'study-finder.html';
        });
    });

    // Comment submission
    document.querySelectorAll('.comment-form button').forEach(button => {
        button.addEventListener('click', function() {
            const textarea = this.parentElement.querySelector('textarea');
            if (!textarea) return;

            const commentText = textarea.value.trim();
            if (commentText) {
                addComment(this.closest('.comments-section'), commentText);
                textarea.value = '';
            }
        });
    });
});

function addComment(commentsSection, text) {
    if (!commentsSection) return;

    const commentCard = document.createElement('div');
    commentCard.className = 'comment-card';
    commentCard.innerHTML = `
        <p class="comment-text">${text}</p>
        <p class="comment-meta">- You, just now</p>
    `;

    const commentForm = commentsSection.querySelector('.comment-form');
    if (commentForm) {
        commentsSection.insertBefore(commentCard, commentForm);
        updateCommentCount(commentsSection);
    }
}

function updateCommentCount(commentsSection) {
    const commentCountElement = commentsSection.querySelector('h3');
    if (!commentCountElement) return;

    const currentCount = parseInt(commentCountElement.textContent.match(/\d+/) || [0])[0];
    commentCountElement.textContent = `Discussion (${currentCount + 1})`;
}
