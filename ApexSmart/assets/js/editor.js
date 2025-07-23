// Initialize Quill editor
let quill;
let editorInitialized = false;

document.addEventListener('DOMContentLoaded', function() {
  const editorContainer = document.getElementById('editor');
  
  if (editorContainer && !editorInitialized) {
    initEditor();
    editorInitialized = true;
  }
  
  // Initialize image upload handlers
  initImageUpload();
  
  // Initialize SEO tools
  initSEOTools();
  
  // Initialize writing tips
  initWritingTips();
  
  // Initialize autosave
  initAutosave();
});

// Initialize Quill editor
function initEditor() {
  const editorContainer = document.getElementById('editor');
  
  // Define toolbar options
  const toolbarOptions = [
    ['bold', 'italic', 'underline', 'strike'],
    ['blockquote', 'code-block'],
    [{ 'header': 1 }, { 'header': 2 }, { 'header': 3 }],
    [{ 'list': 'ordered' }, { 'list': 'bullet' }, { 'indent': '-1' }, { 'indent': '+1' }],
    [{ 'direction': 'rtl' }],
    [{ 'size': ['small', false, 'large', 'huge'] }],
    [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
    [{ 'color': [] }, { 'background': [] }],
    [{ 'font': [] }],
    [{ 'align': [] }],
    ['clean'],
    ['link', 'image', 'video']
  ];
  
  // Initialize Quill
  quill = new Quill(editorContainer, {
    modules: {
      toolbar: toolbarOptions,
      syntax: true,
      clipboard: {
        matchVisual: false
      }
    },
    theme: 'snow',
    placeholder: 'Write your amazing content here...',
    scrollingContainer: 'html, body'
  });
  
  // Add custom toolbar handlers
  addCustomToolbarHandlers();
  
  // Add keyboard shortcuts
  addKeyboardShortcuts();
  
  // Add event listeners
  addEditorEventListeners();
  
  console.log('Quill editor initialized successfully');
}

// Add custom toolbar handlers
function addCustomToolbarHandlers() {
  if (!quill) return;
  
  // Custom image handler
  const toolbar = quill.getModule('toolbar');
  toolbar.addHandler('image', function() {
    document.getElementById('featured-image').click();
  });
  
  // Custom video handler
  toolbar.addHandler('video', function() {
    const url = prompt('Enter video URL:');
    if (url) {
      const range = quill.getSelection(true);
      quill.insertEmbed(range.index, 'video', url);
      quill.setSelection(range.index + 1);
    }
  });
  
  // Custom blockquote handler with attribution
  toolbar.addHandler('blockquote', function() {
    const range = quill.getSelection(true);
    if (range) {
      const text = quill.getText(range.index, range.length);
      if (text.trim()) {
        const attribution = prompt('Enter quote attribution (optional):');
        const blockquoteHTML = attribution ? 
          `<blockquote>${text.trim()}<footer>— ${attribution}</footer></blockquote>` : 
          `<blockquote>${text.trim()}</blockquote>`;
        
        quill.deleteText(range.index, range.length);
        quill.clipboard.dangerouslyPasteHTML(range.index, blockquoteHTML);
        quill.setSelection(range.index + blockquoteHTML.length);
      }
    }
  });
}

// Add keyboard shortcuts
function addKeyboardShortcuts() {
  if (!quill) return;
  
  // Ctrl+S / Cmd+S for save
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
      e.preventDefault();
      saveDraft();
    }
  });
  
  // Ctrl+Enter / Cmd+Enter for publish
  document.addEventListener('keydown', function(e) {
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      document.querySelector('form').requestSubmit();
    }
  });
  
  // Alt+C for word count
  document.addEventListener('keydown', function(e) {
    if (e.altKey && e.key === 'c') {
      e.preventDefault();
      showWordCount();
    }
  });
}

// Add editor event listeners
function addEditorEventListeners() {
  if (!quill) return;
  
  // Content change event
  quill.on('text-change', function(delta, oldDelta, source) {
    if (source === 'user') {
      updateWordCount();
      updateReadTime();
      checkContentQuality();
    }
  });
  
  // Selection change event
  quill.on('selection-change', function(range) {
    if (range) {
      showEditorToolbar(range);
    } else {
      hideEditorToolbar();
    }
  });
}

