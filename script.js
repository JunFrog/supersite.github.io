// Конфигурация - ЗАМЕНИ НА СВОЙ URL ОТ MOCKAPI
const API_URL = 'https://68c5b6e0a712aaca2b697175.mockapi.io/api/v1/library';

// Элементы DOM
const booksContainer = document.getElementById('booksContainer');
const addBookBtn = document.getElementById('addBookBtn');
const bookModal = document.getElementById('bookModal');
const closeModal = document.getElementById('closeModal');
const cancelBtn = document.getElementById('cancelBtn');
const bookForm = document.getElementById('bookForm');
const modalTitle = document.getElementById('modalTitle');
const itemIdInput = document.getElementById('itemId');
const themeToggle = document.getElementById('themeToggle');

// Фильтры
const typeFilter = document.getElementById('typeFilter');
const statusFilter = document.getElementById('statusFilter');
const searchInput = document.getElementById('searchInput');

// Текущие данные
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
    themeToggle.textContent = theme === 'light' ? '🌙 Тёмная тема' : '☀️ Светлая тема';
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    initTheme();
    loadBooks();
    setupEventListeners();
});

// Настройка обработчиков событий
function setupEventListeners() {
    addBookBtn.addEventListener('click', () => openModal());
    closeModal.addEventListener('click', () => closeModalWindow());
    cancelBtn.addEventListener('click', () => closeModalWindow());
    bookForm.addEventListener('submit', handleFormSubmit);
    themeToggle.addEventListener('click', toggleTheme);
    
    // Фильтры
    typeFilter.addEventListener('change', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    searchInput.addEventListener('input', applyFilters);
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === bookModal) {
            closeModalWindow();
        }
    });
}

// Загрузка данных из API
async function loadBooks() {
    try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Ошибка загрузки данных');
        
        books = await response.json();
        applyFilters(); // Применяем фильтры после загрузки
    } catch (error) {
        console.error('Ошибка:', error);
        booksContainer.innerHTML = '<p class="error">Ошибка загрузки данных</p>';
    }
}

// Применение фильтров
function applyFilters() {
    filteredBooks = books.filter(book => {
        const matchesType = !typeFilter.value || book.type === typeFilter.value;
        const matchesStatus = !statusFilter.value || book.status === statusFilter.value;
        const matchesSearch = !searchInput.value || 
            book.title.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            book.author.toLowerCase().includes(searchInput.value.toLowerCase());
        
        return matchesType && matchesStatus && matchesSearch;
    });
    
    renderBooks();
}

// Отображение книг
function renderBooks() {
    if (filteredBooks.length === 0) {
        booksContainer.innerHTML = '<p class="no-books">Ничего не найдено</p>';
        return;
    }
    
    booksContainer.innerHTML = filteredBooks.map(book => `
        <div class="book-card">
            <div class="image-container">
                <img src="${book.image || getDefaultImage(book.type)}" 
                     alt="${book.title}"
                     loading="lazy"
                     onerror="this.src='${getDefaultImage(book.type)}'; this.onerror=null;">
                <div class="image-placeholder">${getTypeIcon(book.type)}</div>
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
}

// Вспомогательные функции для отображения labels
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

function getTypeIcon(type) {
    const icons = {
        'book': '📚',
        'game': '🎮', 
        'movie': '🎬',
        'series': '📺'
    };
    return icons[type] || '📁';
}

// Работа с модальным окном
function openModal(book = null) {
    if (book) {
        // Режим редактирования
        modalTitle.textContent = 'Редактировать';
        itemIdInput.value = book.id;
        document.getElementById('title').value = book.title;
        document.getElementById('type').value = book.type;
        document.getElementById('author').value = book.author;
        document.getElementById('status').value = book.status;
        document.getElementById('rating').value = book.rating;
        document.getElementById('image').value = book.image || '';
        document.getElementById('description').value = book.description || '';
    } else {
        // Режим добавления
        modalTitle.textContent = 'Добавить в библиотеку';
        bookForm.reset();
        itemIdInput.value = '';
    }
    
    bookModal.style.display = 'block';
}

function closeModalWindow() {
    bookModal.style.display = 'none';
    bookForm.reset();
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
    
    const bookId = itemIdInput.value;
    
    try {
        if (bookId) {
            // Обновление существующей книги
            await updateBook(bookId, formData);
        } else {
            // Добавление новой книги
            await addBook(formData);
        }
        
        closeModalWindow();
        await loadBooks(); // Перезагружаем данные
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка сохранения данных');
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
    
    if (!response.ok) throw new Error('Ошибка добавления');
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
    
    if (!response.ok) throw new Error('Ошибка обновления');
    return await response.json();
}

async function deleteBook(id) {
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error('Ошибка удаления');
        
        await loadBooks(); // Перезагружаем данные после удаления
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления элемента');
    }
}

// Функция для редактирования (вызывается из HTML)
function editBook(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        openModal(book);
    }
}
