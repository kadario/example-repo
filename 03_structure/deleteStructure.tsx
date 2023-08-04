// ** Axios
import axios, { AxiosResponse, AxiosError } from 'axios';

// ** Config
import host from 'src/configs/host';

const deleteStructure = (id: string) => {
  return axios.delete(host.url + host.api + '/structure', {
      data: {
        id: id
      }
    })
    .then((response: AxiosResponse) => {
      if (response.data.success === false) {
        throw new Error(response.data.message)
      }
    })
    .catch((error: AxiosError) => {
      throw new Error(error?.message)
    })
};

export default deleteStructure;