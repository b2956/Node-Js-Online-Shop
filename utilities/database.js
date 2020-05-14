const mongodb = require("mongodb/index");

const MongoClient = mongodb.MongoClient;

let _database;


const mongoConnect = (callback) => {

    MongoClient
        .connect("mongodb+srv://nodeJS_app:kLWrZsC9Q4e8BQA@cluster0-ei6pt.mongodb.net/test?retryWrites=true&w=majority")
        .then(client => {
            console.log('Connected');
            _database = client.db();
            callback();
        })
        .catch((err) => {
            console.log(err)
            throw err;
        });
};

const getDb = () => {
    if (_database) {
        return _database;
    }
    throw 'No database found';
};

exports.mongoConnect = mongoConnect;
exports.getDb = getDb;



