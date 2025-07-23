document.addEventListener('DOMContentLoaded', function() {
  initAdminDashboard();
  initCharts();
  initModerationTools();
  initContentManagement();
  initUserManagement();
  initSettings();
  initRealTimeUpdates();
});

// Initialize admin dashboard
function initAdminDashboard() {
  console.log('Admin dashboard initialized');
  
  // Sidebar toggle
  const sidebarToggle = document.getElementById('sidebar-toggle');
  const adminSidebar = document.getElementById('admin-sidebar');
  const adminMain = document.getElementById('admin-main');
  
  if (sidebarToggle && adminSidebar && adminMain) {
    sidebarToggle.addEventListener('click', function() {
      adminSidebar.classList.toggle('sidebar-expanded');
      adminSidebar.classList.toggle('sidebar-collapsed');
      adminMain.classList.toggle('main-expanded');
      adminMain.classList.toggle('main-collapsed');
      
      const icon = this.querySelector('i');
      if (adminSidebar.classList.contains('sidebar-collapsed')) {
        icon.classList.remove('fa-chevron-left');
        icon.classList.add('fa-chevron-right');
      } else {
        icon.classList.remove('fa-chevron-right');
        icon.classList.add('fa-chevron-left');
      }
    });
  }
  
  // Submenu toggles
  document.querySelectorAll('.admin-sidebar button[aria-expanded]').forEach(button => {
    button.addEventListener('click', function() {
      const targetId = this.getAttribute('aria-controls');
      const target = document.getElementById(targetId);
      const isExpanded = this.getAttribute('aria-expanded') === 'true';
      
      this.setAttribute('aria-expanded', !isExpanded);
      target.classList.toggle('hidden');
      
      const icon = this.querySelector('i:last-child');
      if (icon) {
        icon.classList.toggle('rotate-180');
      }
    });
  });
  
  // Load dashboard data
  loadDashboardData();
}

