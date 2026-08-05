# coconutqa — лендинг (face_page)

Отдельный статический сайт. Платформа остаётся на `https://www.coconutschool.ru`.

Кнопки:
- **Войти в школу** → `https://www.coconutschool.ru/login`
- **Политика конфиденциальности** → `/privacy` (локальная страница `privacy.html` на этом же сайте)

Из экспорта Tilda вычищено: Metrika/tag.js, tilda-stat/events/fallback, dns-prefetch на tildacdn, formskey/project-id. Рабочие `tilda-*.js` для блоков/меню/FAQ оставлены — без них вёрстка Zero Block ломается.

Если домен друга не `coconutqa.ru` — поправьте `og:url` / `canonical` в `index.html` и `server_name` в nginx.

## На сервере

1. Друг прокидывает DNS `A` на IP ВМ для `coconutqa.ru` (+ `www` по желанию).
2. Залить файлы:

```bash
# с локальной машины (пример)
rsync -avz --delete ./coconutqa/ user@VM:/var/www/coconutqa/
```

3. Nginx:

```bash
sudo cp nginx-coconutqa.conf.example /etc/nginx/sites-available/coconutqa
sudo ln -sf /etc/nginx/sites-available/coconutqa /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

4. SSL:

```bash
sudo certbot --nginx -d coconutqa.ru -d www.coconutqa.ru
```

5. Проверка: открыть `https://coconutqa.ru` → кнопка «Войти в школу» должна вести на LMS login.

## Локально посмотреть

```bash
cd coconutqa && python3 -m http.server 8080
# http://127.0.0.1:8080
```
