/**
 * Course Management JavaScript
 * This file contains functions for updating and deleting courses
 */

// Function to update a course
async function updateCourse(courseId, courseData) {
    try {
        // Get CSRF token from cookies
        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) {
            throw new Error('CSRF token not found. Please refresh the page and try again.');
        }

        // Send PUT request to update the course
        const response = await fetch(`http://127.0.0.1:8000/api/courses/${courseId}/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            credentials: 'include',
            body: JSON.stringify(courseData)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to update course');
        }

        return {
            success: true,
            message: data.message || 'Course updated successfully',
            data: data.data
        };
    } catch (error) {
        console.error('Error updating course:', error);
        return {
            success: false,
            message: error.message || 'An error occurred while updating the course'
        };
    }
}

// Function to delete a course
async function deleteCourse(courseId) {
    try {
        // Get CSRF token from cookies
        const csrfToken = getCookie('csrftoken');
        if (!csrfToken) {
            throw new Error('CSRF token not found. Please refresh the page and try again.');
        }

        // Send DELETE request to delete the course
        const response = await fetch(`http://127.0.0.1:8000/api/courses/${courseId}/`, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            credentials: 'include'
        });

        if (response.status === 204) {
            return {
                success: true,
                message: 'Course deleted successfully'
            };
        }

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.message || data.error || 'Failed to delete course');
        }

        return {
            success: true,
            message: data.message || 'Course deleted successfully'
        };
    } catch (error) {
        console.error('Error deleting course:', error);
        return {
            success: false,
            message: error.message || 'An error occurred while deleting the course'
        };
    }
}

// Helper function to get cookie value by name
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}
  // Check if user is logged in
  document.addEventListener('DOMContentLoaded', function() {
    const userData = JSON.parse(localStorage.getItem('userData'));
    const userMenu = document.querySelector('.user-menu');
    
    if (userData) {
        userMenu.style.display = 'block';
    }
    
    // Load courses
    fetchCourses();
    
    // Handle tab switching
    const tabs = document.querySelectorAll('.tab');
    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            // Add active class to clicked tab
            this.classList.add('active');
            
            // Hide all tab contents
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('active');
            });
            
            // Show the selected tab content
            const tabId = this.getAttribute('data-tab');
            document.getElementById(`${tabId}-tab`).classList.add('active');
        });
    });
    
    // Handle add course form submission
    document.getElementById('addCourseForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const courseData = {
            title: document.getElementById('courseTitle').value,
            description: document.getElementById('courseDescription').value,
            category: document.getElementById('courseCategory').value,
            level: document.getElementById('courseLevel').value,
            price: document.getElementById('coursePrice').value,
            duration: document.getElementById('courseDuration').value,
            image_url: document.getElementById('courseImage').value,
            video_url: document.getElementById('courseVideo').value
        };
        
        try {
            // Get CSRF token from cookies
            const csrfToken = getCookie('csrftoken');
            if (!csrfToken) {
                throw new Error('CSRF token not found. Please refresh the page and try again.');
            }
            
            // Send POST request to create the course
            const response = await fetch('http://127.0.0.1:8000/api/courses/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': csrfToken
                },
                credentials: 'include',
                body: JSON.stringify(courseData)
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                throw new Error(data.message || data.error || 'Failed to create course');
            }
            
            showMessage('Course added successfully!', 'success');
            this.reset();
            fetchCourses();
            
            // Switch to the list tab
            document.querySelector('.tab[data-tab="list"]').click();
        } catch (error) {
            console.error('Error adding course:', error);
            showMessage(`Error adding course: ${error.message}`, 'error');
        }
    });
    
    // Handle update course form submission
    document.getElementById('updateCourseForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const courseId = document.getElementById('courseId').value;
        if (!courseId) {
            showMessage('Please select a course to update', 'error');
            return;
        }
        
        const courseData = {
            title: document.getElementById('title').value,
            description: document.getElementById('description').value,
            category: document.getElementById('category').value,
            level: document.getElementById('level').value,
            price: document.getElementById('price').value,
            duration: document.getElementById('duration').value,
            image_url: document.getElementById('image_url').value,
            video_url: document.getElementById('video_url').value
        };
        
        const result = await updateCourse(courseId, courseData);
        
        if (result.success) {
            showMessage(result.message, 'success');
            fetchCourses();
            
            // Switch to the list tab
            document.querySelector('.tab[data-tab="list"]').click();
        } else {
            showMessage(result.message, 'error');
        }
    });
    
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

