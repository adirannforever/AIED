// ==========================================================
// 1. REFERENCIAS A ELEMENTOS DE LA INTERFAZ
// ==========================================================
const inputPrincipal = document.getElementById('input-principal');
const tituloModulo = document.getElementById('titulo-modulo');
const textoConsola = document.getElementById('texto-consola');
const vistaMetodos = document.getElementById('vista-metodos');
const vistaModelos = document.getElementById('vista-modelos');
const btnAlternar = document.getElementById('btn-alternar');

// Elementos del Menú
const btnAjustesPrincipal = document.getElementById('btn-ajustes-principal');
const menuAjustes = document.getElementById('menu-ajustes');
const btnAbrirCreditos = document.getElementById('btn-abrir-creditos');
const pantallaAcerca = document.getElementById('pantalla-acerca');
const btnCerrarAcerca = document.getElementById('btn-cerrar-acerca');

// Elementos Dinámicos (Parámetros, Cuadros y Gráfica)
const panelParametrosEdo = document.getElementById('parametros-edo');
const btnResolverGeneral = document.getElementById('btn-resolver-general');
const cuadroOpcionesMetodo = document.getElementById('cuadro-opciones-metodo');
const cajonGrafica = document.getElementById('cajon-grafica');
const btnToggleCajon = document.getElementById('btn-toggle-cajon');
const ctxGrafica = document.getElementById('grafica-edo').getContext('2d');

let chartInstancia = null; // Guardará la gráfica para poder borrarla y redibujarla

// ==========================================================
// 2. SISTEMA DE MEMORIA Y CAMBIO DE MÓDULOS
// ==========================================================
let moduloActual = 'Euler';

const memoriaModulos = {
    'Euler': { input: '', consola: '// Los resultados y fórmulas aparecerán en este panel...', x0: '', xf: '', y0: '', h: '' },
    'Heun': { input: '', consola: '// Los resultados y fórmulas aparecerán en este panel...', x0: '', xf: '', y0: '', h: '' },
    'RK4': { input: '', consola: '// Los resultados y fórmulas aparecerán en este panel...' },
    'Satelite': { input: '', consola: '// Los resultados y fórmulas aparecerán en este panel...' },
    'Virus': { input: '', consola: '// Los resultados y fórmulas aparecerán en este panel...' },
    'Circuito': { input: '', consola: '// Los resultados y fórmulas aparecerán en este panel...' }
};

function cambiarModulo(nombre) {
    // 1. Guardar datos de la pestaña actual
    memoriaModulos[moduloActual].input = inputPrincipal.value;
    memoriaModulos[moduloActual].consola = textoConsola.innerHTML;

    if (moduloActual === 'Euler' || moduloActual === 'Heun') {
        memoriaModulos[moduloActual].x0 = document.getElementById('param-x0').value;
        memoriaModulos[moduloActual].xf = document.getElementById('param-xf').value;
        memoriaModulos[moduloActual].y0 = document.getElementById('param-y0').value;
        memoriaModulos[moduloActual].h = document.getElementById('param-h').value;
    }

    // 2. Ocultar menús flotantes y gráficas al cambiar de pestaña para mantener limpio
    if (cuadroOpcionesMetodo) cuadroOpcionesMetodo.classList.remove('mostrar');
    if (cajonGrafica) {
        cajonGrafica.classList.remove('abierto');
        setTimeout(() => { cajonGrafica.style.display = 'none'; }, 400); // Se oculta tras la animación
    }

    // 3. Cambiar nombre y actualizar UI
    moduloActual = nombre;
    tituloModulo.innerText = "Módulo: " + nombre;

    if (nombre === 'Euler' || nombre === 'Heun') {
        if (panelParametrosEdo) panelParametrosEdo.style.display = 'flex';
    } else {
        if (panelParametrosEdo) panelParametrosEdo.style.display = 'none';
    }

    // 4. Restaurar datos de la nueva pestaña
    inputPrincipal.value = memoriaModulos[moduloActual].input;
    textoConsola.innerHTML = memoriaModulos[moduloActual].consola;

    if (nombre === 'Euler' || nombre === 'Heun') {
        document.getElementById('param-x0').value = memoriaModulos[moduloActual].x0;
        document.getElementById('param-xf').value = memoriaModulos[moduloActual].xf;
        document.getElementById('param-y0').value = memoriaModulos[moduloActual].y0;
        document.getElementById('param-h').value = memoriaModulos[moduloActual].h;
    }

    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('onclick').includes(nombre)) btn.classList.add('active');
    });
}

