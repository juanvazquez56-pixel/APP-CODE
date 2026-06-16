# NK BOX — App de Miembros

App web mobile-first para NK BOX, Escuela de Boxeo en Querétaro.  
Stack: React + Vite + Tailwind CSS.

---

## ▶ Cómo correr el proyecto localmente

Necesitas tener **Node.js** instalado (versión 18 o superior).

```bash
# 1. Instala las dependencias
npm install

# 2. Levanta el servidor de desarrollo
npm run dev
```

Abre tu navegador en `http://localhost:5173`

---

## ✏️ Cómo editar el contenido

**Todo el contenido está en un solo archivo:**

```
src/content.js
```

Abre ese archivo y edita los textos directamente. Cada sección está comentada en español.
No necesitas tocar ningún otro archivo.

### ¿Qué puedes editar?
| Sección | Qué cambiar |
|---------|-------------|
| Anuncios | `content.anuncios` — agrega, quita o edita anuncios |
| Horarios | `content.horarios` — cada día tiene su lista de clases |
| Planes | `content.planes` — precios, nombres, qué incluye cada plan |
| Disciplinas | `content.disciplinas` — descripción de cada clase |
| Contacto | `content.contacto` — WhatsApp, Instagram, dirección |
| Logo/nombre | `content.gym` — nombre, slogan, badges |

### Para cambiar el logo
Pon tu imagen en `public/logo.png` y edita `src/components/Logo.jsx` para usar:
```jsx
<img src="/logo.png" alt="NK BOX" />
```

---

## 🚀 Cómo subir gratis a Vercel

### Opción 1: Desde GitHub (recomendada)

1. Sube tu proyecto a GitHub (crea un repositorio nuevo).
2. Entra a [vercel.com](https://vercel.com) y crea una cuenta gratuita.
3. Haz clic en **"Add New Project"**.
4. Selecciona tu repositorio de GitHub.
5. Vercel detecta automáticamente que es Vite — no cambies nada.
6. Haz clic en **"Deploy"**.
7. En 1-2 minutos tienes tu app en vivo con una URL pública.

Cada vez que actualices el contenido y hagas push a GitHub, Vercel despliega automáticamente.

### Opción 2: Desde la terminal

```bash
# 1. Instala Vercel CLI
npm install -g vercel

# 2. Construye el proyecto
npm run build

# 3. Despliega
vercel --prod
```

---

## 🚀 Cómo subir gratis a Netlify

1. Entra a [netlify.com](https://netlify.com) y crea una cuenta gratuita.
2. Haz clic en **"Add new site"** → **"Deploy manually"**.
3. Primero construye el proyecto:
   ```bash
   npm run build
   ```
4. Arrastra la carpeta `dist/` al área de Netlify.
5. Tu app queda en vivo al instante.

### Para despliegues automáticos desde GitHub:
1. Conecta tu repositorio de GitHub.
2. En "Build command" pon: `npm run build`
3. En "Publish directory" pon: `dist`
4. Haz clic en Deploy.

---

## Estructura del proyecto

```
src/
├── content.js          ← EDITA AQUÍ el contenido
├── App.jsx             ← Navegación principal
├── main.jsx
├── index.css
└── components/
    ├── NavBar.jsx      ← Barra de navegación inferior
    ├── Logo.jsx        ← Logo hexagonal (reemplazable)
    ├── Inicio.jsx      ← Pantalla de anuncios y bienvenida
    ├── Horarios.jsx    ← Horarios por día con colores
    ├── Planes.jsx      ← Tarjetas de planes y precios
    └── Contacto.jsx    ← Dirección, WhatsApp, redes sociales
```
