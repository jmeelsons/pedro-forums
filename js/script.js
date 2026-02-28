// Ключи для localStorage
const STORAGE_KEYS = {
    USERS: 'forum_users',
    CATEGORIES: 'forum_categories',
    TOPICS: 'forum_topics',
    POSTS: 'forum_posts',
    CURRENT_USER: 'forum_current_user'
};

// Инициализация данных при первом запуске
function initializeData() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
        // Создаем тестового пользователя
        const users = [{
            id: 1,
            username: 'admin',
            email: 'admin@example.com',
            password: 'admin123',
            createdAt: new Date().toISOString()
        }];
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.CATEGORIES)) {
        // Создаем тестовые ветки
        const categories = [
            {
                id: 1,
                name: 'Общие вопросы',
                description: 'Обсуждение общих вопросов',
                createdAt: new Date().toISOString()
            },
            {
                id: 2,
                name: 'Техническая поддержка',
                description: 'Помощь и решение проблем',
                createdAt: new Date().toISOString()
            }
        ];
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.TOPICS)) {
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify([]));
    }
    
    if (!localStorage.getItem(STORAGE_KEYS.POSTS)) {
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify([]));
    }
}

// Навигация
function updateNavigation() {
    const navMenu = document.getElementById('nav-menu');
    if (!navMenu) return;
    
    const currentUser = getCurrentUser();
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    
    let navHtml = '<li><a href="index.html" ' + 
        (currentPage === 'index.html' ? 'class="active"' : '') + '>Главная</a></li>';
    
    if (currentUser) {
        navHtml += '<li><a href="profile.html" ' + 
            (currentPage === 'profile.html' ? 'class="active"' : '') + '>Мой профиль</a></li>' +
            '<li><a href="#" onclick="logout(); return false;">Выйти</a></li>';
    } else {
        navHtml += '<li><a href="login.html" ' + 
            (currentPage === 'login.html' ? 'class="active"' : '') + '>Вход</a></li>' +
            '<li><a href="register.html" ' + 
            (currentPage === 'register.html' ? 'class="active"' : '') + '>Регистрация</a></li>';
    }
    
    navMenu.innerHTML = navHtml;
    
    // Показываем/скрываем кнопку создания ветки на главной
    const createBtn = document.getElementById('create-category-btn');
    if (createBtn) {
        createBtn.style.display = currentUser ? 'inline-block' : 'none';
    }
}

// Пользователи
function getCurrentUser() {
    const userJson = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return userJson ? JSON.parse(userJson) : null;
}

function logout() {
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    window.location.href = 'index.html';
}

// Категории
function getCategories() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CATEGORIES)) || [];
}

function getTopics() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TOPICS)) || [];
}

function getPosts() {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.POSTS)) || [];
}

// Отображение категорий на главной
function displayCategories() {
    const categoriesList = document.getElementById('categories-list');
    if (!categoriesList) return;
    
    const categories = getCategories();
    const topics = getTopics();
    
    if (categories.length === 0) {
        categoriesList.innerHTML = '<p class="no-data">Веток пока нет. Создайте первую ветку!</p>';
        return;
    }
    
    let html = '';
    categories.forEach(category => {
        const topicsCount = topics.filter(t => t.categoryId === category.id).length;
        html += `
            <div class="category-card">
                <div class="category-header">
                    <h3><a href="category.html?id=${category.id}">${escapeHtml(category.name)}</a></h3>
                    <span class="topics-count">Тем: ${topicsCount}</span>
                </div>
                ${category.description ? `<p class="category-description">${escapeHtml(category.description)}</p>` : ''}
            </div>
        `;
    });
    
    categoriesList.innerHTML = html;
}

// Регистрация
function setupRegisterForm() {
    const form = document.getElementById('register-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirm-password').value;
        
        // Валидация
        if (password !== confirmPassword) {
            showError('Пароли не совпадают');
            return;
        }
        
        if (password.length < 6) {
            showError('Пароль должен содержать минимум 6 символов');
            return;
        }
        
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
        
        // Проверка уникальности
        if (users.some(u => u.username === username || u.email === email)) {
            showError('Имя пользователя или email уже заняты');
            return;
        }
        
        // Создание пользователя
        const newUser = {
            id: Date.now(),
            username,
            email,
            password, // В реальном приложении нужно хешировать
            createdAt: new Date().toISOString()
        };
        
        users.push(newUser);
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        showSuccess('Регистрация успешна! Перенаправляем...');
        setTimeout(() => {
            window.location.href = 'login.html';
        }, 2000);
    });
}

