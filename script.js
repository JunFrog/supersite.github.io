console.log('✅ Script loaded successfully!');

const API_URL = 'https://68c5b6e0a712aaca2b697175.mockapi.io/api/v1/library';
const SITE_PASSWORD = 'ямегазвезда'; // Замени на свой пароль

let books = [];
let filteredBooks = [];
let EDITING_ENABLED = false;

// ===== СИСТЕМА ЗАЩИТЫ =====
function initAuth() {
    console.log('🔐 Initializing auth...');
    const isAuthenticated = localStorage.getItem('authenticated') === 'true';
    
    if (isAuthenticated) {
        enableEditing();
        hideAuthOverlay();
    } else {
        showAuthOverlay();
    }
    // Данные загружаются в любом случае!
    loadBooks();
}
function viewWithoutPassword() {
    console.log('👀 Viewing without password');
    hideAuthOverlay();
    disableEditing();
    showNotification('👀 Режим просмотра', 'info');
}
function showAuthOverlay() {
    console.log('🔒 Showing auth overlay');
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay) {
        authOverlay.style.display = 'flex';
    }
    disableEditing();
}

function hideAuthOverlay() {
    console.log('🔓 Hiding auth overlay');
    const authOverlay = document.getElementById('authOverlay');
    if (authOverlay) {
        authOverlay.style.display = 'none';
    }
}

function checkPassword() {
    const passwordInput = document.getElementById('passwordInput');
    const password = passwordInput.value;
    
    console.log('🔑 Checking password...');
    
    if (password === SITE_PASSWORD) {
        localStorage.setItem('authenticated', 'true');
        enableEditing();
        hideAuthOverlay();
        showNotification('🔓 Редактирование разрешено', 'success');
    } else {
        passwordInput.value = '';
        passwordInput.placeholder = 'Неверный пароль!';
        passwordInput.style.borderColor = '#e74c3c';
        setTimeout(() => {
            passwordInput.style.borderColor = '#e9ecef';
            passwordInput.placeholder = 'Пароль';
        }, 2000);
    }
}

function enableEditing() {
    console.log('✏️ Enabling editing');
    EDITING_ENABLED = true;
    
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
        addBookBtn.disabled = false;
        addBookBtn.classList.remove('btn-locked');
    }
    
    // Показываем кнопки редактирования на существующих карточках
    showEditButtons();
}

function disableEditing() {
    console.log('🔒 Disabling editing');
    EDITING_ENABLED = false;
    
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
        addBookBtn.disabled = true;
        addBookBtn.classList.add('btn-locked');
    }
    
    // Скрываем кнопки редактирования
    hideEditButtons();
}

function showEditButtons() {
    const editButtons = document.querySelectorAll('.btn-edit, .btn-danger');
    editButtons.forEach(btn => {
        btn.style.display = 'inline-block';
    });
}

