document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById('formEncuesta');
    const resultadosDiv = document.getElementById('resultados');
    const pregunta1 = document.getElementById('modtramite');
    const visitasIE = document.getElementById('visitasIE');
    const costoTrans = document.getElementById('costoTrans');
    const tiempoTraslado = document.getElementById('tiempoTraslado');
    let respuestasJSON = []; // Array para guardar respuestas del JSON
  
    // Cargar datos desde respuestas.json
    fetch('respuestas.json')
    .then(response => {
      if (!response.ok) {
        throw new Error('No se pudo cargar el JSON');
      }
      return response.json();
    })
    .then(jsonData => {
      console.log('Datos JSON cargados:', jsonData);
      respuestasJSON = jsonData; // Guardar respuestas JSON iniciales
    })
    .catch(error => console.error('Error al cargar el JSON:', error));
  
    // Función para habilitar o deshabilitar los campos según la modalidad
    function actualizarPreguntas() {
        const isVirtualOnly = pregunta1.value === '1'; // Modalidad solo virtual
  
        visitasIE.disabled = isVirtualOnly;
        costoTrans.disabled = isVirtualOnly;
        tiempoTraslado.disabled = isVirtualOnly;
  
        if (isVirtualOnly) {
            visitasIE.value = 0;
            costoTrans.value = 0;
            tiempoTraslado.value = 0;
        }
    }
  
    // Escuchar el cambio en la pregunta 1
    pregunta1.addEventListener('change', actualizarPreguntas);
    actualizarPreguntas(); // Ejecutar al inicio para aplicar lógica inicial
  
    form.addEventListener('submit', (event) => {
        event.preventDefault();
  
        // Obtener respuesta del formulario
        const respuesta = {
            modTramite: pregunta1.value,
            tiempoLectura: parseInt(document.getElementById('tiempoLectura').value),
            tiempoLlenado: parseInt(document.getElementById('tiempoLlenado').value),
            tiempoTraslado: parseInt(document.getElementById('tiempoTraslado').value),
            tiempoInicio: parseInt(document.getElementById('tiempoInicio').value),
            tiempoResol: parseInt(document.getElementById('tiempoResol').value),
            tarifaTramite: parseFloat(document.getElementById('tarifaTramite').value),
            visitasIE: parseInt(visitasIE.value),
            costoTrans: parseFloat(costoTrans.value),
        };
  
        // Calcular Valor Social del Tiempo (VST)
        respuesta.VST = respuesta.tiempoResol * 1692;
  
        // Calcular la carga burocrática
        respuesta.cargaBurocratica =
            respuesta.tiempoLectura +
            respuesta.tiempoLlenado +
            respuesta.tiempoTraslado +
            respuesta.tiempoInicio +
            respuesta.tiempoResol +
            respuesta.tarifaTramite +
            respuesta.visitasIE * respuesta.costoTrans +
            respuesta.VST;
  
        console.log("Respuesta capturada:", respuesta);
        alert(`Valor social del tiempo: ${respuesta.VST}\nCarga burocrática: ${respuesta.cargaBurocratica}`);
  
        // Agregar la nueva respuesta al array de respuestas JSON
        respuestasJSON.push(respuesta);
  
        // Calcular y mostrar promedios al finalizar
        mostrarPromedios(respuestasJSON);
    });
  
    // Función para calcular y mostrar los promedios por modalidad
    function mostrarPromedios(respuestas) {
        const sumas = {
            '1': { total: 0, count: 0 },
            '2': { total: 0, count: 0 },
            '3': { total: 0, count: 0 }
        };
  
        respuestas.forEach(resp => {
            const { modTramite, cargaBurocratica } = resp;
            console.log(`Procesando respuesta: ${JSON.stringify(resp)}`); // Log de cada respuesta procesada
            if (sumas[modTramite]) {
                sumas[modTramite].total += cargaBurocratica;
                sumas[modTramite].count++;
            }
        });
  
        console.log('Sumas por modalidad:', sumas); // Log de sumas acumuladas
  
        const promedios = {
            '1': sumas['1'].count > 0 ? (sumas['1'].total / sumas['1'].count).toFixed(2) : 'N/A',
            '2': sumas['2'].count > 0 ? (sumas['2'].total / sumas['2'].count).toFixed(2) : 'N/A',
            '3': sumas['3'].count > 0 ? (sumas['3'].total / sumas['3'].count).toFixed(2) : 'N/A',
        };
  
        console.log('Promedios calculados:', promedios); // Log de los promedios
  
        alert(`Promedios de carga burocrática por modalidad:\n` +
            `Modalidad 1 (Solo virtual): ${promedios['1']}\n` +
            `Modalidad 2 (Virtual y presencial): ${promedios['2']}\n` +
            `Modalidad 3 (Solo presencial): ${promedios['3']}`);
  
        resultadosDiv.innerText = JSON.stringify({ promedios, respuestas }, null, 2);
    }
});
