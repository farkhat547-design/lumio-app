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
        reply = "🔢 **Секция «Математическое мышление» (ОРТ):**\n\n" +
                "Давай разберем классическую задачу на проценты:\n" +
                "*Если цена товара сначала выросла на 20%, а потом снизилась на 20%, как изменилась первоначальная цена?*\n\n" +
                "1) Не изменилась\n2) Уменьшилась на 4%\n3) Увеличилась на 4%\n\n" +
                "Напиши свой вариант ответа, и мы разберем решение по шагам!";
    } else if (lowerText.includes('аналог')) {
        reply = "◇ **Секция «Аналогии» (ОРТ):**\n\n" +
                "Проверяем логику и связи между понятиями:\n" +
                "*Пара: КНИГА : СТРАНИЦА*\n\n" +
                "Выберите похожую пару:\n" +
                "А) Дом : Стена\n" +
                "Б) Лес : Дерево\n" +
                "В) Автомобиль : Колесо\n\n" +
                "Какой вариант правильный? Объясни свою логику.";
    } else if (lowerText.includes('чен') || lowerText.includes('текст')) {
        reply = "◎ **Секция «Чтение и понимание текста» (ОРТ):**\n\n" +
                "Проанализируй отрывок:\n" +
                "*«Эффективное обучение строится не на заучивании правил, а на понимании логики процессов».*\n\n" +
                "Как ты понимаешь эту мысль автора? Напиши краткий вывод своими словами.";
    } else if (lowerText.includes('грамматик') || lowerText.includes('правил')) {
        reply = "Aa **Секция «Грамматика и практика» (ОРТ):**\n\n" +
                "Давай потренируем поиск речевых и грамматических ошибок.\n" +
                "Найди предложение с ошибкой:\n" +
                "1) Благодаря поддержке друга проект был завершен вовремя.\n" +
                "2) Согласно расписанию занятий, экзамен начнется в понедельник.\n" +
                "3) Вопреки прогноза погоды, день выдался солнечным.\n\n" +
                "Напиши цифру с ошибкой и объясни, как правильно!";
    } else {
        reply = "Я готов помочь тебе подготовиться к ОРТ по всем предметным тестам! Выбери нужную тему на карточке сверху (Математика, Аналогии, Чтение, Грамматика) или задай свой вопрос.";
    }

    botMsg.innerText = reply;
    history.scrollTop = history.scrollHeight;
}