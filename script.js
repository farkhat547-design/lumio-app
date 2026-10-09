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

    // Сообщение пользователя
    const userMsg = document.createElement('div');
    userMsg.className = 'msg user-msg';
    userMsg.innerText = text;
    history.appendChild(userMsg);

    input.value = '';
    history.scrollTop = history.scrollHeight;

    // Сообщение «Думаю...»
    const botMsg = document.createElement('div');
    botMsg.className = 'msg bot-msg';
    botMsg.innerText = "Lumio думает...";
    history.appendChild(botMsg);
    history.scrollTop = history.scrollHeight;

    // Имитируем задержку для реалистичности
    await new Promise(resolve => setTimeout(resolve, 800));

    // Умные структурированные ответы по ОРТ
    let reply = "Привет! Я Lumio AI, твой персональный репетитор по подготовке к ОРТ в Кыргызстане. ";
    
    const lowerText = text.toLowerCase();
    if (lowerText.includes('математик') || lowerText.includes('задач')) {
        reply += "Давай разберем задачу по математике (секция «Математическое мышление» ОРТ):\n\n" +
                 "**Пример задачи:** Если цена товара сначала выросла на 20%, а потом снизилась на 20%, как изменилась первоначальная цена?\n" +
                 "1) Не изменилась\n2) Уменьшилась на 4%\n3) Увеличилась на 4%\n\n" +
                 "Попробуй решить и напиши свой ответ!";
    } else if (lowerText.includes('аналог')) {
        reply += "Тренируем аналогии (проверка логического мышления в ОРТ):\n\n" +
                 "**Пара:** КНИГА : СТРАНИЦА\n" +
                 "Выберите похожую пару:\n" +
                 "А) Дом : Стена\n" +
                 "Б) Лес : Дерево\n" +
                 "В) Автомобиль : Колесо\n\n" +
                 "Какой вариант правильный и почему?";
    } else if (lowerText.includes('чен') || lowerText.includes('текст')) {
        reply += "Секция «Чтение и понимание текста»:\n\n" +
                 "Проанализируй отрывок: «Успешная подготовка к экзамену строится на регулярности, а не на штурме перед дедлайном». " +
                 "Напиши своими словами, почему автор делает акцент именно на системе.";
    } else {
        reply += "Я готов помочь тебе подготовиться к ОРТ по всем предметным тестам (Математика, Аналогии, Чтение, Грамматика). Выбери нужную тему на карточке или напиши свой вопрос!";
    }

    botMsg.innerText = reply;
    history.scrollTop = history.scrollHeight;
}