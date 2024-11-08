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
    // array to decide order that answers appear on buttons
    let answer_index = [1,2,3,4];
    // Randomize order
    random_sort(answer_index);
    // Update elements in question_div to show the current question
    for(i in answer_index){
        // variable to store index of answer (eaier to read this way)
        let index = answer_index[i];
        // increment for the benefit of the "anwer_"+i elements
        i++;
        // Set text, bg and function of each button
        document.getElementById("answer_"+i).textContent = quiz_data[question_no][index];
        document.getElementById("answer_"+i).style.background = "";
        document.getElementById("answer_"+i).onclick = incorrect;
        // Answer should always be the first element in the csv
        if(index == 1){
            document.getElementById("answer_"+i).onclick = correct;
        }
    }
}
function correct(){
    let correct_index = parseInt(this.id.slice(-1));
    document.getElementById("answer_"+correct_index).style.background = "green";
}
function incorrect(){
    let correct_index = parseInt(this.id.slice(-1));
    document.getElementById("answer_"+correct_index).style.background = "red";
}
function random_sort(array){
    // index range used for looping over array elements
    let index = array.length;
    while(index > 0){
        // Generate random index to swap elements with
        let random_index = Math.floor(Math.random() * index);
        index--;

        // Swap array elements
        [array[index], array[random_index]] = [array[random_index], array[index]];
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