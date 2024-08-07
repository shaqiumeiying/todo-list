// Initial todo items in a stringified format.
const stringifiedTodoItems = `
    [
        {
            "name": "This item is done",
            "done": true
        },
        {
            "name": "This item is not done",
            "done": false
        }
    ]
`;

/**
* Model describes how todo items are stored and
* specifies the methods that are used to modify the todo list.
*
* Note that model should NOT have interaction with the UI,
* i.e. no DOM manipulation here.
*
* Instead, the DOM should be updated in controller and view.
*/

const model = {
    items: [],

    // Save the current state to local storage
    saveToLocalStorage: function() {
        console.log('Saving to localStorage:', this.items);
        localStorage.setItem('todoItems', JSON.stringify(this.items));
    },

    // Load the state from local storage
    loadFromLocalStorage: function() {
        const storedItems = localStorage.getItem('todoItems');
        console.log('Loading from localStorage:', storedItems);
        if (storedItems) {
            this.items = JSON.parse(storedItems);
        } else {
            this.items = JSON.parse(stringifiedTodoItems);
        }
    },

    countItems: function() {
        const numItems = this.items.length;
        let numDoneItems = 0;
        this.items.forEach(function(item) {
            if (item.done === true) {
                numDoneItems++;
            }
        });
        return {
            numItems: numItems,
            numDoneItems: numDoneItems,
        };
    },

    createItem: function(name) {
        if (typeof name === 'string' && name.length > 0) {
            this.items.push({
                name: name,
                done: false,
            });
            this.saveToLocalStorage();
        }
    },

    changeItemName: function(index, name) {
        this.items[index].name = name;
        this.saveToLocalStorage();
    },

    deleteItem: function(index) {
        this.items.splice(index, 1);
        this.saveToLocalStorage();
    },

    deleteAllItems: function() {
        this.items = [];
        this.saveToLocalStorage();
    },

    toggleItem: function(index) {
        const item = this.items[index];
        item.done = !item.done;
        this.saveToLocalStorage();
    },

    toggleAllItems: function() {
        const allItemsDone = model.items.every(item => item.done);
        model.items.forEach(item => item.done = !allItemsDone);
        model.saveToLocalStorage(); // Save changes to localStorage
    },
};

// Loading the data from local storage when the app starts
model.loadFromLocalStorage();

const controller = {
    createItem: function() {
        const createItemInput = document.getElementById('create-item-input');
        model.createItem(createItemInput.value);
        createItemInput.value = '';
        view.displayTodoItems();
    },

    updateItemNameOnKeyUp: function(event) {
        const updateItemInput = event.target;

        // Get the id attribute from updateItemInput's parent <li> element.
        const id = updateItemInput.parentNode.getAttribute('id');

        // Get the input value that the user has entered.
        const newName = updateItemInput.value;

        console.log('Key pressed:', event.keyCode); // Debugging line
        console.log('Input value:', newName);       // Debugging line

        // If there is some text in the update input,
        // then change the name of the selected item
        // when the ENTER key is pressed.
        if (newName && event.keyCode === ENTER_KEY) {
            this.changeItemName(id, newName);
            view.displayTodoItems(); // Update the view
        }

        // When the ESC key is pressed,
        // reset the name of the selected item to the original value.
        if (event.keyCode === ESC_KEY) {
            updateItemInput.value = model.items[id].name;
            view.displayTodoItems(); // Update the view
        }
    },

    updateItemNameOnFocusOut: function(event) {
        const updateItemInput = event.target;
        const id = updateItemInput.parentNode.getAttribute('id');
        const newName = updateItemInput.value;

        if (typeof newName === 'string' && newName.length > 0) {
            this.changeItemName(id, newName);
        } else {
            this.deleteItem(id);
        }
    },

    changeItemName: function(index, name) {
        model.changeItemName(index, name);
        view.displayTodoItems(); // Update the view
    },

    deleteItem: function(index) {
        model.deleteItem(index);
        view.displayTodoItems();
    },

    deleteAllItems: function() {
        const confirmDelete = confirm('This will delete all todo items!');
        if (confirmDelete === true) {
            model.deleteAllItems();
            view.displayTodoItems();
        }
    },

    turnOnUpdatingMode: function(event) {
        const itemLabel = event.target;
        const updateItemInput = itemLabel.parentNode.querySelector('.update-item-input');
        view.hideDOMElement(itemLabel);
        view.displayDOMElement(updateItemInput);
        updateItemInput.focus();
    },

    toggleItem: function(event) {
        const toggleItemCheckbox = event.target;
        const id = toggleItemCheckbox.parentNode.getAttribute('id');

        model.toggleItem(id);
        view.displayTodoItems();
    },

    toggleAllItems: function() {
        model.toggleAllItems();
        view.displayTodoItems();
    },

    clearForm: function() {
        const createItemInput = document.getElementById('create-item-input');
        createItemInput.value = createItemInput.getAttribute('placeholder');
        const createItemForm = document.getElementById('create-item-form');
        createItemForm.reset();
    },
};

const view = {
    displayTodoItems: function() {
        const todoListUl = document.querySelector('ul');
        todoListUl.innerHTML = '';

        model.items.forEach(function(item, index) {
            const itemLi = document.createElement('li');
            itemLi.id = index;

            const toggleItemCheckbox = document.createElement('input');
            toggleItemCheckbox.type = 'checkbox';
            toggleItemCheckbox.classList.add('toggle-item-checkbox');
            toggleItemCheckbox.addEventListener('change', controller.toggleItem.bind(controller));
            toggleItemCheckbox.checked = item.done;

            const updateItemInput = document.createElement('input');
            updateItemInput.classList.add('update-item-input', 'hide');
            updateItemInput.type = 'text';
            updateItemInput.value = item.name;
            updateItemInput.addEventListener('keyup', controller.updateItemNameOnKeyUp.bind(controller));
            updateItemInput.addEventListener('focusout', controller.updateItemNameOnFocusOut.bind(controller));

            const itemLabel = document.createElement('label');
            itemLabel.addEventListener('click', controller.turnOnUpdatingMode.bind(controller));
            itemLabel.textContent = item.name;
            itemLabel.classList.add('item-label');

            const deleteItemButton = document.createElement('button');
            deleteItemButton.textContent = '-';
            deleteItemButton.className = 'delete-button';
            deleteItemButton.addEventListener('click', controller.deleteItem.bind(controller, index));

            if (item.done === true) {
                itemLabel.classList.add('item-strikethrough');
            } else {
                itemLabel.classList.remove('item-strikethrough');
            }

            itemLi.appendChild(toggleItemCheckbox);
            itemLi.appendChild(itemLabel);
            itemLi.appendChild(updateItemInput);
            itemLi.appendChild(deleteItemButton);
            todoListUl.insertBefore(itemLi, todoListUl.childNodes[0]);
        });

        const toggleAllItemsButton = document.querySelector('#toggle-all-items-button');
        if (model.countItems().numItems > 0) {
            view.displayDOMElement(toggleAllItemsButton);
        } else {
            view.hideDOMElement(toggleAllItemsButton);
        }

        const createItemButton = document.querySelector('#create-item-button');
        const createInputElement = document.getElementById('create-item-input');
        if (createInputElement.value) {
            view.displayDOMElement(createItemButton);
        } else {
            view.hideDOMElement(createItemButton);
        }
    },

    displayDOMElement: function(domElement) {
        domElement.classList.remove('hide');
    },

    hideDOMElement: function(domElement) {
        domElement.classList.add('hide');
    }
};

// Initial rendering of todo items
view.displayTodoItems();


