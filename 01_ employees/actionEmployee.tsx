// ** Axios
import axios, { AxiosResponse, AxiosError } from 'axios';

// ** Config
import host from 'src/configs/host';

// ** Types
import { Employee } from 'src/types/employee-types';

const actionEmployee = (userData: Employee) => {
  let axiosAction = userData.id ? 'put' : 'post';
  return axios({
      method: axiosAction,
      url: `${host.url}${host.api}/employee-custom`,
      data: userData
    }).then((response: AxiosResponse) => {
      if (response.data.success === false) {
        throw new Error(response.data.message)
      }
    }).catch((error: AxiosError) => {
      throw new Error(error?.message)
    })
};

export default actionEmployee;