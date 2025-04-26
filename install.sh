#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Начинаем установку Xray Manager...${NC}"

# Проверка наличия Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js не установлен. Устанавливаем...${NC}"
    
    # Установка fnm
    echo -e "${YELLOW}Устанавливаем fnm...${NC}"
    curl -o- https://fnm.vercel.app/install | bash
    
    # Добавляем fnm в PATH
    export PATH="/root/.local/share/fnm:$PATH"
    eval "$(fnm env --use-on-cd)"
    
    # Установка Node.js
    echo -e "${YELLOW}Устанавливаем Node.js...${NC}"
    fnm install 23
    fnm use 23
    
    # Проверка версий
    echo -e "${GREEN}Node.js версия: $(node -v)${NC}"
    echo -e "${GREEN}npm версия: $(npm -v)${NC}"
fi

# Проверка наличия MongoDB
if ! command -v mongod &> /dev/null; then
    echo -e "${RED}MongoDB не установлен. Устанавливаем...${NC}"
    
    # Установка необходимых пакетов
    sudo apt-get install -y gnupg curl
    
    # Импорт публичного ключа MongoDB
    curl -fsSL https://www.mongodb.org/static/pgp/server-8.0.asc | \
        sudo gpg -o /usr/share/keyrings/mongodb-server-8.0.gpg \
        --dearmor
    
    # Создание файла списка для Ubuntu
    echo "deb [ arch=amd64,arm64 signed-by=/usr/share/keyrings/mongodb-server-8.0.gpg ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/8.0 multiverse" | \
        sudo tee /etc/apt/sources.list.d/mongodb-org-8.0.list
    
    # Обновление списка пакетов
    sudo apt-get update
    
    # Установка MongoDB
    sudo apt-get install -y mongodb-org
    
    # Запуск и включение MongoDB
    sudo systemctl start mongod
    sudo systemctl enable mongod
    
    # Проверка статуса
    echo -e "${GREEN}Статус MongoDB: $(sudo systemctl status mongod | grep Active)${NC}"
fi

# Создание директории проекта
echo -e "${YELLOW}Создаем директорию проекта...${NC}"
sudo mkdir -p /opt/linbe
sudo chown -R $USER:$USER /opt/linbe

# Клонирование репозитория
echo -e "${YELLOW}Клонируем репозиторий...${NC}"
git clone https://github.com/yuhapl/linbe.git /opt/linbe

# Установка зависимостей
echo -e "${YELLOW}Устанавливаем зависимости...${NC}"
cd /opt/linbe/xray-manager
npm install

# Создание файла конфигурации
echo -e "${YELLOW}Создаем файл конфигурации...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}Файл .env создан. Пожалуйста, отредактируйте его и укажите необходимые параметры.${NC}"
fi

# Создание systemd сервиса
echo -e "${YELLOW}Создаем systemd сервис...${NC}"
sudo tee /etc/systemd/system/xray-manager.service << EOF
[Unit]
Description=Xray Manager Service
After=network.target mongodb.service

[Service]
Type=simple
User=$USER
WorkingDirectory=/opt/linbe/xray-manager
Environment="PATH=/root/.local/share/fnm/current/bin:/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin"
ExecStart=/root/.local/share/fnm/current/bin/npm start
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Перезагрузка systemd и запуск сервиса
echo -e "${YELLOW}Запускаем сервис...${NC}"
sudo systemctl daemon-reload
sudo systemctl enable xray-manager
sudo systemctl start xray-manager

echo -e "${GREEN}Установка завершена!${NC}"
echo -e "${YELLOW}Не забудьте отредактировать файл .env и указать необходимые параметры.${NC}"
echo -e "${YELLOW}Для проверки статуса сервиса используйте: sudo systemctl status xray-manager${NC}" 