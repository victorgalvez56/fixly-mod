# Design System: Fixly

Fuente de verdad para generar pantallas nuevas en Google Stitch. Los valores salen
del sistema real de `index.html`, no de una plantilla. Una pantalla generada con
este documento tiene que poder ponerse al lado de la landing sin desentonar.

**Producto:** app de mantenimiento vehicular para Perú. El usuario escribe su placa,
la app reconoce su auto y le dice qué mantenimiento le toca, cuánto debería costarle
y qué documentos vencen.

**Quién la usa:** conductor de aplicativo en Lima. Auto propio de 8 a 15 años.
Unos 45 años. No sabe de mecánica. Android de gama baja, al sol, pantalla sucia,
a veces manejando. El contraste no es una preferencia estética: es un requisito
funcional.

---

## 1. Atmósfera visual

Una **ficha de control** para autos que trabajan. Oscura, utilitaria y precisa,
con la calidez del dorado como única concesión. La referencia no es una app de
finanzas ni un dashboard corporativo: es un instrumento de taller bien hecho —
legible de un vistazo, sin adornos, con la información que importa en grande.

- **Densidad: 4–5 (equilibrada).** Respira, pero nunca es una galería de arte.
  El usuario viene a resolver algo, no a contemplar.
- **Varianza: 6 (asimétrica controlada).** El héroe es un split desbalanceado.
  Las secciones alternan peso. Nada centrado por defecto, nada caótico.
- **Movimiento: 6 (fluido).** El movimiento explica o no existe.

Tono de voz: directo, peruano, sin susto artificial. *"Venció hace 12 días"*,
nunca *"¡Atención! Su documento presenta una irregularidad"*. El dato ya pesa solo.

---

## 2. Paleta y roles

### Base
- **Tinta** `#121416` — Fondo principal. Negro cálido, nunca `#000000`.
- **Superficie** `#1c2023` — Tarjetas, paneles, contenedores elevados.
- **Papel** `#f4f6f4` — Texto principal y fondos invertidos (la placa vehicular).
- **Papel apagado** `#dbe0e2` — Texto secundario sobre superficie oscura.
- **Polvo** `#b7c0c7` — Etiquetas, metadatos.
- **Polvo tenue** `#8d979f` — Texto terciario, notas al pie.
- **Línea** `rgba(244,246,244,0.18)` — Bordes estructurales de 1px.
- **Línea suave** `rgba(244,246,244,0.10)` — Divisiones internas.

### Marca — un solo acento
- **Dorado** `#d8b24c` — CTA principal, acentos, estado activo, foco. Saturación 64%.
- **Dorado claro** `#ebcb74` — Estados hover y texto dorado sobre superficie.
- **Tinta sobre dorado** `#3e3211` — Texto dentro de superficies doradas.

### Estado — semántico, separado del acento
- **Vigente** `#86d2b0` — Verde salvia. Documento al día.
- **Por vencer** `#e8a65b` — Ámbar. La fecha se acerca.
- **Vencido** `#f08c83` — Coral. La fecha pasó.

> **La regla que sostiene el sistema.** El dorado de marca está a solo **12° de
> distancia** del ámbar de "por vencer" en el círculo cromático (hue 44 contra
> hue 32). Al sol, en una pantalla barata, se confunden. Por eso se separan por
> **rol, no por confianza en el ojo**:
>
> - El dorado **nunca** aparece dentro de un chip, barra o etiqueta de estado.
> - El ámbar y el coral **nunca** aparecen en un botón, enlace o elemento de marca.
>
> Si un CTA se pinta de ámbar, el sistema de estado deja de significar algo.

---

## 3. Tipografía

- **Display — `Barlow Semi Condensed`** (600, 700, 800).
  Titulares, cifras de multa, la placa y nombres de documento. Condensada: mete
  mucho texto en el ancho de un celular sin encoger el tamaño. Siempre con
  `letter-spacing` ajustado o negativo en tamaños grandes.

- **Cuerpo — `Atkinson Hyperlegible`** (400, 700).
  Todo lo que se lee de verdad. Es una tipografía diseñada para baja visión: sus
  formas se distinguen entre sí incluso con la pantalla sucia y a contraluz. No es
  una elección estética, es la elección correcta para este usuario.

- **Datos — `IBM Plex Mono`** (500, 600, 700).
  Fechas, códigos de infracción, kilometrajes, etiquetas en mayúscula con
  `letter-spacing` amplio. Todo lo que viene de un registro y no lo escribimos nosotros.

