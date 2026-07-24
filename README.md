# PharmaControl

Aplicacion movil/web para administracion de inventario farmaceutico, control de medicamentos, recordatorios, documentos, reportes y tickets de venta.

Construida con Expo, React Native y React Navigation.

## Funciones principales

- Inicio de sesion con API remota.
- Modo demo local para entrar sin backend.
- Dashboard con metricas, graficas e indicadores de riesgo.
- Gestion de medicamentos con busqueda, paginacion y alta local/demo.
- Calendario de recordatorios.
- Centro de documentos con tickets y reportes.
- Ticket profesional con vista previa y exportacion PDF.
- Tema claro/oscuro.
- Layout responsive para movil, tablet y web.
- Base SQL compatible con XAMPP/phpMyAdmin.

## Requisitos

- Node.js 20 o superior.
- npm.
- Expo CLI via `npx`.
- XAMPP si quieres importar la base MySQL local.

## Instalacion

```bash
npm install
```

## Ejecutar en web

```bash
npm run web
```

Despues abre:

```text
http://localhost:8081
```

## Ejecutar en Expo

```bash
npm start
```

Desde ahi puedes abrir en Expo Go, Android emulator, iOS simulator o web.

## Scripts disponibles

```bash
npm start
npm run web
npm run android
npm run ios
```

## Acceso demo

La app incluye un modo demo para probar sin backend.

En la pantalla de login presiona:

```text
Entrar en modo demo
```

Ese modo crea una sesion local con:

```text
Nombre: Admin Demo
Email: admin@pharmacontrol.demo
Rol: Administrador
```

Los datos demo se guardan en AsyncStorage desde:

```text
src/data/localDb.ts
```

En modo demo funcionan:

- Dashboard.
- Medicamentos.
- Crear medicamento.
- Categorias y proveedores.
- Documentos demo.
- Tickets.
- Calendario local.
- Perfil.

## API remota

La API configurada esta en:

```text
src/api/apiPharma.tsx
```

Base URL actual:

```text
https://api.pharmacontrol.site
```

Endpoint de login:

```text
POST /api/auth/login
```

Payload esperado:

```json
{
  "email": "usuario@example.com",
  "contraseña": "password"
}
```

## Base de datos para XAMPP

Se incluye un archivo SQL listo para importar:

```text
database_pharmacontrol_xampp.sql
```

### Importar con phpMyAdmin

1. Abre XAMPP.
2. Inicia Apache y MySQL.
3. Entra a `http://localhost/phpmyadmin`.
4. Ve a `Importar`.
5. Selecciona `database_pharmacontrol_xampp.sql`.
6. Ejecuta la importacion.

### Importar por consola

```powershell
C:\xampp\mysql\bin\mysql.exe -u root < database_pharmacontrol_xampp.sql
```

La base se llama:

```text
pharmacontrol
```

El SQL respeta el esquema anterior del proyecto:

- `usuarios`
- `categorias`
- `proveedores`
- `medicamentos`
- `venta`
- `venta_detalle`
- `historial_exportacion`
- `historial_importaciones`

## Estructura del proyecto

```text
src/
  api/             Cliente Axios y endpoints
  components/      Componentes reutilizables
  context/         Tema global
  data/            Base local demo
  hooks/           Logica de auth, stats, documentos y formularios
  interfaces/      Tipos TypeScript
  navigation/      Stack, drawer y navegacion
  screens/         Vistas principales
  themes/          Temas y tokens visuales
  utils/           Storage, notificaciones y responsive helpers
```

## Validacion

Para revisar TypeScript:

```bash
npx tsc --noEmit
```

## Git

Rama de trabajo actual:

```text
Areli
```

Repositorio esperado:

```text
https://github.com/JuanEPB/appMovil
```

Si aparece error `403` al hacer push, la cuenta autenticada necesita permisos de colaborador sobre el repo.

## Notas

- `expo-web.log` es generado por Expo y no debe incluirse en commits.
- El modo demo no reemplaza al backend real; sirve para probar vistas, UX y flujo local mientras se conecta la API/base final.
