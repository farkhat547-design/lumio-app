let isLoginMode = true;

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

const GEMINI_API_KEY = "AIzaSyAb8RN6IONzbzKMO1h16idftWqSLgsxJ_hZpUE7JOdxAud_Kpig";

function selectSubject(subject) {
    const input = document.getElementById('userInput');
    if (!input) return;
    input.value = "Хочу позаниматься по предмету: " + subject + ". Дай мне первое задание.";
    sendMessage();
}

async function sendMessage() {
    const input = document.getElementById('userInput');
    const history = document.getElementById('chatHistory');

    if (!input || !history) return;

    const text = input.value.trim();
    if (!text) return;

    const hero = document.getElementById('heroSection');
    const cards = document.getElementById('cardsGrid');
    if (hero) hero.style.display = 'none';
    if (cards) cards.style.display = 'none';

    const userMsg = document.createElement('div');
    userMsg.className = 'msg user-msg';
    userMsg.innerText = text;
    history.appendChild(userMsg);

    input.value = '';
    history.scrollTop = history.scrollHeight;

    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot-msg';
    botMsg.innerText = "Думаю...";
    history.appendChild(botMsg);
    history.scrollTop = history.scrollHeight;

    let success = false;

    // Перебираем актуальные модели с корректной структурой запроса
    for (const model of ['gemini-1.5-flash', 'gemini-2.0-flash']) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    contents: [
                        {
                            role: "user",
                            parts: [
                                { text: "Ты — Lumio AI, персональный репетитор по ОРТ в Кыргызстане. Отвечай понятно и подробно. Вопрос ученика: " + text }
                            ]
                        }
                    ]
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                botMsg.innerText = data.candidates[0].content.parts[0].text;
                success = true;
                break;
            } else {
                console.warn(`Модель ${model} ответила с ошибкой:`, data);
            }
        } catch (err) {
            console.error("Ошибка сети для модели", model, err);
        }
    }

    if (!success) {
        botMsg.innerText = "Не удалось получить ответ. Проверьте консоль (F12) для деталей.";
    }

    history.scrollTop = history.scrollHeight;
}