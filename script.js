console.log('Script loaded!');

const API_URL = 'https://68c5b6e0a712aaca2b697175.mockapi.io/api/v1/library';

// Базовая функция загрузки
async function loadBooks() {
    try {
        console.log('Loading from:', API_URL);
        const response = await fetch(API_URL);
        const data = await response.json();
        console.log('Data loaded:', data);
        
        // Просто покажем данные в консоли
        document.getElementById('booksContainer').innerHTML = 
            '<p>Данные загружены, смотри консоль</p>';
            
    } catch (error) {
        console.error('Error:', error);
        document.getElementById('booksContainer').innerHTML = 
            '<p>Ошибка: ' + error.message + '</p>';
    }
}

// Запускаем при загрузке
document.addEventListener('DOMContentLoaded', loadBooks);
