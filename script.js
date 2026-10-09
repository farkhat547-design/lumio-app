let isLoginMode = true;

function toggleAuthMode() {
    isLoginMode = !isLoginMode;
    const title = document.getElementById('formTitle');
    const mainBtn = document.getElementById('mainBtn');
    const switchBtn = document.getElementById('switchBtn');
    const statusMsg = document.getElementById('statusMsg');

    statusMsg.style.display = 'none';

    if (isLoginMode) {
        title.innerText = "Lumio — Вход";
        mainBtn.innerText = "Войти";
        switchBtn.innerText = "Нет аккаунта? Зарегистрироваться";
    } else {
        title.innerText = "Lumio — Регистрация";
        mainBtn.innerText = "Создать аккаунт";
        switchBtn.innerText = "Уже есть аккаунт? Войти";
    }
}

function handleAuth() {
    const user = document.getElementById('username').value.trim();
    const pass = document.getElementById('password').value.trim();

    if (!user || !pass) {
        showStatus("Заполните логин и пароль!", "error");
        return;
    }

    const users = JSON.parse(localStorage.getItem('lumio_users') || '{}');

    if (isLoginMode) {
        if (users[user] && users[user] === pass) {
            document.getElementById('authCard').style.display = 'none';
            document.getElementById('appContainer').style.display = 'flex';
        } else {
            showStatus("Неверный логин или пароль!", "error");
        }
    } else {
        if (users[user]) {
            showStatus("Пользователь уже существует!", "error");
            return;
        }

        users[user] = pass;
        localStorage.setItem('lumio_users', JSON.stringify(users));
        showStatus("Успешная регистрация! Теперь войдите.", "success");
        toggleAuthMode();
    }
}

function showStatus(text, type) {
    const statusMsg = document.getElementById('statusMsg');
    statusMsg.innerText = text;
    statusMsg.className = "status-msg " + type;
    statusMsg.style.display = 'block';
}

const GEMINI_API_KEY = "AIzaSyAQ.Ab8RN6I56Apl9752QbscPgVO1gCVYOp7Mc8nosOd-dhvJaUf2g";

const modelsToTry = [
    'gemini-1.5-flash',
    'gemini-2.0-flash'
];

function selectSubject(subject) {
    const input = document.getElementById('userInput');
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

    for (const model of modelsToTry) {
        try {
            const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;

            const response = await fetch(url, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{
                        parts: [{ text: "Ты — Lumio AI, персональный репетитор по ОРТ в Кыргызстане. Отвечай понятно и подробно. Вопрос: " + text }]
                    }]
                })
            });

            const data = await response.json();

            if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
                botMsg.innerText = data.candidates[0].content.parts[0].text;
                success = true;
                break;
            }
        } catch (err) {
            console.error("Ошибка сети:", err);
        }
    }

    if (!success) {
        botMsg.innerText = "Ошибка отправки. Попробуйте еще раз.";
    }

    history.scrollTop = history.scrollHeight;
}