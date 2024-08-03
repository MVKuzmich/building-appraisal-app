const InsuranceAssessmentSheet = ({ data }) => {
    return (
      <div className="assessment-sheet">
        <table>
          <thead>
            <tr>
              <th>№</th>
              <th>Наименование строений</th>
              <th>Год постройки</th>
              <th>Фундамент</th>
              <th>Материал стен</th>
              <th>Крыша</th>
              <th>Длина</th>
              <th>Ширина</th>
              <th>Высота</th>
              <th>Тип строения</th>
              <th>Оценочная норма</th>
              <th>Кубатура / Площадь</th>
              <th>Кубатура / Площадь</th>
              <th>Кубатура / Площадь</th>
              {/* Add more headers based on your requirements */}
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>1</td>
              <td>{data.buildingType}</td>
              <td>{data.constructionYear}</td>
              <td>{data.walls}</td>
              {/* Add more cells based on your data */}
            </tr>
            {/* You can add more rows if needed */}
          </tbody>
        </table>
        <div className="assessment-totals">
          <p>Общие надбавки к оценочной стоимости строения: {/* Calculate and display total */}</p>
          <p>Итого: {/* Calculate and display total */}</p>
        </div>
      </div>
    );
  };
  
  export default InsuranceAssessmentSheet;