// Inicialización de la pantalla al cargar
window.addEventListener('load', () => {
    if (moduloActual === 'Euler' || moduloActual === 'Heun') {
        if (panelParametrosEdo) panelParametrosEdo.style.display = 'flex';
    } else {
        if (panelParametrosEdo) panelParametrosEdo.style.display = 'none';
    }
    // Esconder el cajón de la gráfica desde el principio
    if (cajonGrafica) cajonGrafica.style.display = 'none';
});

// ==========================================================
// 3. INTERACCIONES BÁSICAS (Teclados y Menús)
// ==========================================================
function insertar(valor) { inputPrincipal.value += valor; inputPrincipal.focus(); }
function borrarUltimo() { inputPrincipal.value = inputPrincipal.value.slice(0, -1); inputPrincipal.focus(); }
function limpiarTodo() { inputPrincipal.value = ''; inputPrincipal.focus(); }

btnAlternar.addEventListener('click', () => {
    vistaMetodos.classList.toggle('active'); vistaModelos.classList.toggle('active');
});

document.querySelectorAll('.tab-btn-circular').forEach(btn => {
    btn.addEventListener('click', function() {
        this.parentElement.querySelectorAll('.tab-btn-circular').forEach(b => b.classList.remove('active'));
        this.classList.add('active');
    });
});

btnAjustesPrincipal.addEventListener('click', (e) => { e.stopPropagation(); menuAjustes.classList.toggle('show'); });
window.addEventListener('click', () => { if (menuAjustes.classList.contains('show')) menuAjustes.classList.remove('show'); });
btnAbrirCreditos.addEventListener('click', () => { pantallaAcerca.classList.add('mostrar'); menuAjustes.classList.remove('show'); });
btnCerrarAcerca.addEventListener('click', () => { pantallaAcerca.classList.remove('mostrar'); });

// Lógica de la pestaña de la Gráfica (Abrir/Cerrar manualmente)
btnToggleCajon.addEventListener('click', () => {
    cajonGrafica.classList.toggle('abierto');
});

// ==========================================================
// 4. LÓGICA DE RESOLUCIÓN Y GRÁFICAS (SIMULACIÓN)
// ==========================================================

btnResolverGeneral.addEventListener('click', function() {
    const ecuacion = inputPrincipal.value;
    if (ecuacion.trim() === "") { alert("Por favor, ingresa una ecuación antes de continuar."); return; }

    // ¡Aquí está la magia! Evaluamos si es Euler o Heun
    if (moduloActual === 'Euler' || moduloActual === 'Heun') {
        // Cambiamos el título del menú flotante dinámicamente
        document.getElementById('nombre-metodo-flotante').innerText = moduloActual;
        
        // Mostramos u ocultamos el menú flotante
        cuadroOpcionesMetodo.classList.toggle('mostrar');
    } else {
        // Para RK4, Satélite, Virus, etc. (Cálculo directo sin sub-menú)
        cuadroOpcionesMetodo.classList.remove('mostrar');
        textoConsola.innerHTML = `<strong>Iniciando cálculo estándar en ${moduloActual}...</strong><br>Procesando...`;
    }
});

