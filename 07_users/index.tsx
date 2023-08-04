import { useEffect, useState } from 'react'
import { useAuth } from 'src/hooks/useAuth'

// ** MUI Components
import Card from '@mui/material/Card'
import Chip from '@mui/material/Chip'
import CircularProgress from '@mui/material/CircularProgress'
import Pagination from '@mui/material/Pagination'
import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'

import { DataGrid, GridColumns, GridRenderCellParams } from '@mui/x-data-grid'

// ** Icon Imports
import Icon from 'src/@core/components/icon'

// ** Custom Components Imports
import PageHeader from 'src/@core/components/page-header'
import EditUserDialog from './EditUserDialog'

// ** Axios
import axios from 'axios'

// ** Config
import api from 'src/configs/api'
import authConfig from 'src/configs/auth'

import { useDispatch } from 'react-redux'
import { dialogAction, editUserDataAction } from 'src/store/index'

const Users = () => {
  const [usersList, setUsersList] = useState<Array<any>>([])
  const [loader, setLoader] = useState<boolean>(true)
  const [loadTrigger, setLoadTrigger] = useState<boolean | number>(false)
  const { logout } = useAuth()
  const dispatcher = useDispatch()

  const cols: GridColumns = [
    { field: 'id', headerName: 'ID', width: 90 },
    {
      flex: 0.8,
      minWidth: 100,
      headerName: 'Имя',
      field: 'full_name',
      renderCell: (params: GridRenderCellParams) => params.row.full_name
    },
    {
      headerName: 'Логин',
      field: 'name',
      renderCell: (params: GridRenderCellParams) => params.row.name
    },
    {
      flex: 0.5,
      headerName: 'Имейл',
      field: 'email',
      renderCell: (params: GridRenderCellParams) => params.row.email
    },
    {
      flex: 0.5,
      headerName: 'Роль',
      field: 'roles',
      renderCell: (params: GridRenderCellParams) =>
        params.row.roles.map((item: any, key: any) => <Chip label={item.name} sx={{ mr: 1 }} size='small' key={key} />)
    },
    {
      flex: 0.5,
      headerName: 'Разрешения',
      field: 'permissions',
      renderCell: (params: GridRenderCellParams) =>
        params.row.permissions.map((item: any, key: any) => (
          <Chip label={item.name} sx={{ mr: 1 }} size='small' key={key} />
        ))
    },
    {
      flex: 0.4,
      headerName: 'Город',
      field: 'cities',
      renderCell: (params: GridRenderCellParams) => {
        return params.row.cities.length > 0
          ? params.row.cities.map((item: any, key: any) => (
              <Chip label={item.name} sx={{ mr: 1 }} size='small' key={key} />
            ))
          : 'Все'
      }
    },
    {
      flex: 0.5,
      headerName: 'Статус',
      field: 'is_active',
      renderCell: (params: GridRenderCellParams) =>
        params.row.is_active ? (
          <Chip label='Активен' color='info' size='small' />
        ) : (
          <Chip label='Неактивен' color='secondary' size='small' />
        )
    },
    {
      headerName: '',
      field: 'edit',
      renderCell: (params: GridRenderCellParams) => (
        <>
          <IconButton
            aria-label='редактировать'
            onClick={() => {
              handleEditOpen(params.row)
            }}
          >
            <Icon icon='mdi:pencil' />
          </IconButton>
          {loadTrigger && params.row.id === loadTrigger ? <CircularProgress size='1rem' /> : null}
        </>
      )
    }
  ]

  const storedToken =
    window.localStorage.getItem(authConfig.storageTokenKeyName) ||
    window.sessionStorage.getItem(authConfig.storageTokenKeyName)

  const handleEditOpen = (params: any) => {
    dispatcher(dialogAction.dialogOpen())
    dispatcher(editUserDataAction.setEditableUserData(params))
  }

  const handleReloadData = (userId: number) => {
    setLoadTrigger(userId)
  }

  useEffect(() => {
    axios
      .get(api.url + '/users/', {
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-type': 'application/json'
        }
      })
      .then(response => {
        const data = response.data.data
        setUsersList(data)
        setLoader(false)
        if (loadTrigger) setLoadTrigger(false)
      })
      .catch(error => {
        console.error(error)
        setLoader(false)
        if (loadTrigger) setLoadTrigger(false)

        if (error.response.status == 401) {
          logout()
        }
      })
  }, [loadTrigger, logout, storedToken])

  return (
    <>
      <PageHeader
        title={<Typography variant='h2'>Пользователи</Typography>}
        subtitle={<Typography variant='body2'>Справочник пользователей</Typography>}
      />

      <Card sx={{ mt: 4 }}>
        <DataGrid
          autoHeight
          isRowSelectable={() => false}
          rows={usersList}
          columns={cols}
          loading={loader}
          components={{
            Pagination: Pagination,
            Toolbar: null
          }}
        />
      </Card>

      <EditUserDialog loadTrigger={handleReloadData} />
    </>
  )
}

export default Users
