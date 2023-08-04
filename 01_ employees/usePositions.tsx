// ** Axios
import axios, { AxiosResponse, AxiosError } from 'axios';

// ** Config
import host from 'src/configs/host';

const usePositions = () => {
  return axios.get(host.url + host.api + '/positions')
    .then((response: AxiosResponse) => {
      return response.data.objects
    })
    .catch((error: AxiosError) => {
      throw new Error(error?.message)
    })
};

export default usePositions;