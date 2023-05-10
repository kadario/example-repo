import { useCallback, useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'

// ** MUI Components
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Table from '@mui/material/Table'
import TableBody from '@mui/material/TableBody'
import TableCell from '@mui/material/TableCell'
import TableContainer from '@mui/material/TableContainer'
import TableRow from '@mui/material/TableRow'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

import IncompatibleAutocomplete from './IncompatibleAutocomplete'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { incompatibleServicesAction } from 'src/store/index'

const IncompatibleServices = (props: any) => {
  const [incompatible, setIncompatible] = useState<any>([])
  const [loader, setLoader] = useState<boolean>(true)
  const [showAutocomplete, setShowAutocomplete] = useState<boolean>(false)
  const [error, setError] = useState<boolean | string>(false)
  const { logout } = useAuth()

  const incompatibleStoreData = useSelector((state: any) => state.incompatibleservices)
  const dispatcher = useDispatch()

  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)

  // Remove incompatible item
  const handleDeleteService = useCallback(
    (id: number) => {
      console.log('click!')
      setLoader(true)
      setIncompatible(incompatible.filter((item: any) => item.id !== id))

      axios
        .delete(api.url + '/proxy/references/incompatible-services/' + id, {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-type': 'application/json'
          }
        })
        .then(() => {
          setLoader(false)
          props.incompatibleUpdate(id)
        })
        .catch(error => {
          if (error.response.status == 401) {
            logout()
          } else {
            console.error('excluded error', error)
            setError(error.response.data.message[0])
            setLoader(false)
          }
        })
    },
    [incompatible]
  )
  useEffect(() => {
    if (incompatibleStoreData.id != null) {
      const random = Math.floor(Math.random() * 90000) + 10000
      setIncompatible([
        ...incompatible,
        {
          id: 'tmp_inc_' + random,
          incompatible_service: incompatibleStoreData
        }
      ])

      // Post data to backend
      axios
        .post(
          api.url + '/proxy/references/incompatible-services',
          {
            major_service_id: props.major_id,
            incompatible_service_id: incompatibleStoreData.id
          },
          {
            headers: {
              Authorization: `Bearer ${storedToken}`,
              'Content-type': 'application/json'
            }
          }
        )
        .then(() => {
          dispatcher(incompatibleServicesAction.resetIncompatibleData())
          setLoader(false)
        })
    } else {
      setIncompatible(props.incompatibleServices)
      setLoader(false)
    }
  }, [props.incompatibleServices, incompatibleStoreData])

  return (
    <>
      <Card sx={{ mt: 10 }}>
        <CardContent>
          <Box sx={{ flex: [1, 1, '80%'] }}>
            <Typography variant='h5'>
              Несовместимые услуги
              {loader ? <CircularProgress color='inherit' size={20} sx={{ ml: 4 }} /> : null}
            </Typography>
          </Box>
          {error ? <Alert severity='error'>{error}</Alert> : null}
          <TableContainer>
            <Table>
              <TableBody>
                {incompatible && incompatible.length > 0 ? (
                  incompatible?.map((item: any) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.incompatible_service.code}</TableCell>
                      <TableCell>{item.incompatible_service.name}</TableCell>
                      <TableCell align='right'>
                        <Button disabled={loader} onClick={() => handleDeleteService(item.id)}>
                          <Icon icon='mdi:remove' />
                          &nbsp;Удалить
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <></>
                )}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ mt: 4 }}>
            {showAutocomplete ? <IncompatibleAutocomplete /> : null}
            <Button onClick={() => setShowAutocomplete(!showAutocomplete)}>
              {showAutocomplete ? (
                <>
                  <Icon icon='mdi:close' />
                  &nbsp;Закрыть
                </>
              ) : (
                <>
                  <Icon icon='mdi:plus' />
                  &nbsp;Добавить услугу
                </>
              )}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </>
  )
}

export default IncompatibleServices
