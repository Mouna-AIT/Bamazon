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
    console.log("");
    console.log("Hello, Welcome to Bamazon!!");
    console.log("");
});

// check and buy function, dispays all items from sql and then adds functionality to buy an itemand choise quantity
var checkAndBuy = function() {
    connection.query('SELECT * FROM products', function(err, res) {
        if (err) throw err;
        // Table using CLI
        var table = new Table({
            head: ['item_id', 'product_name', 'department_name', 'price', 'stock_quantity'],
            colWidths: [10, 20, 20, 10, 10]
        });

        // Displays Items for sale     
        console.log("THESE ARE ALL THE ITEMS AVAILABLE FOR SALE: ");
        console.log("==========================================");
        for (var i = 0; i < res.length; i++) {
            table.push([res[i].item_id, res[i].product_name, res[i].department_name, res[i].price.toFixed(2), res[i].stock_quantity]);
        }
        console.log("----------------------------------------------------------------------------");

        // Table with Items on for purchase
        console.log(table.toString());
        console.log("----------------------------------------------------------------------------");
        inquirer.prompt([{
            name: "itemId",
            type: "input",
            message: "What is the item ID you would like to buy?",
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }
        }, {
            name: "Quantity",
            type: "input",
            message: "how many units of the product they would like to buy?",
            validate: function(value) {
                if (isNaN(value) == false) {
                    return true;
                } else {
                    return false;
                }
            }

        }]).then(function(answer) {
            // console.log(res)
            var chosenId = answer.itemId - 1
            var chosenProduct = res[chosenId]
            var chosenQuantity = answer.Quantity
            if (chosenQuantity < res[chosenId].stock_quantity) {
                console.log("Your total for " + "(" + answer.Quantity + ")" + "x " + res[chosenId].product_name + " is: $ " + res[chosenId].price.toFixed(2) * chosenQuantity);
                connection.query("UPDATE products SET ? WHERE ?", [{
                    stock_quantity: res[chosenId].stock_quantity - chosenQuantity
                }, {
                    item_id: res[chosenId].item_id

                }], function(err, res) {
                    // console.log(err);
                    checkAndBuy();
                });

            } else {
                console.log("Oh! Sorry, insufficient Quanity at this time. All we have is " + res[chosenId].stock_quantity + " in the Inventory at the moment.");
                checkAndBuy();
            }
        })
    })
}

checkAndBuy()