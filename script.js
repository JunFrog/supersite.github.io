console.log('✅ Script loaded successfully!');

const API_URL = 'https://68c5b6e0a712aaca2b697175.mockapi.io/api/v1/library';
//проверка изменений
// Основные переменные
let books = [];
let filteredBooks = [];

// Управление темой
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

// Загрузка данных
async function loadBooks() {
    try {
        console.log('📡 Loading data from API...');
        const response = await fetch(API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        books = await response.json();
        console.log('✅ Data loaded:', books.length, 'items');
        
        applyFilters();
        
    } catch (error) {
        console.error('❌ Load error:', error);
        showErrorMessage('Ошибка загрузки: ' + error.message);
    }
}

// Фильтрация
function applyFilters() {
    const typeFilter = document.getElementById('typeFilter');
    const statusFilter = document.getElementById('statusFilter');
    const searchInput = document.getElementById('searchInput');
    
    filteredBooks = books.filter(book => {
        const matchesType = !typeFilter?.value || book.type === typeFilter.value;
        const matchesStatus = !statusFilter?.value || book.status === statusFilter.value;
        const matchesSearch = !searchInput?.value || 
            book.title.toLowerCase().includes(searchInput.value.toLowerCase());
        
        return matchesType && matchesStatus && matchesSearch;
    });
    
    renderBooks();
}

// Отрисовка карточек
function renderBooks() {
    const booksContainer = document.getElementById('booksContainer');
    
    if (filteredBooks.length === 0) {
        booksContainer.innerHTML = '<p class="no-books">📚 Библиотека пуста</p>';
        return;
    }
    
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
            <div class="meta">
                <span class="badge badge-type">${getTypeLabel(book.type)}</span>
                <span class="badge badge-status ${book.status}">${getStatusLabel(book.status)}</span>
            </div>
            <div class="meta">
                <span class="rating">⭐ ${book.rating}/10</span>
            </div>
            <div class="book-actions">
                <button class="btn btn-edit" onclick="editBook('${book.id}')">✏️ Редактировать</button>
                <button class="btn btn-danger" onclick="deleteBook('${book.id}')">🗑️ Удалить</button>
            </div>
        </div>
    </div>
`).join('');

// Вспомогательные функции
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

// Модальное окно
function openModal(book = null) {
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

// Обработка формы
async function handleFormSubmit(event) {
    event.preventDefault();
    
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
    } catch (error) {
        console.error('Save error:', error);
        alert('Ошибка сохранения: ' + error.message);
    }
}

// API функции
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
    if (!confirm('Удалить этот элемент?')) return;
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`Ошибка удаления: ${response.status}`);
        await loadBooks();
    } catch (error) {
        alert('Ошибка удаления: ' + error.message);
    }
}

// Вспомогательные
function showErrorMessage(message) {
    const booksContainer = document.getElementById('booksContainer');
    booksContainer.innerHTML = `<div class="error">${message}</div>`;
}

function editBook(id) {
    const book = books.find(b => b.id === id);
    if (book) openModal(book);
}

// Инициализация
function initEventListeners() {
    // Кнопка темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Кнопка добавления
    const addBookBtn = document.getElementById('addBookBtn');
    if (addBookBtn) addBookBtn.addEventListener('click', () => openModal());
    
    // Модальное окно
    const closeModal = document.getElementById('closeModal');
    if (closeModal) closeModal.addEventListener('click', closeModalWindow);
    
    const cancelBtn = document.getElementById('cancelBtn');
    if (cancelBtn) cancelBtn.addEventListener('click', closeModalWindow);
    
    // Форма
    const bookForm = document.getElementById('bookForm');
    if (bookForm) bookForm.addEventListener('submit', handleFormSubmit);
    
    // Фильтры
    const typeFilter = document.getElementById('typeFilter');
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    
    const statusFilter = document.getElementById('statusFilter');
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    
    // Закрытие модального окна
    window.addEventListener('click', (event) => {
        if (event.target === document.getElementById('bookModal')) {
            closeModalWindow();
        }
    });
}

// Запуск при загрузке
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Initializing app...');
    initTheme();
    initEventListeners();
    loadBooks();
});

// Глобальные функции
window.editBook = editBook;
window.deleteBook = deleteBook;
window.openModal = openModal;
window.loadBooks = loadBooks;
window.toggleTheme = toggleTheme;

