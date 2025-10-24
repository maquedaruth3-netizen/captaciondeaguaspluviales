let resultChart = null;
let currentChartType = 'bar';
let calculoData = {};

document.addEventListener('DOMContentLoaded', function() {
    inicializarEventListeners();
    configurarValoresPorDefecto();
});

function inicializarEventListeners() {
    const btnCalcular = document.getElementById('btnCalcular');
    if (btnCalcular) btnCalcular.addEventListener('click', calcularArea);

    const btnReiniciar = document.getElementById('btnReiniciar');
    if (btnReiniciar) btnReiniciar.addEventListener('click', reiniciar);

    document.querySelectorAll('.btn-chart').forEach(btn => {
        btn.addEventListener('click', function() {
            cambiarTipoGrafica(this.dataset.type);
        });
    });

    const btnDescargar = document.getElementById('btnDescargar');
    if (btnDescargar) btnDescargar.addEventListener('click', descargarGrafica);

    document.querySelectorAll('.btn-share').forEach(btn => {
        if (btn.id !== 'btnCopiar') {
            btn.addEventListener('click', function() {
                compartirResultados(this.dataset.platform);
            });
        }
    });

    const btnCopiar = document.getElementById('btnCopiar');
    if (btnCopiar) btnCopiar.addEventListener('click', copiarEnlace);
}

function configurarValoresPorDefecto() {
    const precipitacionInput = document.getElementById('precipitacion');
    if (!precipitacionInput) return;
    precipitacionInput.placeholder = 'mm/año (Zinacantepec: ~800 mm)';

    precipitacionInput.addEventListener('click', function() {
        if (!this.value) this.value = '800';
    });
}

function calcularArea() {
    const areaCaptacion = parseFloat(document.getElementById('areaCaptacion').value);
    const precipitacion = parseFloat(document.getElementById('precipitacion').value);
    const material = document.getElementById('material').value;
    const consumo = document.getElementById('consumo').value ? parseFloat(document.getElementById('consumo').value) : 0;

    if (!areaCaptacion || !precipitacion || !material) {
        mostrarMensaje('Por favor, complete todos los campos obligatorios', 'error');
        return false;
    }

    if (areaCaptacion <= 0 || precipitacion <= 0) {
        mostrarMensaje('Los valores deben ser mayores a cero', 'error');
        return false;
    }

    const eficiencia = parseFloat(material);
    const aguaCaptableAnual = (areaCaptacion * precipitacion * eficiencia) / 1000;
    const aguaCaptableMensual = aguaCaptableAnual / 12;
    const costoPorMetroCubico = 15;
    const potencialAhorro = aguaCaptableAnual * costoPorMetroCubico;

    let porcentajeAhorro = 0;
    if (consumo > 0) {
        const consumoAnual = consumo * 12;
        porcentajeAhorro = (aguaCaptableAnual / consumoAnual) * 100;
    }

    calculoData = {
        areaCaptacion,
        precipitacion,
        eficiencia: eficiencia * 100,
        aguaCaptableAnual: Math.round(aguaCaptableAnual * 100) / 100,
        aguaCaptableMensual: Math.round(aguaCaptableMensual * 100) / 100,
        potencialAhorro: Math.round(potencialAhorro * 100) / 100,
        porcentajeAhorro: Math.round(porcentajeAhorro * 100) / 100,
        consumo
    };

    mostrarResultados();

    setTimeout(() => {
        inicializarGrafica();
    }, 300);

    return false;
}

function mostrarResultados() {
    const resultadoDiv = document.getElementById('resultado');
    if (!resultadoDiv) return;

    let contenidoHTML = `
        <h2 class="result-title">Resultados de Captación</h2>
        <div class="result-grid">
            <div class="result-item">
                <div class="result-label">Agua Captable Anual</div>
                <div class="result-value">${calculoData.aguaCaptableAnual} m³</div>
            </div>
            <div class="result-item">
                <div class="result-label">Agua Captable Mensual</div>
                <div class="result-value">${calculoData.aguaCaptableMensual} m³</div>
            </div>
            <div class="result-item">
                <div class="result-label">Potencial Ahorro Anual</div>
                <div class="result-value">$${calculoData.potencialAhorro}</div>
            </div>
    `;

    if (calculoData.consumo > 0) {
        contenidoHTML += `
            <div class="result-item">
                <div class="result-label">Porcentaje de Ahorro</div>
                <div class="result-value">${calculoData.porcentajeAhorro}%</div>
            </div>
        `;
    }

    contenidoHTML += `
        </div>
        <div class="tip">
            <h3>💡 Recomendación</h3>
            <p>Con ${calculoData.aguaCaptableAnual} m³ de agua anuales puedes satisfacer necesidades como riego de jardines, limpieza de exteriores y uso en sanitarios. ¡Es un excelente comienzo para tu autonomía hídrica!</p>
        </div>
    `;

    resultadoDiv.innerHTML = contenidoHTML;
    resultadoDiv.classList.add('active');

    document.getElementById('graficaSection')?.classList.add('active');
    document.getElementById('shareSection')?.classList.add('active');
}