// Вход
function setupLoginForm() {
    const form = document.getElementById('login-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
        
        const user = users.find(u => 
            (u.username === username || u.email === username) && u.password === password
        );
        
        if (user) {
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify({
                id: user.id,
                username: user.username,
                email: user.email
            }));
            
            showSuccess('Вход выполнен успешно! Перенаправляем...');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1500);
        } else {
            showError('Неверное имя пользователя или пароль');
        }
    });
}

// Профиль
function loadProfile() {
    const profileContainer = document.getElementById('profile-container');
    if (!profileContainer) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const userData = users.find(u => u.id === currentUser.id);
    
    if (!userData) {
        logout();
        return;
    }
    
    profileContainer.innerHTML = `
        <div class="profile-section">
            <h3>Информация о пользователе</h3>
            <div class="profile-info">
                <p><strong>Имя пользователя:</strong> ${escapeHtml(userData.username)}</p>
                <p><strong>Email:</strong> ${escapeHtml(userData.email)}</p>
                <p><strong>Дата регистрации:</strong> ${new Date(userData.createdAt).toLocaleDateString()}</p>
            </div>
        </div>
        
        <div class="profile-section">
            <h3>Редактировать профиль</h3>
            <form id="update-profile-form">
                <div class="form-group">
                    <label for="username">Имя пользователя:</label>
                    <input type="text" id="username" name="username" value="${escapeHtml(userData.username)}" required>
                </div>
                
                <div class="form-group">
                    <label for="email">Email:</label>
                    <input type="email" id="email" name="email" value="${escapeHtml(userData.email)}" required>
                </div>
                
                <button type="submit" class="btn">Сохранить изменения</button>
            </form>
        </div>
        
        <div class="profile-section">
            <h3>Изменить пароль</h3>
            <form id="change-password-form">
                <div class="form-group">
                    <label for="current-password">Текущий пароль:</label>
                    <input type="password" id="current-password" required>
                </div>
                
                <div class="form-group">
                    <label for="new-password">Новый пароль:</label>
                    <input type="password" id="new-password" required>
                    <small>Минимум 6 символов</small>
                </div>
                
                <div class="form-group">
                    <label for="confirm-new-password">Подтверждение нового пароля:</label>
                    <input type="password" id="confirm-new-password" required>
                </div>
                
                <button type="submit" class="btn">Изменить пароль</button>
            </form>
        </div>
    `;
    
    setupUpdateProfileForm(userData);
    setupChangePasswordForm(userData);
}

function setupUpdateProfileForm(userData) {
    const form = document.getElementById('update-profile-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const newUsername = document.getElementById('username').value.trim();
        const newEmail = document.getElementById('email').value.trim();
        
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
        
        // Проверка уникальности
        const existingUser = users.find(u => 
            (u.username === newUsername || u.email === newEmail) && u.id !== userData.id
        );
        
        if (existingUser) {
            showError('Имя пользователя или email уже заняты');
            return;
        }
        
        // Обновление данных
        const userIndex = users.findIndex(u => u.id === userData.id);
        users[userIndex].username = newUsername;
        users[userIndex].email = newEmail;
        
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        // Обновление текущего пользователя в сессии
        const currentUser = getCurrentUser();
        currentUser.username = newUsername;
        currentUser.email = newEmail;
        localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
        
        showSuccess('Профиль успешно обновлен');
    });
}

function setupChangePasswordForm(userData) {
    const form = document.getElementById('change-password-form');
    if (!form) return;
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const currentPassword = document.getElementById('current-password').value;
        const newPassword = document.getElementById('new-password').value;
        const confirmNewPassword = document.getElementById('confirm-new-password').value;
        
        const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
        const user = users.find(u => u.id === userData.id);
        
        if (user.password !== currentPassword) {
            showError('Неверный текущий пароль');
            return;
        }
        
        if (newPassword !== confirmNewPassword) {
            showError('Новые пароли не совпадают');
            return;
        }
        
        if (newPassword.length < 6) {
            showError('Новый пароль должен содержать минимум 6 символов');
            return;
        }
        
        // Обновление пароля
        user.password = newPassword;
        localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
        
        showSuccess('Пароль успешно изменен');
        form.reset();
    });
}