// Initialize image upload functionality
function initImageUpload() {
  const imageInput = document.getElementById('featured-image');
  const imagePreview = document.getElementById('image-preview');
  const previewImage = document.getElementById('preview-image');
  const removeImageBtn = document.getElementById('remove-image');
  
  if (imageInput) {
    imageInput.addEventListener('change', function(e) {
      const file = e.target.files[0];
      if (file) {
        if (!validateImage(file)) {
          alert('Please select a valid image file (JPG, PNG, or GIF) under 5MB');
          this.value = '';
          return;
        }
        
        const reader = new FileReader();
        reader.onload = function(event) {
          previewImage.src = event.target.result;
          imagePreview.classList.remove('hidden');
          
          // If Quill editor is initialized, insert image
          if (quill) {
            const range = quill.getSelection(true);
            quill.insertEmbed(range.index, 'image', event.target.result);
            quill.setSelection(range.index + 1);
          }
        };
        reader.readAsDataURL(file);
      }
    });
  }
  
  if (removeImageBtn) {
    removeImageBtn.addEventListener('click', function() {
      imagePreview.classList.add('hidden');
      if (imageInput) imageInput.value = '';
    });
  }
  
  // Drag and drop functionality
  const dropArea = document.querySelector('.border-dashed');
  if (dropArea) {
    dropArea.addEventListener('dragover', function(e) {
      e.preventDefault();
      this.classList.add('border-indigo-500', 'bg-indigo-50');
    });
    
    dropArea.addEventListener('dragleave', function(e) {
      e.preventDefault();
      this.classList.remove('border-indigo-500', 'bg-indigo-50');
    });
    
    dropArea.addEventListener('drop', function(e) {
      e.preventDefault();
      this.classList.remove('border-indigo-500', 'bg-indigo-50');
      
      const file = e.dataTransfer.files[0];
      if (file && validateImage(file)) {
        if (imageInput) {
          imageInput.files = e.dataTransfer.files;
          const reader = new FileReader();
          reader.onload = function(event) {
            previewImage.src = event.target.result;
            imagePreview.classList.remove('hidden');
          };
          reader.readAsDataURL(file);
        }
      } else {
        alert('Please drop a valid image file (JPG, PNG, or GIF) under 5MB');
      }
    });
  }
}

// Validate image file
function validateImage(file) {
  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  const maxSize = 5 * 1024 * 1024; // 5MB
  
  return validTypes.includes(file.type) && file.size <= maxSize;
}

// Initialize SEO tools
function initSEOTools() {
  const seoToggle = document.getElementById('seo-toggle');
  const seoSettings = document.getElementById('seo-settings');
  const seoTitle = document.getElementById('seo-title');
  const seoDescription = document.getElementById('seo-description');
  
  if (seoToggle && seoSettings) {
    seoToggle.addEventListener('click', function() {
      const isHidden = seoSettings.classList.contains('hidden');
      
      seoSettings.classList.toggle('hidden');
      this.innerHTML = isHidden ? 
        '<i class="fas fa-chevron-up mr-1"></i> Hide Settings' : 
        '<i class="fas fa-chevron-down mr-1"></i> Show Settings';
    });
  }
  
  // Auto-generate SEO title and description from content
  if (quill && seoTitle && seoDescription) {
    quill.on('text-change', debounce(function() {
      const content = quill.getText().trim();
      const title = document.getElementById('post-title')?.value || '';
      
      if (content && !seoTitle.value) {
        seoTitle.value = title.length > 60 ? title.substring(0, 57) + '...' : title;
      }
      
      if (content && !seoDescription.value) {
        const excerpt = content.substring(0, 160);
        seoDescription.value = excerpt.length === 160 ? excerpt + '...' : excerpt;
      }
    }, 1000));
  }
}

