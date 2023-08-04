// ** Axios
import axios, { AxiosResponse, AxiosError } from 'axios';

// ** Config
import host from 'src/configs/host';

// ** Types
import { NewStructure } from 'src/types/structure-types';

const actionStructure = (structureData: NewStructure) => {
  let axiosAction = structureData.id ? 'put' : 'post';
  return axios({
      method: axiosAction,
      url: `${host.url}${host.api}/structure`,
      data: structureData
    }).then((response: AxiosResponse) => {
      if (response.data.success === false) {
        throw new Error(response.data.message)
      }
    }).catch((error: AxiosError) => {
      throw new Error(error?.message)
    })
};

export default actionStructure;