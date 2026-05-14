# 🧭 TripSync

App colaborativa para gestionar viajes con amigos — gastos compartidos, itinerario, equipaje, documentos y chat.

**Stack:** Next.js 14 · TypeScript · Tailwind · Prisma · PostgreSQL · NextAuth

---

## 🚀 Despliegue paso a paso (10 minutos)

Vas a crear cuentas gratis en 3 servicios. Es más fácil de lo que parece.

### Paso 1 — Sube el código a GitHub

1. Crea cuenta en [github.com](https://github.com) si no tienes
2. Crea un **nuevo repositorio** (botón verde "New") — llámalo `tripsync`, déjalo público o privado, NO marques ninguna opción extra
3. En tu computadora, abre la carpeta `tripsync` en una terminal y ejecuta:

```bash
git init
git add .
git commit -m "first commit"
git branch -M main
git remote add origin https://github.com/TU_USUARIO/tripsync.git
git push -u origin main
```

Reemplaza `TU_USUARIO` con tu usuario de GitHub.

---

### Paso 2 — Crea la base de datos en Neon (gratis)

1. Ve a [neon.tech](https://neon.tech) y regístrate con GitHub
2. Click en **"Create project"** — déjale el nombre por defecto, región más cercana
3. Cuando termine, verás una pantalla con un **connection string** que empieza con `postgresql://...`
4. **Copia esa cadena completa** y guárdala en un block de notas — la usarás en el paso siguiente

---

### Paso 3 — Despliega en Vercel

1. Ve a [vercel.com](https://vercel.com) y regístrate con GitHub
2. Click en **"Add New..."** → **"Project"**
3. **Importa tu repositorio `tripsync`** (debería aparecer en la lista)
4. En la sección **Environment Variables**, agrega estas variables (una por una):

| Variable | Valor |
|---|---|
| `DATABASE_URL` | El string de conexión de Neon (paso 2) |
| `DIRECT_URL` | El mismo string de Neon |
| `NEXTAUTH_SECRET` | Genera uno largo aleatorio — usa [generate-secret.vercel.app](https://generate-secret.vercel.app/32) |
| `NEXTAUTH_URL` | Déjalo en blanco por ahora |

5. Click **"Deploy"** — toma 2-3 minutos
6. Cuando termine, Vercel te dará una URL como `https://tripsync-tuusuario.vercel.app`

7. **Último paso:** vuelve a Vercel → Settings → Environment Variables:
   - Edita `NEXTAUTH_URL` y pon tu URL de Vercel (ej: `https://tripsync-abc.vercel.app`)
   - Ve a **Deployments** → tres puntos del último deploy → **Redeploy**

8. **Listo.** Abre tu URL de Vercel, regístrate con email y contraseña, ¡y empieza a usar TripSync! 🎉

---

## 💻 Probar en local (opcional)

Si quieres correrlo en tu computadora antes de desplegar:

```bash
npm install
cp .env.example .env
# Edita .env con los valores de Neon y un NEXTAUTH_SECRET cualquiera
npx prisma db push    # crea las tablas en la DB
npm run dev
```

Abre http://localhost:3000

---

## 📦 ¿Qué tiene esta app?

- ✅ **Registro con email + contraseña** — sin servicios externos
- ✅ **Crear viajes** — con nombre, emoji, fechas, presupuesto, moneda
- ✅ **Invitar amigos** — con código de 6 caracteres o link
- ✅ **Gastos compartidos** — registra quién pagó, se divide automáticamente, ves quién debe a quién con el mínimo de transacciones
- ✅ **Itinerario** — actividades por día y hora, con link a Google Maps
- ✅ **Equipaje colaborativo** — checklist con asignaciones
- ✅ **Documentos** — sube vuelos, hoteles, tickets como PDF/imagen
- ✅ **Chat grupal** — mensajes en tiempo real (polling cada 5s)
- ✅ **Modo oscuro** — se guarda en tu navegador
- ✅ **Responsive** — funciona en móvil con navegación inferior
- ✅ **Dashboard** — contador regresivo, balance, próximas actividades

---

## 🔧 Sobre los documentos

UploadThing requiere configuración adicional. Si no la configuras, la sección de Documentos guarda metadata pero no archivos reales. Para activarla:

1. Regístrate en [uploadthing.com](https://uploadthing.com)
2. Crea una app → copia `UPLOADTHING_SECRET` y `UPLOADTHING_APP_ID`
3. Agrégalos como variables de entorno en Vercel y redespliega

---

## ❓ ¿Algo falla?

- **Error de DB al desplegar:** ve a Vercel → Deployments → Logs y verifica que `DATABASE_URL` esté bien copiada
- **No puedo registrarme:** asegúrate que `NEXTAUTH_SECRET` y `NEXTAUTH_URL` estén configurados, y haz redeploy
- **Pantalla en blanco:** abre la consola del navegador (F12) y mira el error

---

Hecho con ❤️ por TripSync
