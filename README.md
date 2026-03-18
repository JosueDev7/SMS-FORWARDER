# SMS Forwarder MVP (Expo Bare + TypeScript)

MVP Android que intercepta SMS en segundo plano, aplica reglas de filtrado y reenvia mensajes a Telegram.

## Stack

- React Native + Expo (Bare Workflow)
- TypeScript estricto
- Clean Architecture por capas
- AsyncStorage para persistencia local
- Native Android (BroadcastReceiver + Foreground Service + NativeModule)
- Jest para pruebas unitarias y cobertura

## Arquitectura

Estructura principal:

- src/domain: entidades y contratos de repositorios (sin dependencias externas)
- src/application: casos de uso y DI
- src/infrastructure: repositorios AsyncStorage, cliente Telegram por fetch y bridge nativo
- src/presentation: UI React Native, hooks y estado global con Zustand

### Casos de uso implementados

- ProcessIncomingSMS
- ManageRules
- ManageConfig
- SendTelegramTest
- ListRecentEvents

## Requisitos funcionales implementados

- RF-01 Intercepcion de SMS via BroadcastReceiver Android.
- RF-02 Persistencia en background con Foreground Service START_STICKY.
- RF-03 Filtrado por texto plano con includes.
- RF-04 Filtrado por expresion regular con RegExp.test.
- RF-05 Reenvio a Telegram usando Bot API sendMessage.
- RF-06 CRUD completo de reglas desde UI.
- RF-07 Home con feed de ultimos 50 eventos y switch de servicio.
- RF-08 Settings con token/chat id y boton Test Connection.
- RF-09 Ofuscacion del botToken en Base64 antes de persistir.

## Requisitos no funcionales implementados

- RNF-01 Clean Architecture estricta por capas.
- RNF-02 TypeScript estricto y sin uso de any en codigo de app.
- RNF-03 Tests unitarios para todos los casos de uso.
- RNF-04 Cobertura minima >= 70% (actual: lineas 98.33%, ramas 93.75%).
- RNF-05 UI minimalista futurista dark con acentos azul/cian.

## Configuracion del bot de Telegram (BotFather)

1. Abrir Telegram y buscar BotFather.
2. Ejecutar /newbot.
3. Definir nombre visible del bot.
4. Definir username terminado en bot.
5. Copiar el token entregado por BotFather.
6. Crear o abrir el chat/grupo destino.
7. Obtener chat id:
   - Enviar un mensaje al bot/chat.
   - Abrir en navegador:
     https://api.telegram.org/bot<TU_TOKEN>/getUpdates
   - Copiar chat.id del resultado JSON.
8. En la pantalla Settings de la app, pegar token y chat id.
9. Presionar Save y luego Test Connection.

## Ejecucion con Node mas actual instalado (Volta)

En este entorno, la version mas actual instalada es Node 20.19.6.

### 1) Instalar dependencias

volta run --node 20.19.6 npm install

### 2) Generar proyecto nativo (si aun no esta completo)

volta run --node 20.19.6 npx expo prebuild --platform android

Nota: este repositorio ya incluye componentes nativos clave (receiver, service y module), pero prebuild asegura gradle y archivos Android completos en entornos nuevos.

### 3) Ejecutar en Android

volta run --node 20.19.6 npx expo run:android

## Pruebas y cobertura

Ejecutar:

volta run --node 20.19.6 npm test

Resultado validado en este workspace:

- Test suites: 5/5 OK
- Tests: 14/14 OK
- Cobertura global:
  - Statements: 98.36%
  - Branches: 93.75%
  - Functions: 93.75%
  - Lines: 98.33%

## Permisos Android utilizados

- RECEIVE_SMS
- READ_SMS
- FOREGROUND_SERVICE
- POST_NOTIFICATIONS
- INTERNET

## Notas de decisiones tecnicas

- Decision robusta: las reglas invalidas RegExp no rompen el flujo; se ignoran y el SMS puede caer como no coincidente.
- Decision robusta: el feed se conserva acotado (max 200 persistidos, 50 en Home) para evitar crecimiento indefinido.
- Decision robusta: cuando el modulo nativo no esta vinculado, la UI informa estado y evita crash.
