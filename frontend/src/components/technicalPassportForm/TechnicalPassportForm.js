import {Formik, Form, Field} from 'formik';
import {TextField} from 'formik-mui';
import { Button } from 'react-bootstrap';
import './TechnicalPassportForm.css';


const TechnicalPassportForm = () => {
    return (
      <div className="technical-passport-container">
        <div className="form-container">
          <h2>Информация о строении в техническом паспорте</h2>
          <Formik
            initialValues={{
              buildingType: '',
              constructionYear: '',
              depriciation: '',
              area: '',
              volume: '',
              foundation: '',
              walls: '',
              dividers: '',
              overlaps: '',
              roof: '', 
              floors: '',
              windows: '',
              doors: '',
              decoration: '',
              heating: '',
              plumbing: '',
              sewerage: '',
              electricity: '',
              gas: '',
              other: ''
            }}
            onSubmit={(values) => {
              // Обработка отправки формы
            }}
          >
            <Form>
              <div className='form-section'>
                <h3>Общая информация</h3>
                <div className='form-row'>
                  <Field className="form-field" name="buildingType" component={TextField} label="Наименование строения"/>
                  <Field className="form-field" name="constructionYear" component={TextField} label="Год постройки" type="number"/>
                  <Field className="form-field" name="depriciation" component={TextField} label="Износ" type="number"/>
                  <Field className="form-field" name="area" component={TextField} label="Площадь" type="number"/>
                  <Field className="form-field" name="volume" component={TextField} label="Объем" type="number"/>
                </div>
              </div>
              <div className='form-section'>
                <h3>Описание конструктивных элементов и инженерных систем</h3>                
                <div className='form-row'>
                  <Field className="form-field" name="foundation" component={TextField} label="Фундамент"/>
                  <Field className="form-field" name="walls" component={TextField} label="Стены"/>
                  <Field className="form-field" name="dividers" component={TextField} label="Перегородки"/>
                  <Field className="form-field" name="overlaps" component={TextField} label="Перекрытия"/>
                  <Field className="form-field" name="roof" component={TextField} label="Крыша"/>
                  <Field className="form-field" name="floors" component={TextField} label="Полы"/>
                  <Field className="form-field" name="windows" component={TextField} label="Окна"/>
                  <Field className="form-field" name="doors" component={TextField} label="Двери"/>
                  <Field className="form-field" name="decoration" component={TextField} label="Отделка"/>
                  <Field className="form-field" name="heating" component={TextField} label="Отопление"/>
                  <Field className="form-field" name="plumbing" component={TextField} label="Водопровод"/>
                  <Field className="form-field" name="sewerage" component={TextField} label="Канализация"/>
                  <Field className="form-field" name="electricity" component={TextField} label="Электричество"/>
                  <Field className="form-field" name="gas" component={TextField} label="Газоснабжение"/>
                  <Field className="form-field" name="other" component={TextField} label="Иное"/>
                </div>
              </div>
                       
              
              <Button className="submit-button" type="submit">Найти Тип строения</Button>
            </Form>
          </Formik>
        </div>
      </div>
      );
}

export default TechnicalPassportForm;