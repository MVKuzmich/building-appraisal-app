import { useHttp } from '../hooks/http.hook';

const BuildingService = () => {
  const { request, loading, error, clearError } = useHttp();
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  const getBuildingTypes = async (params) => {
    clearError();
    return request(
      `${API_BASE_URL}/api/building-types`,
      'GET',
      null,
      { 'Content-Type': 'application/json' },
      params
    );
  };

  const getBuildingTypeById = async (type) => {
    clearError();
    return request(
      `${API_BASE_URL}/api/building-types/${type}`,
      'GET',
      null,
      { 'Content-Type': 'application/json' }
    );
  };

  const getCommonAdjustments = async () => {
    clearError();
    return request(
      `${API_BASE_URL}/api/common-adjustments`,
      'GET',
      null,
      { 'Content-Type': 'application/json' }
    );
  };

  const exportToExcel = async (data) => request(
    `${API_BASE_URL}/api/export-to-xlsx`,
    'POST',
    data,
    { 'Content-Type': 'application/json' },
    {},
    'blob'
  );

  return {
    loading,
    error,
    getBuildingTypes,
    getBuildingTypeById,
    getCommonAdjustments,
    exportToExcel,
  };
};

export default BuildingService;
