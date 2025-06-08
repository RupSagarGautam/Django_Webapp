const hamburger = document.getElementById('hamburger');
const navMenu = document.getElementById('nav-menu');

hamburger.addEventListener('click', () => {
    navMenu.classList.toggle('active');
    hamburger.classList.toggle('active');
});

// Add these variables at the top of your script
let allCourses = []; // Store all courses
let filteredCourses = []; // Store filtered courses

async function fetchCourses() {
    try {
        // Add credentials to fetch request
        const response = await fetch('http://127.0.0.1:8000/api/courses/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });

        console.log('Response status:', response.status); // Debug log

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data); // Debug log
        
        // Handle both array response and object with results
        let coursesData = [];
        if (Array.isArray(data)) {
            coursesData = data;
        } else if (data.results && Array.isArray(data.results)) {
            coursesData = data.results;
        } else if (data.status === 'success' && Array.isArray(data.results)) {
            coursesData = data.results;
        } else {
            throw new Error('Invalid data format received from server');
        }

        // Store and display courses
        allCourses = coursesData;
        filteredCourses = [...allCourses];
        
        if (allCourses.length === 0) {
            console.log('No courses found in the database');
            coursesGrid.innerHTML = '<p>No courses available at the moment.</p>';
            return;
        }

        // Display courses
        displayCourses(filteredCourses);
        console.log('Courses displayed successfully');

    } catch (error) {
        console.error('Error details:', {
            message: error.message,
            stack: error.stack
        });
        
        const errorMessage = error.message.includes('Failed to fetch') 
            ? 'Unable to connect to the server. Please check your connection and try again.'
            : `Error loading courses: ${error.message}`;
        
        showErrorMessage(errorMessage);
        
        // Show user-friendly message in the courses grid
        const coursesGrid = document.getElementById('coursesGrid');
        coursesGrid.innerHTML = `
            <div class="error-state">
                <i class="fas fa-exclamation-circle"></i>
                <p>Unable to load courses at the moment.</p>
                <button onclick="fetchCourses()" class="retry-btn">Try Again</button>
            </div>
        `;
    }
}

function displayCourses(courses) {
    const coursesGrid = document.getElementById('coursesGrid');
    if (!courses || courses.length === 0) {
        coursesGrid.innerHTML = '<p>No courses found matching your search.</p>';
        return;
    }

    coursesGrid.innerHTML = courses.map(course => {
        // Safely handle potentially undefined URLs
        const imageUrl = course.image
            ? (course.image.startsWith('http') 
                ? course.image
                : course.image.startsWith('/')
                    ? `http://127.0.0.1:8000${course.image}`
                    : `http://127.0.0.1:8000/${course.image}`)
            : '/Image/placeholder.jpg';

        // Improved video URL handling
        const videoUrl = course.video_url || course.video;  // Try both possible field names
        const fullVideoUrl = videoUrl
            ? (videoUrl.startsWith('http')
                ? videoUrl
                : `http://127.0.0.1:8000${videoUrl}`)
            : '';

        // Check if video URL is valid
        const hasValidVideo = Boolean(fullVideoUrl);

        // Safely format price with fallback to 0
        const formattedPrice = course.price 
            ? parseFloat(course.price).toFixed(2)
            : '0.00';

        // Safely handle other potentially undefined properties
        const title = course.title || 'Untitled Course';
        const description = course.description || 'No description available';
        const category = course.category || 'Uncategorized';
        const level = course.level || 'Beginner';
        const duration = course.duration || 0;

        return `
            <div class="course-card">
                <div class="course-image">
                    <img src="${imageUrl}" alt="${title}" 
                        onerror="this.src='/Image/placeholder.jpg'"
                        loading="lazy">
                    <div class="course-badge">${level}</div>
                </div>
                <div class="course-content">
                    <span class="course-category">${category}</span>
                    <h3>${title}</h3>
                    <p>${description}</p>
                    <div class="course-meta">
                        <span><i class="fas fa-clock"></i> ${duration} hours</span>
                        <span><i class="fas fa-signal"></i> ${level}</span>
                        <span><i class="fas fa-tag"></i> $${formattedPrice}</span>
                    </div>
                    ${hasValidVideo 
                        ? `<button class="enroll-btn" onclick="playVideo('${title}', '${fullVideoUrl}')">Learn Now</button>`
                        : `<button class="enroll-btn disabled" disabled>Video Not Available</button>`
                    }
                </div>
            </div>
        `;
    }).join('');
}

