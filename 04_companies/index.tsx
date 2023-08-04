import { useEffect, useState, ChangeEvent } from 'react'
import { DataGrid, GridColumns, GridRenderCellParams } from '@mui/x-data-grid'

// ** MUI Imports
import Alert from '@mui/material/Alert'
import Box from '@mui/material/Box'
import Card from '@mui/material/Card'
import Grid from '@mui/material/Grid'
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import ServerSideToolbar from 'src/views/table/data-grid/ServerSideToolbar'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'
import { useAuth } from 'src/hooks/useAuth'

// ** Axios
import axios from 'axios'

let typingTimer: any = null
const columns: GridColumns = [
  {
    flex: 0.175,
    minWidth: 120,
    headerName: 'Наименование',
    field: 'name',
    renderCell: (params: GridRenderCellParams) => (
      <Typography variant='body2' sx={{ color: 'text.primary' }}>
        {params.row.name}
      </Typography>
    )
  }
]

const Companies = () => {
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState<number>(0)

  const [error, setError] = useState<string | boolean>(false)
  const [lastPage, setLastPage] = useState<number>(1)
  const [loading, setLoading] = useState<boolean>(false)
  const [pageSize, setPageSize] = useState<number>(100)
  const [rows, setRows] = useState([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [handleSearchValue, setHandleSearchValue] = useState<string>('')
  const { logout } = useAuth()
  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)

  const handleSearch = (value: string) => {
    setSearchValue(value)
    setPage(1)

    if (value === '' && searchValue !== '') {
      setSearchValue('')
      setHandleSearchValue('')
    } else {
      if (typingTimer !== null) {
        clearTimeout(typingTimer)
      }

      if (value.length >= 3) {
        typingTimer = setTimeout(() => {
          setHandleSearchValue(searchValue)
        }, 1000)
      }
    }
  }

  useEffect(() => {
    setLoading(true)

    axios
      .get(
        api.url + authConfig.companiesEndpoint + '/?search=' + searchValue + '&limit=' + pageSize + '&page=' + page,
        {
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-type': 'application/json'
          }
        }
      )
      .then(response => {
        const data = response.data.data
        const companiesData = response.data.data.data

        setLastPage(data.last_page)
        setPage(data.current_page)
        setTotal(data.total)
        setPageSize(data.per_page)
        setRows(companiesData)
        setLoading(false)
      })
      .catch(error => {
        if (error.response.status == 401) {
          logout()
        } else {
          setError(error.response.data.message[0])
          setLoading(false)
        }
      })
  }, [handleSearchValue, page])

  return (
    <Grid container spacing={6}>
      <PageHeader
        title={<Typography variant='h5'>Компании</Typography>}
        subtitle={<Typography variant='body2'>Справочник компаний</Typography>}
      />

      <Grid item xs={12}>
        <Card>
          <Box>
            {error ? (
              <Alert severity='error' sx={{ mx: 4.5, mt: 2 }}>
                {error}
              </Alert>
            ) : null}
          </Box>
          <DataGrid
            autoHeight
            rows={rows}
            rowCount={total}
            isRowSelectable={() => false}
            columns={columns}
            loading={loading}
            components={{
              Pagination: Pagination,
              Toolbar: ServerSideToolbar,
              NoRowsOverlay: () => (
                <Box height='100%' alignItems='center' justifyContent='center' display='flex'>
                  Нет данных для отображения
                </Box>
              )
            }}
            componentsProps={{
              pagination: {
                count: lastPage,
                color: 'primary',
                disabled: loading,
                onChange: (event: ChangeEvent<HTMLInputElement>, newPage: number) => setPage(newPage),
                boundaryCount: 2
              },
              toolbar: {
                value: searchValue,
                clearSearch: () => handleSearch(''),
                onChange: (event: ChangeEvent<HTMLInputElement>) => handleSearch(event.target.value)
              }
            }}
          />
        </Card>
      </Grid>
    </Grid>
  )
}

export default Companies
