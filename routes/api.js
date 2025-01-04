'use strict';

require('dotenv').config();
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI);

const projectSchema = new mongoose.Schema({
  project_name: { type: String, required: true },
  issue_title: { type: String, required: true },
  created_by: { type: String, required: true },
  issue_text: { type: String, default: '' },
  created_on: { type: String, default: () => new Date().toISOString() },
  updated_on: { type: String, default: () => new Date().toISOString() },
  assigned_to: { type: String, default: '' },
  open: { type: Boolean, default: true },
  status_text: { type: String, default: '' }
});

const Project = mongoose.model('Project', projectSchema);


module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      Project.find({ project_name: req.params.project, ...req.query })
        .then(data => res.json(data))
        .catch(err => res.json({ error: err.message }));      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      const { issue_title, issue_text, created_by,
        assigned_to, status_text } = req.body;

      if (issue_title === undefined || created_by === undefined)
        return res.json({ error: 'required field(s) missing' });

      let currDate = new Date().toISOString();

      new Project({
        project_name: project,
        issue_title,
        issue_text,
        created_on: currDate,
        updated_on: currDate,
        created_by,
        assigned_to,
        open: true,
        status_text
      }).save()
        .then(() => {
          Project.findOne({ updated_on: currDate }) 
            .then(data => res.json(data))
            .catch(err => res.json({ error: err.message }));
        })
        .catch(err => res.json({ error: err.message }));     
    })
    
    .put(function (req, res){
      if (req.body._id == undefined)
        return res.json({ error: 'missing _id' });

      const { _id, ...fieldsToUpdate } = req.body;

      if (Object.keys(fieldsToUpdate).length === 0)
        return res.json({ error: 'no update field(s) sent', _id: req.body._id });

      fieldsToUpdate.updated_on = new Date().toISOString();

      Project.findOneAndUpdate(
        { project_name: req.params.project, _id },
        fieldsToUpdate, { new: true })
        .then(data => {
          if (data)
            res.json({ result: 'successfully updated', _id: req.body._id })
          else
            res.json({ error: 'could not update', _id: req.body._id })
        })
        .catch(err => res.json({ error: 'could not update' }));      
    })
    
    .delete(function (req, res){
      if (req.body._id === undefined)
        return res.json({ error: 'missing _id' });

      let _id = req.body._id;

      Project.deleteOne({ project_name: req.params.project, _id })
        .then(data => {
          if (data.deletedCount === 1)
            res.json({ result: "successfully deleted", _id });
          else
            res.json({ error: "could not delete", _id });
        })
        .catch(err => res.json({ error: "could not delete", _id }));      
    });
    
};
