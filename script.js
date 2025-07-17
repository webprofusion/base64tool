class Base64Tool {
    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.updateInfo();
    }

    initializeElements() {
        this.plaintextArea = document.getElementById('plaintext');
        this.base64Area = document.getElementById('base64text');
        this.urlSafeToggle = document.getElementById('urlSafeToggle');
        this.encodeBtn = document.getElementById('encodeBtn');
        this.decodeBtn = document.getElementById('decodeBtn');
        this.clearPlainBtn = document.getElementById('clearPlainBtn');
        this.clearBase64Btn = document.getElementById('clearBase64Btn');
        this.copyPlainBtn = document.getElementById('copyPlainBtn');
        this.copyBase64Btn = document.getElementById('copyBase64Btn');
        this.swapBtn = document.getElementById('swapBtn');
        this.inputLength = document.getElementById('inputLength');
        this.outputLength = document.getElementById('outputLength');
        this.encodingType = document.getElementById('encodingType');
        this.notification = document.getElementById('notification');
        this.notificationText = document.getElementById('notificationText');
    }

    attachEventListeners() {
        // Encoding/Decoding buttons
        this.encodeBtn.addEventListener('click', () => this.encode());
        this.decodeBtn.addEventListener('click', () => this.decode());

        // Clear buttons
        this.clearPlainBtn.addEventListener('click', () => this.clearPlaintext());
        this.clearBase64Btn.addEventListener('click', () => this.clearBase64());

        // Copy buttons
        this.copyPlainBtn.addEventListener('click', () => this.copyToClipboard(this.plaintextArea.value, 'Plain text'));
        this.copyBase64Btn.addEventListener('click', () => this.copyToClipboard(this.base64Area.value, 'Base64'));

        // Swap button
        this.swapBtn.addEventListener('click', () => this.swapContent());

        // URL-safe toggle
        this.urlSafeToggle.addEventListener('change', () => {
            this.updateEncodingType();
            this.autoProcess();
        });

        // Auto-process on input
        this.plaintextArea.addEventListener('input', () => {
            this.updateInfo();
            this.debounce(() => this.autoEncode(), 300);
        });

        this.base64Area.addEventListener('input', () => {
            this.updateInfo();
            this.debounce(() => this.autoDecode(), 300);
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey || e.metaKey) {
                switch(e.key) {
                    case 'e':
                        e.preventDefault();
                        this.encode();
                        break;
                    case 'd':
                        e.preventDefault();
                        this.decode();
                        break;
                    case 'k':
                        e.preventDefault();
                        this.clearAll();
                        break;
                }
            }
        });
    }

    encode() {
        const plaintext = this.plaintextArea.value;
        if (!plaintext) {
            this.showNotification('Please enter text to encode', 'error');
            return;
        }

        try {
            this.addLoadingAnimation(this.base64Area);
            
            let encoded;
            if (this.urlSafeToggle.checked) {
                encoded = this.base64UrlEncode(plaintext);
            } else {
                encoded = btoa(unescape(encodeURIComponent(plaintext)));
            }
            
            this.base64Area.value = encoded;
            this.updateInfo();
            this.showNotification('Text encoded successfully!');
            
        } catch (error) {
            this.showNotification('Error encoding text: ' + error.message, 'error');
        } finally {
            this.removeLoadingAnimation(this.base64Area);
        }
    }

    decode() {
        const base64text = this.base64Area.value.trim();
        if (!base64text) {
            this.showNotification('Please enter Base64 text to decode', 'error');
            return;
        }

        try {
            this.addLoadingAnimation(this.plaintextArea);
            
            let decoded;
            if (this.urlSafeToggle.checked) {
                decoded = this.base64UrlDecode(base64text);
            } else {
                decoded = decodeURIComponent(escape(atob(base64text)));
            }
            
            this.plaintextArea.value = decoded;
            this.updateInfo();
            this.showNotification('Base64 decoded successfully!');
            
        } catch (error) {
            this.showNotification('Error decoding Base64: Invalid format', 'error');
        } finally {
            this.removeLoadingAnimation(this.plaintextArea);
        }
    }

    base64UrlEncode(str) {
        const base64 = btoa(unescape(encodeURIComponent(str)));
        return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
    }

    base64UrlDecode(str) {
        // Add padding if needed
        str += '='.repeat((4 - str.length % 4) % 4);
        // Convert URL-safe characters back to standard Base64
        const base64 = str.replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(escape(atob(base64)));
    }

    autoEncode() {
        if (this.plaintextArea.value && !this.base64Area.value) {
            this.encode();
        }
    }

    autoDecode() {
        if (this.base64Area.value && !this.plaintextArea.value) {
            this.decode();
        }
    }

    autoProcess() {
        if (this.plaintextArea.value) {
            this.encode();
        } else if (this.base64Area.value) {
            this.decode();
        }
    }

    clearPlaintext() {
        this.plaintextArea.value = '';
        this.updateInfo();
        this.showNotification('Plain text cleared');
    }

    clearBase64() {
        this.base64Area.value = '';
        this.updateInfo();
        this.showNotification('Base64 text cleared');
    }

    clearAll() {
        this.plaintextArea.value = '';
        this.base64Area.value = '';
        this.updateInfo();
        this.showNotification('All fields cleared');
    }

    swapContent() {
        const plainValue = this.plaintextArea.value;
        const base64Value = this.base64Area.value;
        
        this.plaintextArea.value = base64Value;
        this.base64Area.value = plainValue;
        this.updateInfo();
        this.showNotification('Content swapped');
    }

    async copyToClipboard(text, type) {
        if (!text) {
            this.showNotification(`No ${type.toLowerCase()} to copy`, 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(text);
            this.showNotification(`${type} copied to clipboard!`);
        } catch (error) {
            // Fallback for older browsers
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.select();
            document.execCommand('copy');
            document.body.removeChild(textArea);
            this.showNotification(`${type} copied to clipboard!`);
        }
    }

    updateInfo() {
        const plainLength = this.plaintextArea.value.length;
        const base64Length = this.base64Area.value.length;
        
        this.inputLength.textContent = plainLength;
        this.outputLength.textContent = base64Length;
        this.updateEncodingType();
    }

    updateEncodingType() {
        this.encodingType.textContent = this.urlSafeToggle.checked ? 'URL-Safe' : 'Standard';
    }

    addLoadingAnimation(element) {
        element.classList.add('loading');
        element.disabled = true;
    }

    removeLoadingAnimation(element) {
        element.classList.remove('loading');
        element.disabled = false;
    }

    showNotification(message, type = 'success') {
        this.notificationText.textContent = message;
        this.notification.className = `notification ${type}`;
        this.notification.classList.add('show');
        
        setTimeout(() => {
            this.notification.classList.remove('show');
        }, 3000);
    }

    debounce(func, wait) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(func, wait);
    }
}

