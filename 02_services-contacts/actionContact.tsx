// ** Axios
import axios, { AxiosResponse, AxiosError } from 'axios';

// ** Config
import host from 'src/configs/host';

// ** Types
import { ExistingContact } from 'src/types/service-contacts-types';
const actionContact = (contactData: ExistingContact) => {
  let axiosAction = contactData.id ? 'put' : 'post';

  return axios({
      method: axiosAction,
      url: `${host.url}${host.api}/contacts`,
      data: contactData
    }).then((response: AxiosResponse) => {
      if (response.data.success === false) {
        throw new Error(response.data.message)
      }
    }).catch((error: AxiosError) => {
      throw new Error(error?.message)
    })
};

export default actionContact;