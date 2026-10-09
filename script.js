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

// Строгая память состояния диалога
let sessionState = {
    subject: null, // 'math', 'analogies', 'reading', 'grammar'
    step: 0        // 0 - ждем ответ на 1 вопрос, 1 - перешли к сложной задаче
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

    // Выводим сообщение пользователя
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

    // 1. Определение или смена предмета
    if (lowerText.includes('математик')) {
        sessionState.subject = 'math';
        sessionState.step = 0;
        reply = "🔢 **Секция «Математическое мышление» (ОРТ):**\n\n" +
                "Задача №1: Если цена товара сначала выросла на 20%, а потом снизилась на 20%, как изменилась первоначальная цена?\n" +
                "1) Не изменилась\n2) Уменьшилась на 4%\n3) Увеличилась на 4%\n\nНапиши номер ответа!";
    } else if (lowerText.includes('аналог')) {
        sessionState.subject = 'analogies';
        sessionState.step = 0;
        reply = "◇ **Секция «Аналогии» (ОРТ):**\n\n" +
                "Задача №1: *Пара: КНИГА : СТРАНИЦА*\n" +
                "Выберите похожую пару:\n" +
                "А) Дом : Стена\n" +
                "Б) Лес : Дерево\n" +
                "В) Автомобиль : Колесо\n\nНапиши букву ответа!";
    } else if (lowerText.includes('чен') || lowerText.includes('текст')) {
        sessionState.subject = 'reading';
        sessionState.step = 0;
        reply = "◎ **Секция «Чтение и понимание текста» (ОРТ):**\n\n" +
                "Проанализируй отрывок: *«Эффективное обучение строится на понимании логики, а не заучивании»*.\n" +
                "Как ты это понимаешь?";
    } else if (lowerText.includes('грамматик') || lowerText.includes('правил')) {
        sessionState.subject = 'grammar';
        sessionState.step = 0;
        reply = "Aa **Секция «Грамматика и практика» (ОРТ):**\n\n" +
                "Найди предложение с ошибкой:\n" +
                "1) Благодаря поддержке проект завершен.\n" +
                "2) Согласно расписанию, экзамен во вторник.\n" +
                "3) Вопреки прогноза погоды, было тепло.\n\nНапиши цифру!";
    } 
    // 2. Если предмет уже выбран, анализируем ответ в рамках этого предмета
    else {
        if (!sessionState.subject) {
            reply = "Пожалуйста, выберите предмет с помощью карточек сверху (Математика, Аналогии, Чтение, Грамматика), чтобы мы начали тренировку!";
        } else {
            // Если текущий предмет — Математика
            if (sessionState.subject === 'math') {
                if (sessionState.step === 0 && (lowerText.includes('2') || lowerText.includes('уменьшилась'))) {
                    sessionState.step = 1;
                    reply = "Верно! ✅ Цена уменьшилась на 4% (100 -> 120 -> 96).\n\n🔥 **Переходим к сложной задаче (Уровень 2):**\n" +
                            "Сумма вклада увеличилась в банке в 2 раза за 4 года при сложных процентах. Во сколько раз она увеличится за 12 лет?\n" +
                            "1) В 4 раза\n2) В 6 раз\n3) В 8 раз\n\nЖду твой ответ!";
                } else if (sessionState.step === 1 && (lowerText.includes('3') || lowerText.includes('8'))) {
                    reply = "Великолепно! 🎉 Ты отлично справляешься со сложными задачами по математике для ОРТ. Хочешь продолжить или выберем другой предмет?";
                } else {
                    reply = "Давай подумаем вместе. Вспомни формулу процентов или представь 100 сомов: рост на 20% дает 120, а падение на 20% от 120 дает 96. Попробуй ответить еще раз или напиши «сложнее», чтобы перейти дальше!";
                }
            } 
            // Если текущий предмет — Аналогии
            else if (sessionState.subject === 'analogies') {
                if (sessionState.step === 0 && (lowerText.includes('б') || lowerText.includes('лес'))) {
                    sessionState.step = 1;
                    reply = "Правильно! ✅ Книга состоит из страниц, как лес из деревьев (целое и часть).\n\n🔥 **Переходим к сложной задаче (Уровень 2):**\n" +
                            "*Пара: ЗАТИШЬЕ : БУРЯ*\n" +
                            "Выберите похожую пару:\n" +
                            "А) Успех : Радость\n" +
                            "Б) Засуха : Дождь\n" +
                            "В) Скука : Веселье\n\nКакая буква правильная?";
                } else if (sessionState.step === 1 && (lowerText.includes('б') || lowerText.includes('засуха'))) {
                    reply = "Отлично! 🎉 Затишье сменяется бурей, как засуха сменяется дождем (резкая смена состояния). Ты отлично мыслите логически!";
                } else {
                    reply = "Подсказка: в первой паре идет резкая смена одного состояния на противоположное или следующее за ним. Попробуй выбрать вариант Б или В!";
                }
            } 
            // Для остальных предметов
            else {
                reply = "Я зафиксировал твой ответ! Напиши, хочешь ли разобрать еще одну тему или углубиться в текущую.";
            }
        }
    }

// Текущий язык ('ru' или 'kg')
let currentLang = 'ru';

// Словарь текстов для интерфейса и заданий ОРТ на двух языках
const translations = {
    ru: {
        placeholder: "Задай вопрос по ОРТ...",
        thinking: "Lumio думает...",
        welcome: "Привет! Я Lumio AI, твой персональный репетитор по подготовке к ОРТ в Кыргызстане. Выбери нужную тему или задай свой вопрос!",
        mathTitle: "🔢 Секция «Математическое мышление» (ОРТ):",
        mathQ1: "Задача №1: Если цена товара сначала выросла на 20%, а потом снизилась на 20%, как изменилась первоначальная цена?\n1) Не изменилась\n2) Уменьшилась на 4%\n3) Увеличилась на 4%\n\nНапиши номер ответа!",
        analogiesTitle: "◇ Секция «Аналогии» (ОРТ):",
        analogiesQ1: "Задача №1: Пара: КНИГА : СТРАНИЦА\nВыберите похожую пару:\nА) Дом : Стена\nБ) Лес : Дерево\nВ) Автомобиль : Колесо\n\nНапиши букву ответа!"
    },
    kg: {
        placeholder: "ЖРТ боюнча суроо бер...",
        thinking: "Lumio ойлонууда...",
        welcome: "Салам! Мен Lumio AI, Кыргызстандагы ЖРТга даярдануу боюнча сенин жеке репетиторумун. Кееректүү теманы танда же суроо бер!",
        mathTitle: "🔢 «Математикалык ой жүгүртүү» бөлүмү (ЖРТ):",
        mathQ1: "1-маселе: Товардын баасы алгач 20% га жогорулап, андан кийин 20% га арзандады. Баштапкы баа кандай өзгөрдү?\n1) Өзгөргөн жок\n2) 4% га азайды\n3) 4% га көбөйдү\n\nЖооптун номерин жаз!",
        analogiesTitle: "◇ «Аналогиялар» бөлүмү (ЖРТ):",
        analogiesQ1: "1-маселе: Жуп: КИТЕП : БЕТ\nОкшош жупту танда:\nА) Үй : Дубал\nБ) Токой : Дарак\nВ) Унаа : Дөңгөлөк\n\nЖооптун катасын жаз!"
    }
};

// Функция переключения языка
function setLanguage(lang) {
    currentLang = lang;
    
    // Меняем подсветку кнопок
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

    // Меняем плейсхолдер в поле ввода
    const input = document.getElementById('userInput');
    if (input) {
        input.placeholder = translations[lang].placeholder;
    }
}

// Измененная функция выбора предмета с учетом языка
function selectSubject(subject) {
    const input = document.getElementById('userInput');
    if (!input) return;

    if (subject === 'Математика' || subject === 'Математика') {
        input.value = currentLang === 'ru' ? "Хочу позаниматься по предмету: Математика. Дай мне задание." : "Математика предмети боюнча даярдангым келет. Мага тапшырма бер.";
    } else if (subject === 'Аналогии' || subject === 'Аналогиялар') {
        input.value = currentLang === 'ru' ? "Хочу позаниматься по предмету: Аналогии. Дай мне задание." : "Аналогиялар предмети боюнча даярдангым келет. Мага тапшырма бер.";
    }
    sendMessage();
}

// Интеграция языка в sendMessage (заменяем блок выдачи вопросов)
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
    botMsg.innerText = translations[currentLang].thinking;
    history.appendChild(botMsg);
    history.scrollTop = history.scrollHeight;

    await new Promise(resolve => setTimeout(resolve, 800));

    let reply = "";
    const lowerText = text.toLowerCase();

    // Проверяем ключевые слова на двух языках (русский / кыргызский)
    if (lowerText.includes('математик') || lowerText.includes('математика')) {
        reply = translations[currentLang].mathTitle + "\n\n" + translations[currentLang].mathQ1;
    } else if (lowerText.includes('аналог') || lowerText.includes('аналогия')) {
        reply = translations[currentLang].analogiesTitle + "\n\n" + translations[currentLang].analogiesQ1;
    } else {
        reply = translations[currentLang].welcome;
}

    botMsg.innerText = reply;
    history.scrollTop = history.scrollHeight;
}