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

// Переменная для хранения текущей активной темы диалога
let currentTopic = null;

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

    let reply = "";
    const lowerText = text.toLowerCase();

    // Проверяем, выбирает ли пользователь новую тему через карточки или текст
    if (lowerText.includes('математик') || lowerText.includes('задач')) {
        currentTopic = 'math';
        reply = "🔢 **Секция «Математическое мышление» (ОРТ):**\n\n" +
                "Давай разберем классическую задачу на проценты:\n" +
                "*Если цена товара сначала выросла на 20%, а потом снизилась на 20%, как изменилась первоначальная цена?*\n\n" +
                "1) Не изменилась\n2) Уменьшилась на 4%\n3) Увеличилась на 4%\n\n" +
                "Напиши свой вариант ответа!";
    } else if (lowerText.includes('аналог')) {
        currentTopic = 'analogies';
        reply = "◇ **Секция «Аналогии» (ОРТ):**\n\n" +
                "Проверяем логику и связи между понятиями:\n" +
                "*Пара: КНИГА : СТРАНИЦА*\n\n" +
                "Выберите похожую пару:\n" +
                "А) Дом : Стена\n" +
                "Б) Лес : Дерево\n" +
                "В) Автомобиль : Колесо\n\n" +
                "Какой вариант правильный? Напиши букву и объясни почему.";
    } else if (lowerText.includes('чен') || lowerText.includes('текст')) {
        reply = "◎ **Секция «Чтение и понимание текста» (ОРТ):**\n\n" +
                "Проанализируй отрывок:\n" +
                "*«Эффективное обучение строится не на заучивании правил, а на понимании логики процессов».*\n\n" +
                "Как ты понимаешь эту мысль автора? Напиши краткий вывод своими словами.";
    } else if (lowerText.includes('грамматик') || lowerText.includes('правил')) {
        currentTopic = 'grammar';
        reply = "Aa **Секция «Грамматика и практика» (ОРТ):**\n\n" +
                "Найди предложение с ошибкой:\n" +
                "1) Благодаря поддержке друга проект был завершен вовремя.\n" +
                "2) Согласно расписанию занятий, экзамен начнется в понедельник.\n" +
                "3) Вопреки прогноза погоды, день выдался солнечным.\n\n" +
                "Напиши цифру с ошибкой!";
    } else {
        // Если пользователь отвечает на текущую задачу (продолжает диалог)
        if (currentTopic === 'math') {
            if (lowerText.includes('2') || lowerText.includes('уменьшилась на 4')) {
                reply = "Отлично! Верно ✅. Цена уменьшилась на 4% (например, 100 -> 120 -> 96). Хочешь разобрать еще одну задачу по математике?";
            } else {
                reply = "Не совсем так. Подсказка: посчитай на примере 100 сомов. Сначала рост на 20% (это 120), а потом падение на 20% от 120 (это минус 24). Сколько получилось в итоге?";
            }
        } else if (currentTopic === 'analogies') {
            if (lowerText.includes('б') || lowerText.includes('лес')) {
                reply = "Верно! ✅ Книга состоит из страниц, как лес состоит из деревьев (целое и его составная часть). Отличная логика!";
            } else {
                reply = "Подумай еще. В исходной паре «Книга : Страница» объект состоит из элементов. Какая из пар подходит под это правило лучше всего?";
            }
        } else if (currentTopic === 'grammar') {
            if (lowerText.includes('3')) {
                reply = "Блестяще! ✅ Ошибка в третьем предложении: предлог «вопреки» требует родительного падежа («вопреки чему?» — прогнозу, а не прогноза). Хочешь еще тест по грамматике?";
            } else {
                reply = "Почти. Обрати внимание на предлоги «благодаря», «согласно» и «вопреки» и падежи, которые они требуют. Проверь третье предложение!";
            }
        } else {
            reply = "Я готов помочь с подготовкой к ОРТ! Выбери предмет (Математика, Аналогии, Чтение, Грамматика) на карточках сверху или задай свой вопрос.";
        }
    }

    botMsg.innerText = reply;
    history.scrollTop = history.scrollHeight;
}