// FUNCIÓN PARA GENERAR LA GRÁFICA CON TUS COLORES
function generarGraficaSimulada(nombreVariante) {
    // Datos simulados
    const etiquetasX = ['0.0', '0.2', '0.4', '0.6', '0.8', '1.0', '1.2', '1.4', '1.6', '1.8', '2.0'];
    const datosManual = [1.0, 1.22, 1.49, 1.82, 2.22, 2.71, 3.32, 4.05, 4.95, 6.04, 7.38]; 
    const datosScipy = [1.0, 1.25, 1.55, 1.90, 2.35, 2.85, 3.50, 4.25, 5.20, 6.30, 7.60]; 

    let configuracionDatasets = [];

    if (nombreVariante.includes('Comparar')) {
        configuracionDatasets = [
            { label: 'Manual', data: datosManual, borderColor: '#FF0000', backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 2, tension: 0.3, fill: true },
            { label: 'Scipy', data: datosScipy, borderColor: '#333333', backgroundColor: 'transparent', borderWidth: 2, borderDash: [5, 5], tension: 0.3, fill: false }
        ];
    } else {
        configuracionDatasets = [{
            label: nombreVariante, data: datosManual, borderColor: '#FF0000', backgroundColor: 'rgba(255,0,0,0.1)', borderWidth: 2, tension: 0.3, fill: true
        }];
    }

    if (chartInstancia) chartInstancia.destroy();

    chartInstancia = new Chart(ctxGrafica, {
        type: 'line',
        data: { labels: etiquetasX, datasets: configuracionDatasets },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { position: 'top', labels: { font: { family: 'Segoe UI' } } } },
            scales: {
                x: { grid: { color: '#EAEAEA' } },
                y: { grid: { color: '#EAEAEA' } }
            }
        }
    });
}

function ejecutarVarianteSimulada(nombreVariante) {
    const ecuacion = inputPrincipal.value;
    const x0 = document.getElementById('param-x0').value || '0';
    const xf = document.getElementById('param-xf').value || '0';
    const h = document.getElementById('param-h').value || '0';

    // Imprime en consola usando la variable "moduloActual" (Euler o Heun)
    textoConsola.innerHTML = `<strong style="color: #FF0000;">Ejecutando: ${moduloActual} - ${nombreVariante}</strong><br>
                              ---------------------------------------------------<br>
                              Ecuación dy/dx = <strong>${ecuacion}</strong><br>
                              Intervalo [${x0}, ${xf}], Paso h=${h}<br><br>
                              <em>Se ha generado una aproximación gráfica. Revisa el cajón lateral.</em>`;
    
    // 1. Ocultar el cuadro de opciones
    cuadroOpcionesMetodo.classList.remove('mostrar');
    
    // 2. Hacer existir el cajón de la gráfica
    cajonGrafica.style.display = 'flex';
    
    // 3. Dibujar la gráfica
    generarGraficaSimulada(nombreVariante);

    // 4. Deslizar el cajón suavemente
    setTimeout(() => { cajonGrafica.classList.add('abierto'); }, 100);
}

// Eventos de los botones del cuadro flotante
document.getElementById('btn-ejecutar-manual').addEventListener('click', () => ejecutarVarianteSimulada('Algoritmo Manual'));
document.getElementById('btn-ejecutar-predef').addEventListener('click', () => ejecutarVarianteSimulada('Clases Predefinidas (Scipy)'));
document.getElementById('btn-ejecutar-comp').addEventListener('click', () => ejecutarVarianteSimulada('Comparar Resultados'));

// ==========================================================
// 5. LÓGICA DEL PANEL DE CONFIGURACIÓN (AJUSTES)
// ==========================================================
const panelConfiguracion = document.getElementById('panel-configuracion');
const btnCerrarConfig = document.getElementById('btn-cerrar-config');
const btnConfigOpcion = document.querySelector('.btn-menu-item');

btnConfigOpcion.addEventListener('click', () => {
    panelConfiguracion.classList.add('mostrar');
    menuAjustes.classList.remove('show');
});

btnCerrarConfig.addEventListener('click', () => {
    panelConfiguracion.classList.remove('mostrar');
});

