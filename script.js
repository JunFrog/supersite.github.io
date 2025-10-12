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
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.textContent = theme === 'light' ? '🌙' : '☀️';
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    console.log('Страница загружена, инициализируем...');
    initTheme();
    setupEventListeners();
    loadBooks();
});

// Настройка обработчиков событий
function setupEventListeners() {
    console.log('Настраиваем обработчики событий...');
    
    if (addBookBtn) addBookBtn.addEventListener('click', () => openModal());
    if (closeModal) closeModal.addEventListener('click', () => closeModalWindow());
    if (cancelBtn) cancelBtn.addEventListener('click', () => closeModalWindow());
    if (bookForm) bookForm.addEventListener('submit', handleFormSubmit);
    
    // Добавляем обработчик для кнопки темы
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) themeToggle.addEventListener('click', toggleTheme);
    
    // Фильтры
    if (typeFilter) typeFilter.addEventListener('change', applyFilters);
    if (statusFilter) statusFilter.addEventListener('change', applyFilters);
    if (searchInput) searchInput.addEventListener('input', applyFilters);
    
    // Закрытие модального окна при клике вне его
    window.addEventListener('click', (event) => {
        if (event.target === bookModal) {
            closeModalWindow();
        }
    });
}

// Загрузка данных из API
async function loadBooks() {
    console.log('Загружаем данные из API...', API_URL);
    
    try {
        const response = await fetch(API_URL);
        console.log('Ответ от API:', response);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Данные получены:', data);
        
        books = data;
        applyFilters();
        
    } catch (error) {
        console.error('Ошибка загрузки данных:', error);
        showErrorMessage(`Ошибка загрузки данных: ${error.message}`);
    }
}

// Показать сообщение об ошибке
function showErrorMessage(message) {
    if (booksContainer) {
        booksContainer.innerHTML = `
            <div class="error-message">
                <h3>😕 Не удалось загрузить данные</h3>
                <p>${message}</p>
                <button class="btn btn-primary" onclick="loadBooks()">Повторить попытку</button>
                <div class="debug-info">
                    <p><strong>URL API:</strong> ${API_URL}</p>
                    <p><strong>Проверь:</strong></p>
                    <ul>
                        <li>✅ Интернет-соединение</li>
                        <li>✅ URL API в коде</li>
                        <li>✅ Ресурс "library" в MockAPI</li>
                    </ul>
                </div>
            </div>
        `;
    }
}

// Применение фильтров
function applyFilters() {
    console.log('Применяем фильтры...');
    
    if (!books || books.length === 0) {
        if (booksContainer) {
            booksContainer.innerHTML = `
                <div class="no-books">
                    <h3>📚 Библиотека пуста</h3>
                    <p>Добавьте первую книгу, фильм или игру!</p>
                    <button class="btn btn-primary" onclick="openModal()">+ Добавить первый элемент</button>
                </div>
            `;
        }
        return;
    }
    
    filteredBooks = books.filter(book => {
        const matchesType = !typeFilter?.value || book.type === typeFilter.value;
        const matchesStatus = !statusFilter?.value || book.status === statusFilter.value;
        const matchesSearch = !searchInput?.value || 
            book.title.toLowerCase().includes(searchInput.value.toLowerCase()) ||
            (book.author && book.author.toLowerCase().includes(searchInput.value.toLowerCase()));
        
        return matchesType && matchesStatus && matchesSearch;
    });
    
    renderBooks();
}

// Отображение книг
function renderBooks() {
    console.log('Отрисовываем книги...', filteredBooks.length);
    
    if (!booksContainer) return;
    
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
                <h3>${book.title || 'Без названия'}</h3>
                <p class="author">${book.author || 'Неизвестный автор'}</p>
                <div class="meta">
                    <span class="badge badge-type">${getTypeLabel(book.type)}</span>
                    <span class="badge badge-status ${book.status}">${getStatusLabel(book.status)}</span>
                </div>
                <div class="meta">
                    <span class="rating">⭐ ${book.rating || 0}/10</span>
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
    return types[type] || type || 'Другое';
}

function getStatusLabel(status) {
    const statuses = {
        'planned': 'В планах',
        'in-progress': 'В процессе',
        'completed': 'Завершено'
    };
    return statuses[status] || status || 'Неизвестно';
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
        modalTitle.textContent = 'Редактировать';
        itemIdInput.value = book.id;
        document.getElementById('title').value = book.title || '';
        document.getElementById('type').value = book.type || '';
        document.getElementById('author').value = book.author || '';
        document.getElementById('status').value = book.status || '';
        document.getElementById('rating').value = book.rating || 0;
        document.getElementById('image').value = book.image || '';
        document.getElementById('description').value = book.description || '';
    } else {
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
            await updateBook(bookId, formData);
        } else {
            await addBook(formData);
        }
        
        closeModalWindow();
        await loadBooks();
    } catch (error) {
        console.error('Ошибка сохранения:', error);
        alert('Ошибка сохранения данных: ' + error.message);
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
    if (!confirm('Вы уверены, что хотите удалить этот элемент?')) {
        return;
    }
    
    try {
        const response = await fetch(`${API_URL}/${id}`, {
            method: 'DELETE'
        });
        
        if (!response.ok) throw new Error(`Ошибка удаления: ${response.status}`);
        
        await loadBooks();
    } catch (error) {
        console.error('Ошибка удаления:', error);
        alert('Ошибка удаления элемента: ' + error.message);
    }
}

// Функция для редактирования (вызывается из HTML)
function editBook(id) {
    const book = books.find(b => b.id === id);
    if (book) {
        openModal(book);
    }
}

// Делаем функции глобальными для HTML onclick
window.editBook = editBook;
window.deleteBook = deleteBook;
window.openModal = openModal;
window.loadBooks = loadBooks;
