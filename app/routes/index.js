const express = require('express')
const router = express.Router()

const sierra = require('../db/sierra')

router.get('/', async function (req, res, next) {
  let searchString = "Search term"
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
  const result = await sierra.query(sql)
    .catch(next)
  if (!result) {
    return
  }
  const nested = nest_courses(result.rows)
  const data = {
    title: 'Course Reserves Search',
    items: nested,
    searchString: searchString
  }
  res.render('index', data)
})

router.post('/', async function(req, res, next) {
  let searchString = req.body.searchTerm.toLowerCase() || ""
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
      AND (LOWER(content) LIKE '%${searchString}%' OR LOWER(field_content) LIKE '%${searchString}%')
    ORDER BY varfield_view.record_num
    `
  const result = await sierra.query(sql)
    .catch(next)
  if (!result) {
    return
  }
  const nested = nest_courses(result.rows)
  // frontend has div <input placeholder={{searchString}}>.  Default to "Search term" if no searchString
  searchString = searchString.length ? searchString : "Search term"
  const data = {
    title: 'Course Reserves Search',
    items: nested,
    searchString: searchString
  }
  res.render('index', data)
})

function nest_courses(rows) {
  const nested = {}
  for (item of rows) {
    // set up datastructure
    const course = item.record_num
    if (!nested.hasOwnProperty(course)) {
      nested[course] = {
        fac: undefined,
        courseName: [],
        fullItems: []
      }
    }

    const fac = item.content
    nested[course]['fac'] = fac

    // add the courseName if it is not already in nested
    const courseName = item.field_content
    if (!nested[course]['courseName'].includes(courseName)) {
      nested[course]['courseName'].push(courseName)
    }

    // add the fullItem if it is not already in nested
    // deep compare the fullItem objects
    const fullItem = {
      bibRecord: item.bibrecord,
      courseCode: item.call_number,
      itemRecordId: item.item_record_id,
      location: item.location,
      recordNum: item.record_num,
      status: (item.status) ? "Available" : "Checked Out",
      title: item.title
    }
    let found = false
    for (const i of nested[course]['fullItems']){
      if (isEqual(i, fullItem)) {
        found = true
        break
      }
    }
    if (!found) {
      nested[course]['fullItems'].push(fullItem)
    }
  }

  return nested
}

function isEqual(obj1, obj2) {
  let props1 = Object.getOwnPropertyNames(obj1);
  let props2 = Object.getOwnPropertyNames(obj2);
  
  if (props1.length != props2.length) {
    return false
  } 
  for (prop of props1) {
    if (obj1[prop] !== obj2[prop]) {
      return false
    }
  }
  return true;
}

module.exports = router