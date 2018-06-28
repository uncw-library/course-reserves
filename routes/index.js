var express = require('express');
var router = express.Router();

// bring in our DB connection
var sierra = require('../db/sierra');

/* GET home page. */
router.get('/', function(req, res, next) {
  
  const sql = "" +

  // "Select distinct varfield_view.record_num,content,field_content,sierra_view.course_record_item_record_link.item_record_id " +
  // "from sierra_view.course_record " +

  // "LEFT JOIN  sierra_view.course_record_item_record_link " +
  // "ON sierra_view.course_record.record_id=sierra_view.course_record_item_record_link.course_record_id " +

  // "LEFT JOIN sierra_view.varfield_view " +
  // "ON sierra_view.varfield_view.record_id=course_record.id " +

  // "LEFT JOIN sierra_view.subfield_view " +
  // "ON sierra_view.subfield_view.record_id=sierra_view.course_record.id " +

  // "where varfield_type_code='r' " +
  // "and field_type_code='p' " +

  // "and sierra_view.course_record_item_record_link.item_record_id is not null " +

  // "order by varfield_view.record_num ";


  "Select distinct sierra_view.course_record_item_record_link.item_record_id,varfield_view.record_num,content,field_content, " +
  "sierra_view.bib_view.record_num as bibrecord, call_number,item_view.location_code,item_status_code, title " +
  "from sierra_view.course_record " +
  
  "LEFT JOIN  sierra_view.course_record_item_record_link " +
  "ON sierra_view.course_record.record_id=sierra_view.course_record_item_record_link.course_record_id " +
  
  "LEFT JOIN sierra_view.varfield_view " +
  "ON sierra_view.varfield_view.record_id=course_record.id " +
  
  "LEFT JOIN sierra_view.subfield_view " +
  "ON sierra_view.subfield_view.record_id=sierra_view.course_record.id " +
  
  "LEFT JOIN sierra_view.item_view " +
  "ON sierra_view.item_view.id=sierra_view.course_record_item_record_link.item_record_id " +
  
  "LEFT JOIN sierra_view.bib_record_item_record_link " +
  "ON sierra_view.item_view.id=sierra_view.bib_record_item_record_link.item_record_id " +
  
  
  "LEFT JOIN sierra_view.bib_view " +
  "ON sierra_view.bib_record_item_record_link.bib_record_id=sierra_view.bib_view.id " +
  
  "LEFT JOIN sierra_view.item_record_property " +
  "ON sierra_view.item_record_property.item_record_id=sierra_view.item_view.id " +
  
  
  "where varfield_type_code='r' " +
  "and field_type_code='p' " +
  
  "and sierra_view.course_record_item_record_link.item_record_id is not null " +
  
  "order by varfield_view.record_num " ;


  console.log('hit');
  sierra.query(sql, (err, result) => {
    console.log('finished');
    if (err) console.log(err)
    console.log(result.rows);
    res.render('index', { title: 'Course Reserves Search', items: result.rows });
  })
});

module.exports = router;