// Создание категории
function setupCreateCategoryForm() {
    const form = document.getElementById('create-category-form');
    if (!form) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const name = document.getElementById('name').value.trim();
        const description = document.getElementById('description').value.trim();
        
        if (!name) {
            showError('Название ветки обязательно');
            return;
        }
        
        const categories = getCategories();
        
        const newCategory = {
            id: Date.now(),
            name,
            description,
            createdAt: new Date().toISOString()
        };
        
        categories.push(newCategory);
        localStorage.setItem(STORAGE_KEYS.CATEGORIES, JSON.stringify(categories));
        
        showSuccess('Ветка успешно создана!');
        setTimeout(() => {
            window.location.href = 'index.html';
        }, 1500);
    });
}

// Просмотр категории
function loadCategory() {
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = parseInt(urlParams.get('id'));
    
    if (!categoryId) {
        window.location.href = 'index.html';
        return;
    }
    
    const categories = getCategories();
    const category = categories.find(c => c.id === categoryId);
    
    if (!category) {
        window.location.href = 'index.html';
        return;
    }
    
    const topics = getTopics().filter(t => t.categoryId === categoryId);
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const currentUser = getCurrentUser();
    
    // Сортируем темы по дате (сначала новые)
    topics.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    
    let topicsHtml = '';
    topics.forEach(topic => {
        const author = users.find(u => u.id === topic.userId) || { username: 'Неизвестно' };
        const posts = getPosts().filter(p => p.topicId === topic.id);
        
        topicsHtml += `
            <div class="topic-card">
                <div class="topic-main">
                    <h3><a href="topic.html?id=${topic.id}">${escapeHtml(topic.title)}</a></h3>
                    <p class="topic-excerpt">${escapeHtml(topic.content.substring(0, 150))}${topic.content.length > 150 ? '...' : ''}</p>
                </div>
                <div class="topic-meta">
                    <span>Автор: ${escapeHtml(author.username)}</span>
                    <span>Ответы: ${posts.length}</span>
                    <span>Создано: ${new Date(topic.createdAt).toLocaleString()}</span>
                </div>
            </div>
        `;
    });
    
    const contentDiv = document.getElementById('category-content');
    contentDiv.innerHTML = `
        <div class="header-actions">
            <h2>${escapeHtml(category.name)}</h2>
            ${currentUser ? `<button class="btn" onclick="location.href='create-topic.html?categoryId=${categoryId}'">Создать тему</button>` : ''}
        </div>
        
        ${category.description ? `<p class="category-description">${escapeHtml(category.description)}</p>` : ''}
        
        <div class="topics-list">
            ${topicsHtml || '<p class="no-data">В этой ветке пока нет тем</p>'}
        </div>
    `;
}

// Создание темы
function setupCreateTopicForm() {
    const form = document.getElementById('create-topic-form');
    if (!form) return;
    
    const currentUser = getCurrentUser();
    if (!currentUser) {
        window.location.href = 'login.html';
        return;
    }
    
    const urlParams = new URLSearchParams(window.location.search);
    const categoryId = parseInt(urlParams.get('categoryId'));
    
    if (!categoryId) {
        window.location.href = 'index.html';
        return;
    }
    
    document.getElementById('category-id').value = categoryId;
    
    const cancelBtn = document.getElementById('cancel-btn');
    if (cancelBtn) {
        cancelBtn.href = `category.html?id=${categoryId}`;
    }
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const title = document.getElementById('title').value.trim();
        const content = document.getElementById('content').value.trim();
        
        if (!title || !content) {
            showError('Заполните все поля');
            return;
        }
        
        const topics = getTopics();
        
        const newTopic = {
            id: Date.now(),
            categoryId,
            userId: currentUser.id,
            title,
            content,
            createdAt: new Date().toISOString()
        };
        
        topics.push(newTopic);
        localStorage.setItem(STORAGE_KEYS.TOPICS, JSON.stringify(topics));
        
        showSuccess('Тема успешно создана!');
        setTimeout(() => {
            window.location.href = `category.html?id=${categoryId}`;
        }, 1500);
    });
}

