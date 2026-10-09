let isLoginMode = true;
let currentLang = 'ru';

// Словарь текстов интерфейса
const translations = {
    ru: {
        placeholder: "Задай вопрос по ОРТ...",
        thinking: "Lumio думает...",
        welcome: "Привет! Я Lumio AI, твой персональный репетитор по подготовке к ОРТ в Кыргызстане. Выбери нужную тему на карточке или задай свой вопрос!"
    },
    kg: {
        placeholder: "ЖРТ боюнча суроо бер...",
        thinking: "Lumio ойлонууда...",
        welcome: "Салам! Мен Lumio AI, Кыргызстандагы ЖРТга даярдануу боюнча сенин жеке репетиторумун. Карточкадан керектүү теманы танда же суроо бер!"
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
    
    if (!userField || !passField) {
        showStatus("Ошибка: поля ввода не найдены в HTML!", "error");
        return;
    }

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
    
    if (!statusMsg) {
        statusMsg = document.createElement('div');
        statusMsg.id = 'statusMsg';
        const mainBtn = document.getElementById('mainBtn');
        if (mainBtn && mainBtn.parentNode) {
            mainBtn.parentNode.insertBefore(statusMsg, mainBtn.nextSibling);
        } else {
            document.body.appendChild(statusMsg);
        }
    }

    statusMsg.innerText = text;
    statusMsg.className = "status-msg " + type;
    statusMsg.style.display = 'block';
    statusMsg.style.marginTop = '10px';
    statusMsg.style.fontWeight = 'bold';
    statusMsg.style.color = type === 'error' ? 'red' : 'green';
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

function selectSubject(subject) {
    const input = document.getElementById('userInput');
    if (!input) return;
    input.value = currentLang === 'ru' ? "Хочу позаниматься по предмету: " + subject : subject + " боюнча даярдангым келет.";
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const history = document.getElementById('chatHistory');
    if (!input || !history) return;

    const text = input.value.trim();
    if (!text) return;

    // Скрываем приветствие и карточки при первом сообщении
    const hero = document.getElementById('heroSection');
    const cards = document.getElementById('cardsGrid');
    if (hero) hero.style.display = 'none';
    if (cards) cards.style.display = 'none';

    // 1. Рисуем сообщение пользователя в чате
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user-msg';
    userMsg.innerText = text;
    history.appendChild(userMsg);
    
    input.value = '';
    history.scrollTop = history.scrollHeight;

    // 2. Создаем блок для ответа ИИ с эффектом загрузки
    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot-msg';
    botMsg.innerText = currentLang === 'kg' ? 'Ойлонууда...' : 'Думаю...';
    history.appendChild(botMsg);
    history.scrollTop = history.scrollHeight;

    try {
        // Твой бесплатный API ключ от Google AI Studio
        const API_KEY = "AQ.Ab8RN6LHYrN-sdKEH-pNYBVf70SbqUm94RRbXK-2nuXHP7FvaQ"; 
        
        // Используем быструю и бесплатную модель gemini-1.5-flash
        const response = await fetch(`https://generativelanguage.googleapis.com/v1/models/gemini-1.5-flash:generateContent?key=${API_KEY}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { 
                                text: `Ты — Lumio, дружелюбный ИИ-репетитор по подготовке к ОРТ (Общереспубликанскому тестированию) в Кыргызстане. Отвечай на языке запроса (русский или кыргызский). Помогай разбирать математическое мышление, аналогии и чтение. Вопрос пользователя: ${text}` 
                            }
                        ]
                    }
                ]
            })
        });

        const data = await response.json();
        
        // Достаем ответ от модели
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