function hideEditButtons() {
    const editButtons = document.querySelectorAll('.btn-edit, .btn-danger');
    editButtons.forEach(btn => {
        btn.style.display = 'none';
    });
}

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 20px;
        background: ${type === 'success' ? '#27ae60' : '#3498db'};
        color: white;
        border-radius: 8px;
        z-index: 10000;
        animation: slideIn 0.3s ease;
    `;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

// ===== УПРАВЛЕНИЕ ТЕМОЙ =====
function initTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);
    updateThemeButton(savedTheme);
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeButton(newTheme);
}

function updateThemeButton(theme) {
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// ===== РАБОТА С ДАННЫМИ =====
async function loadBooks() {
    console.log('🔍 Starting data load...');
    
    try {
        console.log('📡 Making request to:', API_URL);
        const response = await fetch(API_URL);
        
        console.log('✅ Response status:', response.status);
        console.log('✅ Response ok:', response.ok);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Data received:', data);
        console.log('🔢 Number of items:', data.length);
        
        books = data;
        console.log('📚 Books array set:', books);
        
        applyFilters();
        
    } catch (error) {
        console.error('❌ Load error:', error);
        showErrorMessage('Ошибка загрузки: ' + error.message);
    }
}

function applyFilters() {
    console.log('🎛️ Applying filters...');
    console.log('📚 Total books:', books.length);
    
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    
    console.log('🔍 Type filter value:', typeFilter?.value);
    console.log('🔍 Status filter value:', statusFilter?.value);
    console.log('🔍 Search value:', searchInput?.value);
    
    filteredBooks = books.filter(book => {
        const matchesType = !typeFilter?.value || book.type === typeFilter.value;
        const matchesStatus = !statusFilter?.value || book.status === statusFilter.value;
        const matchesSearch = !searchInput?.value || book.title.toLowerCase().includes(searchInput.value.toLowerCase());
        
        return matchesType && matchesStatus && matchesSearch;
    });
    
    console.log('📋 Filtered books:', filteredBooks.length);
    renderBooks();
}

function renderBooks() {
    console.log('🎨 Rendering books...');
    const booksContainer = document.getElementById('booksContainer');
    
    if (!booksContainer) {
        console.error('❌ booksContainer not found!');
        return;
    }
    
    console.log('📦 Books container found');
    
    if (filteredBooks.length === 0) {
        console.log('📭 No books to display');
        booksContainer.innerHTML = '<p class="no-books">📚 Библиотека пуста</p>';
        return;
    }
    
    console.log('🖼️ Creating', filteredBooks.length, 'cards');
    
    booksContainer.innerHTML = filteredBooks.map(book => `
        <div class="book-card">
            <div class="image-container">
                <img src="${book.image || getDefaultImage(book.type)}" 
                     alt="${book.title}"
                     loading="lazy"
                     onerror="this.src='${getDefaultImage(book.type)}'">
            </div>
            <div class="book-card-content">
                <h3>${book.title}</h3>
                <p class="author">${book.author}</p>
                
                ${book.description ? `<p class="description">${book.description}</p>` : ''}
                
                <div class="meta">
                    <span class="badge badge-type">${getTypeLabel(book.type)}</span>
                    <span class="badge badge-status ${book.status}">${getStatusLabel(book.status)}</span>
                </div>
                <div class="meta">
                    <span class="rating">⭐ ${book.rating}/10</span>
                </div>
                <div class="book-actions">
                    <button class="btn btn-edit" onclick="editBook('${book.id}')" 
                            style="display: ${EDITING_ENABLED ? 'inline-block' : 'none'}">
                        ✏️ Редактировать
                    </button>
                    <button class="btn btn-danger" onclick="deleteBook('${book.id}')" 
                            style="display: ${EDITING_ENABLED ? 'inline-block' : 'none'}">
                        🗑️ Удалить
                    </button>
                </div>
            </div>
        </div>
    `).join('');
    
    console.log('✅ Books rendered successfully');
}

// ===== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ =====
function getTypeLabel(type) {
    const types = {
        'book': 'Книга',
        'game': 'Игра',
        'movie': 'Фильм',
        'series': 'Сериал'
    };
    return types[type] || type;
}

function getStatusLabel(status) {
    const statuses = {
        'planned': 'В планах',
        'in-progress': 'В процессе',
        'completed': 'Завершено'
    };
    return statuses[status] || status;
}

function getDefaultImage(type) {
    const defaultImages = {
        'book': 'https://via.placeholder.com/400x280/3498db/ffffff?text=📚',
        'game': 'https://via.placeholder.com/400x280/e74c3c/ffffff?text=🎮',
        'movie': 'https://via.placeholder.com/400x280/9b59b6/ffffff?text=🎬',
        'series': 'https://via.placeholder.com/400x280/2ecc71/ffffff?text=📺'
    };
    return defaultImages[type] || 'https://via.placeholder.com/400x280/95a5a6/ffffff?text=📁';
}

function showErrorMessage(message) {
    const booksContainer = document.getElementById('booksContainer');
    if (booksContainer) {
        booksContainer.innerHTML = `<div class="error">${message}</div>`;
    }
}

// ===== РАБОТА С МОДАЛЬНЫМИ ОКНАМИ =====
function openModal(book = null) {
    if (!EDITING_ENABLED) {
        showAuthOverlay();
        return;
    }
    
    const bookModal = document.getElementById('bookModal');
    const modalTitle = document.getElementById('modalTitle');
    
    if (book) {
        modalTitle.textContent = 'Редактировать';
        document.getElementById('itemId').value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('type').value = book.type;
        document.getElementById('author').value = book.author;
        document.getElementById('status').value = book.status;
        document.getElementById('rating').value = book.rating;
        document.getElementById('image').value = book.image || '';
        document.getElementById('description').value = book.description || '';
    } else {
        modalTitle.textContent = 'Добавить в библиотеку';
        document.getElementById('bookForm').reset();
        document.getElementById('itemId').value = '';
    }
    
    bookModal.style.display = 'block';
}

function closeModalWindow() {
    document.getElementById('bookModal').style.display = 'none';
    document.getElementById('bookForm').reset();
}

// ===== ОБРАБОТКА ФОРМ =====
async function handleFormSubmit(event) {
    event.preventDefault();
    
    if (!EDITING_ENABLED) {
        showAuthOverlay();
        return;
    }
    
    const formData = {
        title: document.getElementById('title').value,
        type: document.getElementById('type').value,
        author: document.getElementById('author').value,
        status: document.getElementById('status').value,
        rating: parseInt(document.getElementById('rating').value) || 0,
        image: document.getElementById('image').value,
        description: document.getElementById('description').value
    };
    
    const bookId = document.getElementById('itemId').value;
    
    try {
        if (bookId) {
            await updateBook(bookId, formData);
        } else {
            await addBook(formData);
        }
        
        closeModalWindow();
        await loadBooks();
        showNotification('✅ Изменения сохранены', 'success');
    } catch (error) {
        console.error('Save error:', error);
        showNotification('❌ Ошибка сохранения: ' + error.message, 'error');
    }
}

// ===== API ФУНКЦИИ =====
async function addBook(bookData) {
    const response = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData)
    });
    
    if (!response.ok) throw new Error(`Ошибка добавления: ${response.status}`);
    return await response.json();
}

async function updateBook(id, bookData) {
    const response = await fetch(`${API_URL}/${id}`, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookData)
    });
    
    if (!response.ok) throw new Error(`Ошибка обновления: ${response.status}`);
    return await response.json();
}

async function deleteBook(id) {
    if (!EDITING_ENABLED) {
        showAuthOverlay();
        return;
    }
    
    if (!confirm('Удалить этот элемент?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`Ошибка удаления: ${response.status}`);
        await loadBooks();
        showNotification('🗑️ Элемент удален', 'success');
    } catch (error) {
        showNotification('❌ Ошибка удаления: ' + error.message, 'error');
    }
}

// ===== РЕДАКТИРОВАНИЕ =====
function editBook(id) {
    if (!EDITING_ENABLED) {
        showAuthOverlay();
        return;
    }
    
    const book = books.find(b => b.id === id);
    if (book) openModal(book);
}

// ===== ОБРАБОТЧИКИ СОБЫТИЙ =====
function initEventListeners() {
    console.log('🔌 Initializing event listeners...');
    
    // Кнопка темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleTheme);
        console.log('✅ Theme toggle listener added');
    }
    
    // Кнопка добавления
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) {
        addBookBtn.addEventListener('click', () => openModal());
        console.log('✅ Add book listener added');
    }
    
    // Модальное окно
    const closeModal = document.getElementById('closeModal');
    if (closeModal) {
        closeModal.addEventListener('click', closeModalWindow);
        console.log('✅ Close modal listener added');
    }
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) {
        cancelBtn.addEventListener('click', closeModalWindow);
        console.log('✅ Cancel button listener added');
    }
    
    // Форма
    const bookForm = document.getElementById('bookForm');
    if (bookForm) {
        bookForm.addEventListener('submit', handleFormSubmit);
        console.log('✅ Form submit listener added');
    }
    
    // Фильтры
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) {
        typeFilter.addEventListener('change', applyFilters);
        console.log('✅ Type filter listener added');
    }
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) {
        statusFilter.addEventListener('change', applyFilters);
        console.log('✅ Status filter listener added');
    }
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
        console.log('✅ Search input listener added');
    }
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('bookModal')) {
            closeModalWindow();
        }
    });
    
    // Обработка Enter в поле пароля
    const passwordInput = document.getElementById('passwordInput');
    if (passwordInput) {
        passwordInput.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                checkPassword();
            }
        });
    }
    
    console.log('✅ All event listeners initialized');
}

// ===== ИНИЦИАЛИЗАЦИЯ =====
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 DOM loaded, initializing app...');
    initTheme();
    initAuth(); // Защита и загрузка данных
    initEventListeners();
});

// ===== ГЛОБАЛЬНЫЕ ФУНКЦИИ =====
window.editBook = editBook;
window.deleteBook = deleteBook;
window.openModal = openModal;
window.loadBooks = loadBooks;
window.toggleTheme = toggleTheme;
window.checkPassword = checkPassword;
