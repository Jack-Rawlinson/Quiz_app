// Run loadfile function when a file is entered
document.getElementById("fileinput").addEventListener("change", loadfile);
// Initialize global variables
let quiz_data = [];
let answer_order = [];
let question_no = 0;
let correct_answers = 0;

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
    // Hide div for entering files and reveal div for anwsering questions
    document.getElementById("file_div").style.display = "none";
    document.getElementById("question_div").style.display = "";
}
function load_event(event){
    // Split data by rows
    let rows = event.target.result.split("\n");
    // Store data in temp array to a 
    let csv_data =[];
    rows.forEach(row => csv_data.push(row.split(",")));
    // Store questions and answers in quiz_data array, false variable tells if question has already been answered or not
    csv_data.forEach(row => quiz_data.push([row[0], row[1], row[2], row[3], row[4], false]));
    // Prevent user from escaping the scope of the array
    if(quiz_data.length == 1){document.getElementById("next_button").disbaled = true;}
    // Load first question 
    show_question();
}

function show_question(){
    if(answer_order.length <= question_no){
        // Array to decide order that answers appear on buttons
        let answer_index = [1,2,3,4];
        // Randomize order
        random_sort(answer_index);
        // Push an element in to store index of button that is pressed
        answer_index.push(0)
        answer_order.push(answer_index);
    }
    document.getElementById("Question").textContent = quiz_data[question_no][0];
    document.getElementById("score").textContent = correct_answers+ "/" + quiz_data.length;
    // Update elements in question_div to show the current question
    for(let i=0; i<(answer_order[question_no].length - 1); i++){
        // variable to store index of answer (eaier to read this way)
        let index = answer_order[question_no][i];
        // increment for the benefit of the "anwer_"+i elements
        i++;
        // Set text, bg and function of each button
        document.getElementById("answer_"+i).textContent = quiz_data[question_no][index];
        document.getElementById("answer_"+i).style.background = "";
        document.getElementById("answer_"+i).onclick = incorrect;
        // If question has already been iccorectly answered, highlight incorrect button selected
        if(quiz_data[question_no][5] == true && i == answer_order[question_no][4]){
            document.getElementById("answer_"+i).style.background = "red";
        }
        // Answer should always be the first element in the csv
        if(index == 1){
            document.getElementById("answer_"+i).onclick = correct;
            // If question has already been anwered then show correct answer
            if(quiz_data[question_no][5] == true){
                document.getElementById("answer_"+i).style.background = "green";
            }
        }
        i--;
    }
}
function correct(){
    // Change bg of correct button green
    let correct_index = parseInt(this.id.slice(-1));
    if(quiz_data[question_no][5] == false){
        document.getElementById("answer_"+correct_index).style.background = "green";
        correct_answers++;
        // update array so script knows this question has already been answered
        quiz_data[question_no][5] = true;
        show_question();
    }
}
function incorrect(){
    // Change bg of incorrect button red
    let incorrect_index = parseInt(this.id.slice(-1));
    if(quiz_data[question_no][5] == false){
        document.getElementById("answer_"+incorrect_index).style.background = "red";
        // Store index of incorrect button
        answer_order[question_no][4] = incorrect_index;
        // update array so script knows this question has already been answered
        quiz_data[question_no][5] = true;
        show_question();
    }
}
function random_sort(array){
    // Index range used for looping over array elements
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
function reset_quiz(){
    /*
    Reset the quiz so that it can be retaken
    */
   // Set all questions to unanswered
    for(i in quiz_data){
        quiz_data[i][5] = false;
    }
    correct_answers = 0;
    question_no = 0;
    // Enable/disable buttons as appropriate
    document.getElementById("next_button").disabled = false;
    document.getElementById("back_button").disabled = true;
    if(quiz_data.length==0){
        document.getElementById("next_button").disabled = true;
    }
    show_question();
}