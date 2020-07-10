const mysql = require("mysql");
const Json2csvParser = require("json2csv").Parser;
const fs = require("fs");

const async =  require('async')

const config = require('./config.json')

var dir = config.file.output;

if (!fs.existsSync(dir)){
    fs.mkdirSync(dir);
}

var database = config.database;
// Create a connection to the database
const connection = mysql.createConnection(config.db);


// open the MySQL connection
// testing for Branching -git flow
connection.connect(error => {
  if (error) throw error;


  async.forEachOf(database, function (databaseElement, db){

    var db = databaseElement;

    var db_path = dir + '/' +db
        
    if (!fs.existsSync(db_path)){
        fs.mkdirSync(db_path);
    }
  // query data from MySQL
    var schemaQuery = `SELECT table_name FROM information_schema.tables WHERE table_schema = '${db}' `;
      // console.log(schemaQuery);
    connection.query(schemaQuery, function(error, data, fields) {
        if (error) throw error;
            // console.log('data'+data);
            async.forEachOf(data, function (dataElement, i){
                // console.log(dataElement);
                var query1 =  `SELECT * FROM ${db}.${data[i].table_name} limit 1`;

                var file = db_path + "/mysql_"+data[i].table_name +".csv";

                // console.log(query1);
                connection.query(query1, function(error, data1, fields1) {
                    if (error) throw error;
                    const jsonData = JSON.parse(JSON.stringify(data1));
                    // console.log("jsonData", jsonData,file );
                    const json2csvParser = new Json2csvParser({ header: true});

                    var csv ;
                    if(jsonData.length) {
                        csv = json2csvParser.parse(jsonData);
                    } else{

                        csv = json2csvParser.parse([{field: null}], {flatten: true});
                        
                    }

                    fs.writeFile(file, csv, function(error) {
                    if (error) throw error;
                    console.log("Write to "+file+ "successfully!");
                    });
                });
            });
        });

  });


});