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
    console.log("");
    console.log("Hello, Welcome to Bamazon Manager!");
    console.log("");
});

// Main manager prompt which runs for the manager file which has many diffrent options to choose from

var managerPrompt = function() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "What would you like to do?",
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