// Utility functions for additional features
class Base64Utils {
    static isValidBase64(str) {
        try {
            return btoa(atob(str)) === str;
        } catch (error) {
            return false;
        }
    }

    static isValidUrlSafeBase64(str) {
        const base64Regex = /^[A-Za-z0-9_-]+$/;
        return base64Regex.test(str);
    }

    static formatBase64(str, lineLength = 76) {
        const regex = new RegExp(`.{1,${lineLength}}`, 'g');
        return str.match(regex).join('\n');
    }

    static removeFormatting(str) {
        return str.replace(/\s/g, '');
    }

    static analyzeBase64(str) {
        const analysis = {
            length: str.length,
            padding: (str.match(/=/g) || []).length,
            isUrlSafe: this.isValidUrlSafeBase64(str.replace(/=/g, '')),
            estimatedOriginalLength: Math.floor(str.length * 3 / 4)
        };
        return analysis;
    }
}

// File handling utilities
class FileHandler {
    static async handleFileUpload(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = (e) => reject(e);
            reader.readAsText(file);
        });
    }

    static downloadAsFile(content, filename, contentType = 'text/plain') {
        const blob = new Blob([content], { type: contentType });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    const base64Tool = new Base64Tool();
    
    // Add some example functionality
    const examples = document.querySelectorAll('.example-item');
    examples.forEach(example => {
        example.addEventListener('click', () => {
            const isUrlSafe = example.querySelector('h4').textContent.includes('URL-Safe');
            const input = example.querySelector('p:nth-child(2)').textContent.replace('Input: ', '');
            
            base64Tool.urlSafeToggle.checked = isUrlSafe;
            base64Tool.plaintextArea.value = input;
            base64Tool.updateEncodingType();
            base64Tool.encode();
            base64Tool.showNotification('Example loaded and encoded!');
        });
    });

    // Add keyboard shortcut info
    console.log('Base64 Tool - Keyboard Shortcuts:');
    console.log('Ctrl+E: Encode');
    console.log('Ctrl+D: Decode');
    console.log('Ctrl+K: Clear all');
});

// Service Worker registration for offline functionality
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => {
                console.log('SW registered: ', registration);
            })
            .catch(registrationError => {
                console.log('SW registration failed: ', registrationError);
            });
    });
}
