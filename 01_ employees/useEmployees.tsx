// ** Axios
import axios, { AxiosResponse, AxiosError } from 'axios';

// ** Config
import host from 'src/configs/host';

const useEmployees = () => {
  return axios.get(host.url + host.api + '/employee-custom')
    .then((response: AxiosResponse) => {
      if (response.data.success === false) {
        throw new Error(response.data.message)
      } else {
        return response.data.objects
      }
    })
    .catch((error: AxiosError) => {
      throw new Error(error?.message)
    })
};

export default useEmployees;