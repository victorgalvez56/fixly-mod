# Prompts

Dos prompts para trabajar la landing con otra herramienta. Hacen cosas distintas
y **no son intercambiables**: usar el equivocado cuesta trabajo ya hecho.

| Cuál | Qué hace | Cuándo |
|---|---|---|
| **A · Modificar** | Trabaja sobre el `index.html` actual y solo agrega lo nuevo | Por defecto, casi siempre |
| **B · Reconstruir** | Escribe una landing desde cero con el sistema de marca | Solo si quieres empezar de nuevo a propósito |

El prompt B tira el sistema de movimiento, el vidrio líquido, las trece
correcciones de accesibilidad y tres bugs ya resueltos. Que se vea bien no
significa que no haya perdido nada.

---

## A · Modificar la landing para una app móvil

```
Esto es una MODIFICACIÓN de un archivo que ya existe, no una reconstrucción.
Trabaja sobre el index.html actual. Si reescribes la página desde cero, el
resultado está mal aunque se vea bien: se pierden correcciones de accesibilidad,
un sistema de movimiento y tres bugs ya resueltos.

Objetivo del cambio: hoy la página se lee como una herramienta web que consulta
placas. Tiene que leerse como la landing de una APP MÓVIL de mantenimiento
vehicular, donde la consulta por placa es apenas la puerta de entrada.

── NO TOQUES NADA DE ESTO ──
· El bloque :root completo. Los tokens de color, radios y curvas son el sistema
  de marca y están verificados. Ni un hex nuevo.
· La clase .glass y su canto refractivo (::before con degradado enmascarado),
  el doble bisel de .lookup-card y .whatsapp-card, y el reflejo especular.
· Todo el sistema de movimiento: el IntersectionObserver de [data-reveal] con su
  red de seguridad que falla abierto, el parallax del héroe por
  animation-timeline, .brand-marquee, los contadores de .impact-card, el
  ocultamiento de .site-nav al bajar y las ondas .ripple.
· El campo #plate y su lógica: el autoformato conserva la posición del cursor a
  propósito. No lo simplifiques.
· El #plate-result con su esqueleto y sus filas escalonadas ordenadas por gravedad.
· Los bloques @media (prefers-reduced-motion) en ambos sentidos.
· Las correcciones ya aplicadas: fuentes por <link> con preconnect, width/height
  en las imágenes con height:auto en CSS, scroll-margin-top, skip link,
  touch-action, safe-area-inset, autocomplete, tabular-nums, text-wrap.
· Las secciones existentes y sus clases: .overview, .roadmap-section,
  .risk-section, .maintenance-section, .states-section, .whatsapp-section.

── QUÉ CAMBIAR ──

1. HÉROE. Junto a la ficha de consulta, agrega un teléfono con la app corriendo.
   Composición asimétrica: copy a la izquierda, ficha y teléfono a la derecha,
   el teléfono ligeramente detrás y desplazado. En móvil, el teléfono va debajo
   del copy y la ficha desaparece del héroe.

2. SECCIÓN NUEVA "Así se ve en tu teléfono", entre .overview y .roadmap-section.
   Tres bloques en zigzag de dos columnas alternando lado — nunca tres tarjetas
   iguales en fila. Cada bloque: un teléfono a un lado, y al otro un título en
   condensada con dos o tres líneas de explicación.
   Los tres teléfonos muestran:
     a) Estado del auto: la placa arriba, y filas de estado con barra de color a
        la izquierda, palabra del estado en un chip, y la cifra de multa grande
        en las vencidas.
     b) Plan de mantenimiento: línea de tiempo vertical por KILOMETRAJE, no por
        fechas. Cada hito con el kilometraje en monoespaciada y el servicio en
        condensada. Los pasados atenuados, el próximo con la barra dorada.
     c) Revisar proforma: lista de ítems de un presupuesto de taller, cada uno
        con precio y un veredicto de tres valores (normal, caro, innecesario)
        marcado con palabra y barra, nunca solo color.

3. LA FICHA DE CONSULTA se queda y sigue funcionando, pero cambia de rol: deja
   de ser el producto y pasa a ser una muestra. Ajusta su copy para que diga que
   es una parte de lo que hará la app.

4. ROADMAP. Conserva la fila de tres tarjetas: las tres etapas son genuinamente
   paralelas y comparables, que es el único caso donde esa estructura dice la
   verdad. No la conviertas en zigzag.

── MARCOS DE TELÉFONO — la parte que más se hace mal ──
Los teléfonos se DIBUJAN en HTML y CSS: un contenedor con border-radius grande,
borde de 1px y la interfaz dentro como markup real, con las tipografías reales
del sistema. Nítidos, responsive y sin peso.

NUNCA generes las pantallas como imagen. Los modelos de imagen deforman el texto
de interfaz y el mockup queda con letras rotas.

Dentro del marco, NO dibujes barra de estado del sistema ni teclado. En un
celular real se ven duplicados y delatan el mockup al instante.

── IMÁGENES A GENERAR ──
Solo dos, y solo como atmósfera. Prompts en inglés: los modelos responden mejor.

  1. Reemplazo del héroe (opcional, si mejora la actual):
     "interior of an older working sedan at dawn, view over the dashboard toward an
     empty road, warm low sunlight, dust on the windshield, muted desaturated palette,
     deep warm blacks, cinematic, shallow depth of field, no people, no text"

  2. Para la sección de proforma:
     "close crop of a mechanic's hands holding a printed service quote in a dim garage,
     warm work light from one side, grease on fingers, shallow focus, muted colors,
     documentary photography, no faces, no legible text"

A ambas: gradiente de oscurecimiento hacia #121416 y saturación bajada, para que
ninguna compita con el dorado. Con width y height explícitos, height:auto en CSS,
y loading="lazy" salvo la del héroe.

── REGLAS DE MARCA QUE APLICAN A LO NUEVO ──
· El dorado #d8b24c está a 12° del ámbar #e8a65b en el círculo cromático. Se
  separan por rol: el dorado nunca dentro de un estado, el ámbar y el coral nunca
  en un botón.
· Ningún estado se comunica solo con color: siempre palabra, barra y explicación.
· Un solo botón dorado por pantalla.
· Interlineado mínimo 0.95 en titulares MAYÚSCULA: en español las tildes chocan.
· Movimiento nuevo con la curva cubic-bezier(0.22, 1, 0.36, 1), techo 240 ms,
  solo transform y opacity. Los teléfonos entran con [data-reveal], reutilizando
  el observer que ya existe. No agregues una segunda librería de animación.
· Sin emojis. Iconos como SVG en línea.
· Áreas táctiles de 56 px.

── NO REINTRODUZCAS ESTOS BUGS ──
Ya estaban y ya se arreglaron:
1. Un input con width:100% dentro de un flex con space-between empuja el botón
   fuera y lo corta.
2. Poner width/height en un <img> sin height:auto en CSS: el atributo gana sobre
   aspect-ratio y deforma la imagen.
3. Un botón que cambia de ancho al mostrar su spinner.
4. Interlineado por debajo de 0.95 en titulares en mayúscula.

── ENTREGA ──
El index.html completo y funcional, sin "// resto igual" ni recortes. Al final,
en dos líneas: qué cambiaste y qué conservaste sin tocar.
```

