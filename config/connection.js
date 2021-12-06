const mongoClient = require('mongodb').MongoClient
const state ={
    db:null
}

module.exports.connect = (done)=>{
    const url = `mongodb+srv://${process.env.MONGO_DB_USER}:${process.env.MONGO_DB_PASS}e@cluster0.lisoy.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`
    const dbname = 'ec'

    mongoClient.connect(url,(err,data)=>{
        if(err){
            return done(err)
        }
        state.db = data.db(dbname)
        done()
    })
}

module.exports.get = ()=>{
    return state.db
}