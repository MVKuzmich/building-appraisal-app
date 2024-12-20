import { useHttp } from "../hooks/http.hook";

const BuildingService = () => {
    console.log('BUILD_VERSION:', Date.now()); // Для проверки что код обновился
    const {request, loading, error, clearError} = useHttp();

    // Добавляем отладочную информацию
    console.log('Environment variables:', process.env);
    console.log('API_BASE_URL:', process.env.REACT_APP_API_BASE_URL);

    const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

    const getBuildingTypes = async (params) => {
        clearError();
        const res = await request(`${API_BASE_URL}/api/building-types`, 'GET', null, {'Content-Type': 'application/json'}, params);
        return res;
    }
    
    const exportToExcel = async (data) => {
        clearError();
        const response = await request(`${API_BASE_URL}/api/export-to-xlsx`, 'POST', 
           data,
            { 'Content-Type': 'application/json' },
            {},
            'blob'
        );
        return response;
    }


    return {loading, error, getBuildingTypes, exportToExcel};
    
}


export default BuildingService;