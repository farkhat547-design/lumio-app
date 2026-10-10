let isLoginMode = true;
let currentLang = 'ru';

// Словарь текстов интерфейса
const translations = {
    ru: {
        placeholder: "Задай вопрос...",
        thinking: "Lumio думает..."
    },
    kg: {
        placeholder: "Суроо бер...",
        thinking: "Lumio ойлонууда..."
    }
};

// Конфигурация материалов и карточек для каждой роли
const ROLE_CONFIGS = {
    student: {
        title: "Подготовка к ОРТ и экзаменам",
        subtitle: "Выбери предмет для подготовки или задай вопрос ИИ-репетитору:",
        cards: [
            { title: "Математика", desc: "Решение задач, формулы и разбор тем ОРТ", icon: "Σ" },
            { title: "Аналогии", desc: "Логика, поиск связей и тренировка тестов", icon: "◇" },
            { title: "Чтение и понимание", desc: "Анализ текстов и работа с информацией", icon: "◎" },
            { title: "Грамматика", desc: "Правила кыргызского и русского языков", icon: "Aa" }
        ],
        prompt: "Ты — Lumio AI, терпеливый репетитор для учеников. Помогай готовиться к экзаменам (ОРТ, LGS/YKS), объясняй простыми словами, наталкивай на решение."
    },
    teacher: {
        title: "Кабинет преподавателя",
        subtitle: "Управление учебным процессом, создание уроков и рейтинг учеников:",
        cards: [
            { title: "Планы уроков", desc: "Создание структурированных уроков по темам", icon: "📋" },
            { title: "Генератор тестов", desc: "Создание вопросов с ключами ответов", icon: "📝" },
            { title: "Рейтинг учеников", desc: "Анализ успеваемости и активности класса", icon: "🏆" },
            { title: "Домашние задания", desc: "Разработка заданий и методических материалов", icon: "📚" }
        ],
        prompt: "Ты — Lumio AI, методический ассистент для преподавателей. Помогай составлять планы уроков, тесты, домашние задания и оценивать рейтинг учеников."
    },
    language: {
        title: "Изучение языков",
        subtitle: "Практика разговорной речи и разбор грамматики с ИИ-партнером:",
        cards: [
            { title: "Английский язык", desc: "Разговорная практика и уровни (A1-C2)", icon: "🇬🇧" },
            { title: "Турецкий язык", desc: "Лексика, диалоги и грамматические правила", icon: "🇹🇷" },
            { title: "Кыргызский язык", desc: "Разговорные фразы и повседневная практика", icon: "🇰🇬" },
            { title: "Исправление ошибок", desc: "Разбор неточностей в реальном времени", icon: "✨" }
        ],
        prompt: "Ты — Lumio AI, интерактивный языковой репетитор. Практикуй языки, общайся на изучаемом языке, исправляй ошибки и объясняй грамматику."
    }
};

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('formTitle');
    const mainBtn = document.getElementById('mainBtn');
    const switchBtn = document.getElementById('switchBtn');
    const statusMsg = document.getElementById('statusMsg');

    if (statusMsg) statusMsg.style.display = 'none';

    if (isLoginMode) {
        if (title) title.innerText = "Lumio — Вход";
        if (mainBtn) mainBtn.innerText = "Войти";
        if (switchBtn) switchBtn.innerText = "Нет аккаунта? Зарегистрироваться";
    } else {
        if (title) title.innerText = "Lumio — Регистрация";
        if (mainBtn) mainBtn.innerText = "Создать аккаунт";
        if (switchBtn) switchBtn.innerText = "Уже есть аккаунт? Войти";
    }
}

function handleAuth() {
    const userField = document.getElementById('username');
    const passField = document.getElementById('password');
    
    if (!userField || !passField) return;

    const user = userField.value.trim();
    const pass = passField.value.trim();

    if (!user || !pass) {
        showStatus("Заполните логин и пароль!", "error");
        return;
    }

    const users = JSON.parse(localStorage.getItem('lumio_users') || '{}');

    if (isLoginMode) {
        if (users[user] && users[user] === pass) {
            localStorage.setItem('lumio_current_user', user);
            showStatus("Успешный вход!", "success");
            setTimeout(() => {
                const authScreen = document.getElementById('authScreen');
                const appScreen = document.getElementById('appScreen');
                if (authScreen) authScreen.style.display = 'none';
                if (appScreen) appScreen.style.display = 'block';
                updateRoleInterface(); // Инициализируем интерфейс при входе
            }, 1000);
        } else {
            showStatus("Неверный логин или пароль!", "error");
        }
    } else {
        if (users[user]) {
            showStatus("Такой пользователь уже существует!", "error");
        } else {
            users[user] = pass;
            localStorage.setItem('lumio_users', JSON.stringify(users));
            showStatus("Успешная регистрация! Теперь войдите.", "success");
            toggleAuthMode();
        }
    }
}

