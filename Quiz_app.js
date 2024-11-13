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
    document.getElementById("question_div").style.display = "";
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
    csv_data.forEach(row => quiz_data.push([row[0], row[1], row[2], row[3], row[4], false]));
    // Prevent user from escaping the scope of the array
    if(quiz_data.length == 1){document.getElementById("next_button").disbaled = true;}
    // Load first question 
    show_question();
    setTimeout(timer,1000);
}
async function get_categories(){
    let array = await fetch_data("https://opentdb.com/api_category.php");
    let categories = array["trivia_categories"];
    categories.forEach(row => {
        let option = document.createElement("option");
        option.value = row["id"];
        option.innerHTML = row["name"];
        document.getElementById("categories").appendChild(option);
    })
}
async function load_question_data(){
    let setup = ``;
    // Get number of desired questions from HTML
    let no_questions = document.getElementById("number_of_questions").value;
    let category = document.getElementById("categories").value;
    let difficulty = document.getElementById("difficulty").value;
    if(category != "all"){
        setup = setup.concat("&category=", category);
    }
    if(difficulty != "any"){
        setup = setup.concat("&difficulty=", difficulty);
    }
    // Fetch data from opendb api, use await to avoid astnc issue with data loading 
    alert(`setup = ${setup}, url = https://opentdb.com/api.php?amount=${no_questions}&type=multiple${setup}`);
    let questions = await fetch_data(`https://opentdb.com/api.php?amount=${no_questions}&type=multiple${setup}`);    
    // Store questions from API in useable format 
    questions["results"].forEach(row => quiz_data.push([row["question"], row["correct_answer"], row["incorrect_answers"][0], row["incorrect_answers"][1], row["incorrect_answers"][2], false]));
    // Hide starting div for entering files and reveal div for anwsering questions
    document.getElementById("file_div").style.display = "none";
    document.getElementById("question_div").style.display = "";
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
    document.getElementById("Question").innerHTML = quiz_data[question_no][0];
    document.getElementById("score").textContent = correct_answers+ "/" + quiz_data.length;
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
    let correct_index = parseInt(this.id.slice(-1));
    if(quiz_data[question_no][5] == false){
        document.getElementById("answer_"+correct_index).style.background = "green";
        correct_answers++;
        // update array so script knows this question has already been answered
        quiz_data[question_no][5] = true;
        show_question();
        quiz_finished();
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