// Function to fetch courses
async function fetchCourses() {
    try {
        const response = await fetch('http://127.0.0.1:8000/api/courses/', {
            method: 'GET',
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json'
            }
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
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
        
        displayCourses(coursesData);
    } catch (error) {
        console.error('Error fetching courses:', error);
        showMessage(`Error loading courses: ${error.message}`, 'error');
    }
}

// Function to display courses
function displayCourses(courses) {
    const courseList = document.getElementById('courseList');
    courseList.innerHTML = '';
    
    if (courses.length === 0) {
        courseList.innerHTML = '<p>No courses available.</p>';
        return;
    }
    
    courses.forEach(course => {
        const courseItem = document.createElement('div');
        courseItem.className = 'course-item';
        courseItem.innerHTML = `
            <div class="course-info">
                <h3>${course.title || 'Untitled Course'}</h3>
                <p>${course.description || 'No description available'}</p>
                <div>
                    <span>Category: ${course.category || 'Uncategorized'}</span> | 
                    <span>Level: ${course.level || 'Beginner'}</span> | 
                    <span>Price: $${course.price || '0.00'}</span> | 
                    <span>Duration: ${course.duration || 0} hours</span>
                </div>
            </div>
            <div class="course-actions">
                <button class="action-btn edit-btn" onclick="editCourse(${course.id})">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="action-btn delete-btn" onclick="confirmDelete(${course.id})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        courseList.appendChild(courseItem);
    });
}

// Function to edit a course
function editCourse(courseId) {
    // Find the course in the list
    fetch(`http://127.0.0.1:8000/api/courses/${courseId}/`, {
        method: 'GET',
        credentials: 'include',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(course => {
        // Populate the form with course data
        document.getElementById('courseId').value = course.id;
        document.getElementById('title').value = course.title || '';
        document.getElementById('description').value = course.description || '';
        document.getElementById('category').value = course.category || 'programming';
        document.getElementById('level').value = course.level || 'beginner';
        document.getElementById('price').value = course.price || 0;
        document.getElementById('duration').value = course.duration || 1;
        document.getElementById('image_url').value = course.image_url || '';
        document.getElementById('video_url').value = course.video_url || '';
        
        // Switch to the update tab
        document.querySelector('.tab[data-tab="update"]').click();
    })
    .catch(error => {
        console.error('Error fetching course details:', error);
        showMessage(`Error loading course details: ${error.message}`, 'error');
    });
}

// Function to confirm course deletion
function confirmDelete(courseId) {
    if (confirm('Are you sure you want to delete this course? This action cannot be undone.')) {
        deleteCourse(courseId)
            .then(result => {
                if (result.success) {
                    showMessage(result.message, 'success');
                    fetchCourses();
                } else {
                    showMessage(result.message, 'error');
                }
            })
            .catch(error => {
                console.error('Error deleting course:', error);
                showMessage(`Error deleting course: ${error.message}`, 'error');
            });
    }
}

// Function to show messages
function showMessage(message, type) {
    const messageContainer = document.getElementById('messageContainer');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${type}`;
    messageElement.innerHTML = message;
    
    messageContainer.innerHTML = '';
    messageContainer.appendChild(messageElement);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        messageElement.remove();
    }, 5000);
}

// Export functions for use in other scripts
window.updateCourse = updateCourse;
window.deleteCourse = deleteCourse; 