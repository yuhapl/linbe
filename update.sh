#!/bin/bash

# Цвета для вывода
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}Начинаем обновление Xray Manager...${NC}"

# Проверка наличия директории проекта
if [ ! -d "/opt/linbe" ]; then
    echo -e "${RED}Проект не установлен. Пожалуйста, сначала запустите install.sh${NC}"
    exit 1
fi

# Проверка наличия fnm
if ! command -v fnm &> /dev/null; then
    echo -e "${RED}fnm не установлен. Устанавливаем...${NC}"
    curl -o- https://fnm.vercel.app/install | bash
    export PATH="/root/.local/share/fnm:$PATH"
    eval "$(fnm env --use-on-cd)"
    fnm install 23
    fnm use 23
fi

# Остановка сервиса
echo -e "${YELLOW}Останавливаем сервис...${NC}"
sudo systemctl stop xray-manager

# Обновление репозитория
echo -e "${YELLOW}Обновляем репозиторий...${NC}"
cd /opt/linbe
git pull

# Установка зависимостей
echo -e "${YELLOW}Обновляем зависимости...${NC}"
/root/.local/share/fnm/current/bin/npm install

# Запуск сервиса
echo -e "${YELLOW}Запускаем сервис...${NC}"
sudo systemctl start xray-manager

echo -e "${GREEN}Обновление завершено!${NC}"
echo -e "${YELLOW}Для проверки статуса сервиса используйте: sudo systemctl status xray-manager${NC}" 