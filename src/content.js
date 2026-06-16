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
      password: "fight2026",
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
      password: "elite2026",
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
        // Agrega más avisos aquí siguiendo el mismo formato:
        // {
        //   titulo: "Próximo torneo",
        //   texto: "Detalles del torneo...",
        //   fecha: "Julio 2026",
        // },
      ],
    },
  ],
};

export default content;
