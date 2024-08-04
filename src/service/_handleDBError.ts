import ServiceError from '../core/serviceError'; 

const handleDBError = (error: any): any => {
  const { code = '', sqlMessage } = error; 

  //ER duplicate  (duplicates)
  if (code === 'ER_DUP_ENTRY') {
    switch (true) {
      case sqlMessage.includes('idx_team_name_unique'):
        return ServiceError.validationFailed(
          'A team with this name already exists'
        );
      case sqlMessage.includes('idx_rider_id_unique'):
        return ServiceError.validationFailed(
          'There is already a rider with this id'
        );
      default:
        return ServiceError.validationFailed('This item already exists');
    }
  }

  // 👇 4
  if (code.startsWith('ER_NO_REFERENCED_ROW')) {
    switch (true) {
      case sqlMessage.includes('fk_team_rider'):
        return ServiceError.notFound('This rider does not exist');
    }
  }

  // Return error because we don't know what happened
  return error;
};

export default handleDBError; // 👈 1
