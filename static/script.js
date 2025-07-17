document.addEventListener('DOMContentLoaded', function() {
    const form = document.querySelector('form');
    const textarea = document.querySelector('textarea');
    const button = document.querySelector('button');
    const messageDiv = document.querySelector('.message');

    // Character counter functionality
    const charCounter = document.createElement('div');
    charCounter.className = 'char-counter';
    charCounter.textContent = '0 characters';
    textarea.parentNode.appendChild(charCounter);

    // Update character counter
    function updateCharCounter() {
        const count = textarea.value.length;
        charCounter.textContent = `${count} character${count !== 1 ? 's' : ''}`;
        
        if (count > 1000) {
            charCounter.style.color = '#ff9800';
        } else {
            charCounter.style.color = '#666';
        }
    }

    textarea.addEventListener('input', updateCharCounter);

    // Real-time validation indicator with character highlighting
    let validationTimeout;
    textarea.addEventListener('input', function() {
        clearTimeout(validationTimeout);
        
        // Add loading state
        if (textarea.value.trim()) {
            validationTimeout = setTimeout(() => {
                validateText(textarea.value);
            }, 500); // Debounce for 500ms
        } else {
            clearValidation();
        }
    });

    function validateText(text) {
        // Find non-English characters
        const nonEnglishMatches = findNonEnglishCharacters(text);
        showPreviewMessage(nonEnglishMatches);
    }

    function findNonEnglishCharacters(text) {
        const pattern = /[^A-Za-z0-9 .,!?"'()\[\];:\-\n\r]/g;
        const matches = [];
        let match;
        
        while ((match = pattern.exec(text)) !== null) {
            matches.push({
                character: match[0],
                position: match.index
            });
        }
        
        return matches;
    }

    function showPreviewMessage(nonEnglishMatches) {
        const preview = document.querySelector('.preview-message') || createPreviewMessage();
        
        if (nonEnglishMatches.length > 0) {
            const charWord = nonEnglishMatches.length === 1 ? 'character' : 'characters';
            const uniqueChars = [...new Set(nonEnglishMatches.map(m => m.character))];
            preview.innerHTML = `⚠️ ${nonEnglishMatches.length} non-English ${charWord} detected: <span class="preview-chars">${uniqueChars.join(', ')}</span>`;
            preview.className = 'preview-message warning-preview';
        } else {
            preview.textContent = '✅ All characters are English';
            preview.className = 'preview-message success-preview';
        }
        
        preview.style.display = 'block';
    }

    function createPreviewMessage() {
        const preview = document.createElement('div');
        preview.className = 'preview-message';
        textarea.parentNode.appendChild(preview);
        return preview;
    }

    function clearValidation() {
        const preview = document.querySelector('.preview-message');
        if (preview) {
            preview.style.display = 'none';
        }
    }

    // Form submission with loading state
    form.addEventListener('submit', function(e) {
        if (!textarea.value.trim()) {
            e.preventDefault();
            alert('Please enter some text to check.');
            return;
        }

        // Add loading state
        button.disabled = true;
        button.textContent = 'Checking...';
        
        // The form will submit normally, but we show loading state
        setTimeout(() => {
            button.disabled = false;
            button.textContent = 'Check Text';
        }, 2000);
    });

    // Apply message styling based on content
    function styleMessage() {
        if (messageDiv && messageDiv.textContent.trim()) {
            if (messageDiv.textContent.includes('✅')) {
                messageDiv.className = 'message success';
            } else if (messageDiv.textContent.includes('⚠️')) {
                messageDiv.className = 'message warning';
            }
        } else if (messageDiv) {
            messageDiv.className = 'message empty';
        }
    }

    // Auto-resize textarea based on content
    function autoResize() {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(textarea.scrollHeight, 150) + 'px';
    }

    textarea.addEventListener('input', autoResize);

    // Initialize
    updateCharCounter();
    styleMessage();
    autoResize();

    // Add smooth scrolling to results
    if (messageDiv && messageDiv.textContent.trim()) {
        messageDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }

    // Scroll to results section if it exists
    const resultsSection = document.querySelector('.results-section');
    if (resultsSection) {
        setTimeout(() => {
            resultsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 300);
    }

    // Keyboard shortcuts
    document.addEventListener('keydown', function(e) {
        // Ctrl/Cmd + Enter to submit
        if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
            form.submit();
        }
        
        // Escape to clear
        if (e.key === 'Escape') {
            textarea.value = '';
            updateCharCounter();
            clearValidation();
            textarea.focus();
        }
    });

    // Focus textarea on page load
    textarea.focus();
});