function showStatus(text, type) {
    let statusMsg = document.getElementById('statusMsg');
    if (!statusMsg) return;
    statusMsg.innerText = text;
    statusMsg.className = "status-msg " + type;
    statusMsg.style.display = 'block';
}

function setLanguage(lang) {
    currentLang = lang;
    const ruBtn = document.getElementById('langRuBtn');
    const kgBtn = document.getElementById('langKgBtn');
    
    if (ruBtn && kgBtn) {
        if (lang === 'ru') {
            ruBtn.classList.add('active-lang');
            kgBtn.classList.remove('active-lang');
        } else {
            kgBtn.classList.add('active-lang');
            ruBtn.classList.remove('active-lang');
        }
    }

    const input = document.getElementById('userInput');
    if (input) {
        input.placeholder = translations[lang].placeholder;
    }
}

// Динамическое обновление карточек и материалов на экране в зависимости от роли
function updateRoleInterface() {
    const roleSelect = document.getElementById('roleSelect');
    const container = document.getElementById('dynamicContentContainer');
    if (!roleSelect || !container) return;

    const currentRole = roleSelect.value;
    const config = ROLE_CONFIGS[currentRole] || ROLE_CONFIGS.student;

    let cardsHtml = '';
    config.cards.forEach(card => {
        cardsHtml += `
            <div class="subject-card" onclick="selectSubject('${card.title}')">
                <div class="card-icon">${card.icon}</div>
                <div class="card-title">${card.title}</div>
                <div class="card-desc">${card.desc}</div>
            </div>
        `;
    });

    container.innerHTML = `
        <div class="hero-section" id="heroSection">
            <h1>${config.title}</h1>
            <p>${config.subtitle}</p>
        </div>
        <div class="cards-grid" id="cardsGrid">
            ${cardsHtml}
        </div>
    `;
}

function selectSubject(subject) {
    const input = document.getElementById('userInput');
    if (!input) return;
    input.value = currentLang === 'ru' ? "Хочу поработать с материалом: " + subject : subject + " боюнча иштейли.";
    sendMessage();
}

function getCurrentSystemPrompt() {
    const roleSelect = document.getElementById('roleSelect');
    const role = roleSelect ? roleSelect.value : 'student';
    return ROLE_CONFIGS[role] ? ROLE_CONFIGS[role].prompt : ROLE_CONFIGS.student.prompt;
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const history = document.getElementById('chatHistory');
    if (!input || !history) return;

    const text = input.value.trim();
    if (!text) return;

    // Скрываем шапку приветствия и карточки при начале диалога
    const hero = document.getElementById('heroSection');
    const cards = document.getElementById('cardsGrid');
    if (hero) hero.style.display = 'none';
    if (cards) cards.style.display = 'none';

    // 1. Рисуем сообщение пользователя
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user-msg';
    userMsg.innerText = text;
    history.appendChild(userMsg);
    
    input.value = '';
    history.scrollTop = history.scrollHeight;

    // 2. Блок загрузки ответа ИИ
    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot-msg';
    botMsg.innerText = currentLang === 'kg' ? 'Ойлонууда...' : 'Думаю...';
    history.appendChild(botMsg);
    history.scrollTop = history.scrollHeight;

    try {
        const API_KEY = "AQ.Ab8RN6LKQ0RJ30bWUyJPTbgqo85sTs2loij3r_0fNKM_C5a8nA"; 
        const systemInstruction = getCurrentSystemPrompt();
        
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'x-goog-api-key': API_KEY 
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${systemInstruction}\n\nЯзык ответа: ${currentLang === 'kg' ? 'кыргызский' : 'русский'}.\nЗапрос пользователя: ${text}`
                    }]
                }]
            })
        });

        const data = await response.json();
        
        if (data.candidates && data.candidates[0].content.parts[0].text) {
            botMsg.innerText = data.candidates[0].content.parts[0].text;
        } else {
            botMsg.innerText = currentLang === 'kg' ? 'Ката кетти, кайра аракет кылыңыз.' : 'Произошла ошибка, попробуйте еще раз.';
        }
    } catch (error) {
        console.error(error);
        botMsg.innerText = currentLang === 'kg' ? 'Интернет байланышында ката бар.' : 'Ошибка соединения с сервером.';
    }

    history.scrollTop = history.scrollHeight;
}

// Слушатель для автоматического обновления карточек при смене селекта роли
document.addEventListener('DOMContentLoaded', () => {
    const roleSelect = document.getElementById('roleSelect');
    if (roleSelect) {
        roleSelect.addEventListener('change', updateRoleInterface);
    }
});