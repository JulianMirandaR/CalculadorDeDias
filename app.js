function calcularDias() {
    var fechaInput = document.getElementById("fecha");
    var fechaNacimientoVal = fechaInput.value;
    var resultContainer = document.getElementById("resultado-container");
    var resultText = document.getElementById("resultado");

    // UI Elements for extra info
    var progressBar = document.getElementById("life-progress-bar");
    var progressText = document.getElementById("progress-percentage");
    var nextMilestoneText = document.getElementById("next-milestone");
    var zodiacText = document.getElementById("zodiac-sign");
    var birthDayText = document.getElementById("birth-day");
    var funFactText = document.getElementById("fun-fact");

    // Reset previous state
    resultContainer.classList.remove("visible");
    resultContainer.style.display = "none";

    // Reset inputs
    progressBar.style.width = "0%";
    progressText.innerText = "0%";

    if (!fechaNacimientoVal) {
        resultText.innerHTML = "Por favor, selecciona una fecha válida.";
        resultContainer.classList.remove("success");
        resultContainer.classList.add("visible", "error");
        resultContainer.style.display = "block";
        return;
    }

    var fechaActual = new Date();

    // Parse date properly to avoid timezone issues
    var parts = fechaNacimientoVal.split("-");
    var anio = parseInt(parts[0]);
    var mes = parseInt(parts[1]) - 1; // Months are 0-indexed
    var dia = parseInt(parts[2]);

    var fechaNacimientoCompleta = new Date(anio, mes, dia);

    // Check if future date
    if (fechaNacimientoCompleta > fechaActual) {
        resultText.innerHTML = "¡Aún no has nacido! Selecciona una fecha pasada.";
        resultContainer.classList.remove("success");
        resultContainer.classList.add("visible", "error");
        resultContainer.style.display = "block";
        return;
    }

    var diffTime = Math.abs(fechaActual - fechaNacimientoCompleta);
    var diasVividos = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (!isNaN(diasVividos)) {
        // Success state
        // Success state
        resultContainer.classList.remove("error");
        resultContainer.classList.add("success");

        var diasFormateados = diasVividos.toLocaleString('es-ES');
        resultText.innerHTML = `Has vivido <strong>${diasFormateados}</strong> días hasta hoy.`;

        var lifeExpectancyDays = 80 * 365.25;
        var percentage = (diasVividos / lifeExpectancyDays) * 100;
        if (percentage > 100) percentage = 100; // Cap at 100


        var nextMilestone = Math.ceil((diasVividos + 1) / 5000) * 5000; // Changed to 5k for more frequent milestones
        var daysLeft = nextMilestone - diasVividos;
        var futureDate = new Date();
        futureDate.setDate(fechaActual.getDate() + daysLeft);
        var dateString = futureDate.toLocaleDateString('es-ES');
        nextMilestoneText.innerHTML = `${nextMilestone.toLocaleString()} días<span class="milestone-detail">Faltan ${daysLeft} días (${dateString})</span>`;

        var zodiacInfo = getZodiacSign(dia, mes + 1);
        zodiacText.innerHTML = `${zodiacInfo.name}<span class="zodiac-trait">${zodiacInfo.trait}</span>`;

        var options = { weekday: 'long' };
        var diaSemana = new Intl.DateTimeFormat('es-ES', options).format(fechaNacimientoCompleta);
        diaSemana = diaSemana.charAt(0).toUpperCase() + diaSemana.slice(1); // Capitalize
        birthDayText.innerText = diaSemana;


        fetchHistoricalEvents(dia, mes + 1, anio);

        resultContainer.style.display = "block";

        setTimeout(() => {
            resultContainer.classList.add("visible");
            progressBar.style.width = percentage.toFixed(1) + "%";
            progressText.innerText = percentage.toFixed(1) + "%";
        }, 50);

    } else {
        resultText.innerHTML = "Ocurrió un error al calcular los días.";
        resultContainer.classList.remove("success");
        resultContainer.classList.add("visible", "error");
        resultContainer.style.display = "block";
    }
}

function getZodiacSign(day, month) {
    const signs = [
        { name: "Capricornio", date: 20, trait: "Ambicioso y disciplinado" },
        { name: "Acuario", date: 19, trait: "Original e independiente" },
        { name: "Piscis", date: 20, trait: "Compasivo y artístico" },
        { name: "Aries", date: 20, trait: "Valiente y apasionado" },
        { name: "Tauro", date: 20, trait: "Confiable y paciente" },
        { name: "Géminis", date: 20, trait: "Curioso y adaptable" },
        { name: "Cáncer", date: 22, trait: "Intuitivo y protector" },
        { name: "Leo", date: 22, trait: "Carismático y creativo" },
        { name: "Virgo", date: 22, trait: "Leal y analítico" },
        { name: "Libra", date: 22, trait: "Diplomático y justo" },
        { name: "Escorpio", date: 21, trait: "Apasionado y valiente" },
        { name: "Sagitario", date: 21, trait: "Generoso y optimista" },
        { name: "Capricornio", date: 31, trait: "Ambicioso y disciplinado" }
    ];

    if (day > signs[month - 1].date) {
        return signs[month];
    } else {
        return signs[month - 1];
    }
}

