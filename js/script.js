// js/script.js

// Wait for the DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
    const fileInput = document.getElementById('fileInput');
    const textInput = document.getElementById('textInput');
    const randomizeButton = document.getElementById('randomizeButton');
    const resultsSection = document.getElementById('resultsSection');
    const resultsTableBody = document.querySelector('#resultsTable tbody');
    const downloadButton = document.getElementById('downloadButton');
    const imageUpload = document.getElementById('imageUpload');
    const classroomImage = document.getElementById('classroomImage');
    const boxCountInput = document.getElementById('boxCount');
    const addBoxesButton = document.getElementById('addBoxesButton');
    const container = document.getElementById('container');

    let dragBoxes = [];
    let names = [];

    randomizeButton.addEventListener('click', () => {
        let names = [];

        // Check if a file was uploaded
        if (fileInput.files.length > 0) {
            const reader = new FileReader();
            reader.onload = function(event) {
                names = parseNames(event.target.result);
                generatePairs(names);
            };
            reader.readAsText(fileInput.files[0]);
        } else if (textInput.value.trim() !== '') {
            // Use the text from the textarea
            names = parseNames(textInput.value);
            generatePairs(names);
        } else {
            alert('Please upload a file or enter names in the text area.');
        }
    });

    function parseNames(input) {
        return input
            .split('\n')
            .map(name => name.trim())
            .filter(name => name !== '');
    }

    // Image upload and display
    imageUpload.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                classroomImage.src = e.target.result;
                classroomImage.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Adding draggable boxes
    addBoxesButton.addEventListener('click', () => {
        const boxCount = parseInt(boxCountInput.value);
        if (isNaN(boxCount) || boxCount <= 0) {
            alert("Please enter a valid number of boxes.");
            return;
        }

        // Clear existing boxes
        dragBoxes.forEach(box => box.remove());
        dragBoxes = [];

        // Create new boxes
        for (let i = 0; i < boxCount; i++) {
            const box = document.createElement('div');
            box.classList.add('drag-box');
            box.draggable = true;
            box.id = 'dragBox-' + i; // Ensure each box has a unique ID
            
            box.style.left = (i * 50) + 'px';
            box.style.top = '10px'; 

            //event listeners for drag and drop
            box.addEventListener('dragstart', dragStart);
            box.addEventListener('dragover', dragOver);
            box.addEventListener('drop', drop);
            box.addEventListener('dragend', dragEnd);

            container.appendChild(box);
            dragBoxes.push(box);
        }
    });

    let draggedBox = null;
    
    // drag start event for drag boxes
    function dragStart(e) {
        draggedBox = this;
        e.dataTransfer.effectAllowed = 'move';
        this.classList.add('dragging');
    }

    //drag over event for drag boxes
    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('over');
    }

    //drop event for drag boxes
    function drop(e) {
        e.preventDefault();
        this.classList.remove('over');
        if (draggedBox) {
            // Calculate the drop position relative to the container
            const containerRect = container.getBoundingClientRect();
            const dropX = e.clientX - containerRect.left - (draggedBox.offsetWidth / 2);
            const dropY = e.clientY - containerRect.top - (draggedBox.offsetHeight / 2);

            draggedBox.style.left = dropX + 'px';
            draggedBox.style.top = dropY + 'px';

            draggedBox.classList.remove('dragging');
            draggedBox = null; // Reset draggedBox after drop
        }
    }

    //drag end event for drag boxes
    function dragEnd(e) {
        this.classList.remove('dragging');
        const allBoxes = document.querySelectorAll('.drag-box');
        allBoxes.forEach(box => box.classList.remove('over'));
        draggedBox = null;
    }

    function randomizeNamesToBoxes() {
        
    }

    function generatePairs(names) {
        if (names.length === 0) {
            alert('No names were provided.');
            return;
        }

        // Shuffle the names array using Fisher-Yates algorithm
        for (let i = names.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [names[i], names[j]] = [names[j], names[i]];
        }

        // Clear previous results
        resultsTableBody.innerHTML = '';
        resultsSection.style.display = 'block';

        let tableNumber = 1;
        for (let i = 0; i < names.length; i += 2) {
            const name1 = names[i];
            const name2 = names[i + 1] || '';

            const row = document.createElement('tr');
            row.classList.add('pair-row');

            const cell1 = document.createElement('td');
            cell1.textContent = name1;
            cell1.contentEditable = true;
            cell1.classList.add('name-cell');
            row.appendChild(cell1);

            const cell2 = document.createElement('td');
            cell2.textContent = name2;
            cell2.contentEditable = true;
            cell2.classList.add('name-cell');
            row.appendChild(cell2);

            const cell3 = document.createElement('td');
            cell3.textContent = tableNumber++;
            row.appendChild(cell3);

            resultsTableBody.appendChild(row);
        }

        // Initialize drag-and-drop functionality for rows
        initRowDragAndDrop();

        // Initialize drag-and-drop functionality for name cells
        initCellDragAndDrop();
    }

    // Event listener for the download button
    downloadButton.addEventListener('click', () => {
        const resultsTable = document.getElementById('resultsTable');

        html2canvas(resultsTable, {
            backgroundColor: '#ffffff', // Set background color to white
            scale: 2,                   // Increase resolution
            useCORS: true               // Enable cross-origin images if necessary
        }).then(canvas => {
            const link = document.createElement('a');
            link.download = 'random_pairs.png';
            link.href = canvas.toDataURL('image/png');
            link.click();
        });
    });

    function initRowDragAndDrop() {
        // Use SortableJS to make rows draggable
        Sortable.create(resultsTableBody, {
            animation: 150,
            handle: '.pair-row',
            onEnd: () => {
                // Update table numbers after rearrangement
                updateTableNumbers();
            }
        });
    }

    function initCellDragAndDrop() {
        const nameCells = document.querySelectorAll('.name-cell');

        nameCells.forEach(cell => {
            cell.draggable = true;

            cell.addEventListener('dragstart', dragStart);
            cell.addEventListener('dragover', dragOver);
            cell.addEventListener('drop', drop);
            cell.addEventListener('dragend', dragEnd);
        });
    }

    let draggedCell = null;

    function dragStart(e) {
        draggedCell = this;
        e.dataTransfer.effectAllowed = 'move';
        this.classList.add('dragging-cell');
    }

    function dragOver(e) {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        this.classList.add('drag-over-cell');
    }

    function drop(e) {
        e.preventDefault();
        if (draggedCell !== this) {
            // Swap the text content of the cells
            const tempText = this.textContent;
            this.textContent = draggedCell.textContent;
            draggedCell.textContent = tempText;
        }
        this.classList.remove('drag-over-cell');
    }

    function dragEnd(e) {
        this.classList.remove('dragging-cell');
        const nameCells = document.querySelectorAll('.name-cell');
        nameCells.forEach(cell => cell.classList.remove('drag-over-cell'));
    }

    function updateTableNumbers() {
        const rows = resultsTableBody.querySelectorAll('tr');
        let tableNumber = 1;
        rows.forEach(row => {
            // Update the table number cell
            row.cells[2].textContent = tableNumber++;
        });
    }
});
