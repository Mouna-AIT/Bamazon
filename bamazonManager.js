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
    console.log("Using Port: " + connection.threadId)
})

// Main manager prompt which runs for the manager file which has many diffrent options to choose from

var managerPrompt = function() {
    inquirer.prompt({
        name: "action",
        type: "list",
        message: "Hello! What would you like to do?",
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