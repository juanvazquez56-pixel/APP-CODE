// =============================================================
// ARCHIVO DE CONTENIDO — NK BOX
// Edita este archivo para actualizar TODO el contenido de la app.
// No necesitas tocar ningún otro archivo.
// =============================================================

const content = {

  // ----------------------------------------------------------
  // INFORMACIÓN GENERAL DEL GYM
  // ----------------------------------------------------------
  gym: {
    nombre: "NK BOX",
    subtitulo: "Escuela de Boxeo",
    tagline: "Boxeo · MMA · Kids · Querétaro",
    // Frases que aparecen como sellos/badges en la app
    badges: ["Sin inscripción", "Precios mensuales", "NK Levels"],
    sloganHero: "Aprende boxeo real",
  },

  // ----------------------------------------------------------
  // ANUNCIOS (sección Inicio)
  // Agrega, quita o edita anuncios aquí.
  // Cada anuncio tiene: titulo, texto, fecha (texto libre).
  // ----------------------------------------------------------
  anuncios: [
    {
      titulo: "¡Clase muestra por $70!",
      texto: "Ven a conocernos. Tu primer clase cuesta $70 y ese pago se abona a tu mensualidad si te inscribes.",
      fecha: "Junio 2026",
      destacado: true, // true = aparece primero con acento dorado
	imagen: "/horariohorizontal.png",
    },
    {
      titulo: "Ya tenemos clases de MMA",
      texto: "Martes y Jueves: Striking (Martes) y Grappling (Jueves). Disponibles con el plan NK Fight Club.",
      fecha: "Junio 2026",
      destacado: false,
    },
    {
      titulo: "NK Kids — 6 a 13 años",
      texto: "Clases especiales para niños. Boxeo, disciplina y valores. Lunes, Miércoles y Viernes de 5 a 6 pm.",
      fecha: "Junio 2026",
      destacado: false,
    },
  ],

  // ----------------------------------------------------------
  // HORARIOS (sección Horarios)
  // Cada día tiene un array de clases.
  // clase: { hora, nombre, subetiqueta, tipo }
  // tipo define el color: "boxfit" | "combat" | "control" | "elite" | "kids" | "mma"
  // ----------------------------------------------------------
  horarios: [
    {
      dia: "Lunes",
      abrev: "LUN",
      clases: [
        { hora: "7-8 am",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "8-9 am",  nombre: "Combat Box",  subetiqueta: "Técnica + 40% Fit",     tipo: "combat" },
        { hora: "9-10 am", nombre: "Box Control", subetiqueta: "Téc + Control",          tipo: "control" },
        { hora: "10-11 am",nombre: "Box Control / Elite Box", subetiqueta: "",           tipo: "control" },
        { hora: "5-6 pm",  nombre: "Box Fit / Kids", subetiqueta: "6 a 13 años",        tipo: "kids" },
        { hora: "6-7 pm",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "7-8 pm",  nombre: "Combat Box",  subetiqueta: "Técnica + 40% Fit",     tipo: "combat" },
        { hora: "8-9 pm",  nombre: "Box Control", subetiqueta: "Téc + Control",          tipo: "control" },
        { hora: "9-10 pm", nombre: "Elite Box",   subetiqueta: "Técnica + 30% Acond",   tipo: "elite" },
      ],
    },
    {
      dia: "Martes",
      abrev: "MAR",
      clases: [
        { hora: "7-8 am",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "8-9 am",  nombre: "Combat Box",  subetiqueta: "Técnica + 40% Fit",     tipo: "combat" },
        { hora: "9-10 am", nombre: "MMA",         subetiqueta: "Striking",              tipo: "mma" },
        { hora: "10-11 am",nombre: "MMA",         subetiqueta: "Striking",              tipo: "mma" },
        { hora: "5-6 pm",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "6-7 pm",  nombre: "MMA",         subetiqueta: "Striking",              tipo: "mma" },
        { hora: "7-8 pm",  nombre: "MMA",         subetiqueta: "Striking",              tipo: "mma" },
        { hora: "8-9 pm",  nombre: "Box Control", subetiqueta: "Téc + Control",          tipo: "control" },
        { hora: "9-10 pm", nombre: "Elite Box",   subetiqueta: "Técnica + 30% Acond",   tipo: "elite" },
      ],
    },
    {
      dia: "Miércoles",
      abrev: "MIÉ",
      // Mismo horario que Lunes
      clases: [
        { hora: "7-8 am",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "8-9 am",  nombre: "Combat Box",  subetiqueta: "Técnica + 40% Fit",     tipo: "combat" },
        { hora: "9-10 am", nombre: "Box Control", subetiqueta: "Téc + Control",          tipo: "control" },
        { hora: "10-11 am",nombre: "Box Control / Elite Box", subetiqueta: "",           tipo: "control" },
        { hora: "5-6 pm",  nombre: "Box Fit / Kids", subetiqueta: "6 a 13 años",        tipo: "kids" },
        { hora: "6-7 pm",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "7-8 pm",  nombre: "Combat Box",  subetiqueta: "Técnica + 40% Fit",     tipo: "combat" },
        { hora: "8-9 pm",  nombre: "Box Control", subetiqueta: "Téc + Control",          tipo: "control" },
        { hora: "9-10 pm", nombre: "Elite Box",   subetiqueta: "Técnica + 30% Acond",   tipo: "elite" },
      ],
    },
    {
      dia: "Jueves",
      abrev: "JUE",
      // Igual que Martes pero MMA = Grappling
      clases: [
        { hora: "7-8 am",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "8-9 am",  nombre: "Combat Box",  subetiqueta: "Técnica + 40% Fit",     tipo: "combat" },
        { hora: "9-10 am", nombre: "MMA",         subetiqueta: "Grappling",             tipo: "mma" },
        { hora: "10-11 am",nombre: "MMA",         subetiqueta: "Grappling",             tipo: "mma" },
        { hora: "5-6 pm",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "6-7 pm",  nombre: "MMA",         subetiqueta: "Grappling",             tipo: "mma" },
        { hora: "7-8 pm",  nombre: "MMA",         subetiqueta: "Grappling",             tipo: "mma" },
        { hora: "8-9 pm",  nombre: "Box Control", subetiqueta: "Téc + Control",          tipo: "control" },
        { hora: "9-10 pm", nombre: "Elite Box",   subetiqueta: "Técnica + 30% Acond",   tipo: "elite" },
      ],
    },
    {
      dia: "Viernes",
      abrev: "VIE",
      // Mismo horario que Lunes/Miércoles
      clases: [
        { hora: "7-8 am",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "8-9 am",  nombre: "Combat Box",  subetiqueta: "Técnica + 40% Fit",     tipo: "combat" },
        { hora: "9-10 am", nombre: "Box Control", subetiqueta: "Téc + Control",          tipo: "control" },
        { hora: "10-11 am",nombre: "Box Control / Elite Box", subetiqueta: "",           tipo: "control" },
        { hora: "5-6 pm",  nombre: "Box Fit / Kids", subetiqueta: "6 a 13 años",        tipo: "kids" },
        { hora: "6-7 pm",  nombre: "Box Fit",     subetiqueta: "Box + 50% Fit",         tipo: "boxfit" },
        { hora: "7-8 pm",  nombre: "Combat Box",  subetiqueta: "Técnica + 40% Fit",     tipo: "combat" },
        { hora: "8-9 pm",  nombre: "Box Control", subetiqueta: "Téc + Control",          tipo: "control" },
        { hora: "9-10 pm", nombre: "Elite Box",   subetiqueta: "Técnica + 30% Acond",   tipo: "elite" },
      ],
    },
    {
      dia: "Sábado",
      abrev: "SÁB",
      clases: [
        { hora: "8-9 am",  nombre: "MMA",         subetiqueta: "Mixto",                 tipo: "mma" },
        { hora: "9-10 am", nombre: "MMA",         subetiqueta: "Mixto",                 tipo: "mma" },
      ],
    },
  ],

  // ----------------------------------------------------------
  // PLANES Y PRECIOS (sección Planes)
  // popular: true  →  ese plan se resalta como "Más popular"
  // ----------------------------------------------------------
  planes: [
    {
      nombre: "NK Básico",
      precio: "$499",
      periodo: "/mes",
      descripcion: "Todas las clases de boxeo: Box Fit, Combat Box y Box Control.",
      incluye: ["Box Fit", "Combat Box", "Box Control"],
      popular: true,
    },
    {
      nombre: "NK Fight Club",
      precio: "$699",
      periodo: "/mes",
      descripcion: "Todo lo del Básico más acceso a clases de MMA (Striking y Grappling).",
      incluye: ["Todo el Básico", "MMA Striking (Mar)", "MMA Grappling (Jue)", "MMA Mixto (Sáb)"],
      popular: false,
    },
    {
      nombre: "NK Competitivo",
      precio: "$599",
      periodo: "/mes",
      descripcion: "Básico + Elite Box + participación en torneos. Solo por invitación.",
      incluye: ["Todo el Básico", "Elite Box", "Torneos"],
      popular: false,
      nota: "Solo por invitación",
    },
    {
      nombre: "NK Box + Gym",
      precio: "$799",
      periodo: "/mes",
      descripcion: "Básico + acceso a Bestia Gold Gym para entrenamiento de fuerza.",
      incluye: ["Todo el Básico", "Acceso Bestia Gold Gym"],
      popular: false,
    },
    {
      nombre: "NK Kids",
      precio: "$399",
      periodo: "/mes",
      descripcion: "Boxeo, disciplina y valores para niños de 6 a 13 años.",
      incluye: ["Clases de Kids (LMV 5-6 pm)"],
      popular: false,
    },
    {
      nombre: "Pase / Visita",
      precio: "$70",
      periodo: "/clase",
      descripcion: "Tu primera clase muestra. El pago se abona a tu mensualidad si te quedas.",
      incluye: ["1 clase suelta", "Se abona a mensualidad"],
      popular: false,
    },
  ],

  // Texto que aparece al pie de la sección de planes
  planesNota: "Sin inscripción · Precios mensuales · Alianzas: Clínica EF y Bestia Gold Gym",

  // ----------------------------------------------------------
  // CALCULADORA DE PLAN IDEAL (dentro de la sección Planes)
  // Hace 1 o 2 preguntas y recomienda un plan de la lista "planes" de arriba.
  //
  // CÓMO EDITAR LAS PREGUNTAS:
  //   - "pregunta1.opciones" son las opciones de la primera pregunta.
  //     Cada opción tiene un "valor" (úsalo en las reglas) y una "etiqueta" (texto visible).
  //   - "pregunta2" es una pregunta opcional que solo aparece si la respuesta
  //     de la pregunta 1 está en la lista "soloSiInteresEs".
  //
  // CÓMO EDITAR QUÉ PLAN RECOMIENDA CADA RESPUESTA:
  //   - "reglas" es la lista de combinaciones. Se revisan en orden y se usa
  //     la PRIMERA que haga match. Si una regla no necesita la pregunta 2,
  //     simplemente no le pongas la propiedad "gym".
  //   - El campo "plan" debe escribirse EXACTAMENTE igual al "nombre" de
  //     algún plan en la lista "planes" de arriba (mayúsculas y todo).
  // ----------------------------------------------------------
calculadora: {
      pregunta1: {
        texto: "¿Para quién es la membresía?",
        opciones: [
          { valor: "adulto", etiqueta: "Para mí (adulto)" },
          { valor: "ninos",  etiqueta: "Para un niño/a (6 a 13 años)" },
        ],
      },
      pregunta2: {
        texto: "¿Qué te interesa entrenar?",
        // Solo se muestra si en la pregunta 1 eligió "adulto"
        soloSiInteresEs: ["adulto"],
        opciones: [
          { valor: "boxeo",    etiqueta: "Boxeo y ponerme en forma" },
          { valor: "mma",      etiqueta: "Boxeo + MMA" },
          { valor: "competir", etiqueta: "Competir a nivel alto" },
        ],
      },
      pregunta3: {
        texto: "¿Quieres incluir acceso al gym de pesas (Bestia Gold Gym)?",
        // Solo se muestra si en la pregunta 2 eligió "boxeo"
        soloSiObjetivoEs: ["boxeo"],
        opciones: [
          { valor: "si", etiqueta: "Sí, también quiero pesas" },
          { valor: "no", etiqueta: "No, solo clases" },
        ],
      },
      reglas: [
        { quien: "ninos",  plan: "NK Kids" },
        { quien: "adulto", objetivo: "competir", plan: "NK Competitivo" },
        { quien: "adulto", objetivo: "mma",      plan: "NK Fight Club" },
        { quien: "adulto", objetivo: "boxeo", gym: "si", plan: "NK Box + Gym" },
        { quien: "adulto", objetivo: "boxeo", gym: "no", plan: "NK Básico" },
      ],
    },

  // ----------------------------------------------------------
  // DISCIPLINAS (sección Disciplinas)
  // Cada una tiene: nombre, emoji, descripcion, tipo (para el color)
  // ----------------------------------------------------------
  disciplinas: [
    {
      nombre: "Box Fit",
      emoji: "🥊",
      descripcion: "La mezcla perfecta: técnica de boxeo con 50% de acondicionamiento físico. Ideal para quemar calorías y aprender a golpear.",
      tipo: "boxfit",
    },
    {
      nombre: "Combat Box",
      emoji: "🥋",
      descripcion: "Técnica pura con un 40% de fitness. Trabajas combinaciones, distancia y timing para pelear de verdad.",
      tipo: "combat",
    },
    {
      nombre: "Box Control",
      emoji: "🎯",
      descripcion: "Clase técnica enfocada en precisión, control de distancia y sparring controlado. Para quien quiere subir de nivel.",
      tipo: "control",
    },
    {
      nombre: "Elite Box",
      emoji: "🏆",
      descripcion: "Alto rendimiento: técnica avanzada + 30% de acondicionamiento. Para boxeadores con miras a competir.",
      tipo: "elite",
    },
    {
      nombre: "MMA",
      emoji: "⚡",
      descripcion: "Artes Marciales Mixtas. Martes: Striking (golpes en pie). Jueves: Grappling (lucha y sumisión). Sábados: Mixto.",
      tipo: "mma",
    },
    {
      nombre: "NK Kids",
      emoji: "⭐",
      descripcion: "Boxeo para niños de 6 a 13 años. Aprenden disciplina, respeto y confianza en un ambiente seguro y divertido.",
      tipo: "kids",
    },
    {
      nombre: "Recovery",
      emoji: "💆",
      descripcion: "Movilidad, stretching y recuperación activa. Complemento esencial para entrenar mejor sin lesionarte.",
      tipo: "control",
    },
  ],

  // ----------------------------------------------------------
  // CONTACTO (sección Contacto)
  // ----------------------------------------------------------
  contacto: {
    direccion: "Av. Tarahumaras 607, Cerrito Colorado, Querétaro",
    direccionDetalle: "Planta baja del gym",
    // Número de WhatsApp con código de país (52 = México)
    // Para cambiar: pon 52 + número sin espacios ni guiones
    whatsapp: "527206771174",
    // Mensaje que aparece pre-escrito cuando abren WhatsApp
    whatsappMensaje: "Hola, quiero reservar mi clase muestra de $70",
    // Redes sociales (deja vacío "" si no aplica)
    instagram: "nkboxqueretaro",
    facebook: "", // ejemplo: "NKBoxQro"
    tiktok:   "", // ejemplo: "nkboxqueretaro"
    // Mapa: pega aquí el src del iframe de Google Maps (opcional)
    // Para obtenerlo: busca la dirección en Google Maps → Compartir → Insertar mapa → copia el src
    mapaEmbed: "",
  },

  // ----------------------------------------------------------
  // CTA PRINCIPAL (botón flotante / hero)
  // ----------------------------------------------------------
  ctaPrincipal: {
    texto: "Reserva tu clase muestra · $70",
    // Al hacer clic abre WhatsApp (usa el número y mensaje de arriba)
  },

  // ----------------------------------------------------------
  // COMUNIDADES PRIVADAS
  // Sección con acceso por contraseña para planes especiales.
  //
  // ⚠️  AVISO IMPORTANTE DE SEGURIDAD:
  // La contraseña se verifica en el navegador del usuario (lado cliente).
  // Cualquier persona con conocimientos técnicos puede ver las contraseñas
  // inspeccionando el código. NO pongas aquí información sensible, datos
  // personales, contratos, pagos ni nada confidencial.
  // Sirve como barrera básica para avisos de comunidad, no más.
  //
  // CÓMO CAMBIAR LA CONTRASEÑA:
  //   Cambia el valor de "password" en la comunidad que quieras.
  //   Avisa a tus miembros la nueva contraseña por WhatsApp.
  //
  // CÓMO AGREGAR UN AVISO:
  //   Agrega un objeto al array "avisos" con: titulo, texto, fecha.
  //   El primer aviso de la lista aparece hasta arriba.
  // ----------------------------------------------------------
  comunidades: [
    {
      nombre: "NK Fight Club",
      // Cambia esta contraseña cuando quieras y avisa a tus miembros
      password: "nkfight2026",
      // Color de acento para esta comunidad (azul = MMA/Fight Club)
      acento: "blue",
      emoji: "⚡",
      descripcion: "Zona exclusiva para miembros del plan NK Fight Club.",
      avisos: [
        {
          titulo: "Bienvenido al Fight Club",
          texto: "Esta es tu comunidad privada. Aquí publicaremos avisos exclusivos: fechas de sparring especial, invitaciones a eventos y más. ¡Bienvenido!",
          fecha: "Junio 2026",
        },
        {
          titulo: "Comunidad de WhatsApp",
          texto: "Canal público para competidores. Aquí encontrarás fechas de eventos, avisos, promociones y más.",
          link: "https://whatsapp.com/channel/0029VbBo3SbGufIppaNBAf47",
          linkTexto: "Unirme a la comunidad",
          fecha: "Junio 2026",
        },
        // Agrega más avisos aquí siguiendo el mismo formato:
        // {
        //   titulo: "Título del aviso",
        //   texto: "Texto del aviso...",
        //   fecha: "Junio 2026",
        // },
      ],
    },
    {
      nombre: "NK Competitivo",
      // Cambia esta contraseña cuando quieras y avisa a tus miembros
      password: "nkelite2026",
      // Color de acento para esta comunidad (rojo = élite/competitivo)
      acento: "red",
      emoji: "🏆",
      descripcion: "Zona exclusiva para miembros del plan NK Competitivo.",
      avisos: [
        {
          titulo: "Bienvenido a NK Competitivo",
          texto: "Canal privado para competidores. Aquí encontrarás fechas de torneos, convocatorias y preparación especial. Solo por invitación.",
          fecha: "Junio 2026",
        },
        {
          titulo: "Comunidad de WhatsApp",
          texto: "Canal público para competidores. Aquí encontrarás fechas de eventos, avisos, promociones y más.",
          link: "https://whatsapp.com/channel/0029VbBo3SbGufIppaNBAf47",
          linkTexto: "Unirme a la comunidad",
          fecha: "Junio 2026",
        },
        // Agrega más avisos aquí siguiendo el mismo formato:
        // {
        //   titulo: "Próximo torneo",
        //   texto: "Detalles del torneo...",
        //   fecha: "Julio 2026",
        // },
      ],
    },
  ],

  // ----------------------------------------------------------
  // PANTALLA "MÁS" — accesos a secciones secundarias
  // Aparecen como lista al tocar el botón "Más" en la barra inferior.
  //
  // CÓMO AGREGAR UNA SECCIÓN NUEVA (ej. FAQ, Galería, Campeones):
  //   1. Crea su componente en src/components/ (ej. Faq.jsx)
  //   2. Impórtalo y agrégalo a App.jsx con su propio id (ej. "faq")
  //   3. Agrega un objeto aquí abajo con: id, label, emoji, descripcion
  //   4. (Opcional) agrega ese id a SECCIONES_DENTRO_DE_MAS en NavBar.jsx
  //      para que el botón "Más" se resalte al estar en esa sección.
  // ----------------------------------------------------------
  masAccesos: [
    {
      id: "contacto",
      label: "Contacto",
      emoji: "📞",
      descripcion: "Dirección, WhatsApp y redes sociales",
    },
    {
      id: "comunidades",
      label: "Comunidad",
      emoji: "🔒",
      descripcion: "Zonas privadas para planes especiales",
    },
    {
      id: "faq",
      label: "Preguntas frecuentes",
      emoji: "❓",
      descripcion: "Dudas comunes sobre el gym",
    },
    {
      id: "galeria",
      label: "Galería",
      emoji: "📸",
      descripcion: "Fotos y videos del gym",
    },
    {
      id: "campeones",
      label: "Campeones",
      emoji: "🥇",
      descripcion: "Nuestros alumnos destacados",
    },
    {
      id: "ruta",
      label: "Tu ruta",
      emoji: "🥊",
      descripcion: "De cero a competidor · Las 4 fases del plan",
    },
    {
      id: "menumaestro",
      label: "Menú Maestro",
      emoji: "🔑",
      descripcion: "Panel de administración (solo staff)",
    },
    // Agrega aquí más accesos en el futuro siguiendo el mismo formato.
  ],

  // ----------------------------------------------------------
  // PREGUNTAS FRECUENTES (FAQ)
  // Cada pregunta tiene: pregunta, respuesta.
  // Agrega o quita preguntas libremente, el orden es el que se muestra.
  // ----------------------------------------------------------
  faq: [
    {
      pregunta: "¿Qué debo llevar a mi primera clase?",
      respuesta: "Ropa deportiva cómoda, tenis, una toalla pequeña y una botella de agua. Si tienes vendas y guantes de box tráelos, pero no son obligatorios para la clase muestra: te prestamos el equipo básico.",
    },
    {
      pregunta: "¿Dónde puedo estacionarme?",
      respuesta: "Hay espacio para estacionarte sobre Av. Tarahumaras, frente al gym. También puedes preguntar con el personal por opciones cercanas si no encuentras lugar.",
    },
    {
      pregunta: "¿Qué formas de pago aceptan?",
      respuesta: "Aceptamos efectivo y transferencia bancaria y pago con tarjeta. Pregunta en recepción por los datos de transferencia.",
    },
    {
      pregunta: "¿Hay inscripción o algún pago inicial?",
      respuesta: "No. En NK BOX no cobramos inscripción. Solo pagas tu mensualidad o el plan que elijas, sin pagos ocultos.",
    },
    // Agrega más preguntas aquí siguiendo el mismo formato:
    // {
    //   pregunta: "¿Tu pregunta aquí?",
    //   respuesta: "Tu respuesta aquí...",
    // },
  ],

  // ----------------------------------------------------------
  // GALERÍA DEL GYM
  // Cada foto tiene: imagen (ruta dentro de /public), descripcion.
  //
  // CÓMO AGREGAR FOTOS:
  //   1. Guarda tu foto dentro de la carpeta /public en la raíz del proyecto.
  //   2. Nombra el archivo SIN espacios ni acentos (ej. "galeria4.jpg", NO "galería 4.jpg").
  //   3. Agrega un objeto aquí con la ruta empezando en "/" (ej. "/galeria4.jpg").
  // ----------------------------------------------------------
  galeria: [
    {
      imagen: "/NK_BOX_MMA_striking.png",
      descripcion: "Clase de MMA — Striking",
    },
    {
      imagen: "/galeria3.jpg",
      descripcion: "INSTALACIONES",
    },
    // Agrega más fotos aquí siguiendo el mismo formato:
    // { imagen: "/galeria4.jpg", descripcion: "Descripción de la foto" },
  ],

  // ----------------------------------------------------------
  // MURO DE CAMPEONES
  // Cada campeón tiene: foto (ruta dentro de /public), nombre, logro.
  // Mismo proceso que la galería para subir las fotos a /public.
  // ----------------------------------------------------------
  campeones: [
    {
      foto: "/campeon1.jpg",
      nombre: "Juan Pérez",
      logro: "...",
    },
    {
      foto: "/campeon2.jpg",
      nombre: "María López",
      logro: "...",
    },
    {
      foto: "/campeon3.jpg",
      nombre: "Carlos Ramírez",
      logro: "...",
    },
    // Agrega más campeones aquí siguiendo el mismo formato:
    // { foto: "/campeon4.jpg", nombre: "Nombre completo", logro: "Su logro destacado" },
  ],

  // ----------------------------------------------------------
  // TU RUTA · Plan de desarrollo de cero a competidor
  // ----------------------------------------------------------
  // Cómo editar:
  //   - whatsapp / waMensaje: número y texto para el botón verde al pie.
  //   - fases: cada objeto es una pestaña. Cambia meta, bloques (titulo + items[]),
  //     sparring, sparringNota, fisico y examen (o meta_final en la fase 4).
  //   - semana: 5 días fijos. dia, descripcion, intensidad y nivel (1-3 puntos).
  //   - sesion: bloques de la sesión de 75-90 min. peso es el tamaño relativo
  //     en la barra visual (no tiene que sumar 100, es proporcional).
  //     color es hex para el acento de ese bloque.
  //   - golpes: los 8 golpes NK. clase: "recto" | "curvo" | "uppercut" | "cuerpo"
  //     define el color del número.
  //   - seguridad: equipo[], reglas[], alerta (texto rojo), cuidado[].
  // ----------------------------------------------------------
  ruta: {
    whatsapp: "527206771174",
    waMensaje: "Hola, quiero saber en qué fase del plan me toca empezar.",

    hero: {
      eyebrow: "NK BOX · Plan de desarrollo",
      titulo: "De cero a competidor",
      subtitulo: "Tu camino paso a paso, sin saltarte nada.",
      stats: [
        { valor: "4",     etiqueta: "fases" },
        { valor: "3",     etiqueta: "exámenes" },
        { valor: "12–18", etiqueta: "meses" },
      ],
    },

    regla: "Subes de fase por examen, no por tiempo. Los meses son el mínimo. Si no apruebas, el entrenador te dice qué corregir y vuelves a presentar en la siguiente ceremonia de promociones.",

    fases: [
      {
        n: 1, nombre: "Fundamentos", cuando: "Meses 1–3", tag: "Mínimo 3 meses",
        color: "#22c55e",
        meta: "Pararte, moverte y lanzar los golpes rectos con técnica correcta sin perder la guardia.",
        bloques: [
          { titulo: "Mes 1 · Base", items: [
            "Guardia, postura y distancia; moverte adelante, atrás y a los lados sin cruzar los pies.",
            "Golpes 1 y 2 en sombra, espejo y costal.",
            "Combinaciones: 1, 1-1, 1-2.",
            "Defensa: parada con el guante y paso atrás.",
          ]},
          { titulo: "Mes 2 · Golpes curvos", items: [
            "Golpes 3 y 6 (volados) y 4 y 7 (uppercuts) con giro de cadera y pie.",
            "Combinaciones: 1-2-3, 1-2-3-2, 1-6, 3-2.",
            "Defensa: rol contra volados y slip contra rectos. Pivotes a ambos lados.",
          ]},
          { titulo: "Mes 3 · Integración", items: [
            "Golpes 5 y 8 al cuerpo, con bajada de nivel correcta.",
            "Combinaciones de 3 a 4 golpes: 1-2-5-3, 1-8-3-2.",
            "Manoplas con el entrenador, a la voz y por número.",
          ]},
        ],
        sparring: "Ninguno", sparringNota: "Cero sparring en esta fase.",
        fisico: "Cuerda 3×3 min y trote suave de 20 min, 2 veces por semana fuera de clase.",
        examen: { para: 2, filas: [
          ["Técnica", "Sombra de 2 min con los 8 golpes y guardia limpia; 1-2-3-2 y 1-8-3-2 en manopla a la voz."],
          ["Físico",  "3 rounds de cuerda sin parar."],
          ["Actitud", "85 % de asistencia durante la fase."],
        ]},
      },
      {
        n: 2, nombre: "Intermedio", cuando: "Meses 4–6", tag: "Meses 4 a 6",
        color: "#3b82f6",
        meta: "Defender y contestar en el mismo movimiento, y empezar a usar tu técnica contra alguien que se mueve.",
        bloques: [
          { titulo: "Técnica", items: [
            "Defensa con respuesta: slip + 2, rol + 3, bloqueo + 1-2, paso atrás + 2.",
            "Fintas con jab y con el hombro; cambio de ritmo.",
            "Salir de esquinas y cuerdas con pivote o paso lateral, nunca en línea recta hacia atrás.",
            "Combinaciones de 4 a 6 golpes con salida.",
            "Control de distancia: larga (jab), media (combinaciones) y corta (cuerpo y uppercuts).",
          ]},
          { titulo: "Con pareja", items: [
            "Uno solo ataca con 1 y 2 y el otro solo defiende; luego invierten.",
            "Un solo objetivo: solo cuerpo o solo jab, a 30–40 % de potencia.",
            "Manoplas donde el entrenador tira y tú defiendes y respondes.",
          ]},
        ],
        sparring: "Condicionado · 30–40 %", sparringNota: "1 vez por semana (jueves), 3–4 rounds. Menores: máx. 3 rounds de 2 min.",
        fisico: "Intervalos en costal (30 s rápido / 30 s suave × 6) y circuitos de 3 rondas.",
        examen: { para: 3, filas: [
          ["Técnica", "Defensa + respuesta en 4 situaciones (slip, rol, bloqueo, paso atrás) y salir de una esquina."],
          ["Físico",  "6 rounds seguidos de costal."],
          ["Actitud", "Sparring condicionado sin perder el control."],
        ]},
      },
      {
        n: 3, nombre: "Avanzado", cuando: "Meses 7–12", tag: "Meses 7 a 12",
        color: "#ef4444",
        meta: "Pelear con un plan, adaptarte a distintos rivales y aguantar 3 rounds completos a ritmo de torneo.",
        bloques: [
          { titulo: "Técnica y táctica", items: [
            "Pelear al frente (presión), a distancia (contragolpe) y saber cambiar entre ambos.",
            "Contra zurdos y contra derechos: posición del pie adelantado y ángulos de salida.",
            "Anticipar el jab rival con un 2 o con un 5.",
            "Clinch amateur: cómo romperlo y salir golpeando.",
            "Administrar el round: ganar los últimos 30 segundos.",
          ]},
          { titulo: "Con pareja", items: [
            "Sparring con distintos compañeros: más alto, más bajo, zurdo, más pesado.",
            "Rounds de situación: 'vas perdiendo, quedan 40 segundos', 'estás contra las cuerdas'.",
            "Revisión en video de un sparring al mes, con correcciones.",
          ]},
        ],
        sparring: "Controlado · 50–70 %", sparringNota: "Martes y jueves, 4–6 rounds. Menores: solo técnico, máx. 4 rounds.",
        fisico: "Rounds de costal a ritmo de pelea, carrera con cambios de ritmo y fuerza con carga moderada (adultos).",
        examen: { para: 4, filas: [
          ["Técnica",   "3 rounds de sparring controlado mostrando plan, ajuste y manejo de distancia."],
          ["Físico",    "3 rounds de pelea simulada a ritmo de torneo, con buena recuperación en el minuto."],
          ["Requisito", "Certificado médico de aptitud deportiva; permiso firmado del tutor en menores."],
        ]},
      },
      {
        n: 4, nombre: "Competidor", cuando: "Mes 12+", tag: "Mes 12 en adelante",
        color: "#fbbf24",
        meta: "Ganar experiencia de torneo con un campamento de 8 semanas antes de cada pelea.",
        bloques: [
          { titulo: "Campamento de 8 semanas", items: [
            "Semanas 1–2 · Base: volumen aeróbico, correcciones técnicas y fuerza general.",
            "Semanas 3–5 · Específico: plan de pelea según tu rival e intervalos de alta intensidad.",
            "Semanas 6–7 · Afinación: velocidad, precisión y rounds simulados de torneo.",
            "Semana 8 · Descarga: volumen bajo, técnica ligera, peso y descanso.",
          ]},
          { titulo: "Tu rutina de competidor", items: [
            "Control de peso cada semana, sin cortes bruscos (menos en menores).",
            "Después de cada pelea: 1 semana de recuperación activa y revisión del video.",
          ]},
        ],
        sparring: "De campamento · hasta 80 %", sparringNota: "6–8 rounds. Sin sparring los últimos 5–7 días antes de pelear. Menores: sin llegar a 80 %, máx. 5 rounds.",
        fisico: "Según el bloque del campamento: potencia y mantener la fuerza.",
        examen: null,
        metaFinal: "Competir en torneos amateur avalados por la asociación estatal.",
      },
    ],

    semana: [
      { dia: "LUN", descripcion: "Técnica de ataque: golpes y combinaciones nuevas", intensidad: "Media",      nivel: 2 },
      { dia: "MAR", descripcion: "Defensa y contraataque",                           intensidad: "Media",      nivel: 2 },
      { dia: "MIÉ", descripcion: "Acondicionamiento y costal pesado",                intensidad: "Alta",       nivel: 3 },
      { dia: "JUE", descripcion: "Trabajo con pareja: manoplas, ejercicios condicionados y sparring (desde Fase 2)", intensidad: "Alta", nivel: 3 },
      { dia: "VIE", descripcion: "Repaso de la semana, juego de piernas y prueba técnica rápida", intensidad: "Media-baja", nivel: 1 },
    ],

    // peso: tamaño relativo en la barra visual (proporcional, no suma 100)
    sesion: [
      { nombre: "Calentamiento y movilidad",        duracion: "10 min",    peso: 10, color: "#22c55e" },
      { nombre: "Sombra guiada (3 rounds)",          duracion: "~9 min",    peso:  9, color: "#3b82f6" },
      { nombre: "Bloque técnico principal",          duracion: "25–30 min", peso: 27, color: "#fbbf24" },
      { nombre: "Aplicación: costal, manoplas o sparring", duracion: "15–20 min", peso: 17, color: "#ef4444" },
      { nombre: "Acondicionamiento",                 duracion: "10–15 min", peso: 12, color: "#c084fc" },
      { nombre: "Enfriamiento y estiramiento",       duracion: "5–10 min",  peso:  7, color: "#a1a1aa" },
    ],

    // clase: "recto" | "curvo" | "uppercut" | "cuerpo"  (define el color del número)
    golpes: [
      { numero: 1, nombre: "Jab",               clase: "recto"   },
      { numero: 2, nombre: "Cross",              clase: "recto"   },
      { numero: 3, nombre: "Volado izq.",        clase: "curvo"   },
      { numero: 4, nombre: "Uppercut der.",      clase: "uppercut"},
      { numero: 5, nombre: "Gancho al hígado izq.", clase: "cuerpo" },
      { numero: 6, nombre: "Volado der.",        clase: "curvo"   },
      { numero: 7, nombre: "Uppercut izq.",      clase: "uppercut"},
      { numero: 8, nombre: "Golpe a la panza",   clase: "cuerpo"  },
    ],

    seguridad: {
      equipo: ["Careta", "Protector bucal", "Vendas", "Guantes 14–16 oz", "Concha"],
      reglas: [
        "Siempre con un entrenador en el ring, nunca sin supervisión.",
        "Parejas de peso y nivel parecidos. Menores nunca con adultos.",
        "El entrenador para el round ante un golpe fuerte a la cabeza o si pierdes la guardia por cansancio.",
      ],
      alerta: "Mareo, dolor de cabeza, náusea o visión borrosa. Se detiene la sesión, no regresas ese día y necesitas valoración médica antes de volver al contacto.",
      cuidado: [
        "Fin de semana libre o con actividad ligera.",
        "Juveniles: duerme 8–10 horas y toma agua toda la sesión.",
        "Para y avisa si tienes dolor articular que no cede o cansancio de varios días.",
        "Menores de 16: sin cargas máximas ni peso en el cuello.",
      ],
    },
  },
};

export default content;