let currentEventIndex = 0;
let eventsList = [];

async function fetchHistoricalEvents(day, month, year) {
    const funFactText = document.getElementById("fun-fact");
    const prevBtn = document.getElementById("prev-event");
    const nextBtn = document.getElementById("next-event");

    // UI Reset
    funFactText.innerHTML = "Escaneando historia (Wikipedia & Wikidata)...";
    // UI Reset
    funFactText.innerHTML = "Escaneando historia (Wikipedia & Wikidata)...";
    prevBtn.classList.add("invisible");
    nextBtn.classList.add("invisible");
    eventsList = [];
    currentEventIndex = 0;

    const monthStr = month.toString().padStart(2, '0');
    const dayStr = day.toString().padStart(2, '0');

    const baseUrl = "https://es.wikipedia.org/api/rest_v1/feed/onthisday";
    const types = ["events", "births", "deaths"];

    try {
        const promises = types.map(type =>
            fetch(`${baseUrl}/${type}/${monthStr}/${dayStr}`)
                .then(res => res.ok ? res.json() : { [type]: [] })
                .catch(() => ({ [type]: [] }))
        );

        const results = await Promise.all(promises);

        // Process Wikipedia Results
        results.forEach((data, index) => {
            const type = types[index];
            const list = data[type] || [];

            const filtered = list.filter(e => e.year === year);

            filtered.forEach(e => {
                let text = e.text;
                if (type === "births") text = `🎂 Nacimiento: ${text}`;
                if (type === "deaths") text = `🕊️ Fallecimiento: ${text}`;
                // Avoid exact duplicates
                if (!eventsList.includes(text)) {
                    eventsList.push(text);
                }
            });
        });


        if (eventsList.length < 5) {
            try {
                // SPARQL to get items with exact date, excluding humans (to avoid duplicate births/deaths issues)
                const sparql = `
                    SELECT DISTINCT ?itemLabel WHERE {
                        ?item wdt:P585 ?date .
                        FILTER (YEAR(?date) = ${year} && MONTH(?date) = ${month} && DAY(?date) = ${day})
                        ?item rdfs:label ?itemLabel .
                        FILTER (LANG(?itemLabel) = "es")
                        MINUS { ?item wdt:P31 wd:Q5 } 
                    } LIMIT 5
                `;
                const wdUrl = `https://query.wikidata.org/sparql?query=${encodeURIComponent(sparql)}&format=json&origin=*`;
                const wdRes = await fetch(wdUrl);
                if (wdRes.ok) {
                    const wdData = await wdRes.json();
                    wdData.results.bindings.forEach(b => {
                        const text = b.itemLabel.value;
                        // Avoid adding if similar text already exists
                        const isDuplicate = eventsList.some(e => e.includes(text));
                        if (!isDuplicate && !text.startsWith("Q")) { // Ignore unlabelled Q-items
                            eventsList.push(`🏛️ ${text}`);
                        }
                    });
                }
            } catch (wdErr) {
                console.log("Wikidata fetch failed", wdErr);
            }
        }

        // Final UI Update
        if (eventsList.length > 0) {
            updateEventDisplay();

            if (eventsList.length > 1) {
                prevBtn.classList.remove("invisible");
                nextBtn.classList.remove("invisible");

                prevBtn.onclick = () => navigateEvent(-1);
                nextBtn.onclick = () => navigateEvent(1);
            }
        } else {
            funFactText.innerHTML = "¡Increíble! No hay registros públicos destacados exactamente el día que naciste. ¡Tú eres el evento principal!";
        }

    } catch (e) {
        console.error("Global fetch error", e);
        var gen = getGeneration(year);
        funFactText.innerHTML = `Gen: ${gen}`;
    }
}

function navigateEvent(direction) {
    if (eventsList.length <= 1) return;

    currentEventIndex += direction;

    // Loop around
    if (currentEventIndex >= eventsList.length) currentEventIndex = 0;
    if (currentEventIndex < 0) currentEventIndex = eventsList.length - 1;

    updateEventDisplay();
}

function updateEventDisplay() {
    const funFactText = document.getElementById("fun-fact");
    // Add fade animation effect
    funFactText.style.opacity = 0;
    setTimeout(() => {
        funFactText.innerHTML = eventsList[currentEventIndex];
        funFactText.style.opacity = 1;
    }, 200);
}

function getGeneration(year) {
    if (year >= 2013) return "Generación Alpha";
    if (year >= 1997) return "Generación Z";
    if (year >= 1981) return "Millennial";
    if (year >= 1965) return "Generación X";
    if (year >= 1946) return "Baby Boomer";
    if (year >= 1928) return "Generación Silenciosa";
    return "Veterano";
}

function esBisiesto(year) {
    return (year % 4 === 0 && year % 100 !== 0) || (year % 400 === 0);
}
