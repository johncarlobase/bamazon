var mysql = require("mysql");
var inquirer = require("inquirer");
var colors = require('colors');
var Table = require("cli-table2");

var connection = mysql.createConnection({
    host: "localhost",
  
    // Your port; if not 3306
    port: 3306,
  
    // Your username
    user: "root",
  
    // Your password
    password: "",
    database: "bamazon_db"
  });
  
  connection.connect();

var display = function() {
  connection.query("SELECT * FROM products", function(err, res) {
    if (err) throw err;
    console.log("");
    console.log("");
      console.log("");
    console.log("-----------------------------".rainbow);
    console.log("      Welcome To Bamazon    ".brightYellow);
    console.log("-----------------------------".rainbow);
    console.log("");
    console.log("Find below our Products List".brightYellow);
    console.log("");
    var table = new Table({
      
      head: ["Product Id".magenta, "Product Description".magenta, "Dept".magenta, "Cost".magenta, "Stock QTY".magenta],
      colWidths: [12, 50, 21, 8, 12],
      colAligns: ["center", "left", "left", "right", "center"],
      style: {
        head: ["aqua"],
        compact: true
        
      }
    });

    for (var i = 0; i < res.length; i++) {
      table.push([res[i].item_id, res[i].product_name, res[i].dept_name, res[i].price, res[i].stock_quantity]);
    }

    console.log(table.toString());
    console.log("");
    shopping();
  }); //End Connection to products
};

var shopping = function() {
  inquirer
    .prompt({
      name: "productToBuy",
      type: "input",
      message: "Please enter the Product Id of the item you wish to purchase = ".magenta
    })
    .then(function(answer1) {
      var selection = answer1.productToBuy;
      connection.query("SELECT * FROM products WHERE item_id=?", selection, function(
        err,
        res
      ) {
        if (err) throw err;
        if (res.length === 0) {
          console.log(
            "That Product doesn't exist, Please enter a Product Id from the list above"
          );

          shopping();
        } else {
          inquirer
            .prompt({
              name: "quantity",
              type: "input",
              message: "How many items would you like to purchase?...".magenta
            })
            .then(function(answer2) {
              var quantity = answer2.quantity;
              if (quantity > res[0].stock_quantity) {
                console.log("----------------------------------------------------------------------".brightWhite)
                console.log(
                  "Our Apologies we only have " +
                    res[0].stock_quantity +
                    " items of the product selected"
                )
                console.log("----------------------------------------------------------------------".brightWhite);
                shopping();
              } else {
                console.log("");
                console.log(res[0].product_name.underline.yellow + " successfully purchased!");
                console.log(quantity.underline.yellow + " qty @ $".underline.yellow + res[0].price);
                console.log("Total Price = $".underline.yellow+quantity*res[0].price)

                var newQuantity = res[0].stock_quantity - quantity;
                connection.query(
                  "UPDATE products SET stock_quantity = " +
                    newQuantity +
                    " WHERE item_id = " +
                    res[0].item_id,
                  function(err, resUpdate) {
                    if (err) throw err;
                    console.log("");
                    console.log("Your Order has been Processed");
                    console.log("Thank you for Shopping with us...!");
                    console.log("");
                    connection.end();
                  }
                );
              }
            });
        }
      });
    });
};

display();