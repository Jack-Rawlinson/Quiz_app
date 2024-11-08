// Run loadfile function when a file is entered
document.getElementById("fileinput").addEventListener("change", loadfile);
// Initialize global variables
let quiz_data = [];
let question_index = 0;

function loadfile(event){
    /*
    Load data in from a CSV file containing questions and answers
    */
    document.getElementById("debug").innerHTML +="<br> creating FileReader";
    // FileReader object to handle reading in the data
    const reader = new FileReader();
    // Run load_event when file has been read, this will store the necessary data
    reader.onload = load_event;
    // Read data as a string
    reader.readAsText(event.target.files[0]);
    document.getElementById("debug").innerHTML +="<br>Reader = " + typeof(data);
    // Hide div for entering files and reveal div for anwsering questions
    document.getElementById("file_div").style.display = "none";
    document.getElementById("question_div").style.display = "";
}
function load_event(event){
    // Initialize a temp array
    let csv_data = []
    document.getElementById("debug").innerHTML +="<br>" + event;
    document.getElementById("debug").innerHTML +="<br>" + event.target.result.split(",");
    // Store text data in temp array 
    csv_data = (event.target.result.split(","));
    document.getElementById("debug").innerHTML +="<br>" + csv_data[0];
    // Store questions and answers in quiz_data array
    for(let i=0;i<(csv_data.length/5); i++){
        quiz_data.push([csv_data[i*5], csv_data[(i*5)+1], csv_data[(i*5)+2], csv_data[(i*5)+3], csv_data[(i*5)+4]]);
    }
    // Load first question 
    show_question(question_index);
}

function show_question(question_no){
    // Update elements in question_div to show the current question
    document.getElementById("debug").innerHTML += "<br> quiz_data = " + quiz_data;
    document.getElementById("Question").innerHTML = quiz_data[question_no][0];
    document.getElementById("answer_1").textContent = quiz_data[question_no][1];
    document.getElementById("answer_2").textContent = quiz_data[question_no][2];
    document.getElementById("answer_3").textContent = quiz_data[question_no][3];
    document.getElementById("answer_4").textContent = quiz_data[question_no][4];
}