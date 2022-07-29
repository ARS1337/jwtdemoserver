const checkQueryResult = (result) => {
  //checks if the result has returned some data or not
  //only use when you are returning some result from db, to achieve this    
  // always return something from query like 'returning id' 
  //'id' here is a column name in the db 
  return result && result?.rows && result?.rows?.length > 0;
};

module.exports = checkQueryResult
