console.log('Script loaded successfully!');

const API_URL = 'https://68c5b6e0a712aaca2b697175.mockapi.io/api/v1/library';

// Базовая функция загрузки
async function loadBooks() {
    try {
        console.log('Loading from:', API_URL);
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log('Data loaded:', data);
        
        document.getElementById('booksContainer').innerHTML = 
            '<p>✅ Данные загружены! Проверь консоль.</p>';
            
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('booksContainer').innerHTML = 
            '<p>❌ Ошибка: ' + error.message + '</p>';
    }
}

// Запускаем при загрузке
document.addEventListener('DOMContentLoaded', loadBooks);

// Кнопка темы
function toggleTheme() {
    console.log('Theme toggle clicked');
}

// Делаем глобальной
window.toggleTheme = toggleTheme;
