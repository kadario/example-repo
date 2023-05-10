// ** React Imports
import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/router'
import { useAuth } from 'src/hooks/useAuth'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { serviceItemAction, excludedItemAction } from 'src/store/index'
import { ServiceItemType } from 'src/store/serviceitem'

// ** Axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

// ** Service Components
import IncompatibleServices from './IncompatibleServices'
import ServiceTable from './ServiceTable'

// ** Next Import
import Link from 'next/link'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CircularProgress from '@mui/material/CircularProgress'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

const Service = () => {
  const [serviceData, setServiceData] = useState<ServiceItemType | null>(null)
  const [incompatibleID, setIncompatibleID] = useState<number | null>(null)
  const [pageLoader, setPageLoader] = useState<boolean>(true)

  // const [incompatible, setIncompatible] = useState<any>([])

  const router = useRouter()
  const { sid } = router.query
  const { logout } = useAuth()

  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)

  // ** Current service data from store
  const serviceStoreData = useSelector((state: any) => state.serviceitem)
  const excludedStoreItem = useSelector((state: any) => state.excludeditem.item)
  const dispatcher = useDispatch()

  // Incompatible callback
  const incompatibleUpdate = (id: number) => {
    setIncompatibleID(id)
  }

  //Loading necessary data
  const sentRequest = useCallback(() => {
    axios
      .get(api.url + '/proxy/references/services/' + sid, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-type': 'application/json'
        }
      })
      .then(response => {
        const data = response.data.data[0]
        dispatcher(serviceItemAction.addServiceItemData(data))
        dispatcher(excludedItemAction.hideExcludedEditable())
        setServiceData(data)

        if (pageLoader) setPageLoader(false)
      })
      .catch(error => {
        console.error(error)

        if (error.response.status == 401) {
          logout()
        }
      })
  }, [sid, incompatibleID])

  useEffect(() => {
    if (serviceStoreData.id != null) {
      setServiceData(serviceStoreData)
      setPageLoader(false)
    }

    if (sid != undefined) {
      sentRequest()
    }
  }, [sid, excludedStoreItem])

  return (
    <>
      {pageLoader ? (
        <Box sx={{ mt: 6, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
          <CircularProgress sx={{ mb: 4 }} />
          <Typography>Загрузка...</Typography>
        </Box>
      ) : (
        <>
          <PageHeader
            title={<Typography variant='h2'>Услуга {serviceData?.code}</Typography>}
            subtitle={<Typography variant='body2'>{serviceData?.name}</Typography>}
          />
          <Card sx={{ mt: 4 }}>
            <CardContent
              sx={{
                display: 'flex',
                alignItems: 'center',
                flexWrap: { xs: 'wrap', md: 'nowrap' },
                justifyContent: { xs: 'flex-start' }
              }}
            >
              <Box sx={{ flex: [1, 1, '20%'], display: 'flex', justifyContent: 'flex-end' }}>
                <Button href='/reference/services' component={Link} variant='outlined' size='small'>
                  <Icon icon='mdi:arrow-back' />
                  &nbsp;Назад к услугам
                </Button>
              </Box>
            </CardContent>
            <CardContent>
              <ServiceTable />
            </CardContent>
          </Card>
          <IncompatibleServices
            incompatibleServices={serviceData?.incompatible_services}
            incompatibleUpdate={incompatibleUpdate}
            major_id={sid}
          />
        </>
      )}
    </>
  )
}

export default Service
