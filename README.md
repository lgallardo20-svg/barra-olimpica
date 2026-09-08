# Barra Olímpica

App de halterofilia para el celular: registra tus levantamientos, te da la tabla de
porcentajes de tu 1RM **con los discos exactos a poner en cada lado**, y te muestra
progreso, récords y proporciones entre movimientos.

Es una PWA de un solo archivo, sin dependencias ni build. Los datos se guardan en el
navegador del teléfono (`localStorage`); no hay servidor ni cuenta.

## Qué hace

| Pantalla | Para qué |
|---|---|
| **Hoy** | Tus 4 movimientos clave con el 1RM actual, calculadora de discos y el último entrenamiento. |
| **Porcentajes** | Tabla del 40 % al 105 % con el peso teórico, el peso realmente montable y los discos por lado. Incluye el cálculo inverso (¿qué % es este peso?) y la estimación de 1RM desde una serie. |
| **Registrar** | Series, reps, peso y RPE. Mientras escribes el peso te dice a qué % va, qué discos poner y si sería PR. |
| **Historial** | Sesiones por fecha, tonelaje y series de los últimos 30 días. |
| **Progreso** | Récord acumulado por movimiento, PR por número de reps, volumen semanal y diagnóstico de proporciones. |
| **Ajustes** | Barra, collarines y discos disponibles, movimientos, favoritos y copia de seguridad. |

Dos decisiones que conviene conocer:

- **El redondeo respeta tu gimnasio.** «A cargar» nunca propone un peso que no puedas
  montar con los discos que declaraste en Ajustes, y los muestra como los cargarías:
  los más pesados primero.
- **Las estimaciones de 1RM son conservadoras en los olímpicos.** En arranque, cargada
  y envión se usa la tabla de coeficientes por repeticiones y se avisa a partir de
  3 reps, porque ahí la serie mide técnica y aguante, no fuerza máxima. En sentadillas
  y press se promedia esa tabla con Epley y Brzycki.

## Instalarla en el celular

Con el repo publicado en GitHub Pages (**Settings → Pages → Source: main / root**),
abre `https://TU_USUARIO.github.io/TU_REPO/` en el teléfono y usa «Añadir a pantalla
de inicio» (Chrome) o «Compartir → Añadir a inicio» (Safari). Queda como una app: se
abre a pantalla completa y funciona sin conexión gracias al service worker.

También puedes copiar la carpeta al teléfono y abrir `index.html` desde el gestor de
archivos. Funciona, pero no se instala como app ni queda offline garantizado.

## Copia de seguridad

Los datos viven solo en ese navegador: si borras los datos del sitio, se van. En
**Ajustes → Copia de seguridad** pulsa *Generar copia*, copia el texto y guárdalo donde
quieras. *Restaurar* lo devuelve tal cual. Hazlo cada pocas semanas.

## Archivos

```
index.html          la app entera (HTML + CSS + JS)
manifest.json       datos de instalación como PWA
sw.js               service worker: funciona sin conexión
icon.svg            icono (+ icon-maskable.svg para Android)
test.js             67 pruebas de la lógica
seed.js             datos de ejemplo para revisar el diseño
mobile-test.html    tres pantallas de 390 px en paralelo
check.sh            ejecuta las pruebas y saca capturas
build-artifact.sh   genera artifact.html para publicar como Artifact
```

`index.html` es la única fuente de verdad. `artifact.html` se genera desde él con
`build-artifact.sh` y no se versiona.

## Desarrollo

No hace falta Node ni servidor: la app es un archivo estático. Las pruebas se ejecutan
con Chrome en modo headless, que es lo que hace `check.sh`:

```bash
bash check.sh shots
```

Ejecuta las 67 pruebas (sale con código 1 si alguna falla) y deja una captura de tres
pantallas de móvil en `capturas/movil.png`. Requiere Chrome instalado en la ruta
estándar de Windows; si usas otro sistema, ajusta la variable `CHROME` del script.