// Просмотр темы
function loadTopic() {
    const urlParams = new URLSearchParams(window.location.search);
    const topicId = parseInt(urlParams.get('id'));
    
    if (!topicId) {
        window.location.href = 'index.html';
        return;
    }
    
    const topics = getTopics();
    const topic = topics.find(t => t.id === topicId);
    
    if (!topic) {
        window.location.href = 'index.html';
        return;
    }
    
    const users = JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS)) || [];
    const author = users.find(u => u.id === topic.userId) || { username: 'Неизвестно' };
    const categories = getCategories();
    const category = categories.find(c => c.id === topic.categoryId);
    
    let posts = getPosts().filter(p => p.topicId === topicId);
    posts.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
    const currentUser = getCurrentUser();
    
    let postsHtml = '';
    posts.forEach(post => {
        const postAuthor = users.find(u => u.id === post.userId) || { username: 'Неизвестно' };
        postsHtml += `
            <div class="post-card">
                <div class="post-header">
                    <span class="post-author">${escapeHtml(postAuthor.username)}</span>
                    <span class="post-date">${new Date(post.createdAt).toLocaleString()}</span>
                </div>
                <div class="post-content">${escapeHtml(post.content).replace(/\n/g, '<br>')}</div>
            </div>
        `;
    });
    
    const contentDiv = document.getElementById('topic-content');
    contentDiv.innerHTML = `
        <div>
            <a href="category.html?id=${topic.categoryId}" class="btn">← Вернуться к ветке</a>
        </div>
        
        <div class="topic-header" style="margin-top: 20px;">
            <h2>${escapeHtml(topic.title)}</h2>
            <div class="topic-meta" style="border-top: none; padding-top: 0;">
                <span>Автор: ${escapeHtml(author.username)}</span>
                <span>Ветка: ${category ? escapeHtml(category.name) : 'Неизвестно'}</span>
                <span>Создано: ${new Date(topic.createdAt).toLocaleString()}</span>
            </div>
        </div>
        
        <div class="topic-content" style="margin: 20px 0; padding: 20px; background-color: #f8f9fa; border-radius: 6px; border: 1px solid #e9ecef;">
            ${escapeHtml(topic.content).replace(/\n/g, '<br>')}
        </div>
        
        <div class="posts-list">
            <h3>Ответы (${posts.length})</h3>
            ${postsHtml || '<p class="no-data">Пока нет ответов</p>'}
        </div>
        
        ${currentUser ? `
            <div class="post-form">
                <h3>Добавить ответ</h3>
                <form id="add-post-form">
                    <div class="form-group">
                        <textarea id="post-content" rows="4" required placeholder="Напишите ваш ответ..."></textarea>
                    </div>
                    <button type="submit" class="btn btn-primary">Отправить</button>
                </form>
            </div>
        ` : ''}
    `;
    
    if (currentUser) {
        setupAddPostForm(topicId);
    }
}

function setupAddPostForm(topicId) {
    const form = document.getElementById('add-post-form');
    if (!form) return;
    
    const currentUser = getCurrentUser();
    
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const content = document.getElementById('post-content').value.trim();
        
        if (!content) {
            showError('Введите текст ответа');
            return;
        }
        
        const posts = getPosts();
        
        const newPost = {
            id: Date.now(),
            topicId,
            userId: currentUser.id,
            content,
            createdAt: new Date().toISOString()
        };
        
        posts.push(newPost);
        localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
        
        showSuccess('Ответ добавлен!');
        setTimeout(() => {
            window.location.reload();
        }, 1000);
    });
}

// Вспомогательные функции
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function showError(message) {
    const errorDiv = document.getElementById('error-message');
    if (errorDiv) {
        errorDiv.textContent = message;
        errorDiv.style.display = 'block';
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 5000);
    }
}

function showSuccess(message) {
    const successDiv = document.getElementById('success-message');
    if (successDiv) {
        successDiv.textContent = message;
        successDiv.style.display = 'block';
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 5000);
    }
}

// Инициализация при загрузке страницы
document.addEventListener('DOMContentLoaded', () => {
    initializeData();
    updateNavigation();
    
    // Определяем текущую страницу и вызываем соответствующие функции
    const path = window.location.pathname.split('/').pop() || 'index.html';
    
    switch (path) {
        case 'index.html':
            displayCategories();
            break;
        case 'register.html':
            setupRegisterForm();
            break;
        case 'login.html':
            setupLoginForm();
            break;
        case 'profile.html':
            loadProfile();
            break;
        case 'create-category.html':
            setupCreateCategoryForm();
            break;
        case 'category.html':
            loadCategory();
            break;
        case 'create-topic.html':
            setupCreateTopicForm();
            break;
        case 'topic.html':
            loadTopic();
            break;
    }
});
