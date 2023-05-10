import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import { useAuth } from 'src/hooks/useAuth'
import { useRouter } from 'next/router'

// ** Store Imports
import { useDispatch, useSelector } from 'react-redux'
import { servicesAction, serviceItemAction } from 'src/store/index'

// ** MUI Imports
import { DataGrid, GridColumns, GridRenderCellParams, GridEventListener, GridOverlay } from '@mui/x-data-grid'
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Pagination from '@mui/material/Pagination'
import ServerSideToolbar from 'src/views/table/data-grid/ServerSideToolbar'
import Typography from '@mui/material/Typography'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'

// ** Axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

// ** Setup timer for search field
let typingTimer: any = null

const columns: GridColumns = [
  {
    field: 'servicecode',
    minWidth: 100,
    headerName: 'Код услуги',
    flex: 0.175,
    renderCell: (params: GridRenderCellParams) => params.row.code
  },
  {
    flex: 0.7,
    minWidth: 100,
    headerName: 'Название',
    field: 'name',
    renderCell: (params: GridRenderCellParams) => params.row.name
  },
  {
    flex: 0.1,
    headerName: 'Доступность',
    field: 'accesebility',
    align: 'center',
    renderCell: (params: GridRenderCellParams) => {
      return params.row.is_available ? 'Да' : 'Нет'
    }
  }
]

const Services = () => {
  // ** States
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [prevPage, setPrevPage] = useState<number>(0)
  const [lastPage, setLastPage] = useState<number>(1)
  const [rows, setRows] = useState([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [errorMessage, setErrorMessage] = useState<string>('')
  const { logout } = useAuth()
  const router = useRouter()

  // ** Store
  const dispatcher = useDispatch()
  const servicesData = useSelector((state: any) => state.servicesdata)

  const sendRequest = (search: string, token: string | null) => {
    axios
      .get(api.url + '/proxy/references/services?' + search + '&limit=100&page=' + page, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-type': 'application/json'
        }
      })
      .then(response => {
        setLastPage(response.data.data.last_page)
        setRows(response.data.data.data)

        // load data to store to show it when we come back from service item
        dispatcher(
          servicesAction.addServicesData({
            page: response.data.data.current_page,
            pageData: response.data.data.data,
            lastPage: response.data.data.last_page,
            prevPage: prevPage
          })
        )

        if (response.data.data.data.length === 0) {
          throw new Error()
        }
      })
      .catch(error => {
        if (error?.response) {
          if (error?.response?.data?.message[0]) {
            setErrorMessage(error.response.data.message[0])
          }

          if (error.response?.status && error.response.status == 401) {
            logout()
          }
        } else {
          setErrorMessage('Поиск не дал результатов, введите другой запрос')
        }
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handlePageChange = (newPage: number) => {
    setPrevPage(page) // set previous page to check if data was loaded when came back from other page
    setPage(newPage)
  }
  const setTableData = useCallback(() => {
    setLoading(true)
    const storedToken =
      window.localStorage.getItem(authConfig.storageTokenKeyName) ||
      window.sessionStorage.getItem(authConfig.storageTokenKeyName)

    let searchText = ''

    if (searchValue.length == 0) {
      // Check if data was loaded before, when we came back from other page
      if (servicesData?.prevPage > 0 && prevPage === 0) {
        setLastPage(servicesData.lastPage)
        setRows(servicesData.pageData)
        setPage(servicesData.page)
        setPrevPage(0)
        setLoading(false)
      } else {
        sendRequest(searchText, storedToken)
      }
    }

    if (searchValue.length >= 3) {
      clearTimeout(typingTimer)
      searchText = `search=${searchValue}`
      typingTimer = setTimeout(() => {
        sendRequest(searchText, storedToken)
      }, 1000)
    }
  }, [page, searchValue, logout])

  const handleRowClick: GridEventListener<'rowClick'> = params => {
    dispatcher(serviceItemAction.addServiceItemData(params.row))
    router.push(`/reference/services/${params.row.id}`)
  }

  useEffect(() => {
    setTableData()
  }, [setTableData])

  return (
    <>
      <Grid container spacing={6}>
        <Grid item xs={12}>
          <PageHeader
            title={<Typography variant='h2'>Услуги</Typography>}
            subtitle={<Typography variant='body2'>Справочник услуг</Typography>}
          />
          <Card sx={{ mt: 2 }}>
            <DataGrid
              autoHeight
              onRowClick={handleRowClick}
              rows={rows}
              columns={columns}
              loading={loading}
              disableColumnMenu={true}
              disableSelectionOnClick={true}
              components={{
                Pagination: Pagination,
                Toolbar: ServerSideToolbar,
                NoRowsOverlay: () => <GridOverlay>{errorMessage}</GridOverlay>
              }}
              componentsProps={{
                pagination: {
                  page: page,
                  defaultPage: page,
                  count: lastPage,
                  color: 'primary',
                  disabled: loading,
                  onChange: (event: ChangeEvent<HTMLInputElement>, newPage: number) => handlePageChange(newPage),
                  boundaryCount: 2
                },
                toolbar: {
                  value: searchValue,
                  clearSearch: () => setSearchValue(''),
                  onChange: (event: ChangeEvent<HTMLInputElement>) => setSearchValue(event.target.value)
                }
              }}
            />
          </Card>
        </Grid>
      </Grid>
    </>
  )
}

export default Services
