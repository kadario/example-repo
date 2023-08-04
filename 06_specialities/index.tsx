import { useEffect, useState, useCallback, ChangeEvent } from 'react'
import { DataGrid, GridColumns, GridRenderCellParams } from '@mui/x-data-grid'

// ** MUI Imports
import Grid from '@mui/material/Grid'
import Card from '@mui/material/Card'
import Pagination from '@mui/material/Pagination'
import Typography from '@mui/material/Typography'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import ServerSideToolbar from 'src/views/table/data-grid/ServerSideToolbar'

// ** Axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

import { useAuth } from 'src/hooks/useAuth'

let typingTimer: any = null

const columns: GridColumns = [
  { field: 'id', headerName: 'ID', width: 90 },
  {
    flex: 0.175,
    minWidth: 100,
    headerName: 'Название',
    field: 'name',
    renderCell: (params: GridRenderCellParams) => params.row.name
  },
  {
    flex: 0.1,
    field: 'division_name',
    headerName: 'Отделение',
    minWidth: 100,
    renderCell: (params: GridRenderCellParams) => params.row.division.name
  },
  { flex: 0.07, field: 'creation_time', headerName: 'Дата создания', width: 150 }
]

const Specialities = () => {
  const [loading, setLoading] = useState<boolean>(false)
  const [page, setPage] = useState<number>(1)
  const [lastPage, setLastPage] = useState<number>(1)
  const [rows, setRows] = useState([])
  const [searchValue, setSearchValue] = useState<string>('')
  const [tempSearchValue, setTempSearchValue] = useState<string>('')
  const { logout } = useAuth()

  const fetchTableData = useCallback(() => {
    setLoading(true)
    const storedToken =
      window.localStorage.getItem(authConfig.storageTokenKeyName) ||
      window.sessionStorage.getItem(authConfig.storageTokenKeyName)

    axios
      .get(api.url + '/proxy/references/specialities/?search=' + searchValue + '&limit=15&page=' + page, {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-type': 'application/json'
        }
      })
      .then(response => {
        setLastPage(response.data.data.last_page)
        setRows(response.data.data.data)
        setLoading(false)
      })
      .catch(error => {
        console.error('error:', error)
        setLoading(false)

        if (error.response?.status && error.response.status == 401) {
          logout()
        }
      })
  }, [page, searchValue, logout])

  const handleSearch = (value: string) => {
    setTempSearchValue(value)
    setPage(1)

    if (value === '' && searchValue !== '') {
      setSearchValue('')
    } else {
      if (typingTimer !== null) clearTimeout(typingTimer)

      if (value.length >= 3) {
        typingTimer = setTimeout(() => setSearchValue(tempSearchValue), 1000)
      }
    }
  }

  useEffect(() => {
    fetchTableData()
  }, [fetchTableData])

  return (
    <Grid container spacing={6}>
      <Grid item xs={12}>
        <PageHeader
          title={<Typography variant='h2'>Специальности</Typography>}
          subtitle={<Typography variant='body2'>Справочник специальностей</Typography>}
        />
        <Card sx={{ mt: 4 }}>
          <DataGrid
            autoHeight
            rows={rows}
            columns={columns}
            loading={loading}
            components={{
              Pagination: Pagination,
              Toolbar: ServerSideToolbar
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
                value: tempSearchValue,
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

export default Specialities
