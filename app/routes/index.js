const express = require('express')
const router = express.Router()

const sierra = require('../db/sierra')

router.get('/', function (req, res, next) {
  const sql = `
    SELECT DISTINCT
      sierra_view.course_record_item_record_link.item_record_id,
      varfield_view.record_num,
      title,
      content,
      field_content,
      sierra_view.bib_view.record_num as bibrecord, 
      (REPLACE(REPLACE(item_record_property.call_number, '|a', ''), '|b', ' ')) as call_number,
      item_view.location_code,
      location_name.name as location,
      item_record.is_available_at_library as status
    FROM sierra_view.course_record
    LEFT JOIN sierra_view.course_record_item_record_link
      ON sierra_view.course_record.record_id = sierra_view.course_record_item_record_link.course_record_id
    LEFT JOIN sierra_view.varfield_view
      ON sierra_view.varfield_view.record_id = course_record.id
    LEFT JOIN sierra_view.subfield_view
      ON sierra_view.subfield_view.record_id = sierra_view.course_record.id
    LEFT JOIN sierra_view.item_view
      ON sierra_view.item_view.id = sierra_view.course_record_item_record_link.item_record_id
    LEFT JOIN sierra_view.bib_record_item_record_link
      ON sierra_view.item_view.id = sierra_view.bib_record_item_record_link.item_record_id
    LEFT JOIN sierra_view.bib_view
      ON sierra_view.bib_record_item_record_link.bib_record_id = sierra_view.bib_view.id
    LEFT JOIN sierra_view.item_record_property
      ON sierra_view.item_record_property.item_record_id = sierra_view.item_view.id
    LEFT JOIN sierra_view.item_record
      ON sierra_view.item_record.id = sierra_view.item_view.id
    LEFT JOIN sierra_view.location
      ON item_view.location_code = location.code
    LEFT JOIN sierra_view.location_name
      ON location.id = location_name.location_id
    WHERE varfield_type_code = 'r'
      AND field_type_code = 'p'
      AND sierra_view.course_record_item_record_link.item_record_id is not null
    ORDER BY varfield_view.record_num
    `

  sierra.query(sql)
    .then(result => {
      console.log('finished')
      res.render('index', { title: 'Course Reserves Search', items: result.rows })
    })
    .catch(next)
})

module.exports = router