// Initialize charts
function initCharts() {
  // Traffic chart
  const trafficCtx = document.getElementById('trafficChart');
  if (trafficCtx) {
    new Chart(trafficCtx, {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        datasets: [{
          label: 'Page Views',
          data: [1500, 2400, 2800, 3200, 4500, 5200, 5800, 6500, 7100, 7800, 8500, 9200],
          borderColor: '#6366f1',
          backgroundColor: 'rgba(99, 102, 241, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#6366f1',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#6366f1',
          pointHoverBorderColor: '#ffffff'
        }, {
          label: 'Unique Visitors',
          data: [800, 1200, 1500, 1800, 2200, 2500, 2800, 3200, 3500, 3800, 4100, 4400],
          borderColor: '#8b5cf6',
          backgroundColor: 'rgba(139, 92, 246, 0.1)',
          borderWidth: 3,
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#8b5cf6',
          pointBorderColor: '#ffffff',
          pointHoverRadius: 6,
          pointHoverBackgroundColor: '#8b5cf6',
          pointHoverBorderColor: '#ffffff'
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'top',
            labels: {
              font: {
                family: 'Inter',
                size: 12
              },
              color: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#4b5563'
            }
          },
          tooltip: {
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
            titleColor: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
            bodyColor: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4b5563',
            borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            displayColors: true,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: false,
            grid: {
              color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4b5563',
              font: {
                family: 'Inter',
                size: 11
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4b5563',
              font: {
                family: 'Inter',
                size: 11
              }
            }
          }
        }
      }
    });
  }
  
  // Content performance chart
  const contentCtx = document.getElementById('contentChart');
  if (contentCtx) {
    new Chart(contentCtx, {
      type: 'bar',
      data: {
        labels: ['Digital Minimalism', 'Redefining Success', 'Mental Wellness', 'Creative Collaboration', 'Career Paths'],
        datasets: [{
          label: 'Views',
          data: [2400, 1800, 1500, 1200, 900],
          backgroundColor: [
            'rgba(99, 102, 241, 0.7)',
            'rgba(139, 92, 246, 0.7)',
            'rgba(74, 222, 128, 0.7)',
            'rgba(236, 72, 153, 0.7)',
            'rgba(59, 130, 246, 0.7)'
          ],
          borderColor: [
            'rgba(99, 102, 241, 1)',
            'rgba(139, 92, 246, 1)',
            'rgba(74, 222, 128, 1)',
            'rgba(236, 72, 153, 1)',
            'rgba(59, 130, 246, 1)'
          ],
          borderWidth: 1,
          borderRadius: 6,
          borderSkipped: false
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          },
          tooltip: {
            backgroundColor: document.documentElement.classList.contains('dark') ? '#1e293b' : '#ffffff',
            titleColor: document.documentElement.classList.contains('dark') ? '#e2e8f0' : '#1e293b',
            bodyColor: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4b5563',
            borderColor: document.documentElement.classList.contains('dark') ? '#334155' : '#e2e8f0',
            borderWidth: 1,
            padding: 12,
            callbacks: {
              label: function(context) {
                return `${context.dataset.label}: ${context.parsed.y.toLocaleString()}`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: {
              color: document.documentElement.classList.contains('dark') ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4b5563',
              font: {
                family: 'Inter',
                size: 11
              }
            }
          },
          x: {
            grid: {
              display: false
            },
            ticks: {
              color: document.documentElement.classList.contains('dark') ? '#cbd5e1' : '#4b5563',
              font: {
                family: 'Inter',
                size: 11
              }
            }
          }
        },
        animation: {
          duration: 1500,
          easing: 'easeOutQuart'
        }
      }
    });
  }
}

// Initialize moderation tools
function initModerationTools() {
  // Approve content
  document.querySelectorAll('.moderation-approve').forEach(button => {
    button.addEventListener('click', function() {
      const contentId = this.getAttribute('data-content-id');
      approveContent(contentId);
    });
  });
  
  // Reject content
  document.querySelectorAll('.moderation-reject').forEach(button => {
    button.addEventListener('click', function() {
      const contentId = this.getAttribute('data-content-id');
      rejectContent(contentId);
    });
  });
  
  // Bulk actions
  const bulkActions = document.getElementById('bulk-actions');
  if (bulkActions) {
    bulkActions.addEventListener('change', function() {
      if (this.value === 'approve') {
        bulkApproveContent();
      } else if (this.value === 'reject') {
        bulkRejectContent();
      } else if (this.value === 'delete') {
        bulkDeleteContent();
      }
      this.value = 'bulk-actions';
    });
  }
}

// Approve content
function approveContent(contentId) {
  showNotification('Content approved successfully!', 'success');
  // In a real app, this would call Firebase to update the content status
  console.log('Approving content:', contentId);
}

// Reject content
function rejectContent(contentId) {
  showNotification('Content rejected successfully!', 'info');
  // In a real app, this would call Firebase to update the content status
  console.log('Rejecting content:', contentId);
}

// Bulk approve content
function bulkApproveContent() {
  const selectedItems = document.querySelectorAll('.moderation-item input[type="checkbox"]:checked');
  if (selectedItems.length === 0) {
    showNotification('Please select items to approve', 'error');
    return;
  }
  
  showNotification(`${selectedItems.length} items approved successfully!`, 'success');
  // In a real app, this would call Firebase to update multiple content items
  console.log('Bulk approving content:', selectedItems.length);
}

// Bulk reject content
function bulkRejectContent() {
  const selectedItems = document.querySelectorAll('.moderation-item input[type="checkbox"]:checked');
  if (selectedItems.length === 0) {
    showNotification('Please select items to reject', 'error');
    return;
  }
  
  showNotification(`${selectedItems.length} items rejected successfully!`, 'info');
  // In a real app, this would call Firebase to update multiple content items
  console.log('Bulk rejecting content:', selectedItems.length);
}

// Bulk delete content
function bulkDeleteContent() {
  const selectedItems = document.querySelectorAll('.moderation-item input[type="checkbox"]:checked');
  if (selectedItems.length === 0) {
    showNotification('Please select items to delete', 'error');
    return;
  }
  
  if (confirm(`Are you sure you want to delete ${selectedItems.length} items? This action cannot be undone.`)) {
    showNotification(`${selectedItems.length} items deleted successfully!`, 'success');
    // In a real app, this would call Firebase to delete multiple content items
    console.log('Bulk deleting content:', selectedItems.length);
  }
}

// Initialize content management
function initContentManagement() {
  // Create post button
  const createPostBtn = document.querySelector('button[data-action="create-post"]');
  if (createPostBtn) {
    createPostBtn.addEventListener('click', function() {
      window.location.href = 'create.html';
    });
  }
  
  // Edit post buttons
  document.querySelectorAll('.edit-post').forEach(button => {
    button.addEventListener('click', function() {
      const postId = this.getAttribute('data-post-id');
      window.location.href = `edit.html?id=${postId}`;
    });
  });
  
  // Delete post buttons
  document.querySelectorAll('.delete-post').forEach(button => {
    button.addEventListener('click', function() {
      const postId = this.getAttribute('data-post-id');
      if (confirm('Are you sure you want to delete this post? This action cannot be undone.')) {
        deletePost(postId);
      }
    });
  });
  
  // Category management
  document.querySelectorAll('.edit-category').forEach(button => {
    button.addEventListener('click', function() {
      const categoryId = this.getAttribute('data-category-id');
      editCategory(categoryId);
    });
  });
  
  document.querySelectorAll('.delete-category').forEach(button => {
    button.addEventListener('click', function() {
      const categoryId = this.getAttribute('data-category-id');
      if (confirm('Are you sure you want to delete this category? All posts in this category will be uncategorized.')) {
        deleteCategory(categoryId);
      }
    });
  });
}

// Delete post
function deletePost(postId) {
  showNotification('Post deleted successfully!', 'success');
  // In a real app, this would call Firebase to delete the post
  console.log('Deleting post:', postId);
  
  // Remove post from UI
  const postElement = document.querySelector(`[data-post-id="${postId}"]`);
  if (postElement) {
    postElement.remove();
  }
}

// Edit category
function editCategory(categoryId) {
  showNotification('Category edit functionality will be available soon!', 'info');
  console.log('Editing category:', categoryId);
}

// Delete category
function deleteCategory(categoryId) {
  showNotification('Category deleted successfully!', 'success');
  // In a real app, this would call Firebase to delete the category
  console.log('Deleting category:', categoryId);
  
  // Remove category from UI
  const categoryElement = document.querySelector(`[data-category-id="${categoryId}"]`);
  if (categoryElement) {
    categoryElement.remove();
  }
}

// Initialize user management
function initUserManagement() {
  // Role change dropdowns
  document.querySelectorAll('.user-role').forEach(select => {
    select.addEventListener('change', function() {
      const userId = this.getAttribute('data-user-id');
      const newRole = this.value;
      changeUserRole(userId, newRole);
    });
  });
  
  // Delete user buttons
  document.querySelectorAll('.delete-user').forEach(button => {
    button.addEventListener('click', function() {
      const userId = this.getAttribute('data-user-id');
      if (confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        deleteUser(userId);
      }
    });
  });
  
  // Export users button
  const exportUsersBtn = document.querySelector('button[data-action="export-users"]');
  if (exportUsersBtn) {
    exportUsersBtn.addEventListener('click', function() {
      exportUsers();
    });
  }
}

// Change user role
function changeUserRole(userId, newRole) {
  showNotification(`User role updated to ${newRole} successfully!`, 'success');
  // In a real app, this would call Firebase to update the user's role
  console.log('Changing user role:', userId, newRole);
}

// Delete user
function deleteUser(userId) {
  showNotification('User deleted successfully!', 'success');
  // In a real app, this would call Firebase to delete the user
  console.log('Deleting user:', userId);
  
  // Remove user from UI
  const userElement = document.querySelector(`[data-user-id="${userId}"]`);
  if (userElement) {
    userElement.remove();
  }
}

// Export users
function exportUsers() {
  showNotification('User data exported successfully!', 'success');
  // In a real app, this would generate and download a CSV file of user data
  console.log('Exporting users data');
}

// Initialize settings
function initSettings() {
  // Save settings button
  const saveSettingsBtn = document.querySelector('button[data-action="save-settings"]');
  if (saveSettingsBtn) {
    saveSettingsBtn.addEventListener('click', function() {
      saveSettings();
    });
  }
  
  // Test notification button
  const testNotificationBtn = document.querySelector('button[data-action="test-notification"]');
  if (testNotificationBtn) {
    testNotificationBtn.addEventListener('click', function() {
      testNotification();
    });
  }
  
  // Clear cache button
  const clearCacheBtn = document.querySelector('button[data-action="clear-cache"]');
  if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', function() {
      if (confirm('Are you sure you want to clear the cache? This will log out all users.')) {
        clearCache();
      }
    });
  }
}