function searchCourses() {
    const searchInput = document.getElementById('searchInput').value.toLowerCase().trim();
    
    if (searchInput === '') {
        // If search is empty, show all courses
        filteredCourses = [...allCourses];
        displayCourses(filteredCourses);
        return;
    }

    // Filter courses based on search input
    filteredCourses = allCourses.filter(course => 
        course.title.toLowerCase().includes(searchInput) ||
        course.description.toLowerCase().includes(searchInput) ||
        course.category.toLowerCase().includes(searchInput)
    );

    displayCourses(filteredCourses);
}

// Add event listener for Enter key in search input
document.getElementById('searchInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        searchCourses();
    }
});

// Add event listener for real-time search
document.getElementById('searchInput').addEventListener('input', function() {
    searchCourses();
});

// Modal functionality
const modal = document.getElementById('videoModal');
const closeBtn = document.getElementsByClassName('close-modal')[0];
const video = document.getElementById('courseVideo');

// Function to play video in modal
function playVideo(title, videoUrl) {
    try {
        // Get video element and modal elements
        const modalTitle = document.getElementById('modalTitle');
        const videoContainer = document.querySelector('.video-container');
        
        // Validate video URL
        if (!videoUrl) {
            throw new Error('Video URL is missing or invalid');
        }

        // Set the modal title
        modalTitle.textContent = title;
        
        // Create a new video element with proper attributes
        videoContainer.innerHTML = `
            <video id="courseVideo" controls controlsList="nodownload" playsinline>
                <source src="${videoUrl}" type="video/mp4">
                <source src="${videoUrl}" type="video/webm">
                Your browser does not support the video tag.
            </video>
        `;

        // Get the newly created video element
        const videoElement = document.getElementById('courseVideo');
        
        // Display the modal
        modal.style.display = 'block';
        
        // Handle video loading errors
        videoElement.onerror = function() {
            const errorMessage = getVideoErrorMessage(videoElement.error);
            console.error('Video Error:', errorMessage);
            showErrorMessage(`Error loading video: ${errorMessage}`);
        };

        // Log success
        console.log('Video player initialized successfully');
        
        // Add loading indicator
        videoElement.addEventListener('loadstart', () => {
            console.log('Video loading started');
        });
        
        videoElement.addEventListener('canplay', () => {
            console.log('Video can start playing');
        });
        
        videoElement.addEventListener('playing', () => {
            console.log('Video is playing');
        });

    } catch (error) {
        console.error('Video Player Error:', error);
        showErrorMessage(`Failed to initialize video player: ${error.message}`);
    }
}

// Function to get specific video error messages
function getVideoErrorMessage(error) {
    if (!error) return 'Unknown error occurred';
    
    // Map error codes to user-friendly messages
    switch (error.code) {
        case MediaError.MEDIA_ERR_ABORTED:
            return 'Video playback was aborted';
        case MediaError.MEDIA_ERR_NETWORK:
            return 'A network error occurred while loading the video';
        case MediaError.MEDIA_ERR_DECODE:
            return 'Video format is not supported';
        case MediaError.MEDIA_ERR_SRC_NOT_SUPPORTED:
            return 'Video source is not supported or file not found';
        default:
            return `Error code ${error.code}: ${error.message}`;
    }
}

