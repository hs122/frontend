const mongoose = require('mongoose')

const Schema = mongoose.Schema
const detailsSechma = new Schema({
    name:{type:String , required:true},
    mobile:{type:Number , required:true},
    address:{type:String , required:true},
    creator:{type:mongoose.Types.ObjectId , required:true ,ref:'User'}
})

module.exports = mongoose.model('Details',detailsSechma)