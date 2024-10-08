import {Formik, Form, Field} from 'formik';
import {TextField} from 'formik-mui';
import { Button } from 'react-bootstrap';
import './BuildingTypeSearchForm.css';
import BuildingService from '../../services/BuildingsService';
import ErrorBoundary from '../errorBoundary/ErrorBoundary';

const BuildingTypeSearchForm = ({setBuildingTypes}) => {
  const {loading, error, getBuildingTypes} = BuildingService();
  
  return (
    <div className="search-form-container">
      <div className="form-container">
        <h2>Введите информацию о типе строения</h2>
        <ErrorBoundary>
          <Formik
            initialValues={{
              buildingType: '',
              buildingName: '',
            }}
            onSubmit={(values, {resetForm}) => {
              getBuildingTypes(values).then((res) => {
                setBuildingTypes(res);
                resetForm();

              }).catch(err => {
                console.error("Error fetching building types:", err);
              });
            }}
          >
            <Form>
              <div className='form-section'>
                <div className='form-row'>
                  <Field className="form-field" name="buildingType" component={TextField} label="Номер Типа строения"/>
                  <Field className="form-field" name="buildingName" component={TextField} label="Наименование строения"/>
                  <Button className="submit-button" type="submit" disabled={loading}>
                    {loading ? 'Загрузка...' : 'Найти Тип строения'}
                  </Button>
                </div>
              </div>
            </Form>
          </Formik>  
        </ErrorBoundary>
        
        {error && <div className="error-message">{error}</div>}
      </div>
    </div>
  );
}

export default BuildingTypeSearchForm;