// --- Tamaño de Letra ---
let nivelZoom = 100;
const zoomMinimo = 80;
const zoomMaximo = 130;
const valorLetraUi = document.getElementById('valor-letra');

document.getElementById('btn-letra-mas').addEventListener('click', () => {
    if (nivelZoom < zoomMaximo) { nivelZoom += 10; actualizarZoom(); }
});

document.getElementById('btn-letra-menos').addEventListener('click', () => {
    if (nivelZoom > zoomMinimo) { nivelZoom -= 10; actualizarZoom(); }
});

function actualizarZoom() {
    valorLetraUi.innerText = `${nivelZoom}%`;
    document.querySelector('.layout-principal').style.zoom = `${nivelZoom}%`;
}

// --- Cambio de Temas ---
const botonesTema = document.querySelectorAll('.btn-tema');
const cuerpoPagina = document.body;

botonesTema.forEach(boton => {
    boton.addEventListener('click', (e) => {
        botonesTema.forEach(b => b.classList.remove('activo'));
        e.target.classList.add('activo');

        const temaSeleccionado = e.target.getAttribute('data-tema');
        cuerpoPagina.classList.remove('tema-compañero', 'tema-oceano');

        if (temaSeleccionado === 'compañero') cuerpoPagina.classList.add('tema-compañero');
        else if (temaSeleccionado === 'oceano') cuerpoPagina.classList.add('tema-oceano');
    });
});

// ==========================================================
// 6. MOTOR DE TRADUCCIÓN (DICCIONARIO i18n)
// ==========================================================

const traducciones = {
    es: {
        tituloPrincipal: "ECUACIONES DIFERENCIALES",
        btnAjustes: "⚙️ Ajustes y más...",
        btnCambio: "🔄 Cambio",
        tituloEntrada: "Entrada",
        placeholderEdo: "Escribe tu EDO aquí...",
        tituloParametros: "Parámetros del Método:",
        btnResolver: "RESOLVER",
        tituloAjustes: "Ajustes de Interfaz"
    },
    en: {
        tituloPrincipal: "DIFFERENTIAL EQUATIONS",
        btnAjustes: "⚙️ Settings & more...",
        btnCambio: "🔄 Switch",
        tituloEntrada: "Input",
        placeholderEdo: "Type your ODE here...",
        tituloParametros: "Method Parameters:",
        btnResolver: "SOLVE",
        tituloAjustes: "Interface Settings"
    },
    pt: {
        tituloPrincipal: "EQUAÇÕES DIFERENCIAIS",
        btnAjustes: "⚙️ Configurações e mais...",
        btnCambio: "🔄 Mudar",
        tituloEntrada: "Entrada",
        placeholderEdo: "Digite sua EDO aqui...",
        tituloParametros: "Parâmetros do Método:",
        btnResolver: "RESOLVER",
        tituloAjustes: "Configurações de Interface"
    }
};

function cambiarIdioma(idiomaSeleccionado) {
    const diccionario = traducciones[idiomaSeleccionado];

    // Buscar todos los elementos en el HTML que tengan la etiqueta "data-i18n"
    document.querySelectorAll('[data-i18n]').forEach(elemento => {
        const clave = elemento.getAttribute('data-i18n');
        
        // Si la traducción existe en nuestro diccionario para esa palabra
        if (diccionario[clave]) {
            // Si es la cajita de texto, cambiamos el texto fantasma (placeholder)
            if (elemento.tagName === 'INPUT') {
                elemento.placeholder = diccionario[clave];
            } else {
                // Si es un título o botón, cambiamos el texto normal
                elemento.innerText = diccionario[clave];
            }
        }
    });
}

// --- Lógica: Cambio de Idioma ---
document.getElementById('select-idioma').addEventListener('change', (e) => {
    const idioma = e.target.value; // Agarra 'es', 'en' o 'pt'
    cambiarIdioma(idioma); // Ejecuta el motor de traducción
});