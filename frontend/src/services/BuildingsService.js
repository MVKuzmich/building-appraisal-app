import { useHttp } from "../hooks/http.hook";

const BuildingService = () => {
    const {request, loading, error, clearError} = useHttp();

    const getBuildingTypes = async (params) => {
        clearError();
        const res = await request("http://localhost:8080/building-types", 'GET', null, {'Content-Type': 'application/json'}, params);
        return res;
    }

    return {loading, error, getBuildingTypes};
}

export default BuildingService;