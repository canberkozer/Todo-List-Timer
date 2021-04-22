// Data controller
const dataController = (function() {

    // Project class
    class Project {
        constructor(id, title) {
            this.id = id;
            this.title = title;
        }
    }

    // Project data
    const projects = {
        allProjects: []
    };

    // Publicly accessible
    return {

        // Add project
        addProject: function(title) {

            // Create ID
            let ID;
            if (projects.allProjects.length > 0) {
                ID = projects.allProjects[projects.allProjects.length - 1].id + 1;
            } else {
                ID = 0;
            }

            // Create a new instance
            const newProject = new Project(ID, title);

            // Add the project to the project data
            projects.allProjects.push(newProject);

            // Return the new project
            return newProject;

        },

        // Update project title in data structure
        updateTitle: function(newTitle, ID) {

            // Find the object with matching ID
            const projectToUpdate = projects.allProjects.find(project => project.id === ID);
            
            // Update the title
            projectToUpdate.title = newTitle;

        },

        // Delete a project from data structure
        deleteData: function(ID) {

            const currentProject = projects.allProjects.map(current => current.id);
            const index = currentProject.indexOf(ID);
            if (index !== -1) {
                projects.allProjects.splice(index, 1);
            }

        },

        // Testing
        testing: function() {
            console.log(projects);
        }

    };
    
})();

// UI controller
const UIController = (function() {

    // Variables
    let intervalID;

    // Get the element classes
    const DOMstrings = {
        projectForm: '.project-form',
        inputValue: 'input[type="text"]',
        projectList: '.projects',
        hoursSpan: '.hours',
        minutesSpan: '.minutes',
        secondsSpan: '.seconds'
    };

    // Create variables from DOMstrings
    const {projectForm, inputValue, projectList, hoursSpan, minutesSpan, secondsSpan} = DOMstrings;

    // Publicly accessible
    return {

        // Get input value
        getInput: function() {
            return document.querySelector(inputValue);
        },

        // Add project to UI
        addProjectToUI: function(obj) {

            // Create markup
            const html = `
            <li id="project-${obj.id}">
                <h2>${obj.title}</h2>
                <div class="timer">
                    <p class="timer-label">Toplam geçen süre</p>
                    <p class="timer-text"><span class="hours">00</span>:<span class="minutes">00</span>:<span class="seconds">00</span></p>
                </div>
                <button class="btn start">Başlat</button>
                <button class="delete-btn"><i class="fa fa-times"></i></button>
            </li>
            `;

            // Insert the HTML into the DOM
            document.querySelector(projectList).insertAdjacentHTML('beforeend', html);

        },

        // Clear field
        clearField: function() {
            const input = document.querySelector(inputValue);
            input.value = '';
        },

        // Start the timer
        startTimer: function(event) {

            const target = event.target.previousElementSibling.lastElementChild;
            const seconds = target.querySelector(secondsSpan);
            const minutes = target.querySelector(minutesSpan);
            const hours = target.querySelector(hoursSpan); 

            let sec = 0;
            intervalID = setInterval(function() {
                sec++;
                seconds.textContent = (`0${sec % 60}`).substr(-2);
                minutes.textContent = (`0${(parseInt(sec / 60)) % 60}`).substr(-2);
                hours.textContent = (`0${parseInt(sec / 3600)}`).substr(-2);
            }, 1000);

            // Add interval ID to event target as an attribute
            target.setAttribute('timer-id', intervalID);

        },

        // Stop the timer
        stopTimer: function(event) {
            const target = event.target.previousElementSibling.lastElementChild;
            clearInterval(target.getAttribute('timer-id'));
        },

        // Update project name in UI
        edit: function(event) {
            
            const input = document.createElement('input');
            const title = event.target;
            const parent = title.parentNode;
            input.value = title.textContent;
            parent.insertBefore(input, title);
            parent.removeChild(title);

        },

        // Save the project title in UI
        save: function(event) {

            const title = document.createElement('h2');
            const input = event.target;
            const parent = input.parentNode;
            title.textContent = input.value;
            parent.insertBefore(title, input);
            parent.removeChild(input);
            return title.textContent;

        },

        // Delete the project in the UI
        delete: function(projectID) {
            const projectToDelete = document.getElementById(projectID);
            projectToDelete.parentNode.removeChild(projectToDelete);
        },

        // Make the DOMstrings public
        getDOMstrings: function() {
            return DOMstrings;
        }

    };
    
})();

// Global app controller
const controller = (function(dataCtrl, UICtrl) {

    // Event listeners
    const setupEventListeners = function() {

        // Get the DOMstrings
        const DOM = UICtrl.getDOMstrings();

        // When the form is submitted
        const form = document.querySelector(DOM.projectForm);
        form.addEventListener('submit', ctrlAddProject);

        const projects = document.querySelector(DOM.projectList);

        projects.addEventListener('click', function(event) {

            const target = event.target;

            // When the start button is clicked
            if (target.className === 'btn start' || target.className === 'btn start stop') {
                timer(event);
            }

            // When the project title is clicked
            if (target.tagName === 'H2') {
                editTitle(event);
            }

            // When the delete button is clicked
            if (target.className === 'delete-btn') {
                deleteProject(event);
            }

        });

        // When the enter key is pressed
        projects.addEventListener('keypress', function(event) {
            if (event.keyCode === 13 || event.which === 13) {
                saveTitle(event);
            }
        });

    };

    // Add new project
    const ctrlAddProject = function(event) {

        // Prevent default behavior
        event.preventDefault();

        // Get and sanitize the input
        const dirty = UICtrl.getInput().value;
        const clean = DOMPurify.sanitize(dirty);

        // If the input is not empty
        if (clean !== '') {
            
            // Add the project to the data controller
            const newProject = dataCtrl.addProject(clean);

            // Add the project to the UI
            UICtrl.addProjectToUI(newProject);

            // Clear the input field
            UICtrl.clearField();
        }

    };

    // Timer
    const timer = function(event) {

        const target = event.target;

        // Toggle the button color
        target.classList.toggle('durdur');

        // If the button's text is start
        if (target.textContent === 'Başlat') {

            target.textContent = 'Durdur';
            UICtrl.startTimer(event);
    
        // If the button's text is stop
        } else if (target.textContent === 'Durdur') {

            target.textContent = 'Başlat';
            UICtrl.stopTimer(event);

        }

    };

    // Edit the project title
    const editTitle = function(event) {
        UICtrl.edit(event);
    };

    // Save the project title
    const saveTitle = function(event) {

        const ID = parseInt(event.target.parentNode.id.slice(8));

        // Update the project title in the UI
        const newTitle = UICtrl.save(event);

        // Update the project title in the data structure
        dataCtrl.updateTitle(newTitle, ID);

    };

    // Delete project
    const deleteProject = function(event) {
        const target = event.target;
        const projectID = target.parentNode.id;
        const ID = parseInt(target.parentNode.id.slice(8));

        if (projectID) {

            // Delete the project from the data structure
            dataCtrl.deleteData(ID);

            // Delete the item from the UI
            UICtrl.delete(projectID);
            
        }
    };

    // Publicly accessible
    return {
        
        // Initialization
        init: function() {
            console.log('Application has started');
            setupEventListeners();
        }

    };
    
})(dataController, UIController);

// Initialize
controller.init();