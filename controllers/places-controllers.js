const { v4: uuidv4 } = require('uuid');
const { validationResult } = require('express-validator');

const HttpError = require('../models/http-error');
const Details = require('../models/details')
const mongoose = require('mongoose')

const User = require('../models/user');
const mongooseUniqueValidator = require('mongoose-unique-validator');


const getPlaceById = async(req, res, next) => {
    const placeId = req.params.pid;

    let detail;
    try {
        detail = await Details.findById(placeId);
    } catch (err) {
        const error = new HttpError(
            'Something went wrong, could not find a place.',
            500
        );
        return next(error);
    }

    if (!detail) {
        const error = new HttpError(
            'Could not find a place for the provided id.',
            404
        );
        return next(error);
    }

    res.json({ detail: detail.toObject({ getters: true }) });
};



// function getPlaceById() { ... }
// const getPlaceById = function() { ... }

const getPlacesByUserId = async(req, res, next) => {
    const userId = req.params.uid;

    // let places;
    let userWithDetails;
    try {
        userWithDetails = await User.findById(userId).populate('details');
    } catch (err) {
        const error = new HttpError(
            'Fetching places failed, please try again later',
            500
        );
        return next(error);
    }

    // if (!places || places.length === 0) {
    if (!userWithDetails || userWithDetails.details.length === 0) {
        return next(
            new HttpError('Could not find places for the provided user id.', 404)
        );
    }

    res.json({
        details: userWithDetails.details.map(place =>
            place.toObject({ getters: true })
        )
    });
};

const createDetails = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(
            new HttpError('Invalid inputs passed, please check your data.', 422)
        );
    }

    const { name, mobile, address, creator } = req.body;

    // const title = req.body.title;
    const createdDetails = new Details({
        name,
        mobile,
        address,
        creator
    })
    let user;
    try{
     user = await User.findById(creator)
     }
    catch(err){
       const error = new HttpError(
         'Creating details failed' , 500
     )
     return next(error)
 }

 if(!user){
     const error = new HttpError(
         'Could not find details id ',404
     )
     return next(error)
 }
 console.log(user)
 try{
   const start = await mongoose.startSession()
   start.startTransaction()
   await createdDetails.save({session:start})
   user.details.push(createdDetails)
   await user.save({session:start})
   await start.commitTransaction()
}
catch(err){
    const error = new HttpError(
        'Creating details failed' , 500
    )
    return next(error)
}
    

    res.status(201).json({ details: createdDetails});
};

const updatePlace = async(req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return next(new HttpError('Invalid inputs passed, please check your data.', 422));
    }

    const { name, mobile,address } = req.body;
    const placeId = req.params.pid;

    let detail
    try{
        detail = await Details.findById(placeId)
    }
    catch(err){
        const error = new HttpError("Something wrong in updated",500)
        return next(error)
    }

   
    detail.name = name;
    detail.mobile = mobile;
    detail.address = address


    try{
        await detail.save()
    }catch(err){
        const error = new HttpError("Something wrong not updated",500)
        return next(error)
    }

    res.status(200).json({detail: detail.toObject({getters:true})});
};

const deletePlace = async(req, res, next) => {
    const placeId = req.params.pid;
    let detail
    try{
        detail = await Details.findById(placeId).populated('creator')
    }
    catch(err){
        const error = new HttpError("Something wrong in deleted",500)
        return next(error)
    }
    if (!detail) {
        const error = new HttpError('Could not find place for this id.', 404);
        return next(error);
      }
    
      try { 
        const start = await mongoose.startSession();
        start.startTransaction();
        await detail.remove({ session: start });
        detail.creator.details.pull(detail);
        await detail.creator.save({ session: start });
        await start.commitTransaction();
      } catch (err) {
        const error = new HttpError(
          'Something went wrong, could not delete place.',
          500
        );
        return next(error);
      }
    
      res.status(200).json({ message: 'Deleted place.' });
    };

exports.getPlaceById = getPlaceById;
exports.getPlacesByUserId = getPlacesByUserId;
exports.createDetails = createDetails;
exports.updatePlace = updatePlace;
exports.deletePlace = deletePlace;