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

## 📲 Cómo instalar la app en el celular (PWA)

Esta app funciona como **PWA (Progressive Web App)**: una vez publicada en internet, los miembros pueden "instalarla" en su celular sin pasar por ninguna tienda de aplicaciones. Queda como un ícono más en su pantalla de inicio y abre a pantalla completa, sin la barra del navegador.

### En Android (Chrome)
1. Abre el link de la app en Chrome.
2. Espera unos segundos: puede aparecer un aviso de **"Instala NK BOX en tu celular"** dentro de la misma app — solo toca **Instalar**.
3. Si no aparece el aviso, toca el menú de tres puntos (⋮) arriba a la derecha de Chrome → **"Instalar app"** o **"Agregar a pantalla de inicio"**.
4. Confirma y listo: el ícono de NK BOX aparece en su pantalla de inicio.

### En iPhone (Safari)
Apple no permite instalar PWAs con un solo botón automático — el usuario debe hacerlo manualmente:
1. Abre el link de la app en **Safari** (debe ser Safari, no Chrome ni otro navegador).
2. Toca el ícono de **Compartir** (el cuadrado con una flecha hacia arriba), generalmente abajo en medio de la pantalla.
3. Baja en el menú y toca **"Agregar a pantalla de inicio"**.
4. Confirma el nombre ("NK BOX") y toca **Agregar**.
5. El ícono aparece en su pantalla de inicio y abre la app a pantalla completa.

### Notas para ti como administrador
- El ícono de la app usa la imagen `public/LOGONKBOX.png`. Si cambias el logo, reemplaza ese archivo (debe ser cuadrado, idealmente 512x512 px o más) y todos los íconos se actualizan solos.
- No necesitas configurar nada más: el `manifest.webmanifest` y el archivo de "service worker" se generan automáticamente al correr `npm run build`, gracias al plugin `vite-plugin-pwa`.

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
| Preguntas frecuentes | `content.faq` — agrega o edita preguntas y respuestas |
| Galería | `content.galeria` — fotos del gym (ver sección de fotos abajo) |
| Muro de Campeones | `content.campeones` — fotos, nombres y logros de alumnos |
| Menú "Más" | `content.masAccesos` — qué secciones aparecen en el menú Más |
| Calculadora de plan ideal | `content.calculadora` — preguntas, opciones y qué plan recomienda cada respuesta |

### Para cambiar el logo
Pon tu imagen en `public/logo.png` y edita `src/components/Logo.jsx` para usar:
```jsx
<img src="/logo.png" alt="NK BOX" />
```

### Cómo agregar preguntas frecuentes (FAQ)
Abre `src/content.js`, busca `faq: [` y agrega un objeto nuevo dentro del array:
```js
{
  pregunta: "¿Tu pregunta aquí?",
  respuesta: "Tu respuesta aquí...",
},
```
Aparecerá automáticamente como una nueva pregunta desplegable.

### Cómo subir fotos a la Galería o al Muro de Campeones

Las fotos **no se editan en el código**, se guardan como archivos:

1. Busca la carpeta `public/` en la raíz del proyecto (al mismo nivel que `src/`).
2. Copia ahí tu foto (formato `.jpg` o `.png`).
3. **Muy importante: nombra el archivo sin espacios ni acentos.**
   - ✅ Correcto: `galeria4.jpg`, `campeon-juan.jpg`
   - ❌ Incorrecto: `galería 4.jpg`, `campeón Juan.png`
4. Abre `src/content.js` y agrega un objeto nuevo:

   **Para la Galería:**
   ```js
   { imagen: "/galeria4.jpg", descripcion: "Descripción de la foto" },
   ```

   **Para el Muro de Campeones:**
   ```js
   { foto: "/campeon4.jpg", nombre: "Nombre completo", logro: "Su logro destacado" },
   ```

   La ruta siempre empieza con `/` seguido del nombre exacto del archivo que pusiste en `public/`.

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

---

## ⚠️ Aviso importante: Comunidades privadas y contraseñas

La sección "Comunidades" usa una **contraseña del lado del cliente** (en el navegador).

**Esto NO es seguridad real.** Cualquier persona con conocimientos básicos de programación puede abrir las herramientas del navegador y ver las contraseñas directamente en el código fuente.

**Lo que SÍ puedes poner ahí:**
- Avisos generales de la comunidad (fechas de sparring, eventos internos, motivación)
- Información que no importaría mucho si alguien la viera sin querer

**Lo que NUNCA debes poner ahí:**
- Datos personales de miembros (nombre, teléfono, dirección)
- Información de pagos o estados de cuenta
- Contratos o acuerdos privados
- Cualquier dato sensible o confidencial

La contraseña sirve únicamente como **barrera básica de conveniencia**, no como protección real. Si necesitas seguridad real, considera una solución con autenticación en servidor (Firebase, Supabase, etc.).

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
    ├── Calculadora.jsx ← Calculadora de plan ideal (modal dentro de Planes)
    ├── Contacto.jsx    ← Dirección, WhatsApp, redes sociales
    ├── Comunidades.jsx ← Comunidades privadas con contraseña
    ├── Mas.jsx         ← Menú "Más" con accesos secundarios
    ├── FAQ.jsx         ← Preguntas frecuentes (acordeón)
    ├── Galeria.jsx     ← Cuadrícula de fotos con modal
    ├── Campeones.jsx   ← Muro de campeones
    └── InstalarApp.jsx ← Aviso flotante para instalar la PWA
```