### Escala
| Rol | Tamaño | Familia |
|---|---|---|
| Titular de pantalla | `clamp(44px, 5.5vw, 72px)` / interlineado 0.95 | Display 800 |
| Titular de sección | `clamp(43px, 5vw, 67px)` | Display 800 |
| Cifra destacada | `clamp(37px, 4.6vw, 62px)` | Display 800, tabular |
| Título de tarjeta | 21–30px | Display 700 |
| Cuerpo | 16–18px / interlineado 1.6 | Cuerpo 400 |
| Cuerpo menor | 14px | Cuerpo 400 |
| Etiqueta | 10–11px, mayúscula, `letter-spacing: .14em` | Mono 500 |

### Reglas duras
- **Interlineado mínimo 0.95 en titulares en MAYÚSCULA.** El español lleva tildes:
  con una condensada por debajo de 0.95, la Í de "DÍA" choca con la línea de arriba.
- **Nunca por debajo de 14px** para texto de lectura. Ni la letra chica.
- **Sin cursivas.** El énfasis se hace con peso o color, nunca inclinando la condensada.
- **Cifras con `font-variant-numeric: tabular-nums`** siempre que se comparen.
- `text-wrap: balance` en titulares, `text-pretty` en párrafos.

---

## 4. Componentes

**Botones.** Altura 56px, radio 15px, sin borde. Primario: relleno dorado con texto
tinta. Secundario: fantasma con borde de línea. Terciario: solo texto subrayado.
Al pulsar, hundimiento físico (`scale(.97)`) y una onda desde el punto de contacto.
Sin resplandores externos. Un solo botón dorado por pantalla.

**Vidrio líquido.** El vidrio no es una capa borrosa, es un material con canto:
`backdrop-filter: blur(22px) saturate(132%)`, un borde de 1px hecho de degradado
enmascarado —claro arriba a la izquierda, con un roce dorado abajo a la derecha—,
brillo interior superior y sombra interior inferior. Dos anillos de 1px alrededor
simulan la bandeja donde la pieza se encaja. Solo en elementos fijos o del héroe:
nunca sobre contenedores que hacen scroll.

**Tarjetas.** Radios 15 / 22 / 30px según jerarquía. Solo cuando la elevación
comunica algo. Sombras teñidas del fondo, nunca negras puras.

**Fila de estado.** El componente central de la app. Barra de color de 4px a la
izquierda, nombre del documento en display, chip con la **palabra** del estado,
línea de detalle en mono, y si venció, la cifra de multa como el elemento más
grande de la tarjeta.

> **La etiqueta manda, el color ayuda.** Ningún estado se comunica solo con color.
> Siempre lleva palabra, barra y explicación. Hay daltónicos manejando.

**Campo de placa.** Es el gesto de entrada del producto y debe **parecer una placa
peruana**: fondo claro `#f4f6f4`, franja dorada de 15px a la izquierda, texto en
display 800 con `letter-spacing: .12em`, mayúsculas, formato `ABC-123`. El
placeholder muestra el patrón, no una instrucción.

**Formularios.** Etiqueta arriba, campo, error debajo. Alto 56px. Foco con anillo
dorado de 3px. Nunca `outline: none` sin reemplazo.

**Carga.** Esqueletos con las dimensiones exactas del contenido que van a
reemplazar, con brillo desplazándose. Nunca un círculo giratorio.

**Vacío.** Composición que explica cómo llenar la pantalla, no un "sin datos".

---

## 5. Layout

- Contenedor máximo 1280px centrado, con respiración lateral de `clamp(20px, 5vw, 64px)`.
- **Héroe asimétrico:** copy a la izquierda, ficha de consulta a la derecha. Nunca centrado.
- **CSS Grid antes que cálculos con flex.** Nada de `calc(33% - 1rem)`.
- **Sin elementos superpuestos.** Cada pieza ocupa su zona.
- Secciones separadas por `clamp(3rem, 8vw, 6rem)`.
- Alturas completas con `min-h-[100dvh]`, nunca `h-screen`.
- **Bajo 768px todo colapsa a una columna.** Sin excepción, sin scroll horizontal.
- Área táctil mínima 44px, y en la práctica 56px porque el usuario tiene el celular
  en la mano dentro de un auto.
- `env(safe-area-inset-*)` en layouts a sangre.

---

## 6. Movimiento

