export const validateUsername = (username) => {
    const regex = /^[А-Яа-яЁё]+$/;
    if (!username) return 'Имя обязательно';
    if (!regex.test(username)) return 'Имя может содержать только русские буквы';
    if (username.length < 2) return 'Имя должно быть не менее 2 букв';
    return '';
};

export const validateEmail = (email) => {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return 'Email обязателен';
    if (!regex.test(email)) return 'Введите корректный email';
    return '';
};

export const validatePassword = (password) => {
    if (!password) return 'Пароль обязателен';
    if (password.length < 6) return 'Пароль должен быть не менее 6 символов';
    return '';
};
