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

// Переменная памяти для сохранения контекста диалога
let chatMemory = {
    activeSubject: null,
    currentLevel: 1,
    waitingForAnswer: false
};

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

    // Выводим сообщение пользователя в чат
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

    await new Promise(resolve => setTimeout(resolve, 800));

    let reply = "";
    const lowerText = text.toLowerCase();

    // 1. Если пользователь выбирает предмет с нуля или меняет тему
    if (lowerText.includes('математик') || lowerText.includes('задач')) {
        chatMemory.activeSubject = 'math';
        chatMemory.currentLevel = 1;
        chatMemory.waitingForAnswer = true;
        reply = "🔢 **Секция «Математическое мышление» (ОРТ):**\n\n" +
                "Давай разберем классическую задачу на проценты:\n" +
                "*Если цена товара сначала выросла на 20%, а потом снизилась на 20%, как изменилась первоначальная цена?*\n\n" +
                "1) Не изменилась\n2) Уменьшилась на 4%\n3) Увеличилась на 4%\n\n" +
                "Напиши свой вариант ответа!";
    } else if (lowerText.includes('аналог')) {
        chatMemory.activeSubject = 'analogies';
        chatMemory.currentLevel = 1;
        chatMemory.waitingForAnswer = true;
        reply = "◇ **Секция «Аналогии» (ОРТ):**\n\n" +
                "Проверяем логику и связи между понятиями:\n" +
                "*Пара: КНИГА : СТРАНИЦА*\n\n" +
                "Выберите похожую пару:\n" +
                "А) Дом : Стена\n" +
                "Б) Лес : Дерево\n" +
                "В) Автомобиль : Колесо\n\n" +
                "Какой вариант правильный?";
    } else if (lowerText.includes('чен') || lowerText.includes('текст')) {
        chatMemory.activeSubject = 'reading';
        chatMemory.currentLevel = 1;
        chatMemory.waitingForAnswer = true;
        reply = "◎ **Секция «Чтение и понимание текста» (ОРТ):**\n\n" +
                "Проанализируй отрывок:\n" +
                "*«Эффективное обучение строится не на заучивании правил, а на понимании логики процессов».*\n\n" +
                "Как ты понимаешь эту мысль автора? Напиши краткий вывод своими словами.";
    } else if (lowerText.includes('грамматик') || lowerText.includes('правил')) {
        chatMemory.activeSubject = 'grammar';
        chatMemory.currentLevel = 1;
        chatMemory.waitingForAnswer = true;
        reply = "Aa **Секция «Грамматика и практика» (ОРТ):**\n\n" +
                "Найди предложение с ошибкой:\n" +
                "1) Благодаря поддержке друга проект был завершен вовремя.\n" +
                "2) Согласно расписанию занятий, экзамен начнется в понедельник.\n" +
                "3) Вопреки прогноза погоды, день выдался солнечным.\n\n" +
                "Напиши цифру с ошибкой!";
    } 
    // 2. Если пользователь просит усложнить задачу или дать новую
    else if (lowerText.includes('сложн') || lowerText.includes('еще') || lowerText.includes('другую') || lowerText.includes('новую')) {
        chatMemory.currentLevel++;
        if (chatMemory.activeSubject === 'math') {
            reply = `🔥 **Уровень ${chatMemory.currentLevel} (Математика):**\n\n` +
                    "Сумма вклада увеличилась в банковской системе в 2 раза за 4 года при сложных процентах. Во сколько раз она увеличится за 12 лет?\n\n" +
                    "1) В 4 раза\n2) В 6 раз\n3) В 8 раз\n\nНапиши ответ!";
        } else if (chatMemory.activeSubject === 'analogies') {
            reply = `🔥 **Уровень ${chatMemory.currentLevel} (Аналогии):**\n\n` +
                    "*Пара: ЗАТИШЬЕ : БУРЯ*\n\n" +
                    "Выберите похожую пару:\n" +
                    "А) Успех : Радость\n" +
                    "Б) Засуха : Дождь\n" +
                    "В) Скука : Веселье\n\n" +
                    "Какой вариант выберешь?";
        } else {
            reply = "Дерзи следующее задание по текущей теме! Напиши свой ответ, и мы его разберем.";
        }
        chatMemory.waitingForAnswer = true;
    } 
    // 3. Продолжение диалога в рамках активной темы (анализ ответов пользователя и детальные объяснения)
    else {
        if (chatMemory.activeSubject === 'math') {
            if (lowerText.includes('2') || lowerText.includes('уменьшилась на 4')) {
                reply = "Отлично! Верно ✅. Цена действительно уменьшилась на 4% (если взять 100 сомов: рост до 120, затем падение на 20% от 120 дает 96). Хочешь разобрать задачу посложнее или перейти к другой теме?";
                chatMemory.waitingForAnswer = false;
            } else {
                reply = "Давай разберем это подробнее. Представь стоимость товара равной 100. После роста на 20% он стоит 120. Но когда цена снижается на 20%, это считается уже *от 120* (20% от 120 равно 24). Значит, 120 - 24 = 96. Понятно, почему получилось 96?";
            }
        } else if (chatMemory.activeSubject === 'analogies') {
            if (lowerText.includes('б') || lowerText.includes('лес')) {
                reply = "Верно! ✅ Книга состоит из страниц, точно так же как лес состоит из деревьев. Это классическая связь «целое — часть». Хочешь задачу посложнее?";
                chatMemory.waitingForAnswer = false;
            } else {
                reply = "Разберем логику: в паре «Книга : Страница» второй объект — это составная часть первого. В варианте Б «Лес : Дерево» дерево является составной частью леса. Хочешь попробовать еще раз или перейти дальше?";
            }
        } else if (chatMemory.activeSubject === 'grammar') {
            if (lowerText.includes('3')) {
                reply = "Блестяще! ✅ Предлог «вопреки» требует дательного падежа («вопреки чему?» — прогноз**у**), а не родительного. Отличная работа!";
                chatMemory.waitingForAnswer = false;
            } else {
                reply = "Подсказка: обрати внимание на то, какой падеж требуют производные предлоги «благодаря», «согласно» и «вопреки». Проверь третье предложение еще раз!";
            }
        } else {
            reply = "Я тебя понял! Чтобы начать тренировку, выбери один из предметов сверху (Математика, Аналогии, Чтение, Грамматика) или напиши, какая тема тебя интересует.";
        }
    }

    botMsg.innerText = reply;
    history.scrollTop = history.scrollHeight;
}