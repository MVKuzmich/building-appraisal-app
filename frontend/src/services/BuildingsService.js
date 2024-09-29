import { useHttp } from "../hooks/http.hook";

const BuildingService = () => {
    const {request, loading, error, clearError} = useHttp();

    const getBuildingTypes = async (params) => {
        clearError();
        const res = await request("http://localhost:8080/building-types", 'GET', null, {'Content-Type': 'application/json'}, params);
        return res;
    }
    const exportToExcel = async (data) => {
        clearError();
        const response = await request("http://localhost:8080/export-to-xlsx", 'POST', 
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