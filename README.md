# eRada

Aplikacja do elektronicznego głosowania/obsługi rady (Express + MySQL/MariaDB,
frontend jako gotowa paczka Angular w `server/dist`).

## Uruchomienie (Docker — zalecane)

Wymagania: Docker + Docker Compose.

```bash
docker compose up -d --build
```

To wszystko. Przy pierwszym uruchomieniu kontener bazy danych automatycznie:

- utworzy bazy `erada` i `session`,
- zaimportuje strukturę i dane startowe z `db/init/*.sql` (oryginalny zrzut z phpMyAdmin),
- utworzy użytkownika DB i nada mu uprawnienia do obu baz.

Aplikacja będzie dostępna pod `http://localhost:8080`.

Domyślne dane logowania (z zaimportowanego zrzutu):
- e-mail: `admin@admin.pl`
- hasło: (to, które było ustawione w oryginalnej bazie — hash jest zaimportowany,
  aplikacja go nie zmienia)

Aby zatrzymać:

```bash
docker compose down
```

Aby zatrzymać i skasować dane bazy (świeży start):

```bash
docker compose down -v
```

### Konfiguracja

Domyślne wartości w `docker-compose.yml` wystarczą do uruchomienia „z marszu”.
Aby je zmienić, skopiuj `.env.example` do `.env` i dostosuj wartości
(hasła do bazy, port publikowany na hoście, sekret sesji itd.), a następnie
`docker compose up -d --build` ponownie.

## Struktura repo

- `server/` — backend Node.js/Express (API + serwowanie zbudowanego frontendu z `server/dist`)
- `db/init/` — skrypty inicjalizujące bazę danych (uruchamiane automatycznie przez kontener MariaDB)
- `deploy/` — oryginalne pliki do uruchamiania usługi systemd bez Dockera (zachowane jako alternatywa)
- `docker-compose.yml` — definicja usług: `db` (MariaDB) i `app` (Node.js)

## Uruchomienie bez Dockera (opcjonalnie)

Wymaga lokalnie zainstalowanego MySQL/MariaDB i Node.js >= 14.

```bash
# zaimportuj bazy
mysql -u root < db/init/01-erada.sql
mysql -u root < db/init/02-session.sql
mysql -u root -e "CREATE USER 'erada'@'%' IDENTIFIED BY 'erada'; GRANT ALL PRIVILEGES ON erada.* TO 'erada'@'%'; GRANT ALL PRIVILEGES ON session.* TO 'erada'@'%'; FLUSH PRIVILEGES;"

cd server
npm install
DB_HOST=127.0.0.1 DB_USER=erada DB_PASSWORD=erada npm start
```

## Co zostało poprawione względem dostarczonych plików

- Konfiguracja hosta bazy danych, portu aplikacji i sekretu sesji jest teraz
  wczytywana ze zmiennych środowiskowych (wcześniej były zahardkodowane na
  `127.0.0.1` i port `80`, co uniemożliwiało uruchomienie w kontenerach/Dockerze).
- Katalog na logi (`server/log`) jest teraz tworzony automatycznie — wcześniej
  aplikacja zakładała, że katalog już istnieje, i wywalała się przy pierwszym
  uruchomieniu na czystym środowisku.
- Serwer nasłuchuje jawnie na `0.0.0.0`, aby był dostępny spoza kontenera.
- Poprawiono ścieżkę do `dist/index.html`, by nie zależała od bieżącego
  katalogu roboczego procesu.
- Poprawiono błędny route `set-uy` (brakujący `/` na początku ścieżki).
- Dodano `package.json` `start`/`dev` scripts oraz `engines`.
- Całość została przetestowana end-to-end: import zrzutu SQL, `npm install`,
  start serwera, logowanie przez `/api/login` i middleware sesji — wszystko
  działa poprawnie na świeżo zaimportowanej bazie.
