// Run loadfile function when a file is entered
document.getElementById("fileinput").addEventListener("change", loadfile);
// Initialize global variables
let quiz_data = [];
let question_no = 0;

function loadfile(event){
    /*
    Load data in from a CSV file containing questions and answers
    */
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
    // Store text data in temp array 
    csv_data = (event.target.result.split(","));
    // Store questions and answers in quiz_data array
    for(let i=0;i<(csv_data.length/5); i++){
        quiz_data.push([csv_data[i*5], csv_data[(i*5)+1], csv_data[(i*5)+2], csv_data[(i*5)+3], csv_data[(i*5)+4]]);
    }
    // Prevent user from escaping the scope of the array
    if(quiz_data.length == 1){document.getElementById("next_button").disbaled = true;}
    // Load first question 
    show_question();
}

function show_question(){
    document.getElementById("debug").innerHTML = quiz_data[question_no];
    random_sort(quiz_data[question_no]);
    document.getElementById("debug").innerHTML += "<br>" + quiz_data[question_no];
    // Update elements in question_div to show the current question
    document.getElementById("Question").innerHTML = quiz_data[question_no][0];
    document.getElementById("answer_1").textContent = quiz_data[question_no][1];
    document.getElementById("answer_2").textContent = quiz_data[question_no][2];
    document.getElementById("answer_3").textContent = quiz_data[question_no][3];
    document.getElementById("answer_4").textContent = quiz_data[question_no][4];
}

function random_sort(array){
    let index = array.length - 2;
    //document.getElementById("debug").innerHTML += "<br>" + index;
    while(index > 0){
        document.getElementById("debug").innerHTML += "<br>" + index;
        let random_index = Math.floor(Math.random() * index) + 2;
        document.getElementById("debug").innerHTML += " " + random_index;
        index--;

            // And swap it with the current element.
        [array[index+1], array[random_index]] = [array[random_index], array[index+1]];
    }
}
function next_question(){
    /*
    Move to next question and update next & back buttons to prevent user from going out of scope of array
    */
    question_no += 1;
    document.getElementById("back_button").disabled = false;
     if(question_no == quiz_data.length-1){
        document.getElementById("next_button").disabled = true;
     }
    show_question();
}
function previous_question(){
    /*
    Move to previous question and update next & back buttons to prevent user from going out of scope of array
    */
    question_no -= 1;
    document.getElementById("next_button").disabled = false;
    if(question_no == 0){
        document.getElementById("back_button").disabled = true;
    }
    show_question();
}