Curvas: `cubic-bezier(0.22, 1, 0.36, 1)` para lo que llega,
`cubic-bezier(0.2, 0.8, 0.2, 1)` para lo que cambia. Nunca `linear` ni `ease-in-out`.

| Duración | Para qué |
|---|---|
| 100 ms | Respuesta al toque |
| 140 ms | Algo desaparece |
| 160 ms | Un estado cambia de color |
| 200 ms + 60 ms de escalón | Una tarjeta llega |
| **240 ms** | **Techo absoluto. Nada dura más.** |

- **La revelación es lo único que merece coreografía.** Cuando llega el resultado
  de una consulta, las filas entran escalonadas y **ordenadas por gravedad**: lo
  vencido primero, para que el ojo llegue al problema sin que un color parpadee.
- **Nada pulsa para llamar la atención.** Sin latidos, sin brillos, sin flechas
  que rebotan. Solo los indicadores de estado activo respiran.
- **Una vibración de 15 ms**, y solo si hay algo vencido. Si todo está bien, silencio.
- Solo `transform` y `opacity`. Nunca `top`, `left`, `width` ni `height`.
- Los efectos de puntero (magnético, destello) van detrás de
  `@media (hover: hover) and (pointer: fine)`: no existen en el celular.
- `prefers-reduced-motion` desactiva todo, incluido el scroll suave por JS.
- **El revelado por scroll debe fallar abierto.** Contenido invisible porque un
  observer no disparó es mucho peor que no tener animación.

### Gestos
Tocar y desplazar en vertical. **Nada más.**

- **Sin jalar-para-recargar.** Cada consulta cuesta créditos de API reales; un
  gesto de recarga es un botón de gastar dinero que además invita a repetirlo.
  La respuesta correcta es mostrar *"consultado hace 2 h"*.
- **Sin deslizar entre tarjetas.** Esconde información que debe verse junta.
- **Sin mantener presionado.** No se descubre solo.

---

## 7. Prohibido

**Del sistema Fixly**
- El dorado dentro de un estado, o el ámbar y el coral en un botón.
- Estado comunicado solo con color, sin palabra.
- Interlineado bajo 0.95 en titulares en mayúscula.
- Texto de lectura por debajo de 14px.
- Barra de estado o teclado falsos dibujados en mockups de celular.
- Prometer datos de mantenimiento que todavía no existen para ese modelo.
- Números en formato que no sea peruano: coma para miles, punto para decimales
  (`S/2,475.00`).
- Mayúsculas iniciales estilo inglés en botones. El español va en oración:
  *"Consultar placa"*, no *"Consultar Placa"*.

**Generales**
- Emojis, en cualquier lugar.
- `Inter`, `Roboto`, `Arial` o tipografías de sistema.
- Serifas genéricas (`Times New Roman`, `Georgia`, `Garamond`).
- Negro puro `#000000`.
- Resplandores de neón o sombras con brillo exterior.
- Degradados morado-a-azul, y texto con relleno degradado en titulares.
- Cursores personalizados.
- Elementos superpuestos.
- Filas de tres tarjetas iguales *(ver nota abajo)*.
- Nombres genéricos ("Juan Pérez", "Acme"), cifras redondas falsas (`99.99%`, `50%`).
- Clichés de copy: "Potencia", "Sin fricción", "Revoluciona", "De última generación".
- Relleno de interfaz: "Desliza para explorar", flechas que rebotan.
- Enlaces rotos de Unsplash — usar `picsum.photos` o SVG.

---

## Dónde este documento se aparta del molde

Tres decisiones deliberadas, para que quien lea esto no las tome por descuido:

1. **`Atkinson Hyperlegible` en vez de una display de agencia.** Es una tipografía
   de accesibilidad. Para un usuario de 45 años, al sol, con la pantalla sucia,
   gana a cualquier grotesca de moda. La personalidad la pone la condensada.

2. **La landing tiene una fila de tres tarjetas iguales** en el roadmap, que está
   en la lista de prohibidos. Se mantuvo porque las tres etapas son genuinamente
   paralelas y comparables, que es el único caso donde esa estructura dice la
   verdad. **No la repliques en pantallas nuevas** sin ese argumento.

3. **Cuatro colores, no uno.** El dorado es el único acento; verde, ámbar y coral
   son semánticos y su presencia siempre significa algo sobre el vehículo. La
   restricción de "un solo acento" se cumple; los estados no cuentan como acento.