// Initialize writing tips
function initWritingTips() {
  const writingTipsBtn = document.querySelector('button[aria-label="Writing Tips"]');
  const writingTipsModal = document.getElementById('writing-tips-modal');
  const closeWritingTips = document.getElementById('close-writing-tips');
  const closeWritingTipsBottom = document.getElementById('close-writing-tips-bottom');
  
  if (writingTipsBtn && writingTipsModal) {
    writingTipsBtn.addEventListener('click', function() {
      writingTipsModal.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
    });
  }
  
  if (closeWritingTips) {
    closeWritingTips.addEventListener('click', function() {
      writingTipsModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }
  
  if (closeWritingTipsBottom) {
    closeWritingTipsBottom.addEventListener('click', function() {
      writingTipsModal.classList.add('hidden');
      document.body.style.overflow = 'auto';
    });
  }
  
  // Close modal when clicking outside
  if (writingTipsModal) {
    writingTipsModal.addEventListener('click', function(e) {
      if (e.target === writingTipsModal) {
        writingTipsModal.classList.add('hidden');
        document.body.style.overflow = 'auto';
      }
    });
  }
}

// Initialize autosave
function initAutosave() {
  if (!quill || !auth.currentUser) return;
  
  const postId = document.getElementById('post-id')?.value;
  const autosaveInterval = 60000; // 1 minute
  
  setInterval(function() {
    if (quill.getLength() > 1) { // Check if editor has content
      saveDraft(postId);
    }
  }, autosaveInterval);
  
  console.log('Autosave initialized');
}

// Save draft
function saveDraft(postId = null) {
  if (!quill) return;
  
  const content = quill.root.innerHTML;
  const title = document.getElementById('post-title')?.value || 'Untitled Draft';
  
  if (!content || content.trim() === '<p><br></p>') {
    console.log('No content to save');
    return;
  }
  
  const draft = {
    id: postId || `draft-${Date.now()}`,
    title: title,
    content: content,
    excerpt: content.substring(0, 250) + '...',
    isDraft: true,
    updatedAt: new Date().toISOString()
  };
  
  // Save to localStorage
  let drafts = JSON.parse(localStorage.getItem('genzsmart_drafts') || '[]');
  const existingIndex = drafts.findIndex(d => d.id === draft.id);
  
  if (existingIndex > -1) {
    drafts[existingIndex] = draft;
  } else {
    drafts.unshift(draft); // Add to beginning of array
    if (drafts.length > 10) {
      drafts.pop(); // Keep only last 10 drafts
    }
  }
  
  localStorage.setItem('genzsmart_drafts', JSON.stringify(drafts));
  console.log('Draft saved successfully:', draft.id);
  
  // Show save notification
  showNotification('Draft saved successfully!', 'success');
  
  return draft.id;
}

// Show notification
function showNotification(message, type = 'info') {
  let notification = document.getElementById('editor-notification');
  
  if (!notification) {
    notification = document.createElement('div');
    notification.id = 'editor-notification';
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

// Update word count
function updateWordCount() {
  if (!quill) return;
  
  const text = quill.getText().trim();
  const wordCount = text === '' ? 0 : text.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  
  let wordCountElement = document.getElementById('word-count');
  if (!wordCountElement) {
    wordCountElement = document.createElement('div');
    wordCountElement.id = 'word-count';
    wordCountElement.className = 'absolute bottom-2 right-2 text-xs text-gray-500 dark:text-gray-400';
    quill.container.parentNode.appendChild(wordCountElement);
  }
  
  wordCountElement.textContent = `${wordCount} words, ${charCount} characters`;
}

// Update read time
function updateReadTime() {
  if (!quill) return;
  
  const text = quill.getText().trim();
  const wordsPerMinute = 200;
  const wordCount = text === '' ? 0 : text.split(/\s+/).filter(word => word.length > 0).length;
  const readTime = Math.ceil(wordCount / wordsPerMinute) || 1;
  
  let readTimeElement = document.getElementById('read-time');
  if (!readTimeElement) {
    readTimeElement = document.createElement('div');
    readTimeElement.id = 'read-time';
    readTimeElement.className = 'text-sm text-gray-500 dark:text-gray-400 mt-1';
    const statsContainer = document.querySelector('.border-t.border-gray-200.dark:border-gray-700.pt-6');
    if (statsContainer) {
      statsContainer.insertBefore(readTimeElement, statsContainer.firstChild);
    }
  }
  
  readTimeElement.textContent = `⏱️ ${readTime} min read`;
}

// Check content quality
function checkContentQuality() {
  if (!quill) return;
  
  const text = quill.getText().trim();
  if (text.length < 100) return; // Only check for substantial content
  
  // Simple content quality checks
  const issues = [];
  
  // Check for short paragraphs
  const paragraphs = text.split('\n').filter(p => p.trim().length > 0);
  if (paragraphs.length > 0 && paragraphs.every(p => p.length < 50)) {
    issues.push('Consider writing longer paragraphs for better readability');
  }
  
  // Check for repetitive words
  const words = text.toLowerCase().match(/\b[a-z]{3,}\b/g);
  if (words) {
    const wordCounts = {};
    words.forEach(word => {
      wordCounts[word] = (wordCounts[word] || 0) + 1;
    });
    
    const repetitiveWords = Object.entries(wordCounts)
      .filter(([word, count]) => count > 10 && !['the', 'and', 'that', 'this', 'with', 'have', 'from'].includes(word))
      .map(([word, count]) => ({ word, count }));
    
    if (repetitiveWords.length > 0) {
      issues.push(`Consider using synonyms for: ${repetitiveWords.slice(0, 3).map(w => w.word).join(', ')}`);
    }
  }
  
  // Show quality suggestions
  if (issues.length > 0) {
    let qualityElement = document.getElementById('content-quality');
    if (!qualityElement) {
      qualityElement = document.createElement('div');
      qualityElement.id = 'content-quality';
      qualityElement.className = 'mt-4 p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg text-sm text-yellow-700 dark:text-yellow-300';
      const contentContainer = document.querySelector('#editor');
      if (contentContainer) {
        contentContainer.parentNode.insertBefore(qualityElement, contentContainer.nextSibling);
      }
    }
    
    qualityElement.innerHTML = `
      <div class="flex items-start">
        <i class="fas fa-exclamation-triangle mt-0.5 mr-2"></i>
        <div>
          <p class="font-medium mb-1">Content Suggestions</p>
          <ul class="list-disc pl-5 space-y-1">
            ${issues.slice(0, 3).map(issue => `<li>${issue}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
  }
}

// Show editor toolbar
function showEditorToolbar(range) {
  const selection = window.getSelection();
  if (selection.rangeCount === 0) return;
  
  const rect = selection.getRangeAt(0).getBoundingClientRect();
  let toolbar = document.getElementById('floating-toolbar');
  
  if (!toolbar) {
    toolbar = document.createElement('div');
    toolbar.id = 'floating-toolbar';
    toolbar.className = 'fixed z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg py-1 px-2 transition-opacity opacity-0';
    toolbar.innerHTML = `
      <div class="flex space-x-1">
        <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Bold" data-format="bold">
          <i class="fas fa-bold"></i>
        </button>
        <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Italic" data-format="italic">
          <i class="fas fa-italic"></i>
        </button>
        <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Underline" data-format="underline">
          <i class="fas fa-underline"></i>
        </button>
        <button class="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded" title="Link" data-format="link">
          <i class="fas fa-link"></i>
        </button>
      </div>
    `;
    document.body.appendChild(toolbar);
  }
  
  // Position toolbar
  const toolbarHeight = toolbar.offsetHeight;
  const toolbarWidth = toolbar.offsetWidth;
  const viewportWidth = window.innerWidth;
  const viewportHeight = window.innerHeight;
  
  let top = rect.top + window.pageYOffset - toolbarHeight - 10;
  let left = rect.left + window.pageXOffset - toolbarWidth / 2 + rect.width / 2;
  
  // Keep toolbar within viewport
  if (top < 0) top = rect.bottom + window.pageYOffset + 10;
  if (left < 10) left = 10;
  if (left + toolbarWidth > viewportWidth - 10) left = viewportWidth - toolbarWidth - 10;
  
  toolbar.style.top = `${top}px`;
  toolbar.style.left = `${left}px`;
  toolbar.style.opacity = '1';
  
  // Add event listeners to toolbar buttons
  toolbar.querySelectorAll('button').forEach(button => {
    button.addEventListener('click', function(e) {
      e.stopPropagation();
      const format = this.getAttribute('data-format');
      
      if (format === 'link') {
        const url = prompt('Enter link URL:');
        if (url) {
          quill.format('link', url);
        }
      } else {
        quill.format(format, !quill.getFormat()[format]);
      }
      
      toolbar.style.opacity = '0';
      setTimeout(() => {
        if (toolbar.parentNode) {
          toolbar.parentNode.removeChild(toolbar);
        }
      }, 300);
    });
  });
}

// Hide editor toolbar
function hideEditorToolbar() {
  const toolbar = document.getElementById('floating-toolbar');
  if (toolbar) {
    toolbar.style.opacity = '0';
    setTimeout(() => {
      if (toolbar.parentNode) {
        toolbar.parentNode.removeChild(toolbar);
      }
    }, 300);
  }
}

// Show word count
function showWordCount() {
  if (!quill) return;
  
  const text = quill.getText().trim();
  const wordCount = text === '' ? 0 : text.split(/\s+/).filter(word => word.length > 0).length;
  const charCount = text.length;
  
  alert(`Word count: ${wordCount}\nCharacter count: ${charCount}`);
}

// Debounce function
function debounce(func, wait) {
  let timeout;
  return function() {
    const context = this;
    const args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function() {
      func.apply(context, args);
    }, wait);
  };
}

// Export functions for use in other scripts
window.initEditor = initEditor;
window.saveDraft = saveDraft;
window.showNotification = showNotification;
window.updateWordCount = updateWordCount;
window.updateReadTime = updateReadTime;

console.log('Editor JavaScript module loaded and initialized');
