
# Instrukcja uruchomienia projektu Corceo

## 1. Wymagania

Przed uruchomieniem projektu należy zainstalować:

- Node.js (wersja 20 lub nowsza)
- npm
- PostgreSQL

## 2. Przygotowanie bazy danych

1. Uruchomić serwer PostgreSQL.
2. Utworzyć nową bazę danych, np. `corceo`.
3. Wykonać skrypt SQL znajdujący się w pliku:

   `database/schema.sql`

Skrypt tworzy tabele niezbędne do działania aplikacji.

## 3. Uruchomienie backendu

Przejść do katalogu backendu:

cd backend

Zainstalować zależności:

npm install

Utworzyć plik `.env` na podstawie `.env.example` i uzupełnić konfigurację, w szczególności:

DATABASE_URL=postgresql://USER:PASSWORD@localhost:5432/corceo
JWT_SECRET=twoj_tajny_klucz

Wartości `USER`, `PASSWORD` i `JWT_SECRET` należy zastąpić własnymi danymi.

Uruchomić serwer:

npm run dev

Serwer backendu musi pozostać uruchomiony podczas korzystania z aplikacji.

## 4. Uruchomienie frontendu

Otworzyć drugi terminal i przejść do katalogu frontendu:

cd frontend/corceo

Zainstalować zależności:

npm install

W razie potrzeby utworzyć plik `.env` na podstawie `.env.example` i ustawić adres lokalnego API.

Uruchomić aplikację:

npm run dev

Po uruchomieniu terminal wyświetli adres aplikacji, zwykle:

`http://localhost:5173`

Adres należy otworzyć w przeglądarce internetowej.

## 5. Uruchamianie testów

### Testy backendu

W katalogu `backend` wykonać:


npm test


### Testy frontendu

W katalogu `frontend/corceo` wykonać:


npm run test:run