function inicializarGrafica() {
    const canvas = document.getElementById('resultChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    if (resultChart) resultChart.destroy();

    const config = {
        type: currentChartType,
        data: obtenerDatosGrafica(),
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { position: 'top', labels: { font: { size: 14 } } },
                title: { display: true, text: 'Resumen de Captación de Agua', font: { size: 16, weight: 'bold' } },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            const label = context.label || context.dataset?.label || '';
                            const value = typeof context.parsed === 'object' && context.parsed !== null
                                ? (context.parsed.y ?? context.parsed)
                                : context.parsed;
                            return `${label}: ${value} m³`;
                        }
                    }
                }
            }
        }
    };

    resultChart = new Chart(ctx, config);
}

function obtenerDatosGrafica() {
    const labels = ['Agua Captable Anual', 'Agua Captable Mensual'];
    const datos = [calculoData.aguaCaptableAnual, calculoData.aguaCaptableMensual];
    const colores = ['rgba(26, 95, 122, 0.8)', 'rgba(21, 152, 149, 0.8)'];
    const bordes = ['rgba(26, 95, 122, 1)', 'rgba(21, 152, 149, 1)'];

    if (calculoData.potencialAhorro > 0) {
        labels.push('Potencial Ahorro ($)');
        datos.push(calculoData.potencialAhorro);
        colores.push('rgba(87, 197, 182, 0.8)');
        bordes.push('rgba(87, 197, 182, 1)');
    }

    if (calculoData.porcentajeAhorro > 0) {
        labels.push('Porcentaje Ahorro (%)');
        datos.push(calculoData.porcentajeAhorro);
        colores.push('rgba(44, 62, 80, 0.8)');
        bordes.push('rgba(44, 62, 80, 1)');
    }

    return {
        labels,
        datasets: [{
            label: 'Resultados',
            data: datos,
            backgroundColor: colores,
            borderColor: bordes,
            borderWidth: 2,
            borderRadius: currentChartType === 'bar' ? 8 : 0,
            borderSkipped: false,
        }]
    };
}

function cambiarTipoGrafica(tipo) {
    currentChartType = tipo;

    document.querySelectorAll('.btn-chart').forEach(btn => btn.classList.remove('active'));
    const btn = document.querySelector(`.btn-chart[data-type="${tipo}"]`);
    if (btn) btn.classList.add('active');

    inicializarGrafica();
}

function mostrarMensaje(mensaje, tipo = 'info') {
    document.querySelectorAll('.mensaje-alerta').forEach(msg => msg.remove());

    const mensajeDiv = document.createElement('div');
    mensajeDiv.className = 'mensaje-alerta';

    let backgroundColor = '#2196F3'; 
    if (tipo === 'success') backgroundColor = '#4CAF50'; 
    if (tipo === 'error') backgroundColor = '#f44336'; 

    mensajeDiv.style.backgroundColor = backgroundColor;
    mensajeDiv.innerHTML = `<span>${mensaje}</span><button onclick="this.parentElement.remove()">&times;</button>`;
    document.body.appendChild(mensajeDiv);

    setTimeout(() => mensajeDiv.remove(), 5000);
}

function reiniciar() {
    document.getElementById('formAreaCaptacion')?.reset();
    document.getElementById('resultado')?.classList.remove('active');
    document.getElementById('graficaSection')?.classList.remove('active');
    document.getElementById('shareSection')?.classList.remove('active');

    if (resultChart) {
        resultChart.destroy();
        resultChart = null;
    }

    calculoData = {};
    mostrarMensaje('Calculadora reiniciada', 'info');
}


