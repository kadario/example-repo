import { useState, useEffect } from 'react'
import { useAuth } from 'src/hooks/useAuth'

// ** Axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

// ** Custom Components Imports
// import PageHeader from 'src/@core/components/page-header'

// ** MUI Components
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import { DataGrid, GridColDef, GridRenderCellParams } from '@mui/x-data-grid'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

import EditCityDialog from './editCityDialog'

type CityRowDataType = {
  id: number
  name: string
  is_active?: boolean
}

const Cities = () => {
  const [citiesList, setCitiesList] = useState<Array<any>>([])
  const [tableLoader, setTableLoader] = useState<boolean>(false)
  const [openDialog, setOpenDialog] = useState<boolean>(false)
  const [cityRowData, setCityRowData] = useState<CityRowDataType>()
  const [loadTrigger, setLoadTrigger] = useState<boolean | number>(0)
  const { logout } = useAuth()

  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)

  const handleCityDialogOpen = (cityRow?: any) => {
    setCityRowData(cityRow)
    setOpenDialog(true)
  }

  const handleEditClose = () => {
    setOpenDialog(false)
  }

  const handleReloadData = (cityId: number) => {
    setLoadTrigger(cityId)
  }

  const columns: GridColDef[] = [
    {
      headerName: 'ID',
      field: 'id',
      flex: 1
    },
    {
      headerName: 'Название города',
      field: 'name',
      flex: 4
    },
    {
      headerName: 'Активный',
      field: 'deleted',
      flex: 4,
      renderCell: (params: GridRenderCellParams) => {
        const chipColor = params.row.deleted ? 'secondary' : 'info'
        const chipLabel = params.row.deleted ? 'Неактивен' : 'Активен'

        return <Chip color={chipColor} label={chipLabel} size='small' />
      }
    },
    {
      headerName: '',
      field: 'edit',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            aria-label='редактировать'
            onClick={() => {
              handleCityDialogOpen(params.row)
            }}
          >
            <Icon icon='mdi:pencil' />
          </IconButton>
          {loadTrigger && params.row.id === loadTrigger ? <CircularProgress size='1rem' /> : null}
        </>
      )
    }
  ]

  useEffect(() => {
    if (loadTrigger === 0) setTableLoader(true)
    axios
      .get(api.url + '/proxy/references/cities', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-type': 'application/json'
        }
      })
      .then((response: any) => {
        setCitiesList(response.data.data)
        setTableLoader(false)
        if (loadTrigger) setLoadTrigger(false)
      })
      .catch((error: any) => {
        console.error(error)
        setTableLoader(false)
        if (loadTrigger) setLoadTrigger(false)

        if (error.response.status == 401) {
          logout()
        }
      })
  }, [logout, storedToken, loadTrigger])

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center'
        }}
      >
        <Box sx={{ flex: '1 1 auto' }}>
          <Typography variant='h2'>Города</Typography>
          <Typography variant='body2'>Справочник городов</Typography>
        </Box>

        <Button sx={{ ml: 2 }} variant='contained' onClick={handleCityDialogOpen}>
          Добавить город
        </Button>
      </Box>

      <Card>
        <DataGrid
          getRowId={row => row.id}
          loading={tableLoader}
          autoHeight
          rows={citiesList}
          rowCount={citiesList.length}
          columns={columns}
        />
      </Card>
      <EditCityDialog
        cityRowData={cityRowData}
        dialogOpen={openDialog}
        handleEditDialogClose={handleEditClose}
        loadTrigger={handleReloadData}
      />
    </>
  )
}

export default Cities