// Save settings
function saveSettings() {
  showNotification('Settings saved successfully!', 'success');
  // In a real app, this would save settings to Firebase
  console.log('Saving settings');
}

// Test notification
function testNotification() {
  showNotification('Test notification sent successfully!', 'success');
  // In a real app, this would send a test notification to the admin
  console.log('Sending test notification');
}

// Clear cache
function clearCache() {
  showNotification('Cache cleared successfully!', 'success');
  // In a real app, this would clear server cache
  console.log('Clearing cache');
}

// Initialize real-time updates
function initRealTimeUpdates() {
  // Simulate real-time updates
  setInterval(function() {
    updateDashboardStats();
    updateRecentActivity();
    updateModerationQueue();
  }, 30000); // Update every 30 seconds
  
  console.log('Real-time updates initialized');
}

// Update dashboard stats
function updateDashboardStats() {
  // In a real app, this would fetch updated stats from Firebase
  console.log('Updating dashboard stats');
  
  // Example of updating a stat
  const activeUsersElement = document.querySelector('.stat-active-users .text-2xl');
  if (activeUsersElement) {
    const currentValue = parseInt(activeUsersElement.textContent.replace(',', ''));
    const newValue = currentValue + Math.floor(Math.random() * 10) - 5;
    activeUsersElement.textContent = newValue.toLocaleString();
  }
}

