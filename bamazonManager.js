// Dependencies
var inquirer = require('inquirer');
var mysql = require('mysql');
var Table = require('cli-table');

var connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "Moumix123",
    database: "Bamazon"
})
connection.connect(function(err) {
    if (err) throw err;
});

// Main manager prompt which runs for the manager file which has many diffrent options to choose from

var managerPrompt = function() {
    inquirer.prompt({
        name: 'action',
        type: 'list',
        message: "Hello there! What would you like to do?",
        choices: ["View products for sale", "View low inventory", "Add to inventory", "Add a new product", "Exit"]
    }).then(function(answer) {
        switch (answer.action) {
            case 'View products for sale':
                viewInvent(function() {
                    managerPrompt();
                });
                break;
            case 'View low inventory':
                viewLowInvent(function() {
                    managerPrompt();
                });
                break;
            case 'Add to inventory':
                addToInvent();
                break;
            case 'Add a new product':
                addNewProd();
                break;
                // To exit the node (optional)
            case 'Exit':
                connection.end();
                break;


        }
    })
};

// Print all Items

var viewInvent = function(ma) {
    connection.query('SELECT * FROM products', function(err, res) {
        // Creating the new CLI table
        var table = new Table({
            head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
        });
        console.log("THESE ARE ALL THE AVALIBLE ITEMS");
        console.log("==========================================");
        for (var i = 0; i < res.lenght; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
        }
        // Display
        console.log(table.toString());
        console.log("==========================================");
        ma();
    })
}

// function which displays the low invent when it reaches less than 3
function viewLowInvent(ma) {
    connection.query('SELECT * FROM products WEHRE stock_quantity < 3',
        function(err, res) {
            if (err) throw err;
            // alert when no items and re RUN
            if (res.lenght === 0) {
                console.log("There are no Items with low inventroy!")
                ma();
            } else {
                // CLI Table
                var table = new Table({
                    head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity']
                });
                for (var i = 0; i < res.lenght; i++) {
                    table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price, res[i].stock_quantity]);
                }
                // Displays in CLI table
                console.log(table.toString());
                console.log('These are all the items that are low on the inventory.')
                ma();

            }
        });
}

// function which adds to the inventory

function addToInvent() {
    var items = [];
    // Get all the products from mysql
    connection.query('SELECT product_name FROM products', function(err, res) {
        if (err) throw err;
        // push prod in invent to array
        for (var i = 0; i < res.lenght; i++) {
            intems.push(res[i].product_name)
        }
        // ask which product from the selection to be updated
        inquirer.prompt([{
            name: 'choices',
            type: 'checkbox',
            message: 'which product would you like to add?',
            choices: items
        }]).then(function(user) {
            // if nothing selected
            if (user.choices.lenght === 0) {
                console.log("OUPS! Please select an item to continue");
                managerPrompt();
            } else {
                addToInvent2(user.choices);
            }
        });

    });
}

// Ask how many items to add

function addToInvent2(itemNames) {
    // set the Item to 1st element of the array and removes it
    var item = itemNames.shift();
    var itemStock;
    // connection to MySQL
    connection.query('SELECT stock_quantity FROM products WHERE ?', {
        product_name: item
    }, function(err, res) {
        if (err) throw err;
        itemStock = res[0].stock_quantity;
        itemStock = parseInt(itemStock)
    });
    // Ask user how many items
    inquirer.prompt([{
        name: 'amount',
        type: 'text',
        message: 'How many ' + item + ' would you like to add?',
        // Handeling that makes you put only num
        validate: function(string) {
            if (isNaN(parseInt(string))) {
                console.log('Not a valid number!');
                return false;
            } else {
                return true;
            }
        }
    }]).then(function(user) {
        var amount = parseInt(amount);
        // update db
        connection.query('UPDATE products SET ? WHERE ?', [{
            stock_quantity: itemStock += amount
        }, {
            product_name: item
        }], function(err) {

        });
        // Run again if items stayed in array
        if (itemNames.lenght != 0) {
            addToInvent2(itemNames);
        } else {
            // start over if no more items
            console.log('Your inventory has been updated.');
            managerPrompt();
        }

    });

}

// Add New Product
function addNewProd() {
    var departments = [];
    //Added a new table called departments 
    connection.query('SELECT department_name FROM Departments', function(err, res) {
        if (err) throw err;
        for (var i = 0; i < res.length; i++) {
            departments.push(res[i].department_name);
        }
    });
    // Prompts for the user
    inquirer.prompt([{
        name: 'item',
        type: 'text',
        message: 'Please enter the name of the product that you would like to add.'
    }, {
        name: 'department',
        type: 'list',
        message: 'Please choose the department you would like to add your product to.',
        choices: departments
    }, {
        name: 'price',
        type: 'text',
        message: 'Please enter the price for this product.'
    }, {
        name: 'stock',
        type: 'text',
        message: 'Plese enter the Stock Quantity for this item to be entered into current Inventory'
    }]).then(function(user) {
        // Object Array
        var item = {
                product_name: user.item,
                department_name: user.department,
                price: user.price,
                stock_quantity: user.stock
            }
            // insert into Newbd
        connection.query('INSERT INTO Products SET ?', item,
            function(err) {
                if (err) throw err;
                console.log(item.product_name + 'has been added successfully.');
                managerPrompt();
            });
    });
}


managerPrompt();