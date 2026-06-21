// ===================== MOBILE NAV =====================

const navToggle = document.getElementById("navToggle");
const navMenu = document.getElementById("navMenu");

if(navToggle && navMenu){

    navToggle.addEventListener("click", function(){
        const isOpen = navMenu.classList.toggle("open");
        navToggle.setAttribute("aria-expanded", isOpen);
    });

    navMenu.querySelectorAll("a").forEach(link=>{
        link.addEventListener("click", ()=>{
            navMenu.classList.remove("open");
            navToggle.setAttribute("aria-expanded", false);
        });
    });
}


// ===================== CHART VARIABLES =====================

let subjectChart;
let modelChart;


// ===================== SUBJECT CHART =====================

function createSubjectChart(math, reading, writing, science){

    if(subjectChart){
        subjectChart.destroy();
    }

    subjectChart = new Chart(
        document.getElementById("subjectChart"),
        {
            type:"doughnut",

            data:{
                labels:[
                    "Math",
                    "Reading",
                    "Writing",
                    "Science"
                ],

                datasets:[{
                    data:[
                        math,
                        reading,
                        writing,
                        science
                    ],

                    backgroundColor:[
                        "#3b82f6",
                        "#8b5cf6",
                        "#10b981",
                        "#f59e0b"
                    ],

                    borderColor:"#0f172a",
                    borderWidth:3,
                    hoverOffset:6
                }]
            },

            options:{
                responsive:true,
                maintainAspectRatio:false,

                plugins:{
                    legend:{
                        position:"bottom",
                        labels:{
                            color:"#94a3b8",
                            padding:16,
                            font:{ family:"Inter", size:12 }
                        }
                    }
                }
            }
        }
    );
}


// ===================== MODEL CHART =====================

function createModelChart(){

    if(modelChart){
        modelChart.destroy();
    }

    modelChart = new Chart(
        document.getElementById("modelChart"),
        {

            type:"bar",

            data:{

                labels:[
                    "Linear Regression",
                    "Decision Tree",
                    "Random Forest"
                ],

                datasets:[{

                    label:"R² Score",

                    data:[
                        0.87,
                        0.91,
                        0.95
                    ],

                    backgroundColor:[
                        "#3b82f6",
                        "#8b5cf6",
                        "#facc15"
                    ],

                    borderRadius:8,
                    maxBarThickness:60

                }]
            },

            options:{

                responsive:true,
                maintainAspectRatio:false,

                plugins:{
                    legend:{ display:false }
                },

                scales:{

                    y:{
                        beginAtZero:true,
                        max:1,
                        ticks:{ color:"#94a3b8" },
                        grid:{ color:"rgba(255,255,255,.06)" }
                    },

                    x:{
                        ticks:{ color:"#94a3b8" },
                        grid:{ display:false }
                    }

                }

            }

        }
    );

}


// ===================== GRADE =====================

function calculateGrade(avg){

    if(avg>=90){
        return "A+";
    }

    if(avg>=80){
        return "A";
    }

    if(avg>=70){
        return "B";
    }

    if(avg>=60){
        return "C";
    }

    return "D";
}


// ===================== SCORE RING =====================

function updateScoreRing(value){

    const ring = document.getElementById("scoreRing");

    if(ring){
        ring.style.setProperty("--pct", Math.max(0, Math.min(100, value)));
    }
}


// ===================== HISTORY =====================

function saveHistory(math, reading, writing, average){

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    history.unshift({
        math,
        reading,
        writing,
        average
    });

    history = history.slice(0,5);

    localStorage.setItem(
        "history",
        JSON.stringify(history)
    );

    displayHistory();

}



function displayHistory(){

    const body =
        document.getElementById("historyBody");

    let history =
        JSON.parse(localStorage.getItem("history")) || [];

    if(history.length === 0){

        body.innerHTML = `
        <tr class="empty-row">
            <td colspan="4">No predictions yet — run one above to see it here.</td>
        </tr>
        `;

        return;
    }

    body.innerHTML = "";

    history.forEach(item=>{

        body.innerHTML += `
        <tr>

            <td>${item.math}</td>

            <td>${item.reading}</td>

            <td>${item.writing}</td>

            <td>${item.average}</td>

        </tr>
        `;
    });

}



// ===================== FORM =====================

const form = document.getElementById("predictionForm");
const submitBtn = document.getElementById("submitBtn");
const insightMessage = document.getElementById("insightMessage");

form.addEventListener("submit", async function(e){

    e.preventDefault();

    const formData = new FormData(this);

    submitBtn.classList.add("loading");


    // reading and writing

    let reading =
        Number(formData.get("reading_score"));

    let writing =
        Number(formData.get("writing_score"));


    // science score

    let science =
        Math.round(
            (reading + writing)/2
        );


    // ================= BACKEND =================

    try{

        const response =
        await fetch("/predict",{

            method:"POST",

            body:formData

        });

        if(!response.ok){
            throw new Error("Prediction request failed");
        }


        const data =
            await response.json();


        let math =
            Math.round(data.prediction);


        // average

        let average =
            Math.round(
                (math+reading+writing+science)/4
            );


        // grade

        let grade =
            calculateGrade(average);


        // ================= UPDATE UI =================

        document.getElementById(
            "predictionValue"
        ).innerText = math;

        updateScoreRing(math);


        document.getElementById(
            "displayReading"
        ).innerText = reading;


        document.getElementById(
            "displayWriting"
        ).innerText = writing;


        document.getElementById(
            "displayScience"
        ).innerText = science;


        document.getElementById(
            "averageScore"
        ).innerText = average;


        document.getElementById(
            "grade"
        ).innerText = grade;


        // ================= AI INSIGHT =================

        let message;

        if(average>=85){

            message =
            "Excellent overall performance. Random Forest achieved the highest accuracy among the tested models.";

        }

        else if(average>=70){

            message =
            "Good performance with balanced reading and writing scores.";

        }

        else{

            message =
            "Performance can improve with more focus on reading and writing.";

        }


        insightMessage.innerText = message;


        // charts

        createSubjectChart(
            math,
            reading,
            writing,
            science
        );


        createModelChart();


        // history

        saveHistory(
            math,
            reading,
            writing,
            average
        );


    }

    catch(error){

        console.error(error);

        insightMessage.innerText =
            "Something went wrong while reaching the model — please try again.";

    }

    finally{

        submitBtn.classList.remove("loading");

    }

});



// ===================== INITIAL LOAD =====================

createModelChart();

displayHistory();

updateScoreRing(0);