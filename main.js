document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('formEncuesta');
    const resultadosDiv = document.getElementById('resultados');

    let respuestas = [];
    let contador = 0;
    const totalEjecutions = 3;

    const pregunta1 = document.getElementById('modtramite');
    const visitasIE = document.getElementById('visitasIE');
    const costoTrans = document.getElementById('costoTrans');
    const tiempoTraslado = document.getElementById('tiempoTraslado');

    function actualizarPreguntas() {
        if (pregunta1.value === '1') { // Solo virtual
            visitasIE.value = 0;
            costoTrans.value = 0;
            tiempoTraslado.value = 0;

            visitasIE.setAttribute('disabled', 'disabled');
            costoTrans.setAttribute('disabled', 'disabled');
            tiempoTraslado.setAttribute('disabled', 'disabled');
        } else {
            visitasIE.removeAttribute('disabled');
            costoTrans.removeAttribute('disabled');
            tiempoTraslado.removeAttribute('disabled');
        }
    }

    // Escuchar el cambio en la pregunta 1
    pregunta1.addEventListener('change', actualizarPreguntas);
    actualizarPreguntas();

    form.addEventListener('submit', (event) => {
        event.preventDefault();

        // Obtener respuestas del formulario
        const respuesta = {
            modTramite: pregunta1.value,
            tiempoLectura: parseInt(document.getElementById('tiempoLectura').value),
            tiempoLlenado: parseInt(document.getElementById('tiempoLlenado').value),
            tiempoTraslado: parseInt(document.getElementById('tiempoTraslado').value),
            tiempoInicio: parseInt(document.getElementById('tiempoInicio').value),
            tiempoResol: parseInt(document.getElementById('tiempoResol').value),
            tarifaTramite: parseFloat(document.getElementById('tarifaTramite').value),
            visitasIE: parseInt(visitasIE.value),
            costoTrans: parseFloat(costoTrans.value)
        };

        // Calcular el Valor Social del Tiempo (VST)
        let VST = respuesta.tiempoResol * 1692;

        // Guardar respuesta con VST
        respuesta.VST = VST;

        // Calcular la carga burocrática
        let cargaBurocratica = respuesta.tiempoLectura + respuesta.tiempoLlenado + respuesta.tiempoTraslado + respuesta.tiempoInicio + respuesta.tiempoResol + respuesta.tarifaTramite + (respuesta.visitasIE * respuesta.costoTrans) + respuesta.VST;

        // Agregar cargaBurocratica a la respuesta
        respuesta.cargaBurocratica = cargaBurocratica;

        // Guardar en el local storage
        localStorage.setItem(`respuesta_${contador + 1}`, JSON.stringify(respuesta));

        // Agregar respuesta al array
        respuestas.push(respuesta);

        // Mostrar cada respuesta en la consola
        console.log("Respuesta capturada:", respuesta);
        console.log("Carga burocrática:", cargaBurocratica);

        // Mostrar el contenido del local storage
        console.log("Contenido del local storage:", localStorage);

        // Mostrar el VST por alerta
        alert("Valor social del tiempo: " + VST + "\n" + "Carga burocrática: " + cargaBurocratica + "\nPresione [Aceptar] para continuar con la encuesta.");
        
        // Mostrar mensaje mientras se recopilan los datos
        contador++;
        if (contador < totalEjecutions) {
            alert(`Encuesta completada ${contador} de ${totalEjecutions}. Por favor, vuelve a llenar el formulario.`);
            form.reset();
            actualizarPreguntas(); // Reajustar las preguntas después de reiniciar el formulario
        }

        // Una vez que se ejecuta 3 veces, calcular los promedios
        if (contador === totalEjecutions) {
            calcularPromedios(respuestas);
        }
    });

    // Función para calcular los promedios
    function calcularPromedios(respuestas) {
        let sumas = {
            modTramite1: { total: 0, count: 0 },
            modTramite2: { total: 0, count: 0 },
            modTramite3: { total: 0, count: 0 }
        };

        respuestas.forEach(resp => {
            // Calcular la carga burocrática
            let cargaBurocratica = resp.cargaBurocratica;

            switch (resp.modTramite) {
                case '1':
                    sumas.modTramite1.total += cargaBurocratica;
                    sumas.modTramite1.count++;
                    break;
                case '2':
                    sumas.modTramite2.total += cargaBurocratica;
                    sumas.modTramite2.count++;
                    break;
                case '3':
                    sumas.modTramite3.total += cargaBurocratica;
                    sumas.modTramite3.count++;
                    break;
            }
        });

        // Calcular los promedios
        let promedios = {
            modTramite1: sumas.modTramite1.count > 0 ? (sumas.modTramite1.total / sumas.modTramite1.count).toFixed(2) : "N/A",
            modTramite2: sumas.modTramite2.count > 0 ? (sumas.modTramite2.total / sumas.modTramite2.count).toFixed(2) : "N/A",
            modTramite3: sumas.modTramite3.count > 0 ? (sumas.modTramite3.total / sumas.modTramite3.count).toFixed(2) : "N/A"
        };

        // Mostrar resultados en la página
        resultadosDiv.innerText = JSON.stringify({
            promedios: promedios,
            respuestas: respuestas
        }, null, 2);
    }
});