// Function to display error messages to the user
function showErrorMessage(message) {
    // Create error message container
    const errorDiv = document.createElement('div');
    errorDiv.className = 'error-message';
    
    // Add error message content with icon and dismiss button
    errorDiv.innerHTML = `
        <div class="error-content">
            <i class="fas fa-exclamation-circle"></i>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    
    // Add error message to the page
    document.body.appendChild(errorDiv);
}

// Handle modal close button click
closeBtn.onclick = function() {
    const videoContainer = document.querySelector('.video-container');
    // Clear the video container
    videoContainer.innerHTML = '';
    // Hide the modal
    modal.style.display = 'none';
}

// Handle clicks outside the modal
window.onclick = function(event) {
    if (event.target == modal) {
        const videoContainer = document.querySelector('.video-container');
        // Clear the video container
        videoContainer.innerHTML = '';
        // Hide the modal
        modal.style.display = 'none';
    }
}

// Call fetchCourses when the page loads
document.addEventListener('DOMContentLoaded', fetchCourses);

// Add this to your existing JavaScript
document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userMenu = document.querySelector('.user-menu');
    const manageCourseLink = document.getElementById('manageCourseLink');
    
    if (userData) {
        userMenu.style.display = 'block';
        // Check if user's email is rupsagargautam@gmail.com
        if (userData.email === 'rupsagargautam@gmail.com') {
            manageCourseLink.style.display = 'block';
        } else {
            manageCourseLink.style.display = 'none';
        }
    }

    // Handle logout
    document.getElementById('logoutBtn').addEventListener('click', function(e) {
        e.preventDefault();
        fetch('http://127.0.0.1:8000/api/auth/logout/', {
            method: 'POST',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (response.ok) {
                // Clear user data from localStorage
                localStorage.removeItem('userData');
                // Redirect to auth page
                window.location.href = 'auth.html';
            } else {
                throw new Error('Logout failed');
            }
        })
        .catch(error => {
            console.error('Error:', error);
            // Even if the server request fails, clear local data and redirect
            localStorage.removeItem('userData');
            window.location.href = 'auth.html';
        });
    });
});

// Add close button functionality
document.querySelector('.close-modal').addEventListener('click', function() {
    window.location.reload();
});

// Add this function to handle category clicks
function scrollToSearch(event) {
    event.preventDefault();
    const searchSection = document.querySelector('.search-bar');
    searchSection.scrollIntoView({ behavior: 'smooth' });
}

// Update the form submission error handling
document.getElementById('addCourseForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    try {
        const formData = {
            title: document.getElementById('courseTitle').value.trim(),
            description: document.getElementById('courseDescription').value.trim(),
            category: document.getElementById('courseCategory').value,
            level: document.getElementById('courseLevel').value,
            price: document.getElementById('coursePrice').value,
            duration: document.getElementById('courseDuration').value,
            image_url: document.getElementById('courseImage').value.trim(),
            video_url: document.getElementById('courseVideo').value.trim()
        };

        // Validate form data
        if (!formData.title) throw new Error('Course title is required');
        if (!formData.description) throw new Error('Course description is required');
        if (!formData.category) throw new Error('Please select a category');
        if (!formData.level) throw new Error('Please select a level');
        if (!formData.price || formData.price < 0) throw new Error('Please enter a valid price');
        if (!formData.duration || formData.duration < 1) throw new Error('Please enter a valid duration');
        if (!formData.image_url) throw new Error('Image URL is required');
        if (!formData.video_url) throw new Error('Video URL is required');

        // Validate URLs
        try {
            new URL(formData.image_url);
            new URL(formData.video_url);
        } catch (urlError) {
            throw new Error('Please enter valid URLs for image and video');
        }

        const csrfToken = document.cookie.split('; ')
            .find(row => row.startsWith('csrftoken='))
            ?.split('=')[1];

        if (!csrfToken) {
            throw new Error('CSRF token not found. Please refresh the page.');
        }

        const response = await fetch('http://127.0.0.1:8000/api/courses/', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify(formData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Server error: ' + response.statusText);
        }

        showSuccessMessage('Course added successfully!');
        this.reset();
        fetchCourses();
    } catch (error) {
        console.error('Form Submission Error:', error);
        showErrorMessage(error.message || 'Failed to add course. Please try again.');
    }
});

function showSuccessMessage(message) {
    const successDiv = document.createElement('div');
    successDiv.className = 'success-message';
    successDiv.innerHTML = `
        <div class="success-content">
            <i class="fas fa-check-circle"></i>
            <p>${message}</p>
            <button onclick="this.parentElement.parentElement.remove()">OK</button>
        </div>
    `;
    document.body.appendChild(successDiv);
}