// Update recent activity
function updateRecentActivity() {
  // In a real app, this would fetch recent activity from Firebase
  console.log('Updating recent activity');
}

// Update moderation queue
function updateModerationQueue() {
  // In a real app, this would fetch pending moderation items from Firebase
  console.log('Updating moderation queue');
}

// Load dashboard data
function loadDashboardData() {
  // Simulate loading data
  const statsCards = document.querySelectorAll('.bg-white.dark\\:bg-gray-800.rounded-xl');
  statsCards.forEach(card => {
    card.classList.add('animate-pulse');
    
    setTimeout(() => {
      card.classList.remove('animate-pulse');
    }, 800);
  });
  
  console.log('Dashboard data loaded');
}

// Show notification
function showNotification(message, type = 'info') {
  let notification = document.getElementById('admin-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'admin-notification';
    notification.className = 'fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transform translate-y-full transition-transform duration-300';
    document.body.appendChild(notification);
  }
  
  // Set notification content and style
  notification.textContent = message;
  
  switch(type) {
    case 'success':
      notification.className = 'fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transform translate-y-full transition-transform duration-300 bg-green-500';
      break;
    case 'error':
      notification.className = 'fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transform translate-y-full transition-transform duration-300 bg-red-500';
      break;
    case 'info':
      notification.className = 'fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transform translate-y-full transition-transform duration-300 bg-blue-500';
      break;
    default:
      notification.className = 'fixed bottom-4 right-4 z-50 px-6 py-3 rounded-xl shadow-lg text-white font-medium transform translate-y-full transition-transform duration-300 bg-indigo-600';
  }
  
  // Show notification
  setTimeout(() => {
    notification.classList.remove('translate-y-full');
    notification.classList.add('translate-y-0');
  }, 100);
  
  // Hide notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('translate-y-0');
    notification.classList.add('translate-y-full');
  }, 3100);
}

// Export functions for use in other scripts
window.initAdminDashboard = initAdminDashboard;
window.showNotification = showNotification;
window.approveContent = approveContent;
window.rejectContent = rejectContent;

console.log('Admin JavaScript module loaded and initialized');