**Al usarlo.** El bloque *NO TOQUES* es la mitad del valor. Casi toda herramienta,
ante un archivo largo, prefiere reescribirlo antes que editarlo — nombrar las
clases concretas es lo que lo evita. **Si el resultado vuelve más corto que el
archivo actual, lo reescribió.** Compara el número de líneas antes de aceptarlo.

---

## B · Reconstruir desde cero

Solo si decides empezar de nuevo. Produce una landing nueva con el sistema de
marca correcto, pero sin nada de lo construido después.

```
Construye la landing de producto de una app móvil de mantenimiento vehicular.
Genera también las imágenes que necesites, con las instrucciones del bloque
IMÁGENES.

── EL PRODUCTO ──
Fixly. Una app móvil que le dice al dueño de un auto todo lo que su auto necesita.
Escribes tu placa una vez, la app reconoce marca, modelo y año, y desde ahí:
  - qué mantenimiento le toca según el kilometraje de ESE modelo
  - cuánto debería costar cada servicio, para detectar si el taller cobra de más
  - qué documentos están por vencer (SOAT, revisión técnica) y la multa si vencieron
  - avisos antes de cada fecha, no el día que ya no puedes hacer nada
  - historial de lo hecho, que sube el valor del auto al venderlo

── QUIÉN LO USA ──
Conductor que vive de su auto. Vehículo propio de 8 a 15 años. Unos 45 años.
No sabe de mecánica y no quiere aprender. Android de gama baja, al sol, pantalla
sucia, a veces dentro del auto. Llega desde un enlace en redes.
El contraste no es preferencia estética: es requisito funcional.

── ESTADO REAL — respétalo, no lo maquilles ──
La app NO está publicada todavía.
  - Prohibidos los botones "Descargar en App Store / Google Play". No existen, y un
    botón que no lleva a ningún lado quema la confianza en el primer segundo.
  - La acción real es dejar el WhatsApp para avisar cuando salga.
  - Sin testimonios, logos de clientes ni cifras de usuarios inventadas.
  - Donde falte un dato real, deja un marcador visible como [TU CIFRA].

── ESTRUCTURA ──
1. HÉROE asimétrico, nunca centrado. Copy a la izquierda: un titular corto en
   condensada pesada que plantea el PROBLEMA del usuario, no la función del
   producto. A la derecha, el teléfono con la app. Una sola llamada a la acción.
2. EL PROBLEMA. Por qué tu auto no te avisa: el manual está en un cajón o nunca
   estuvo, el mecánico sabe qué le toca y tú no, y esa diferencia se paga en cada
   visita.
3. QUÉ HACE LA APP. Cuatro bloques en zigzag de dos columnas alternando lado —
   nunca tres tarjetas iguales en fila. Cada bloque con su pantalla de app al lado.
4. EL COSTO DE NO SABER. Las multas por documentos vencidos, con la cifra como el
   elemento más grande de la sección.
5. DE DÓNDE SALEN LOS DATOS. Fuentes públicas oficiales. Qué NO se pide: ni
   documento de identidad, ni datos del titular, ni acceso a nada. Esta sección
   existe porque el usuario desconfía, y con razón.
6. CIERRE. La misma acción del héroe, repetida. Una sola.

Una sola acción primaria en toda la página. Nunca tres botones compitiendo.

── SISTEMA DE MARCA (aplícalo tal cual) ──
Fondo tinta #121416 (negro cálido, nunca #000000) · superficie #1c2023
Líneas rgba(244,246,244,0.18) · texto #f4f6f4 · texto tenue #8d979f
Acento único dorado #d8b24c, con #ebcb74 para hover
Estado: vigente #86d2b0 · por vencer #e8a65b · vencido #f08c83
Radios 15 / 22 / 30 px

Tipografía (Google Fonts):
  Barlow Semi Condensed 700/800 → titulares, cifras y la placa, en MAYÚSCULAS
  Atkinson Hyperlegible 400/700 → todo lo que se lee (es tipografía de
    accesibilidad: sobrevive a una pantalla sucia a contraluz)
  IBM Plex Mono 500 → fechas, códigos, etiquetas

REGLA DURA DE COLOR: el dorado está a solo 12° del ámbar de "por vencer" en el
círculo cromático. Se separan por rol, no por confiar en el ojo — el dorado nunca
aparece dentro de un estado, y el ámbar o el coral nunca aparecen en un botón.

REGLA DURA DE ESTADO: ningún estado se comunica solo con color. Siempre lleva
palabra, barra y explicación. Hay daltónicos manejando.

── IMÁGENES ──
Genera SOLO estas tres. Escribe los prompts de imagen en inglés: los modelos
responden mejor y evitas texto deformado.

  1. HÉROE — "interior of an older working sedan at dawn, view over the dashboard
     toward an empty road, warm low sunlight, dust on the windshield, muted desaturated
     palette, deep warm blacks, cinematic, shallow depth of field, no people, no text,
     photographic"

  2. TALLER — "close crop of a mechanic's hands holding a printed service quote in a
     dim garage, warm work light from one side, grease on fingers, shallow focus, muted
     colors, documentary photography, no faces, no legible text"

  3. TEXTURA — "subtle fine film grain texture, monochrome, transparent overlay,
     seamless" — se aplica como capa fija con pointer-events:none y opacidad muy baja,
     NUNCA sobre un contenedor con scroll.

Sobre todas las fotos: gradiente de oscurecimiento hacia el fondo tinta, y
saturación bajada, para que ninguna compita con el dorado.

NUNCA generes las pantallas de la app como imagen. Los modelos deforman el texto
de interfaz y el resultado se ve roto. Las pantallas se DIBUJAN en HTML y CSS:
un marco de teléfono hecho con border-radius y borde, y dentro la interfaz real
con la tipografía real. Se ve nítida, es responsive y pesa nada.

Dentro de esos marcos, no dibujes barra de estado del sistema ni teclado: en un
celular real se ven duplicados y delatan el mockup.

── MOVIMIENTO ──
Curva cubic-bezier(0.22, 1, 0.36, 1) para lo que entra. Sin linear ni ease-in-out.
Revelado escalonado al hacer scroll con IntersectionObserver, 200 ms por elemento
y 60 ms entre uno y otro. Techo absoluto: 240 ms. Nada dura más.
Nada pulsa ni late para llamar la atención.
Solo transform y opacity. Nunca top, left, width ni height.
Respeta prefers-reduced-motion, incluido el scroll suave por JS.
El revelado debe FALLAR ABIERTO: si el observer no dispara, el contenido igual se
muestra. Contenido invisible es peor que no tener animación.

── TÉCNICO ──
Un solo archivo HTML. Sin build, sin framework, sin dependencias.
Móvil primero: se diseña a 375 px y se agranda.
Imágenes con width y height explícitos (evita saltos de layout) y height:auto en
CSS — sin eso el atributo HTML gana sobre aspect-ratio y deforma la imagen.
La del héroe con fetchpriority="high"; las de abajo con loading="lazy".
Fuentes por <link> con preconnect, nunca @import.
Áreas táctiles de 56 px como mínimo.
scroll-margin-top en los destinos de ancla si la navegación flota.
touch-action: manipulation y env(safe-area-inset-*) en layouts a sangre.

── CINCO ERRORES QUE DEBES EVITAR ──
1. Interlineado apretado en titulares MAYÚSCULA en español. Las tildes de Í, Á, Ú
   chocan con la línea de arriba. Con una condensada, no bajes de 0.95.
2. Un input con width:100% dentro de un flex con space-between: empuja el botón
   fuera del contenedor y lo corta.
3. Un botón que cambia de ancho al mostrar su spinner. Dale min-width fija.
4. Emojis como iconografía. Usa SVG en línea, trazo consistente.
5. Formato numérico ajeno: coma para miles, punto para decimales (S/2,475.00).

── ENTREGA ──
El archivo HTML completo y funcional, sin marcadores de posición ni "// resto del
código aquí". Las tres imágenes generadas y referenciadas. Al final, en dos líneas,
qué asumiste y qué falta verificar.
```

---

## De dónde salen estos prompts

Los tokens, tipografías, radios y curvas están verificados contra `index.html`:
son el sistema real, no una plantilla.

La regla de los 12° entre el dorado y el ámbar salió de medir la paleta; no estaba
escrita en ningún lado. Los cuatro bugs listados son defectos reales encontrados y
corregidos en este repositorio, no advertencias genéricas.

Contexto completo en [`DESIGN.md`](DESIGN.md) y [`PANTALLAS.md`](PANTALLAS.md).
