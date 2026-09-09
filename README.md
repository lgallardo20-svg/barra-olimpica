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
- **El 1RM se estima con dos tablas distintas.** Las fórmulas clásicas (Epley,
  Brzycki) y los coeficientes por repeticiones vienen del powerlifting: asumen series
  al fallo, donde un triple se hace al ~92 % del máximo. En arranque y cargada la serie
  se corta por técnica mucho antes —un triple ronda el 87 %—, así que los movimientos
  olímpicos usan su propia tabla y muestran un rango, no un número exacto. En
  sentadillas y press se sigue promediando la tabla de fuerza con Epley y Brzycki.
  El número de series no influye: el máximo se estima siempre desde la mejor serie.
- **El RPE entra en el cálculo.** Las fórmulas asumen una serie llevada al fallo, así
  que sin RPE el resultado es un mínimo. Al indicarlo se cuentan las repeticiones en
  reserva (RPE 8 = quedaban 2, así que la serie pesa como una de 5 al límite), lo que
  reproduce la tabla de RPE de Reactive Training Systems. En los olímpicos solo cuenta
  la mitad del margen, porque ahí el RPE mide técnica tanto como esfuerzo.

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
