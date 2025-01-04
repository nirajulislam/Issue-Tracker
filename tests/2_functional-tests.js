const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let VALID_ID = '?';

suite('Functional Tests', function() {
  
    suite('POST /api/issues/{project}', function() {
      test('Create an issue with every field', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Test Title',
            issue_text: 'Test text',
            created_by: 'Tester',
            assigned_to: 'Test Assignee',
            status_text: 'In Progress'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Test Title');
            assert.equal(res.body.created_by, 'Tester');
            VALID_ID = res.body._id;
            done();
          });
      });
  
      test('Create an issue with only required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_title: 'Required Field Test',
            issue_text: 'Test text',
            created_by: 'Tester'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.equal(res.body.issue_title, 'Required Field Test');
            assert.equal(res.body.created_by, 'Tester');
            done();
          });
      });
  
      test('Create an issue with missing required fields', function(done) {
        chai.request(server)
          .post('/api/issues/test')
          .send({
            issue_text: 'Missing required fields'
          })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.property(res.body, 'error');
            done();
          });
      });
    });
  
    suite('GET /api/issues/{project}', function() {
      test('View issues on a project', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
  
      test('View issues on a project with one filter', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ open: true })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
  
      test('View issues on a project with multiple filters', function(done) {
        chai.request(server)
          .get('/api/issues/test')
          .query({ open: true, assigned_to: 'Test Assignee' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.isArray(res.body);
            done();
          });
      });
    });
  
    suite('PUT /api/issues/{project}', function() {
      test('Update one field on an issue', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({ _id: VALID_ID, issue_text: 'Updated text' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, 'result', 'successfully updated');
            done();
          });
      });
  
      test('Update multiple fields on an issue', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({ _id: VALID_ID, issue_text: 'Updated text', assigned_to: 'Updated Assignee' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, 'result', 'successfully updated');
            done();
          });
      });
  
      test('Update an issue with missing _id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({ issue_text: 'No ID provided' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, 'error', 'missing _id');
            done();
          });
      });
  
      test('Update an issue with no fields to update', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({ _id: VALID_ID })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, 'error', 'no update field(s) sent');
            done();
          });
      });
  
      test('Update an issue with an invalid _id', function(done) {
        chai.request(server)
          .put('/api/issues/test')
          .send({ _id: 'invalid_id', issue_text: 'Update with invalid ID' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, 'error', 'could not update');
            done();
          });
      });
    });
  
    suite('DELETE /api/issues/{project}', function() {
      test('Delete an issue', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: VALID_ID })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, 'result', 'successfully deleted');
            done();
          });
      });
  
      test('Delete an issue with an invalid _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({ _id: 'invalid_id' })
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, 'error', 'could not delete');
            done();
          });
      });
  
      test('Delete an issue with missing _id', function(done) {
        chai.request(server)
          .delete('/api/issues/test')
          .send({})
          .end(function(err, res) {
            assert.equal(res.status, 200);
            assert.propertyVal(res.body, 'error', 'missing _id');
            done();
          });
      });
    });
  
  });