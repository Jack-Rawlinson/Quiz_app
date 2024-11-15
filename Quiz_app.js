// Run loadfile function when a file is entered
document.getElementById("fileinput").addEventListener("change", loadfile);
// Initialize global variables
let quiz_data = [];//[[question, corect_answer, inccorrect answer, ..., ..., boolean:question has been answered]]
let answer_order = [];//[[display order of answers for Q1],[display order of answers for Q2],...]
let time = [0,0] //[hours,minutes,seconds]
let all_answered = false;
let question_no = 0;
let correct_answers = 0;

function loadfile(event){
    /*
    Load data in from a CSV file containing questions and answers
    */
    // FileReader object to handle reading in the data
    const reader = new FileReader();
    // Validate that the file entered is a csv file
    if(event.target.files[0].name.slice(-3) != "csv"){
        alert("File is not a csv");
        return
    }
    // Run load_event when file has been read, this will store the necessary data
    reader.onload = load_event;
    // Read data as a string
    reader.readAsText(event.target.files[0]);
    // Hide div for entering files and reveal div for anwsering questions
    document.getElementById("file_div").style.display = "none";
    document.getElementById("question_div").style.display = "block";
}
function load_event(event){
    // Split data by rows
    let rows = event.target.result.split("\n");
    if(document.getElementById("header").checked){
        rows.splice(0,1);
    }
    // Store data in temp array to a 
    let csv_data =[];
    rows.forEach(row => csv_data.push(row.split(",")));
    // Store questions and answers in quiz_data array, false variable tells if question has already been answered or not
    csv_data.forEach(row => {
        row.push(false);
        quiz_data.push(row);});
    // Prevent user from escaping the scope of the array
    if(quiz_data.length == 1){document.getElementById("next_button").disbaled = true;}
    // Load first question 
    show_question();
    setTimeout(timer,1000);
}
async function get_categories(){
    // Fetch categories list from opentdb 
    let array = await fetch_data("https://opentdb.com/api_category.php");
    let categories = array["trivia_categories"];
    // Set up select element on start page 
    categories.forEach(row => {
        let option = document.createElement("option");
        option.value = row["id"];
        option.innerHTML = row["name"];
        document.getElementById("categories").appendChild(option);
    })
}
async function load_question_data(){
    let setup = ``;
    // Get desired setup of questions questions from HTML
    let no_questions = document.getElementById("number_of_questions").value;
    let type = document.getElementById("type").value;
    let category = document.getElementById("categories").value;
    let difficulty = document.getElementById("difficulty").value;
    if(category != "all"){
        setup = setup.concat("&category=", category);
    }
    if(difficulty != "any"){
        setup = setup.concat("&difficulty=", difficulty);
    }
    if(type != "any"){
        setup = setup.concat("&type=", type)
    }
    // Fetch data from opendb api, use await to avoid astnc issue with data loading 
    let questions = await fetch_data(`https://opentdb.com/api.php?amount=${no_questions}${setup}`);    
    // Store questions from API in useable format 
    questions["results"].forEach(row => {
        if(row["type"] == "multiple"){
            quiz_data.push([row["question"], row["correct_answer"], row["incorrect_answers"][0], row["incorrect_answers"][1], row["incorrect_answers"][2], false]);
        }
        else{
            quiz_data.push([row["question"], row["correct_answer"],"","","",false]);
        }
        }
    );
    // Hide starting div for entering files and reveal div for anwsering questions
    document.getElementById("file_div").style.display = "none";
    document.getElementById("question_div").style.display = "block";
    show_question();
    setTimeout(timer,1000);
}
async function fetch_data(url){
    // Load data from url
    let response = await fetch(url)
    //Inform user of fetch errors
    if (!response.ok) {
        console.error('There was a problem with the fetch operation:', error);
        //throw new Error('Network response was not ok');
      }
    // Store object data and return it 
    let data = await response.json()
    return data    
}
function show_question(){
    if(answer_order.length <= question_no){
        // Array to decide order that answers appear on buttons
        let answer_index = [1,2,3,4];
        // Randomize order
        random_sort(answer_index);
        // Push an element in to store index of button that is pressed
        answer_order.push(answer_index);
        answer_index.push(0);
    }
    // Show question and current score 
    document.getElementById("Question").innerHTML = quiz_data[question_no][0];
    document.getElementById("score").textContent = correct_answers+ "/" + quiz_data.length;
    // Show appropriate answer box for the type of question
    if(quiz_data[question_no][2] == ""){
        if(quiz_data[question_no][1].toLowerCase() == "true" || quiz_data[question_no][1].toLowerCase() == "false"){
            true_false();
        }
        else{exact_answer()}
    }
    else{multiple_choice()}
    
}
function true_false(){
    // Show text input for exact answer and hid display for other question types
    document.getElementById("multiple_answers").style.display = "none";
    document.getElementById("true_false").style.display = "";
    document.getElementById("text_answer").style.display = "none";
    // Set button bg's to default
    document.getElementById("true").style.background = "";
    document.getElementById("false").style.background = "";
    // Check if question has been answered, show correct answer if so and if incorrect and was chosen make this clear as well
    if(quiz_data[question_no][5] == true){
        // Remember to use lower cases to avoid case issues 
        switch(quiz_data[question_no][1].toLowerCase()){
            case "true":
                document.getElementById("true").style.background = "green";
                if(answer_order[question_no][4] != 0){document.getElementById("false").style.background = "red"}
                break;
            case "false":
                document.getElementById("false").style.background = "green";
                if(answer_order[question_no][4] != 0){document.getElementById("true").style.background = "red"}
                break;
        }
    }
    // Link correct button to correct function
    document.getElementById(quiz_data[question_no][1].toLowerCase()).onclick = correct;
    // Use boolean statement to find which answer is incorrect
    let boolean_answer = !(quiz_data[question_no][1].toLowerCase() === "true");
    // Link incorrect answer to incorrect function
    document.getElementById(boolean_answer.toString().toLowerCase()).onclick = incorrect;
}
function exact_answer(){
    // Show text input for exact answer and hid display for other question types
    document.getElementById("multiple_answers").style.display = "none";
    document.getElementById("true_false").style.display = "none";
    document.getElementById("text_answer").style.display = "";
    // Show appropriate error/success answer box dependent on previous answer 
    if(quiz_data[question_no][5] == true){
        if(answer_order[question_no][4] == quiz_data[question_no][1]){
            document.getElementById("text_input").value = quiz_data[question_no][1];
            document.getElementById("text_input").disabled = true;
            document.getElementById("check_or_cross").innerHTML = `\u2705`;
        }
        else{
            document.getElementById("text_input").value = answer_order[question_no][4];
            document.getElementById("text_input").disabled = true;
            document.getElementById("check_or_cross").innerHTML = `\u274C Answer: ${quiz_data[question_no][1]}`;
        }
    }
    else{
        // If question hasn't been answered then reset display to avoid issue for quizzes with multiple exact answer questions
        document.getElementById("text_input").value = "";
        document.getElementById("text_input").disabled = false;
        document.getElementById("check_or_cross").innerHTML = "";
        document.getElementById("check").style.display = "";
    }
}
function check_answer(){
    // Exact answer questions require their own unique check function
    let answer = document.getElementById("text_input").value;
    // Stop user from changing answer and hide check button to stop multiple answer submissions
    document.getAnimations("text_input").disabled = true;
    document.getElementById("check").style.display = "none";
    if(quiz_data[question_no][5] == false){
        // Update array so script knows this question has already been answered
        quiz_data[question_no][5] = true;
        // Add a tick next to answer if correct, save answer in answer order
        if(answer.toLowerCase() == quiz_data[question_no][1].toLowerCase()){
            document.getElementById("check_or_cross").innerHTML = `\u2705`;
            answer_order[question_no][4] = quiz_data[question_no][1];
            correct_answers++;

            show_question();
            quiz_finished();
        }
        else{
            // Show cross with the correct answer if quizzer is wrong, store incorrect answer in answer_order 
            document.getElementById("check_or_cross").innerHTML = `\u274C Answer: ${quiz_data[question_no][1]}`;
            answer_order[question_no][4] = answer;
        }
    }
}
function multiple_choice(){
    // Show multiple options and hid display for other question types
    document.getElementById("multiple_answers").style.display = "";
    document.getElementById("true_false").style.display = "none";
    document.getElementById("text_answer").style.display = "none";
    // Update elements in question_div to show the current question
    for(let i=0; i<(answer_order[question_no].length - 1); i++){
        // variable to store index of answer (eaier to read this way)
        let index = answer_order[question_no][i];
        // increment for the benefit of the "anwer_"+i elements
        i++;
        // Set text, bg and function of each button
        document.getElementById("answer_"+i).innerHTML = quiz_data[question_no][index];
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
function timer(){
    /*
    Repeatable function that will call itself every second to update the timer until all questions have been answered
    */
    // Increment the seconds & update minutes when necessary
    time[0]++;
    if(time[0] == 60){
        time[1]++;
        time[0] = 0;
    }
    // Format time into desired string format (00:00)
    let mins = String(time[1]).padStart(2, '0');
    let seconds = String(time[0]).padStart(2, '0');
    // Show time
    document.getElementById("timer").textContent = `${mins}:${seconds}`;
    // Only call again if there is an unanswered question (This format leads timer to tick for one second more when quiz is finished)
    if(!all_answered){
        setTimeout(timer, 1000);
    }
}
function quiz_finished(){
    // Assume all questions have been answered until contrary is shown
    all_answered = true;
    for(question of quiz_data){
        if(question[5] == false){
            all_answered = false;
        }
    }
}
function correct(){
    // Change bg of correct button green
    let id_text = this.id;
    if(quiz_data[question_no][5] == false){
        document.getElementById(id_text).style.background = "green";
        correct_answers++;
        // Update array so script knows this question has already been answered
        quiz_data[question_no][5] = true;
        show_question();
        quiz_finished();
    }
}
function incorrect(){
    // Change bg of incorrect button red
    let incorrect_index = parseInt(this.id.slice(-1));
    if(quiz_data[question_no][5] == false){
        document.getElementById(this.id).style.background = "red";
        // Store index of incorrect button
        answer_order[question_no][4] = incorrect_index;
        // update array so script knows this question has already been answered
        quiz_data[question_no][5] = true;
        show_question();
        quiz_finished();
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
    all_answered = false;
    time = [0,0];
    correct_answers = 0;
    question_no = 0;
    // Enable/disable buttons as appropriate
    document.getElementById("next_button").disabled = false;
    document.getElementById("back_button").disabled = true;
    if(quiz_data.length==0){
        document.getElementById("next_button").disabled = true;
    }
    show_question();
    document.getElementById("debug").innerHTML = "Restarting timer "
    // clear timeout incase quiz has been reset before finishing and restart timer 
    clearTimeout(timer);
}